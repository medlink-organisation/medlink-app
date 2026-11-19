import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { catchError, EMPTY, Observable, Subject, takeUntil } from 'rxjs';

import { PageResponse, RendezVous } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { SchedulingInternalService } from '../../../services/scheduling-internal.service';

@Component({
  selector: 'app-rendez-vous-list',
  templateUrl: './rendez-vous-list.component.html',
  standalone: false
})
export class RendezVousListComponent implements OnInit, OnDestroy {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly schedulingInternalService = inject(SchedulingInternalService);

  rendezVous: PageResponse<RendezVous> | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  selectedRdv: RendezVous | null = null;
  actionLoading = false;
  destroy$ = new Subject<void>();

  readonly columns: ColumnDef[] = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Statut' },
    { key: 'creneauId', label: 'Créneau' },
    { key: 'patientId', label: 'Patient' }
  ];

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.error = null;
    this.rendezVousService.getAll({ page: this.currentPage, size: this.pageSize, sort: 'createdAt' }).pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.rendezVous = page;
      this.loading = false;
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

  onAction(event: { id: string; action: string }): void {
    if (event.action === 'reporter') {
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
    request.pipe(
      catchError(() => {
        this.error = 'Erreur lors de l’action';
        this.actionLoading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.actionLoading = false;
      this.selectedRdv = null;
      this.loadRendezVous();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isRendezVous(value: unknown): value is RendezVous {
    return typeof value === 'object' && value !== null && 'status' in value && 'creneauId' in value;
  }
}
