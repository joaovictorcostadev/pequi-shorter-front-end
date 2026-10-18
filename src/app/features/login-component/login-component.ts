import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  username = 'user@test.com';
  password = 'user123';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.username.trim(), this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login realizado com sucesso!';
        
        // Redirect to home page after successful login
        this.router.navigate(['/home']);

      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erro ao realizar login. Verifique suas credenciais.';
      },
    });
  }
}
