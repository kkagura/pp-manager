import { getBaseURL, request, requestRaw } from "./http";
import type {
  FileContentMode,
  FileListParams,
  PaginatedResult,
  PublicStoredFile,
  SuccessResponse,
  UploadFileParams,
} from "./types";

function appendIfPresent(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null || value === "") {
    return;
  }
  formData.append(key, String(value));
}

function createUploadFormData(payload: UploadFileParams): FormData {
  const formData = new FormData();
  if (payload.filename) {
    formData.append("file", payload.file, payload.filename);
  } else {
    formData.append("file", payload.file);
  }
  appendIfPresent(formData, "bizType", payload.bizType);
  appendIfPresent(formData, "bizId", payload.bizId);
  appendIfPresent(formData, "isPublic", payload.isPublic);
  return formData;
}

export function uploadFile(payload: UploadFileParams): Promise<PublicStoredFile> {
  return request<PublicStoredFile, FormData>({
    method: "POST",
    url: "/files/upload",
    data: createUploadFormData(payload),
  });
}

export const fileApi = {
  list(params?: FileListParams): Promise<PaginatedResult<PublicStoredFile>> {
    return request<PaginatedResult<PublicStoredFile>>({
      method: "GET",
      url: "/files",
      params,
    });
  },

  upload(payload: UploadFileParams): Promise<PublicStoredFile> {
    return uploadFile(payload);
  },

  get(id: number): Promise<PublicStoredFile> {
    return request<PublicStoredFile>({
      method: "GET",
      url: `/files/${id}`,
    });
  },

  delete(id: number): Promise<SuccessResponse> {
    return request<SuccessResponse>({
      method: "DELETE",
      url: `/files/${id}`,
    });
  },

  async getContent(id: number, mode?: FileContentMode): Promise<Blob> {
    const response = await requestRaw<Blob>({
      method: "GET",
      url: `/files/${id}/content`,
      params: mode ? { mode } : undefined,
      responseType: "blob",
    });
    return response.data;
  },

  resolveContentUrl(path: string): string {
    return new URL(path, getBaseURL()).toString();
  },
};
