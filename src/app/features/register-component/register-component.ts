import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth-service';
import { UserRegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const trimmedName = this.name.trim();
    const trimmedEmail = this.email.trim();

    if (!trimmedName || !trimmedEmail || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve conter no mínimo 6 caracteres.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas informadas não coincidem.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const payload: UserRegisterRequest = {
      name: trimmedName,
      email: trimmedEmail,
      password: this.password,
    };

    this.authService
      .register(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Conta criada com sucesso! Redirecionando para login...';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true', email: trimmedEmail },
            });
          }, 1200);
        },
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
  }

  private extractErrorMessage(err: any): string {
    if (err?.name === 'TimeoutError' || err?.status === 504 || err?.status === 408) {
      return 'Tempo limite esgotado. O servidor demorou muito para responder. Tente novamente.';
    }

    if (err?.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o servidor está online ou sua conexão.';
    }

    if (err?.status === 409) {
      return err?.error?.message || 'Este e-mail já está cadastrado no sistema.';
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (Array.isArray(err?.error?.errors) && err.error.errors.length > 0) {
      return err.error.errors.join(', ');
    }

    return 'Erro ao criar conta. Verifique os dados informados ou tente novamente.';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
