import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, UserRegisterRequest, UserRegisterResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly SESSION_KEY = 'pequi_session_active';
  private readonly EXP_KEY = 'pequi_session_exp';
  private readonly REQUEST_TIMEOUT_MS = 15000;

  private isAuthenticatedSignal = signal<boolean>(this.checkSession());
  readonly isAuthenticated$ = this.isAuthenticatedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(request: UserRegisterRequest): Observable<UserRegisterResponse> {
    return this.http
      .post<UserRegisterResponse>(
        `${this.baseUrl}/user/auth/save`,
        request,
      )
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map((response) => {
          if (response && response.code && response.code !== 200) {
            throw {
              status: response.code,
              error: { message: response.message || 'Falha ao criar conta.' },
              message: response.message || 'Falha ao criar conta.',
            };
          }
          return response;
        }),
      );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/user/auth/login`,
        { email: username, password: password },
        { withCredentials: true },
      )
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map((response) => {
          if (response && response.code && response.code !== 200) {
            throw {
              status: response.code,
              error: { message: response.message || 'Falha na autenticação.' },
              message: response.message || 'Falha na autenticação.',
            };
          }
          return response;
        }),
        tap((response) => {
          if (response && response.code === 200) {
            this.setSession(response.data?.exp);
          }
        }),
      );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  setSession(exp?: number): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      if (exp) {
        sessionStorage.setItem(this.EXP_KEY, exp.toString());
      }
    }
    this.isAuthenticatedSignal?.set(true);
  }

  clearSession(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.EXP_KEY);
    }
    this.isAuthenticatedSignal?.set(false);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private checkSession(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    const isActive = sessionStorage.getItem(this.SESSION_KEY) === 'true';
    if (!isActive) {
      return false;
    }

    const expStr = sessionStorage.getItem(this.EXP_KEY);
    if (expStr) {
      const exp = Number(expStr);
      if (!isNaN(exp) && Date.now() >= exp) {
        this.clearSession();
        return false;
      }
    }

    return true;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }
}
