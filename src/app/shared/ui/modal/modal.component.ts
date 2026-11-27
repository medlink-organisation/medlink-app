import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';

import { HlmDialogService } from '../primitives/dialog/src';

interface ModalDialogContext {
  title: string;
  description: string;
  content: TemplateRef<unknown>;
}

@Component({
  selector: 'app-modal-dialog-content',
  template: `
    <div hlmDialogHeader>
      <h2 hlmDialogTitle>{{ context.title }}</h2>
      <p *ngIf="context.description" hlmDialogDescription>{{ context.description }}</p>
    </div>
    <div class="ml-modal__body ml-scrollbar">
      <ng-container *ngTemplateOutlet="context.content"></ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ModalDialogContentComponent {
  readonly context = injectBrnDialogContext<ModalDialogContext>();
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: false
})
export class ModalComponent implements OnDestroy {
  @Input() title = '';
  @Input() description = '';
  @Input() ariaLabel = '';
  @Input() closeDisabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() closed = new EventEmitter<void>();

  @ViewChild('contentTemplate', { static: true }) private contentTemplate!: TemplateRef<unknown>;

  private readonly dialogService = inject(HlmDialogService);
  private dialogRef?: BrnDialogRef<void>;

  show(): void {
    if (this.dialogRef?.open) {
      return;
    }

    this.dialogRef = this.dialogService.open<void, ModalDialogContext>(ModalDialogContentComponent, {
      ariaLabel: this.ariaLabel || this.title || 'Fenêtre MedLink',
      disableClose: this.closeDisabled,
      role: 'dialog',
      showCloseButton: !this.closeDisabled,
      closeLabel: 'Fermer',
      contentClass: this.contentClass,
      context: {
        title: this.title,
        description: this.description,
        content: this.contentTemplate
      }
    });

    this.dialogRef.closed$.subscribe(() => {
      this.dialogRef = undefined;
      this.closed.emit();
    });
  }

  hide(): void {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    this.dialogRef?.forceClose();
  }

  private get contentClass(): string {
    const width = this.size === 'lg' ? 'sm:max-w-3xl' : this.size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-xl';
    return `ml-modal ${width}`;
  }
}
