import axios, {
  AxiosError,
  AxiosHeaders,
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

function resolveBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL?.trim() || '';
}

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
