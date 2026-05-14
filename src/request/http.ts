import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";
import { clearTokenPair, getAccessToken, getRefreshToken, setTokenPair } from "./token";
import type { ErrorResponse, LoginResult, RefreshTokenDto, RequestErrorPayload } from "./types";

const AUTH_REFRESH_PATH = "/auth/refresh";
const AUTH_LOGIN_PATH = "/auth/login";
const AUTH_LOGOUT_PATH = "/auth/logout";

export interface RequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  skipAuth?: boolean;
  retryOnAuthError?: boolean;
  showErrorMessage?: boolean;
  errorMessage?: string;
}

interface RetryableRequestConfig<D = unknown> extends InternalAxiosRequestConfig<D> {
  skipAuth?: boolean;
  retryOnAuthError?: boolean;
  showErrorMessage?: boolean;
  errorMessage?: string;
  _retry?: boolean;
}

export class RequestError extends Error {
  status?: number;
  code?: string;
  details?: string[];
  raw?: unknown;

  constructor(payload: RequestErrorPayload) {
    super(payload.message);
    this.name = "RequestError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.raw = payload.raw;
  }
}

interface ElectronFormField {
  type: "field";
  name: string;
  value: string;
}

interface ElectronFormFile {
  type: "file";
  name: string;
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
}

type ElectronSerializedBody =
  | { type: "empty" }
  | { type: "text"; value: string }
  | { type: "json"; value: unknown }
  | { type: "arrayBuffer"; value: ArrayBuffer; mimeType?: string }
  | { type: "formData"; entries: Array<ElectronFormField | ElectronFormFile> };

interface ElectronApiProxyRequest {
  method?: string;
  baseURL?: string;
  url: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  data?: ElectronSerializedBody;
  responseType?: string;
  timeout?: number;
}

interface ElectronApiProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}

interface ElectronArrayBufferResponse {
  type: "arrayBuffer";
  value: ArrayBuffer;
}

function resolveBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim() || '';
}

function resolveElectronProxyBaseURL(baseURL?: string): string | undefined {
  if (!baseURL) {
    return typeof window !== "undefined" ? window.location.origin : undefined;
  }

  if (/^https?:\/\//i.test(baseURL)) {
    return baseURL;
  }

  if (typeof window !== "undefined" && /^https?:\/\//i.test(window.location.origin)) {
    return new URL(baseURL, window.location.origin).toString();
  }

  return baseURL;
}

function getElectronApiRequest():
  | ((config: ElectronApiProxyRequest) => Promise<ElectronApiProxyResponse>)
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const apiRequest = (window as any).ipcRenderer?.apiRequest;
  return typeof apiRequest === "function" ? apiRequest : null;
}

function normalizeHeaderValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === false) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  return String(value);
}

function serializeHeaders(headers?: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const normalizedHeaders = AxiosHeaders.from(headers as any).toJSON();

  Object.entries(normalizedHeaders).forEach(([key, value]) => {
    const normalizedValue = normalizeHeaderValue(value);
    if (normalizedValue !== undefined) {
      result[key] = normalizedValue;
    }
  });

  return result;
}

function serializeParams(params: unknown): Record<string, unknown> | undefined {
  if (!params) {
    return undefined;
  }

  if (params instanceof URLSearchParams) {
    const result: Record<string, string[]> = {};
    params.forEach((value, key) => {
      result[key] = [...(result[key] ?? []), value];
    });
    return result;
  }

  if (typeof params === "object") {
    return params as Record<string, unknown>;
  }

  return undefined;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function resolveBlobFilename(value: Blob): string {
  return typeof File !== "undefined" && value instanceof File ? value.name : "blob";
}

async function serializeRequestData(data: unknown): Promise<ElectronSerializedBody> {
  if (data === undefined || data === null) {
    return { type: "empty" };
  }

  if (isFormData(data)) {
    const entries: Array<ElectronFormField | ElectronFormFile> = [];
    for (const [name, value] of data.entries()) {
      if (isBlob(value)) {
        entries.push({
          type: "file",
          name,
          filename: resolveBlobFilename(value),
          mimeType: value.type,
          data: await value.arrayBuffer(),
        });
        continue;
      }

      entries.push({
        type: "field",
        name,
        value: String(value),
      });
    }

    return { type: "formData", entries };
  }

  if (isBlob(data)) {
    return {
      type: "arrayBuffer",
      value: await data.arrayBuffer(),
      mimeType: data.type,
    };
  }

  if (data instanceof ArrayBuffer) {
    return { type: "arrayBuffer", value: data };
  }

  if (ArrayBuffer.isView(data)) {
    const source = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const copied = new Uint8Array(source.byteLength);
    copied.set(source);
    return { type: "arrayBuffer", value: copied.buffer };
  }

  if (typeof data === "string") {
    return { type: "text", value: data };
  }

  return { type: "json", value: data };
}

function isArrayBufferProxyResponse(data: unknown): data is ElectronArrayBufferResponse {
  return Boolean(
    data &&
      typeof data === "object" &&
      (data as ElectronArrayBufferResponse).type === "arrayBuffer" &&
      (data as ElectronArrayBufferResponse).value instanceof ArrayBuffer,
  );
}

function getResponseHeader(headers: Record<string, string>, name: string): string | undefined {
  const expectedName = name.toLowerCase();
  const found = Object.entries(headers).find(([key]) => key.toLowerCase() === expectedName);
  return found?.[1];
}

function deserializeResponseData(
  response: ElectronApiProxyResponse,
  responseType?: string,
): unknown {
  if (!isArrayBufferProxyResponse(response.data)) {
    return response.data;
  }

  if (responseType === "blob") {
    return new Blob([response.data.value], {
      type: getResponseHeader(response.headers, "content-type") ?? "",
    });
  }

  return response.data.value;
}

const electronApiProxyAdapter: AxiosAdapter = async (config) => {
  const apiRequest = getElectronApiRequest();
  if (!apiRequest) {
    throw new AxiosError("Electron API proxy is unavailable", AxiosError.ERR_NOT_SUPPORT, config);
  }

  try {
    const proxyResponse = await apiRequest({
      method: config.method?.toUpperCase() ?? "GET",
      baseURL: resolveElectronProxyBaseURL(config.baseURL),
      url: config.url ?? "",
      params: serializeParams(config.params),
      headers: serializeHeaders(config.headers),
      data: await serializeRequestData(config.data),
      responseType: config.responseType,
      timeout: config.timeout,
    });

    const response: AxiosResponse = {
      data: deserializeResponseData(proxyResponse, config.responseType),
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: AxiosHeaders.from(proxyResponse.headers),
      config,
      request: null,
    };

    const validateStatus = config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      return response;
    }

    const errorCode = response.status >= 500
      ? AxiosError.ERR_BAD_RESPONSE
      : AxiosError.ERR_BAD_REQUEST;
    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      errorCode,
      config,
      null,
      response,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }

    throw new AxiosError(
      error instanceof Error ? error.message : "Electron API proxy request failed",
      AxiosError.ERR_NETWORK,
      config,
    );
  }
};

function createHeaders(headers?: unknown): AxiosHeaders {
  return AxiosHeaders.from(headers as any);
}

function shouldAttachToken(config: RetryableRequestConfig): boolean {
  return !config.skipAuth && Boolean(getAccessToken());
}

function shouldRetryAuth(error: AxiosError<ErrorResponse>): boolean {
  const config = error.config as RetryableRequestConfig | undefined;
  if (!config || config._retry) {
    return false;
  }

  if (config.skipAuth || config.retryOnAuthError === false) {
    return false;
  }

  if (error.response?.status !== 401) {
    return false;
  }

  if (!getRefreshToken()) {
    return false;
  }

  const requestUrl = config.url ?? "";
  return ![AUTH_LOGIN_PATH, AUTH_REFRESH_PATH, AUTH_LOGOUT_PATH].some((path) =>
    requestUrl.includes(path),
  );
}

function normalizeError(error: AxiosError<ErrorResponse>): RequestError {
  const config = error.config as RetryableRequestConfig | undefined;
  const payload = error.response?.data;
  const messageList = Array.isArray(payload?.message)
    ? payload.message
    : payload?.message
      ? [payload.message]
      : [];
  const message =
    config?.errorMessage || messageList[0] || error.message || "Request failed";

  return new RequestError({
    status: error.response?.status,
    code: error.code,
    message,
    details: messageList.length > 1 ? messageList : undefined,
    raw: payload ?? error,
  });
}

function shouldShowErrorMessage(config?: RetryableRequestConfig): boolean {
  return config?.showErrorMessage !== false;
}

function showRequestError(error: RequestError): void {
  ElMessage.error(error.message);
}

const http: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
  adapter: getElectronApiRequest() ? electronApiProxyAdapter : undefined,
});

let refreshPromise: Promise<LoginResult> | null = null;

async function refreshAccessToken(): Promise<LoginResult> {
  if (!refreshPromise) {
    const payload: RefreshTokenDto = {
      refreshToken: getRefreshToken(),
    };

    refreshPromise = http
      .request<LoginResult, AxiosResponse<LoginResult>, RefreshTokenDto>({
        method: "POST",
        url: AUTH_REFRESH_PATH,
        data: payload,
        skipAuth: true,
        retryOnAuthError: false,
        showErrorMessage: false,
      } as RequestConfig<RefreshTokenDto>)
      .then((response) => {
        setTokenPair({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const nextConfig = config as RetryableRequestConfig;
  const headers = createHeaders(nextConfig.headers);

  if (shouldAttachToken(nextConfig) && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${getAccessToken()}`);
  }

  nextConfig.headers = headers;
  return nextConfig;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (shouldRetryAuth(error)) {
      const config = error.config as RetryableRequestConfig;
      config._retry = true;

      try {
        const loginResult = await refreshAccessToken();
        const headers = createHeaders(config.headers);
        headers.set("Authorization", `${loginResult.tokenType} ${loginResult.accessToken}`);
        config.headers = headers;
        return http.request(config);
      } catch (refreshError) {
        clearTokenPair();
        if (refreshError instanceof RequestError) {
          throw refreshError;
        }
      }
    }

    const requestError = normalizeError(error);
    if (shouldShowErrorMessage(config)) {
      showRequestError(requestError);
    }
    throw requestError;
  },
);

export async function request<T = unknown, D = unknown>(
  config: RequestConfig<D>,
): Promise<T> {
  const response = await http.request<T, AxiosResponse<T>, D>(config);
  return response.data;
}

export function requestRaw<T = unknown, D = unknown>(
  config: RequestConfig<D>,
): Promise<AxiosResponse<T, D>> {
  return http.request<T, AxiosResponse<T, D>, D>(config);
}

export function getRequestClient(): AxiosInstance {
  return http;
}

export function getBaseURL(): string {
  return http.defaults.baseURL ?? resolveBaseURL();
}
