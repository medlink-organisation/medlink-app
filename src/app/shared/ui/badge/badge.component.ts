import { Component, Input } from '@angular/core';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  standalone: false
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() className = '';
}
