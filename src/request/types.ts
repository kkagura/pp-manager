export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PaginatedResult<T> {
  list: T[];
  pagination: PaginationMeta;
}

export interface SuccessResponse {
  success: true;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface RequestErrorPayload {
  status?: number;
  code?: string;
  message: string;
  details?: string[];
  raw?: unknown;
}

export interface LoginDto {
  username: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CaptchaResult {
  captchaId: string;
  captchaSvg: string;
  expiresIn: number;
}

export interface CreateUserDto {
  username: string;
  password: string;
  nickname?: string | null;
  email?: string | null;
  mobile?: string | null;
  avatar?: string | null;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  status?: number;
}

export interface FileListParams {
  page?: number;
  pageSize?: number;
  bizType?: string;
  bizId?: string;
  originalName?: string;
  status?: 0 | 1 | 2 | 3;
  createdBy?: number;
}

export type FileContentMode = "preview" | "download";

export interface UploadFileParams {
  file: File | Blob;
  filename?: string;
  bizType?: string | null;
  bizId?: string | null;
  isPublic?: 0 | 1 | "0" | "1" | "true" | "false";
}

export interface PublicUser {
  id: number;
  username: string;
  nickname: string | null;
  email: string | null;
  mobile: string | null;
  avatar: string | null;
  status: number;
  loginIp: string | null;
  loginAt: string | null;
  createBy: number | null;
  createAt: string;
  updateBy: number | null;
  updateAt: string;
  deleteAt: string | null;
}

export interface AuthenticatedUser extends PublicUser {
  sessionId: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: PublicUser;
}

export interface PublicStoredFile {
  id: number;
  originalName: string;
  ext: string;
  mimeType: string;
  size: number;
  etag: string | null;
  sha256: string;
  status: 0 | 1 | 2 | 3;
  isPublic: 0 | 1;
  bizType: string | null;
  bizId: string | null;
  createdBy: number | null;
  createAt: string;
  updateBy: number | null;
  updateAt: string;
  deleteAt: string | null;
  contentUrl: string;
  previewUrl: string;
  downloadUrl: string;
}
