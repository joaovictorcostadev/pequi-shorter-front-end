import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent implements OnInit {
  username = 'user@test.com';
  password = 'user123';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParams['registered'];
    const email = this.route.snapshot.queryParams['email'];
    if (registered === 'true') {
      this.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
      if (email) {
        this.username = email;
        this.password = '';
      }
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Login realizado com sucesso!';

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erro ao realizar login. Verifique suas credenciais.';
      },
    });
  }
}
