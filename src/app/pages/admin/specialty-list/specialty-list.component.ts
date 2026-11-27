import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { catchError, EMPTY, finalize, Subject, takeUntil } from 'rxjs';

import { CreateSpecialiteRequest, PageResponse, Specialite, UpdateSpecialiteRequest } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { DataTableRowAction, DataTableRowActionEvent } from '../../../shared/ui/data-table/data-table.component';
import { EntityDetailItem } from '../../../components/entity-details-history/entity-details-history.component';
import { SpecialiteService } from '../../../services/specialite.service';

@Component({
  selector: 'app-specialty-list',
  templateUrl: './specialty-list.component.html',
  standalone: false
})
export class SpecialtyListComponent implements OnInit, OnDestroy {
  private readonly specialiteService = inject(SpecialiteService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;
  @ViewChild('specialtyDialog') private specialtyDialog?: ModalComponent;
  @ViewChild('specialtyDetailsDialog') private specialtyDetailsDialog?: ModalComponent;

  specialites: PageResponse<Specialite> | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  editTarget: Specialite | null = null;
  detailTarget: Specialite | null = null;
  deleteTarget: number | null = null;
  destroy$ = new Subject<void>();
  searchTerm = '';

  readonly columns: ColumnDef[] = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'description', label: 'Description' },
    { key: 'actif', label: 'Statut', formatter: (value) => value ? 'Actif' : 'Inactif' }
  ];

  readonly rowActions: DataTableRowAction[] = [
    { id: 'details', label: 'Plus de détails', icon: 'eye' },
    { id: 'edit', label: 'Modifier', icon: 'edit' },
    { id: 'delete', label: 'Supprimer', icon: 'trash', destructive: true }
  ];

  ngOnInit(): void {
    this.loadSpecialites();
  }

  loadSpecialites(): void {
    this.loading = true;
    this.error = null;
    this.specialiteService.getAll({ page: this.currentPage, size: this.pageSize, sort: 'id' }).pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des spécialités';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.specialites = page;
      this.changeDetectorRef.markForCheck();
    });
  }

  get rows(): Specialite[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const rows = this.specialites?.content ?? [];
    return term
      ? rows.filter((specialite) =>
        `${specialite.code} ${specialite.nom} ${specialite.description ?? ''}`.toLocaleLowerCase().includes(term))
      : rows;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 0;
    this.loadSpecialites();
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadSpecialites();
  }

  onRowClick(row: unknown): void {
    if (this.isSpecialite(row)) {
      this.openDetails(row);
    }
  }

  onTableAction(event: DataTableRowActionEvent): void {
    if (!this.isSpecialite(event.row)) {
      return;
    }
    if (event.action === 'details') {
      this.openDetails(event.row);
    } else if (event.action === 'edit') {
      this.onEdit(event.row);
    } else if (event.action === 'delete' && event.row.id !== null) {
      this.onDeleteRequest(event.row.id);
    }
  }

  openDetails(specialite: Specialite): void {
    this.detailTarget = specialite;
    this.specialtyDetailsDialog?.show();
  }

  detailsFor(specialite: Specialite): EntityDetailItem[] {
    return [
      { label: 'Code', value: specialite.code },
      { label: 'Nom', value: specialite.nom },
      { label: 'Description', value: specialite.description },
      { label: 'Statut', value: specialite.actif ? 'Active' : 'Inactive' }
    ];
  }

  onEdit(specialite: Specialite): void {
    this.editTarget = specialite;
    this.specialtyDialog?.show();
  }

  onNew(): void {
    this.editTarget = null;
    this.specialtyDialog?.show();
  }

  onFormCancel(): void {
    this.specialtyDialog?.hide();
    this.editTarget = null;
  }

  onFormSubmit(req: CreateSpecialiteRequest | UpdateSpecialiteRequest): void {
    this.loading = true;
    const request = this.editTarget
      ? this.specialiteService.update(this.editTarget.id!, req as UpdateSpecialiteRequest)
      : this.specialiteService.create(req as CreateSpecialiteRequest);
    request.pipe(
      catchError(() => {
        this.error = 'Erreur lors de l’enregistrement';
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.specialtyDialog?.hide();
      this.editTarget = null;
      this.loadSpecialites();
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
    this.specialiteService.delete(this.deleteTarget).pipe(
      catchError(() => {
        this.error = 'Erreur lors de la suppression';
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleteTarget = null;
      this.loadSpecialites();
    });
  }

  onDeleteCancel(): void {
    this.deleteTarget = null;
  }

  onToggleStatus(event: { id: number; actif: boolean }): void {
    this.specialiteService.changeStatus(event.id, event.actif).pipe(
      catchError(() => {
        this.error = 'Erreur lors du changement de statut';
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadSpecialites());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isSpecialite(value: unknown): value is Specialite {
    return typeof value === 'object' && value !== null && 'code' in value && 'nom' in value;
  }
}
