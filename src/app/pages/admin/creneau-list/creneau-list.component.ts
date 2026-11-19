import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { catchError, EMPTY, Subject, takeUntil } from 'rxjs';

import { Creneau, CreateCreneauRequest, PageResponse, UpdateCreneauRequest } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { CreneauService } from '../../../services/creneau.service';

@Component({
  selector: 'app-creneau-list',
  templateUrl: './creneau-list.component.html',
  standalone: false
})
export class CreneauListComponent implements OnInit, OnDestroy {
  private readonly creneauService = inject(CreneauService);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;

  creneaux: PageResponse<Creneau> | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  showForm = false;
  editTarget: Creneau | null = null;
  deleteTarget: number | null = null;
  destroy$ = new Subject<void>();

  readonly columns: ColumnDef[] = [
    { key: 'praticienId', label: 'Praticien ID' },
    { key: 'cliniqueId', label: 'Clinique ID' },
    { key: 'dateDebut', label: 'Début' },
    { key: 'dateFin', label: 'Fin' },
    { key: 'statut', label: 'Statut' }
  ];

  ngOnInit(): void {
    this.loadCreneaux();
  }

  loadCreneaux(): void {
    this.loading = true;
    this.error = null;
    this.creneauService.getAll({ page: this.currentPage, size: this.pageSize, sort: 'dateDebut' }).pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des créneaux';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.creneaux = page;
      this.loading = false;
    });
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadCreneaux();
  }

  onRowClick(row: unknown): void {
    if (this.isCreneau(row)) {
      this.onEdit(row);
    }
  }

  onEdit(creneau: Creneau): void {
    this.editTarget = creneau;
    this.showForm = true;
  }

  onNew(): void {
    this.editTarget = null;
    this.showForm = true;
  }

  onFormCancel(): void {
    this.showForm = false;
    this.editTarget = null;
  }

  onFormSubmit(req: CreateCreneauRequest | UpdateCreneauRequest): void {
    this.loading = true;
    const request = this.editTarget
      ? this.creneauService.update(this.editTarget.id!, req as UpdateCreneauRequest)
      : this.creneauService.create(req as CreateCreneauRequest);
    request.pipe(
      catchError(() => {
        this.error = 'Erreur lors de l’enregistrement du créneau';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.showForm = false;
      this.editTarget = null;
      this.loadCreneaux();
    });
  }

  onDeleteRequest(id: number): void {
    this.deleteTarget = id;
    this.confirmDeleteDialog?.show();
  }

  onDeleteConfirm(): void {
    if (this.deleteTarget === null) {
      return;
    }
    this.creneauService.delete(this.deleteTarget).pipe(
      catchError(() => {
        this.error = 'Erreur lors de la suppression du créneau';
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleteTarget = null;
      this.loadCreneaux();
    });
  }

  onDeleteCancel(): void {
    this.deleteTarget = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isCreneau(value: unknown): value is Creneau {
    return typeof value === 'object' && value !== null && 'dateDebut' in value && 'dateFin' in value;
  }
}
