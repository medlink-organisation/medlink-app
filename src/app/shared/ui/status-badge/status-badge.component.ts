import { Component, Input } from '@angular/core';
import { BadgeVariant } from '../badge/badge.component';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  standalone: false
})
export class StatusBadgeComponent {
  @Input() value: boolean | string = false;
  @Input() trueLabel = 'Actif';
  @Input() falseLabel = 'Inactif';

  get variant(): BadgeVariant {
    if (typeof this.value === 'boolean') {
      return this.value ? 'default' : 'destructive';
    }
    return 'secondary';
  }

  get label(): string {
    if (typeof this.value === 'boolean') {
      return this.value ? this.trueLabel : this.falseLabel;
    }
    return this.value;
  }
}
