import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPageComponent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlAccessDto } from '../../core/models/url-access.model';
import { UrlDtoResponse } from '../../core/models/url.model';
import { finalize, forkJoin } from 'rxjs';

export interface StatItem {
  label: string;
  count: number;
  percentage: number;
}

export interface DayAccessItem {
  date: string;
  displayDate: string;
  count: number;
  heightPercent: number;
}

@Component({
  selector: 'app-stats-detail-component',
  standalone: true,
  imports: [CommonModule, UserPageComponent, PageTitleComponent],
  templateUrl: './stats-detail-component.html',
  styleUrl: './stats-detail-component.scss',
})
export class StatsDetailComponent implements OnInit {
  urlId: number = 0;
  currentUrl: UrlDtoResponse | null = null;
  accesses: UrlAccessDto[] = [];
  isLoading = false;
  errorMessage = '';

  // Indicadores calculados
  totalClicks = 0;
  uniqueIps = 0;
  topCountry = '—';
  topDevice = '—';

  // Breakdowns
  countries: StatItem[] = [];
  cities: StatItem[] = [];
  devices: StatItem[] = [];
  operatingSystems: StatItem[] = [];
  browsers: StatItem[] = [];
  recentDays: DayAccessItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private urlService: UrlService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.urlId = Number(idParam);
      this.loadData();
    } else {
      this.errorMessage = 'Identificador da URL inválido.';
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      urlsRes: this.urlService.getUrls(),
      accessRes: this.urlService.getUrlAccess(this.urlId),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ urlsRes, accessRes }) => {
          const allUrls = urlsRes?.data ?? [];
          this.currentUrl = allUrls.find((u) => u.id === this.urlId) || null;
          this.accesses = accessRes?.data ?? [];
          this.calculateMetrics();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'Não foi possível carregar as métricas deste link. Verifique sua conexão e tente novamente.';
          this.cdr.detectChanges();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/stats']);
  }

  private calculateMetrics(): void {
    const list = this.accesses;
    this.totalClicks = list.length;

    if (this.totalClicks === 0) {
      this.uniqueIps = 0;
      this.topCountry = '—';
      this.topDevice = '—';
      this.countries = [];
      this.cities = [];
      this.devices = [];
      this.operatingSystems = [];
      this.browsers = [];
      this.recentDays = [];
      return;
    }

    // IPs únicos
    const ips = new Set(list.map((a) => a.ip).filter(Boolean));
    this.uniqueIps = ips.size;

    // Métricas agrupadas
    this.countries = this.groupByField(list, (a) => a.country || 'Desconhecido');
    this.cities = this.groupByField(list, (a) => a.city || 'Desconhecido');
    this.devices = this.groupByField(list, (a) => a.deviceType || a.device_type || 'Desconhecido');
    this.operatingSystems = this.groupByField(
      list,
      (a) => a.operatingSystem || a.operating_system || 'Desconhecido',
    );
    this.browsers = this.groupByField(list, (a) => a.browser || 'Desconhecido');

    this.topCountry = this.countries[0]?.label || '—';
    this.topDevice = this.devices[0]?.label || '—';

    // Gráfico de acessos nos últimos 7 dias
    this.calculateRecentDays(list);
  }

  private groupByField(
    items: UrlAccessDto[],
    extractor: (item: UrlAccessDto) => string,
  ): StatItem[] {
    const total = items.length;
    const counts = new Map<string, number>();

    for (const item of items) {
      const key = extractor(item).trim() || 'Desconhecido';
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateRecentDays(items: UrlAccessDto[]): void {
    const daysMap = new Map<string, number>();
    const now = new Date();

    // Inicializa os últimos 7 dias
    const dayKeys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayKeys.push(key);
      daysMap.set(key, 0);
    }

    for (const item of items) {
      if (item.updatedAt) {
        const itemDateKey = item.updatedAt.slice(0, 10);
        if (daysMap.has(itemDateKey)) {
          daysMap.set(itemDateKey, (daysMap.get(itemDateKey) || 0) + 1);
        }
      }
    }

    const counts = dayKeys.map((k) => daysMap.get(k) || 0);
    const maxCount = Math.max(...counts, 1);

    this.recentDays = dayKeys.map((k) => {
      const [year, month, day] = k.split('-');
      const count = daysMap.get(k) || 0;
      return {
        date: k,
        displayDate: `${day}/${month}`,
        count,
        heightPercent: Math.max(Math.round((count / maxCount) * 100), count > 0 ? 12 : 4),
      };
    });
  }

  formatDate(isoString: string): string {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }
}
