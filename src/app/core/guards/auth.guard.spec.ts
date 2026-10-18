import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth/auth-service';

describe('authGuard', () => {
  let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authServiceSpy = { isAuthenticated: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    router = TestBed.inject(Router);
  });

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const createMockSnapshot = (url: string) => ({ url } as RouterStateSnapshot);

  it('should allow activation when user is authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, createMockSnapshot('/home'))
    );

    expect(result).toBe(true);
  });

  it('should redirect to /login with returnUrl when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, createMockSnapshot('/home'))
    );

    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toBe('/login?returnUrl=%2Fhome');
  });

  it('should redirect to /login without returnUrl when url is root', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, createMockSnapshot('/'))
    );

    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toBe('/login');
  });
});
