import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-selection-card',
  templateUrl: './selection-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SelectionCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() meta = '';
  @Input() icon: 'building' | 'tag' | 'users' | 'stethoscope' = 'building';
  @Input() selected = false;
  @Input() disabled = false;
  @Input() multiple = false;
  @Output() selectionChange = new EventEmitter<boolean>();

  toggle(): void {
    if (!this.disabled) {
      this.selectionChange.emit(!this.selected);
    }
  }
}
