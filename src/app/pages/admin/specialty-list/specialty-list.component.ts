import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { catchError, EMPTY, Subject, takeUntil } from 'rxjs';

import { CreateSpecialiteRequest, PageResponse, Specialite, UpdateSpecialiteRequest } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { SpecialiteService } from '../../../services/specialite.service';

@Component({
  selector: 'app-specialty-list',
  templateUrl: './specialty-list.component.html',
  standalone: false
})
export class SpecialtyListComponent implements OnInit, OnDestroy {
  private readonly specialiteService = inject(SpecialiteService);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;

  specialites: PageResponse<Specialite> | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  showForm = false;
  editTarget: Specialite | null = null;
  deleteTarget: number | null = null;
  destroy$ = new Subject<void>();
  searchTerm = '';

  readonly columns: ColumnDef[] = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'description', label: 'Description' },
    { key: 'actif', label: 'Statut', formatter: (value) => value ? 'Actif' : 'Inactif' }
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
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.specialites = page;
      this.loading = false;
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
      this.onEdit(row);
    }
  }

  onEdit(specialite: Specialite): void {
    this.editTarget = specialite;
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

  onFormSubmit(req: CreateSpecialiteRequest | UpdateSpecialiteRequest): void {
    this.loading = true;
    const request = this.editTarget
      ? this.specialiteService.update(this.editTarget.id!, req as UpdateSpecialiteRequest)
      : this.specialiteService.create(req as CreateSpecialiteRequest);
    request.pipe(
      catchError(() => {
        this.error = 'Erreur lors de l’enregistrement';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.showForm = false;
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
