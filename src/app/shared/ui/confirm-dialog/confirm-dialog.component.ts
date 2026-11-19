import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonVariant } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  standalone: false
})
export class ConfirmDialogComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  open = false;

  get confirmVariant(): ButtonVariant {
    return this.destructive ? 'destructive' : 'default';
  }

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.hide();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.hide();
  }
}
