import { Component, Input } from '@angular/core';
import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  standalone: false
})
export class SectionCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon?: IconName;
}
