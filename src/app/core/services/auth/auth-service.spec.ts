import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { AuthResponse } from '../../models/auth.model';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockAuthResponse: AuthResponse = {
    code: 200,
    message: 'Authorized',
    data: {
      token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      iat: 1792347076130,
      exp: Date.now() + 60000,
    },
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with unauthenticated state when storage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should perform login request with credentials and set session on 200', () => {
    let result: AuthResponse | undefined;

    service.login('user@test.com', 'user123').subscribe((res) => {
      result = res;
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/user/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@test.com', password: 'user123' });
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockAuthResponse);

    expect(result).toEqual(mockAuthResponse);
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem('pequi_session_active')).toBe('true');
    expect(sessionStorage.getItem('pequi_session_exp')).toBe(mockAuthResponse.data.exp.toString());

    // Verify tokens are NOT stored in storage
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('should clear session on clearSession() and logout()', () => {
    service.setSession(Date.now() + 60000);
    expect(service.isAuthenticated()).toBe(true);

    service.clearSession();
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('pequi_session_active')).toBeNull();
  });

  it('should navigate to login when logout() is invoked', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    service.setSession(Date.now() + 60000);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should mark session as invalid when expiration has passed', () => {
    sessionStorage.setItem('pequi_session_active', 'true');
    sessionStorage.setItem('pequi_session_exp', (Date.now() - 5000).toString());

    const httpClient = TestBed.inject(HttpClient);
    const reloadedService = TestBed.runInInjectionContext(() => new AuthService(
      httpClient,
      router,
    ));

    expect(reloadedService.isAuthenticated()).toBe(false);
  });
});
