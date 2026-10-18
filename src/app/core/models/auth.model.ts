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
