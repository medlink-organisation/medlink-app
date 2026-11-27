import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { EMPTY, Subject, catchError, takeUntil } from 'rxjs';

import { AuditRevision, AuditSource, PageResponse } from '../../../models';
import { AuditService } from '../../../services/audit.service';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  standalone: false
})
export class AuditListComponent implements OnInit, OnDestroy {
  private readonly auditService = inject(AuditService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('historyDialog') private historyDialog?: ModalComponent;

  source: AuditSource = 'directory';
  entityType = '';
  entities: string[] = [];
  revisions: PageResponse<AuditRevision> | null = null;
  selectedRevision: AuditRevision | null = null;
  loading = false;
  error = '';
  currentPage = 0;
  pageSize = 20;

  readonly columns: ColumnDef[] = [
    { key: 'entityName', label: 'Type' },
    { key: 'entityId', label: 'Identifiant' },
    { key: 'username', label: 'Créé par', formatter: (value) => this.textValue(value, 'Système') },
    { key: 'timestamp', label: 'Date de création', formatter: (value) => this.formatDate(value) },
    { key: 'serviceName', label: 'Service' }
  ];

  ngOnInit(): void {
    this.loadEntities();
    this.loadCreations();
  }

  setSource(source: AuditSource): void {
    if (this.source === source) {
      return;
    }
    this.source = source;
    this.entityType = '';
    this.currentPage = 0;
    this.loadEntities();
    this.loadCreations();
  }

  setEntityType(value: string): void {
    this.entityType = value;
    this.currentPage = 0;
    this.loadCreations();
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadCreations();
  }

  openDetails(row: unknown): void {
    if (!this.isAuditRevision(row)) {
      return;
    }
    this.selectedRevision = row;
    this.historyDialog?.show();
  }

  loadCreations(): void {
    this.loading = true;
    this.error = '';
    this.auditService.getCreations(this.source, {
      page: this.currentPage,
      size: this.pageSize,
      ...(this.entityType ? { entityType: this.entityType } : {})
    }).pipe(
      catchError((error: unknown) => {
        this.error = error instanceof HttpErrorResponse && error.status === 403
          ? 'Votre compte Administrateur ne possède pas encore l’autorité AUDIT_READ.'
          : 'Impossible de charger l’historique des créations.';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.revisions = page;
      this.loading = false;
    });
  }

  formatDate(value: unknown): string {
    if (typeof value !== 'string') {
      return '—';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEntities(): void {
    this.auditService.getEntities(this.source).pipe(
      catchError(() => EMPTY),
      takeUntil(this.destroy$)
    ).subscribe((entities) => {
      this.entities = entities;
    });
  }

  private textValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  private isAuditRevision(value: unknown): value is AuditRevision {
    return typeof value === 'object' && value !== null && 'revisionId' in value && 'operation' in value;
  }
}
