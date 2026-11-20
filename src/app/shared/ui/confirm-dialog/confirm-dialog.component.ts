import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { ButtonVariant } from '../button/button.component';
import { HlmDialogService } from '../primitives/dialog/src';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  standalone: false
})
export class ConfirmDialogComponent implements OnDestroy {
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() destructive = false;
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogTemplate', { static: true }) private dialogTemplate!: TemplateRef<unknown>;

  private readonly dialogService = inject(HlmDialogService);
  private dialogRef?: BrnDialogRef<void>;

  get confirmVariant(): ButtonVariant {
    return this.destructive ? 'destructive' : 'default';
  }

  show(): void {
    if (this.dialogRef?.open) {
      return;
    }

    this.dialogRef = this.dialogService.open<void>(this.dialogTemplate, {
      ariaLabel: this.title || 'Confirmation',
      disableClose: this.loading,
      role: this.destructive ? 'alertdialog' : 'dialog',
      showCloseButton: false,
      contentClass: 'ml-confirm-dialog'
    });

    this.dialogRef.closed$.subscribe(() => {
      this.dialogRef = undefined;
    });
  }

  hide(): void {
    this.dialogRef?.close();
    this.dialogRef = undefined;
  }

  onConfirm(): void {
    if (this.loading) {
      return;
    }
    this.confirmed.emit();
    this.hide();
  }

  onCancel(): void {
    if (this.loading) {
      return;
    }
    this.cancelled.emit();
    this.hide();
  }

  ngOnDestroy(): void {
    this.dialogRef?.forceClose();
  }
}
