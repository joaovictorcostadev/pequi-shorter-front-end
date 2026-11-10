import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UserPageComponent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlDtoRequest } from '../../core/models/url.model';

@Component({
  selector: 'app-url-form-component, app-url-form',
  standalone: true,
  imports: [CommonModule, FormsModule, UserPageComponent, PageTitleComponent],
  templateUrl: './url-form-component.html',
  styleUrl: './url-form-component.scss',
})
export class UrlFormComponent {
  externalUrl = '';
  customName = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private urlService: UrlService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid || !this.externalUrl.trim()) {
      this.errorMessage = 'Por favor, informe uma URL externa válida.';
      this.cdr.detectChanges();
      return;
    }

    let formattedUrl = this.externalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const payload: UrlDtoRequest = {
      external_url: formattedUrl,
      name: this.customName.trim() ? this.customName.trim() : undefined,
    };

    this.isLoading = true;
    this.cdr.detectChanges();

    this.urlService
      .createUrl(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/links']);
        },
        error: (err) => {
          const message =
            err?.error?.message ||
            'Erro ao criar o link encurtado. Verifique os dados informados.';
          this.errorMessage = message;
          this.cdr.detectChanges();
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/links']);
  }
}
