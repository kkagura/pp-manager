import { ipcMain } from "electron";
import { log } from "./log";

interface SerializedFormField {
  type: "field";
  name: string;
  value: string;
}

interface SerializedFormFile {
  type: "file";
  name: string;
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
}

type SerializedFormEntry = SerializedFormField | SerializedFormFile;

type SerializedBody =
  | { type: "empty" }
  | { type: "text"; value: string }
  | { type: "json"; value: unknown }
  | { type: "arrayBuffer"; value: ArrayBuffer; mimeType?: string }
  | { type: "formData"; entries: SerializedFormEntry[] };

interface ApiProxyRequest {
  method?: string;
  baseURL?: string;
  url: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  data?: SerializedBody;
  responseType?: string;
  timeout?: number;
}

interface ApiProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}

let registered = false;
const SENSITIVE_KEYS = ["authorization", "token", "accessToken", "refreshToken", "password", "captchaCode"];
const MAX_LOG_TEXT_LENGTH = 500;

function isSensitiveKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => normalizedKey.includes(sensitiveKey.toLowerCase()));
}

function redactSearchParams(url: URL): string {
  const clonedUrl = new URL(url.toString());
  clonedUrl.searchParams.forEach((_value, key) => {
    if (isSensitiveKey(key)) {
      clonedUrl.searchParams.set(key, "[REDACTED]");
    }
  });
  return clonedUrl.toString();
}

function summarizeHeaders(headers?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(headers ?? {}).forEach(([key, value]) => {
    result[key] = isSensitiveKey(key) ? "[REDACTED]" : value;
  });

  return result;
}

function summarizeUnknownValue(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > MAX_LOG_TEXT_LENGTH
      ? `${value.slice(0, MAX_LOG_TEXT_LENGTH)}...`
      : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => summarizeUnknownValue(item));
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      result[key] = isSensitiveKey(key) ? "[REDACTED]" : summarizeUnknownValue(item);
    });
    return result;
  }

  return value;
}

function summarizeBody(data?: SerializedBody): unknown {
  if (!data || data.type === "empty") {
    return { type: "empty" };
  }

  if (data.type === "text") {
    return {
      type: "text",
      length: data.value.length,
      preview: summarizeUnknownValue(data.value),
    };
  }

  if (data.type === "json") {
    return {
      type: "json",
      value: summarizeUnknownValue(data.value),
    };
  }

  if (data.type === "arrayBuffer") {
    return {
      type: "arrayBuffer",
      byteLength: data.value.byteLength,
      mimeType: data.mimeType,
    };
  }

  return {
    type: "formData",
    entries: data.entries.map((entry) => {
      if (entry.type === "field") {
        return {
          type: "field",
          name: entry.name,
          value: isSensitiveKey(entry.name) ? "[REDACTED]" : summarizeUnknownValue(entry.value),
        };
      }

      return {
        type: "file",
        name: entry.name,
        filename: entry.filename,
        mimeType: entry.mimeType,
        byteLength: entry.data.byteLength,
      };
    }),
  };
}

function summarizeResponseData(data: unknown): unknown {
  if (
    data &&
    typeof data === "object" &&
    (data as { type?: unknown }).type === "arrayBuffer" &&
    (data as { value?: unknown }).value instanceof ArrayBuffer
  ) {
    return {
      type: "arrayBuffer",
      byteLength: ((data as { value: ArrayBuffer }).value).byteLength,
    };
  }

  return summarizeUnknownValue(data);
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function appendSearchParam(searchParams: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendSearchParam(searchParams, key, item));
    return;
  }

  searchParams.append(key, String(value));
}

function buildRequestUrl(payload: ApiProxyRequest): URL {
  const url = /^https?:\/\//i.test(payload.url)
    ? new URL(payload.url)
    : new URL(payload.url, payload.baseURL);

  if (payload.params) {
    Object.entries(payload.params).forEach(([key, value]) => {
      appendSearchParam(url.searchParams, key, value);
    });
  }

  return url;
}

function createHeaders(payload: ApiProxyRequest): Headers {
  const headers = new Headers();

  Object.entries(payload.headers ?? {}).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    headers.set(key, value);
  });

  if (payload.data?.type === "formData") {
    headers.delete("content-type");
  }

  return headers;
}

function createBody(payload: ApiProxyRequest): BodyInit | undefined {
  const data = payload.data;
  if (!data || data.type === "empty") {
    return undefined;
  }

  if (data.type === "text") {
    return data.value;
  }

  if (data.type === "json") {
    return JSON.stringify(data.value);
  }

  if (data.type === "arrayBuffer") {
    return new Blob([data.value], { type: data.mimeType });
  }

  const formData = new FormData();
  data.entries.forEach((entry) => {
    if (entry.type === "field") {
      formData.append(entry.name, entry.value);
      return;
    }

    const file = new Blob([entry.data], { type: entry.mimeType });
    formData.append(entry.name, file, entry.filename);
  });

  return formData;
}

function normalizeHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

async function readResponseData(response: Response, responseType?: string): Promise<unknown> {
  if (responseType === "arraybuffer" || responseType === "blob") {
    return {
      type: "arrayBuffer",
      value: await response.arrayBuffer(),
    };
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (contentType.includes("application/json") && text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

export function registerApiProxyHandlers() {
  if (registered) {
    return;
  }

  ipcMain.handle("apiRequest", async (_event, payload: ApiProxyRequest): Promise<ApiProxyResponse> => {
    const controller = new AbortController();
    const timeout = payload.timeout && payload.timeout > 0
      ? setTimeout(() => controller.abort(), payload.timeout)
      : null;
    const startedAt = Date.now();
    const requestUrl = buildRequestUrl(payload);
    const method = payload.method ?? "GET";

    log.info("[api-proxy] request", {
      method,
      url: redactSearchParams(requestUrl),
      headers: summarizeHeaders(payload.headers),
      body: summarizeBody(payload.data),
      responseType: payload.responseType,
      timeout: payload.timeout,
    });

    try {
      const response = await fetch(requestUrl.toString(), {
        method,
        headers: createHeaders(payload),
        body: createBody(payload),
        signal: controller.signal,
      });
      const data = await readResponseData(response, payload.responseType);
      const proxyResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: normalizeHeaders(response.headers),
        data,
      };

      log.info("[api-proxy] response", {
        method,
        url: redactSearchParams(requestUrl),
        status: response.status,
        statusText: response.statusText,
        durationMs: Date.now() - startedAt,
        responseType: payload.responseType,
        data: summarizeResponseData(data),
      });

      return proxyResponse;
    } catch (error) {
      log.error("[api-proxy] error", {
        method,
        url: redactSearchParams(requestUrl),
        durationMs: Date.now() - startedAt,
        message: normalizeErrorMessage(error),
      });
      throw error;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  });

  registered = true;
}
