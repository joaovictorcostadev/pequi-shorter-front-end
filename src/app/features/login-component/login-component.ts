import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParams['registered'];
    const email = this.route.snapshot.queryParams['email'];
    if (registered === 'true') {
      this.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
      if (email) {
        this.username = email;
        this.password = '';
      }
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService
      .login(this.username.trim(), this.password)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Login realizado com sucesso!';
          this.cdr.detectChanges();

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
  }

  private extractErrorMessage(err: any): string {
    // 1. Timeout (RxJS TimeoutError ou HTTP 504 / 408)
    if (err?.name === 'TimeoutError' || err?.status === 504 || err?.status === 408) {
      return 'Tempo limite esgotado. O servidor demorou muito para responder. Verifique sua conexão e tente novamente.';
    }

    // 2. Erro de rede / Servidor offline / CORS / DNS inacessível
    if (err?.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o servidor está online ou sua conexão com a internet.';
    }

    // 3. Credenciais inválidas (401 / 403)
    if (err?.status === 401 || err?.status === 403) {
      return (
        err?.error?.message ||
        err?.error?.error_description ||
        (typeof err?.error === 'string' && err.error) ||
        'E-mail ou senha incorretos. Verifique suas credenciais.'
      );
    }

    // 4. Servidor indisponível (502 / 503)
    if (err?.status === 502 || err?.status === 503) {
      return 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.';
    }

    // 5. Erro interno do servidor (500)
    if (err?.status === 500) {
      return err?.error?.message || 'Erro interno no servidor. Tente novamente mais tarde.';
    }

    // 6. Mensagens de erro específicas vindas da API
    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.error?.error_description) {
      return err.error.error_description;
    }

    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (Array.isArray(err?.error?.errors) && err.error.errors.length > 0) {
      return err.error.errors.join(', ');
    }

    if (err?.message && !err.message.includes('Http failure response')) {
      return err.message;
    }

    return 'Erro ao realizar login. Verifique suas credenciais ou tente novamente.';
  }
}
