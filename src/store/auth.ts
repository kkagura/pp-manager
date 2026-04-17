import { defineStore } from "pinia";
import { authApi, clearTokenPair, getAccessToken, request } from "@/request";
import type { AuthenticatedUser, CaptchaResult, LoginDto, PublicUser } from "@/request";

interface AuthState {
  user: AuthenticatedUser | null;
  loginUser: PublicUser | null;
  captcha: CaptchaResult | null;
}

export type CurrentAuthUser = AuthenticatedUser | PublicUser;

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    loginUser: null,
    captcha: null,
  }),
  getters: {
    currentUser(state): CurrentAuthUser | null {
      return state.user ?? state.loginUser;
    },
  },
  actions: {
    async fetchCaptcha(): Promise<CaptchaResult> {
      const captcha = await request<CaptchaResult>({
        method: "GET",
        url: "/auth/captcha",
        skipAuth: true,
        retryOnAuthError: false,
      });
      this.captcha = captcha;
      return captcha;
    },

    async login(payload: LoginDto): Promise<void> {
      const result = await authApi.login(payload);
      this.loginUser = result.user;
      this.user = null;
    },

    async fetchCurrentUser(force = false): Promise<CurrentAuthUser | null> {
      if (!getAccessToken()) {
        this.clearAuthState();
        return null;
      }

      if (!force) {
        if (this.user) {
          return this.user;
        }
        if (this.loginUser) {
          return this.loginUser;
        }
      }

      try {
        const user = await authApi.me();
        this.user = user;
        this.loginUser = user;
        return user;
      } catch {
        if (!force && this.loginUser) {
          return this.loginUser;
        }
        this.clearAuthState();
        return null;
      }
    },

    async logout(): Promise<void> {
      if (getAccessToken()) {
        try {
          await authApi.logout();
        } catch {
          // authApi.logout already clears local tokens in finally
        }
      } else {
        clearTokenPair();
      }

      this.clearAuthState();
    },

    clearAuthState(): void {
      clearTokenPair();
      this.user = null;
      this.loginUser = null;
      this.captcha = null;
    },
  },
  persist: {
    pick: ["loginUser"],
  },
});
