import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';

export interface NavItem {
  id: string;
  label: string;
  icon: 'home' | 'link' | 'list' | 'chart' | 'settings';
  routerLink?: string;
  badge?: string;
  badgeType?: 'primary' | 'warning' | 'info' | 'success';
}

@Component({
  selector: 'app-side-bar-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar-component.html',
  styleUrl: './side-bar-component.scss',
})
export class SideBarComponent {
  /** Se a sidebar está recolhida no modo desktop (somente ícones) */
  @Input() isCollapsed: boolean = false;

  /** Se a sidebar está aberta no modo mobile (gaveta / offcanvas) */
  @Input() isMobileOpen: boolean = false;

  /** Mostra botão de menu hambúrguer para dispositivos móveis */
  @Input() showMobileToggle: boolean = true;

  /** Caminho do logo */
  @Input() logoSrc: string = '/logos/logo-v.png';

  /** Informações do usuário */
  @Input() userName: string = 'Usuário Pequi';
  @Input() userAvatarUrl: string = '';

  /** Itens de navegação configuráveis */
  @Input() navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: 'home',
      routerLink: '/home',
    },
    {
      id: 'shorten',
      label: 'Encurtar Link',
      icon: 'link',
      routerLink: '/links/create',
      badge: 'Novo',
      badgeType: 'warning',
    },
    {
      id: 'my-links',
      label: 'Meus Links',
      icon: 'list',
      routerLink: '/links',
    },
    {
      id: 'analytics',
      label: 'Estatísticas',
      icon: 'chart',
      routerLink: '/home',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'settings',
      routerLink: '/home',
    },
  ];

  @Input() activeItemId: string = 'home';

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  @Output() itemClick = new EventEmitter<NavItem>();
  @Output() logout = new EventEmitter<void>();

  constructor(private router: Router) {}

  get userInitials(): string {
    if (!this.userName) return 'PQ';
    const parts = this.userName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.mobileOpenChange.emit(this.isMobileOpen);
  }

  openMobile(): void {
    if (!this.isMobileOpen) {
      this.isMobileOpen = true;
      this.mobileOpenChange.emit(true);
    }
  }

  closeMobile(): void {
    if (this.isMobileOpen) {
      this.isMobileOpen = false;
      this.mobileOpenChange.emit(false);
    }
  }

  selectItem(item: NavItem): void {
    this.activeItemId = item.id;
    this.itemClick.emit(item);

    if (item.routerLink) {
      this.router.navigate([item.routerLink]);
    }

    if (this.isMobileView()) {
      this.closeMobile();
    }
  }

  private authService = inject(AuthService, { optional: true });

  onLogout(): void {
    this.authService?.clearSession();
    this.logout.emit();
    this.router.navigate(['/login']);
    if (this.isMobileView()) {
      this.closeMobile();
    }
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 992;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isMobileView() && this.isMobileOpen) {
      this.closeMobile();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileOpen) {
      this.closeMobile();
    }
  }
}
