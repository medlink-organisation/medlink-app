import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: false
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
}
