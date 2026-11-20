import { Component, Input } from '@angular/core';

export type CardVariant = 'default' | 'section' | 'interactive';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: false
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padded = true;

  get cardClass(): string {
    const base = 'overflow-hidden rounded-[var(--ml-radius-lg)] border border-[var(--ml-border)] bg-[var(--ml-surface)] text-[var(--ml-text-primary)] shadow-[var(--ml-shadow-xs)]';
    const padding = this.padded ? ' p-5 sm:p-6' : '';
    const variantClass = this.variant === 'interactive'
      ? ' transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--ml-border-strong)] hover:shadow-[var(--ml-shadow-sm)]'
      : this.variant === 'section' ? ' divide-y divide-[var(--ml-border)]' : '';
    return `${base}${padding}${variantClass}`;
  }
}
