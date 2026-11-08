import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register-component';
import { AuthService } from '../../core/services/auth/auth-service';
import { UserRegisterResponse } from '../../core/models/auth.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: { register: any };
  let router: Router;

  const mockSuccessResponse: UserRegisterResponse = {
    code: 200,
    message: 'User created',
    data: {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      group_id: 2,
    },
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    authServiceSpy = {
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when required fields are empty', () => {
    component.name = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    component.onRegister();

    expect(component.errorMessage).toBe('Por favor, preencha todos os campos obrigatórios.');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should show error when password is less than 6 characters', () => {
    component.name = 'João Silva';
    component.email = 'joao@example.com';
    component.password = '12345';
    component.confirmPassword = '12345';

    component.onRegister();

    expect(component.errorMessage).toBe('A senha deve conter no mínimo 6 caracteres.');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should show error when passwords do not match', () => {
    component.name = 'João Silva';
    component.email = 'joao@example.com';
    component.password = '123456';
    component.confirmPassword = 'differentPassword';

    component.onRegister();

    expect(component.errorMessage).toBe('As senhas informadas não coincidem.');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call authService.register and navigate to login on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    authServiceSpy.register.mockReturnValue(of(mockSuccessResponse));

    component.name = 'João Silva';
    component.email = 'joao@example.com';
    component.password = 'senha123';
    component.confirmPassword = 'senha123';

    component.onRegister();

    expect(component.isLoading).toBe(false);
    expect(component.successMessage).toContain('Conta criada com sucesso!');
    expect(authServiceSpy.register).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'senha123',
    });

    vi.advanceTimersByTime(1300);

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { registered: 'true', email: 'joao@example.com' },
    });
  });

  it('should display error message on backend failure', () => {
    authServiceSpy.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Email already exists' } })),
    );

    component.name = 'João Silva';
    component.email = 'duplicado@example.com';
    component.password = 'senha123';
    component.confirmPassword = 'senha123';

    component.onRegister();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should navigate to login when goToLogin is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goToLogin();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
