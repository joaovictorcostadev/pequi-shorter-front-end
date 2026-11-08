import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { loginGuard } from './login.guard';
import { AuthService } from '../services/auth/auth-service';

describe('loginGuard', () => {
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
  const dummySnapshot = {} as RouterStateSnapshot;

  it('should allow access to login when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      loginGuard(dummyRoute, dummySnapshot)
    );

    expect(result).toBe(true);
  });

  it('should redirect to /home when user is already authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      loginGuard(dummyRoute, dummySnapshot)
    );

    expect(result instanceof UrlTree).toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toBe('/home');
  });
});
