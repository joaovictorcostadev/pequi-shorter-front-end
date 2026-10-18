import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserPageComponent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlDtoResponse } from '../../core/models/url.model';

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
  ) {}

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.urlService.getUrls().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.urls = response?.data ?? [];
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          'Não foi possível carregar os links. Verifique sua conexão e tente novamente.';
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/links/create']);
  }

  copyToClipboard(url: UrlDtoResponse): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url.url).then(() => {
        this.copiedUrlId = url.id;
        setTimeout(() => {
          if (this.copiedUrlId === url.id) {
            this.copiedUrlId = null;
          }
        }, 2000);
      });
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
      },
      error: (err) => {
        this.deletingUrlId = null;
        alert(err?.error?.message || 'Erro ao excluir o link. Tente novamente.');
      },
    });
  }
}
