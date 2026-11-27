import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, catchError, finalize } from 'rxjs';

import { AuditRevision, AuditSource } from '../../models';
import { AuditService } from '../../services/audit.service';

export interface EntityDetailItem {
  label: string;
  value: unknown;
}

@Component({
  selector: 'app-entity-details-history',
  templateUrl: './entity-details-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class EntityDetailsHistoryComponent implements OnChanges {
  private readonly auditService = inject(AuditService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) source: AuditSource = 'directory';
  @Input({ required: true }) entityType = '';
  @Input() entityId: string | number | null = null;
  @Input() details: EntityDetailItem[] = [];

  revisions: AuditRevision[] = [];
  loading = false;
  error = '';

  ngOnChanges(): void {
    if (this.entityType && this.entityId !== null && this.entityId !== undefined) {
      this.loadHistory();
    }
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? timestamp
      : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return 'Valeur non affichable';
      }
    }
    return String(value);
  }

  operationLabel(operation: AuditRevision['operation']): string {
    return operation === 'ADD' ? 'Création' : operation === 'MOD' ? 'Modification' : 'Suppression';
  }

  trackRevision(_index: number, revision: AuditRevision): number {
    return revision.revisionId;
  }

  private loadHistory(): void {
    this.loading = true;
    this.error = '';
    this.revisions = [];
    this.auditService.getHistory(this.source, this.entityType, this.entityId!, { page: 0, size: 50 }).pipe(
      catchError((error: unknown) => {
        this.error = error instanceof HttpErrorResponse && error.status === 403
          ? 'Votre compte ne possède pas l’autorité AUDIT_READ.'
          : 'Impossible de charger l’historique de cet élément.';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((page) => {
      this.revisions = page.content;
      this.changeDetectorRef.markForCheck();
    });
  }
}
