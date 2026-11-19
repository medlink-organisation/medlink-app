import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  standalone: false
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() trend = '';
  @Input() trendPositive = true;
}
