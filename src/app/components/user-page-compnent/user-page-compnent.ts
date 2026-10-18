import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../side-bar-component/side-bar-component';

@Component({
  selector: 'app-user-page-component, app-user-page-compnent',
  standalone: true,
  imports: [CommonModule, SideBarComponent],
  templateUrl: './user-page-compnent.html',
  styleUrl: './user-page-compnent.scss',
})
export class UserPageCompnent {
  /** Estado de recolhimento da sidebar */
  @Input() isSidebarCollapsed: boolean = false;

  /** Dados do usuário repassados para a sidebar */
  @Input() userName: string = 'Usuário Pequi';
  @Input() userAvatarUrl: string = '';
  @Input() logoSrc: string = '/logos/logo-v.png';

  @Output() sidebarCollapsedChange = new EventEmitter<boolean>();

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
    this.sidebarCollapsedChange.emit(collapsed);
  }
}

// Exporta também com o nome corrigido para flexibilidade de import
export { UserPageCompnent as UserPageComponent };
