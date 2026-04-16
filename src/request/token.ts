const ACCESS_TOKEN_KEY = "pp-manager.access-token";
const REFRESH_TOKEN_KEY = "pp-manager.refresh-token";

let memoryAccessToken = "";
let memoryRefreshToken = "";

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function getAccessToken(): string {
  const storage = getStorage();
  return storage?.getItem(ACCESS_TOKEN_KEY) ?? memoryAccessToken;
}

export function getRefreshToken(): string {
  const storage = getStorage();
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? memoryRefreshToken;
}

export function setTokenPair(tokens: TokenPair): void {
  const { accessToken, refreshToken } = tokens;
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;

  const storage = getStorage();
  storage?.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage?.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokenPair(): void {
  memoryAccessToken = "";
  memoryRefreshToken = "";

  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
}
