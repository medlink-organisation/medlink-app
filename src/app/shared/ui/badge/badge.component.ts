import { Component, Input } from '@angular/core';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  standalone: false
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() tone?: BadgeTone;
  @Input() className = '';

  get toneClass(): string {
    if (!this.tone) {
      return '';
    }
    return `ml-badge ml-badge--${this.tone}`;
  }
}
