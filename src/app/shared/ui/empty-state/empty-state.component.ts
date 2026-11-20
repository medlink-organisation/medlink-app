import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: false
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon: IconName | '' = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
