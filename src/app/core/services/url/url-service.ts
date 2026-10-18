import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UrlDtoRequest, UrlDtoResponse, UrlListResponse, UrlResponse } from '../../models/url.model';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private readonly baseUrl = environment.apiUrl;
  private currentUserId = signal<number | null>(null);

  constructor(private http: HttpClient) {}

  getUrls(): Observable<UrlListResponse> {
    return this.http
      .get<UrlListResponse>(`${this.baseUrl}/url/get`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response?.data && response.data.length > 0) {
            const firstWithUser = response.data.find((item) => item.user_id);
            if (firstWithUser) {
              this.currentUserId.set(firstWithUser.user_id);
            }
          }
        }),
      );
  }

  createUrl(request: UrlDtoRequest): Observable<UrlResponse> {
    const payload: UrlDtoRequest = {
      ...request,
      user_id: request.user_id ?? this.currentUserId() ?? undefined,
    };

    return this.http.post<UrlResponse>(`${this.baseUrl}/url/save`, payload, {
      withCredentials: true,
    });
  }

  deleteUrl(id: number): Observable<UrlResponse> {
    return this.http.delete<UrlResponse>(`${this.baseUrl}/url/delete/${id}`, {
      withCredentials: true,
    });
  }

  setUserId(userId: number): void {
    this.currentUserId.set(userId);
  }

  getUserId(): number | null {
    return this.currentUserId();
  }
}
