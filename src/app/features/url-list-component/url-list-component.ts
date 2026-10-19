import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserPageComponent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlDtoResponse } from '../../core/models/url.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-url-list-component',
  standalone: true,
  imports: [CommonModule, UserPageComponent, PageTitleComponent],
  templateUrl: './url-list-component.html',
  styleUrl: './url-list-component.scss',
})
export class UrlListComponent implements OnInit {
  urls: UrlDtoResponse[] = [];
  isLoading = false;
  errorMessage = '';
  copiedUrlId: number | null = null;
  deletingUrlId: number | null = null;

  constructor(
    private urlService: UrlService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.urlService
      .getUrls()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.urls = response?.data ?? [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'Não foi possível carregar os links. Verifique sua conexão e tente novamente.';
          this.cdr.detectChanges();
        },
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/links/create']);
  }

  copyToClipboard(url: UrlDtoResponse): void {
    const text = url.url;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => this.markAsCopied(url.id))
        .catch(() => this.fallbackCopy(text, url.id));
    } else {
      this.fallbackCopy(text, url.id);
    }
  }

  private markAsCopied(id: number): void {
    this.copiedUrlId = id;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.copiedUrlId === id) {
        this.copiedUrlId = null;
        this.cdr.detectChanges();
      }
    }, 2000);
  }

  private fallbackCopy(text: string, id: number): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const success = document.execCommand('copy');
      if (success) {
        this.markAsCopied(id);
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }

  onDelete(url: UrlDtoResponse): void {
    const confirmDelete = window.confirm(`Deseja realmente excluir o link "/${url.name}"?`);
    if (!confirmDelete) {
      return;
    }

    this.deletingUrlId = url.id;
    this.urlService.deleteUrl(url.id).subscribe({
      next: () => {
        this.deletingUrlId = null;
        this.urls = this.urls.filter((item) => item.id !== url.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deletingUrlId = null;
        this.cdr.detectChanges();
        alert(err?.error?.message || 'Erro ao excluir o link. Tente novamente.');
      },
    });
  }
}
