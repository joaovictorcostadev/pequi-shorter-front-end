import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-title, app-page-title-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-title-component.html',
  styleUrl: './page-title-component.scss',
})
export class PageTitleComponent {
  /** Título principal da página */
  @Input() title: string = '';

  /** Subtítulo descritivo da página */
  @Input() subtitle: string = '';

  /** Texto opcional para botão de voltar */
  @Input() backButtonText: string = '';

  /** Evento disparado ao clicar no botão de voltar */
  @Output() backClick = new EventEmitter<void>();

  onBack(): void {
    this.backClick.emit();
  }
}
