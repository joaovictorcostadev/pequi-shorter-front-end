import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserPageComponent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlDtoResponse } from '../../core/models/url.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-stats-list-component',
  standalone: true,
  imports: [CommonModule, UserPageComponent, PageTitleComponent],
  templateUrl: './stats-list-component.html',
  styleUrl: './stats-list-component.scss',
})
export class StatsListComponent implements OnInit {
  urls: UrlDtoResponse[] = [];
  isLoading = false;
  errorMessage = '';

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
            'Não foi possível carregar os links para estatísticas.';
          this.cdr.detectChanges();
        },
      });
  }

  viewDetails(url: UrlDtoResponse): void {
    this.router.navigate(['/stats', url.id]);
  }
}
