export interface AuthResponseData {
  token: string;
  refresh_token: string;
  exp: number;
  iat: number;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: AuthResponseData;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponseData {
  id: number;
  name: string;
  email: string;
  group_id: number;
}

export interface UserRegisterResponse {
  code: number;
  message: string;
  data: UserResponseData;
}

