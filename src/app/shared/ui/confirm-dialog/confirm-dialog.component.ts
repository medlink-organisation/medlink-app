import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { ButtonVariant } from '../button/button.component';
import { HlmDialogService } from '../primitives/dialog/src';

interface ConfirmDialogContext {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant: ButtonVariant;
  loading: boolean;
  confirm: () => void;
  cancel: () => void;
}

@Component({
  selector: 'app-confirm-dialog-content',
  template: `
    <div hlmDialogHeader>
      <h2 hlmDialogTitle>{{ context.title }}</h2>
      <p hlmDialogDescription>{{ context.message }}</p>
    </div>
    <div hlmDialogFooter>
      <app-button variant="outline" [disabled]="context.loading" (click)="context.cancel()">
        {{ context.cancelLabel }}
      </app-button>
      <app-button [variant]="context.confirmVariant" [loading]="context.loading" (click)="context.confirm()">
        {{ context.confirmLabel }}
      </app-button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ConfirmDialogContentComponent {
  readonly context = injectBrnDialogContext<ConfirmDialogContext>();
}

@Component({
  selector: 'app-confirm-dialog',
  template: '',
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

  private readonly dialogService = inject(HlmDialogService);
  private dialogRef?: BrnDialogRef<void>;

  get confirmVariant(): ButtonVariant {
    return this.destructive ? 'destructive' : 'default';
  }

  show(): void {
    if (this.dialogRef?.open) {
      return;
    }

    this.dialogRef = this.dialogService.open<void, ConfirmDialogContext>(ConfirmDialogContentComponent, {
      ariaLabel: this.title || 'Confirmation',
      disableClose: this.loading,
      role: this.destructive ? 'alertdialog' : 'dialog',
      showCloseButton: false,
      contentClass: 'ml-confirm-dialog',
      context: {
        title: this.title,
        message: this.message,
        confirmLabel: this.confirmLabel,
        cancelLabel: this.cancelLabel,
        confirmVariant: this.confirmVariant,
        loading: this.loading,
        confirm: () => this.onConfirm(),
        cancel: () => this.onCancel()
      }
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
