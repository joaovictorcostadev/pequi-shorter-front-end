import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login-component';
import { AuthService } from '../../core/services/auth/auth-service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: { login: any };
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when required fields are empty', () => {
    component.username = '';
    component.password = '';

    component.onLogin();

    expect(component.errorMessage).toBe('Por favor, preencha todos os campos.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should perform login and redirect to /home on success', () => {
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');
    authServiceSpy.login.mockReturnValue(of({ code: 200, message: 'OK', data: {} }));

    component.username = 'test@example.com';
    component.password = 'password123';

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(component.isLoading).toBe(false);
    expect(component.successMessage).toBe('Login realizado com sucesso!');
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/home');
  });

  it('should display error message on login failure', () => {
    authServiceSpy.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } })),
    );

    component.username = 'wrong@example.com';
    component.password = 'wrong';

    component.onLogin();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should display timeout message on timeout error', () => {
    authServiceSpy.login.mockReturnValue(
      throwError(() => ({ name: 'TimeoutError' })),
    );

    component.username = 'test@example.com';
    component.password = 'password123';

    component.onLogin();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Tempo limite esgotado');
  });

  it('should display connection error message when status is 0', () => {
    authServiceSpy.login.mockReturnValue(
      throwError(() => ({ status: 0 })),
    );

    component.username = 'test@example.com';
    component.password = 'password123';

    component.onLogin();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Não foi possível conectar ao servidor');
  });

  it('should navigate to /register when goToRegister is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goToRegister();
    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });
});
