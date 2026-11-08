import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const trimmedName = this.name.trim();
    const trimmedEmail = this.email.trim();

    if (!trimmedName || !trimmedEmail || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve conter no mínimo 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas informadas não coincidem.';
      return;
    }

    this.isLoading = true;

    const payload: UserRegisterRequest = {
      name: trimmedName,
      email: trimmedEmail,
      password: this.password,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Conta criada com sucesso! Redirecionando para login...';
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true', email: trimmedEmail },
          });
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          'Erro ao criar conta. Verifique os dados informados ou se o e-mail já está cadastrado.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
