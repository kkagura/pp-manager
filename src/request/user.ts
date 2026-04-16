import { request } from "./http";
import type { CreateUserDto, PaginatedResult, PublicUser, UserListParams, SuccessResponse } from "./types";

export const userApi = {
  create(payload: CreateUserDto): Promise<PublicUser> {
    return request<PublicUser, CreateUserDto>({
      method: "POST",
      url: "/users",
      data: payload,
    });
  },

  list(params?: UserListParams): Promise<PaginatedResult<PublicUser>> {
    return request<PaginatedResult<PublicUser>>({
      method: "GET",
      url: "/users",
      params,
    });
  },

  get(id: number): Promise<PublicUser> {
    return request<PublicUser>({
      method: "GET",
      url: `/users/${id}`,
    });
  },

  delete(id: number): Promise<SuccessResponse> {
    return request<SuccessResponse>({
      method: "DELETE",
      url: `/users/${id}`,
    });
  },
};
