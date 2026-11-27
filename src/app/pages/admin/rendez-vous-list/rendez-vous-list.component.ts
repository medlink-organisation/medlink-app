import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { catchError, EMPTY, Observable, Subject, takeUntil } from 'rxjs';

import { AdminRendezVous, PageResponse, RendezVous, StatusRendezVous, TypeRendezVous } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { DataTableRowAction, DataTableRowActionEvent } from '../../../shared/ui/data-table/data-table.component';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { SchedulingInternalService } from '../../../services/scheduling-internal.service';

@Component({
  selector: 'app-rendez-vous-list',
  templateUrl: './rendez-vous-list.component.html',
  standalone: false,
})
export class RendezVousListComponent implements OnInit, OnDestroy {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly schedulingInternalService = inject(SchedulingInternalService);
  private readonly cdr = inject(ChangeDetectorRef);
  rendezVous: PageResponse<AdminRendezVous> | null = null;
  rows: RendezVousTableRow[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  selectedRdv: AdminRendezVous | null = null;
  actionLoading = false;
  destroy$ = new Subject<void>();

  readonly columns: ColumnDef[] = [
    { key: 'patient', label: 'Patient' },
    { key: 'praticien', label: 'Praticien' },
    { key: 'dateRendezVous', label: 'Date' },
    { key: 'heureDebut', label: 'Début' },
    { key: 'heureFin', label: 'Fin' },
    { key: 'type', label: 'Type', formatter: (value) => this.typeLabel(value) },
    { key: 'status', label: 'Statut', statusBadge: true },
  ];

  readonly rowActions: DataTableRowAction[] = [
    {
      id: 'confirmer',
      label: 'Confirmer',
      icon: 'check',
      visible: (row) => this.hasStatus(row, 'EN_ATTENTE'),
    },
    {
      id: 'annuler',
      label: 'Annuler',
      icon: 'x',
      destructive: true,
      visible: (row) => this.hasStatus(row, 'EN_ATTENTE'),
    },
    {
      id: 'terminer',
      label: 'Terminer',
      icon: 'circle-check',
      visible: (row) => this.hasStatus(row, 'CONFIRME'),
    },
    {
      id: 'absent',
      label: 'Marquer absent',
      icon: 'circle-x',
      destructive: true,
      visible: (row) => this.hasStatus(row, 'CONFIRME'),
    },
    {
      id: 'reporter',
      label: 'Reporter',
      icon: 'clock',
      visible: (row) => this.hasStatus(row, 'CONFIRME'),
    },
  ];

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.error = null;
    this.rendezVousService
      .getAll({ page: this.currentPage, size: this.pageSize, sort: 'creneau.dateDebut,desc' })
      .pipe(
        catchError(() => {
          this.error = 'Erreur lors du chargement des rendez-vous';
          this.loading = false;
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((page) => {
        this.rendezVous = page;
        this.rows = page.content.map((rendezVous) => this.toTableRow(rendezVous));
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadRendezVous();
  }

  onRowClick(rdv: unknown): void {
    if (this.isRendezVous(rdv)) {
      this.selectedRdv = rdv;
    }
  }

  onTableAction(event: DataTableRowActionEvent): void {
    if (this.isRendezVous(event.row)) {
      this.onAction({ id: event.row.id, action: event.action });
    }
  }

  onAction(event: { id: string; action: string }): void {
    if (this.actionLoading || event.action === 'reporter') {
      return;
    }

    let request: Observable<RendezVous>;
    switch (event.action) {
      case 'confirmer':
        request = this.schedulingInternalService.confirmer(event.id);
        break;
      case 'annuler':
        request = this.schedulingInternalService.annuler(event.id);
        break;
      case 'terminer':
        request = this.schedulingInternalService.terminer(event.id);
        break;
      case 'absent':
        request = this.schedulingInternalService.absent(event.id);
        break;
      default:
        return;
    }

    this.actionLoading = true;
    this.error = null;
    request
      .pipe(
        catchError(() => {
          this.error = 'Erreur lors de l’action';
          this.actionLoading = false;
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.actionLoading = false;
        this.selectedRdv = null;
        this.loadRendezVous();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toTableRow(rendezVous: AdminRendezVous): RendezVousTableRow {
    return {
      ...rendezVous,
      patient: this.fullName(rendezVous.patientNom, rendezVous.patientPrenom),
      praticien: this.fullName(rendezVous.praticienNom, rendezVous.praticienPrenom),
      dateRendezVous: this.dateLabel(rendezVous.dateDebut),
      heureDebut: this.timeLabel(rendezVous.dateDebut),
      heureFin: this.timeLabel(rendezVous.dateFin),
    };
  }

  private fullName(nom: string, prenom: string): string {
    return `${nom} ${prenom}`.trim() || '—';
  }

  private dateLabel(value: string): string {
    const [date] = value.split('T');
    const [year, month, day] = date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private timeLabel(value: string): string {
    const time = value.split('T')[1];
    return time ? time.slice(0, 5) : value;
  }

  private typeLabel(value: unknown): string {
    const labels: Record<TypeRendezVous, string> = {
      CONSULTATION: 'Consultation',
      CONTROLE: 'Contrôle',
      URGENCE: 'Urgence',
    };
    return typeof value === 'string' && value in labels
      ? labels[value as TypeRendezVous]
      : String(value ?? '');
  }

  private hasStatus(row: unknown, status: StatusRendezVous): boolean {
    return this.isRendezVous(row) && row.status === status;
  }

  private isRendezVous(value: unknown): value is AdminRendezVous {
    return typeof value === 'object'
      && value !== null
      && 'id' in value
      && 'status' in value
      && 'dateDebut' in value;
  }
}

type RendezVousTableRow = AdminRendezVous & {
  patient: string;
  praticien: string;
  dateRendezVous: string;
  heureDebut: string;
  heureFin: string;
};
