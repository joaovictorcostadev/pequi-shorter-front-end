export interface UrlDtoResponse {
  id: number;
  name: string;
  external_url: string;
  user_id: number;
  url: string;
}

export interface UrlDtoRequest {
  name?: string;
  external_url: string;
  user_id?: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type UrlListResponse = ApiResponse<UrlDtoResponse[]>;
export type UrlResponse = ApiResponse<UrlDtoResponse>;
