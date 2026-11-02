import { ApiResponse } from './url.model';

export interface UrlAccessDto {
  id?: number;
  userId?: number;
  user_id?: number;
  urlId?: number;
  url_id?: number;
  ip: string;
  country: string;
  state: string;
  city: string;
  deviceType?: string | null;
  device_type?: string | null;
  operatingSystem?: string | null;
  operating_system?: string | null;
  browser?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  updatedAt: string;
}

export type UrlAccessListResponse = ApiResponse<UrlAccessDto[]>;
