import { Component, Input } from '@angular/core';
import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  standalone: false
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon: IconName | '' = '';
  @Input() trend = '';
  @Input() trendLabel = '';
  @Input() trendPositive = true;
  @Input() loading = false;
}
