import { request } from "./http";
import { clearTokenPair, setTokenPair } from "./token";
import type {
  AuthenticatedUser,
  LoginDto,
  LoginResult,
  RefreshTokenDto,
  SuccessResponse,
} from "./types";

export const authApi = {
  async login(payload: LoginDto): Promise<LoginResult> {
    const result = await request<LoginResult, LoginDto>({
      method: "POST",
      url: "/auth/login",
      data: payload,
      skipAuth: true,
      retryOnAuthError: false,
    });

    setTokenPair({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return result;
  },

  async refreshToken(payload?: RefreshTokenDto): Promise<LoginResult> {
    const result = await request<LoginResult, RefreshTokenDto>({
      method: "POST",
      url: "/auth/refresh",
      data: payload,
      skipAuth: true,
      retryOnAuthError: false,
    });

    setTokenPair({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return result;
  },

  async logout(): Promise<SuccessResponse> {
    try {
      return await request<SuccessResponse>({
        method: "POST",
        url: "/auth/logout",
        retryOnAuthError: false,
      });
    } finally {
      clearTokenPair();
    }
  },

  me(): Promise<AuthenticatedUser> {
    return request<AuthenticatedUser>({
      method: "GET",
      url: "/auth/me",
    });
  },
};
