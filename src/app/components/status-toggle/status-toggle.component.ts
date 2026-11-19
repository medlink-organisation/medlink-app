import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-toggle',
  templateUrl: './status-toggle.component.html',
  standalone: false
})
export class StatusToggleComponent {
  @Input() id!: number;
  @Input() actif = false;
  @Input() loading = false;
  @Output() toggled = new EventEmitter<{ id: number; actif: boolean }>();

  toggle(): void {
    if (!this.loading) {
      this.toggled.emit({ id: this.id, actif: !this.actif });
    }
  }
}