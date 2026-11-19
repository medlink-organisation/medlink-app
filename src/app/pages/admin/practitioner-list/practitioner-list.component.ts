import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { catchError, EMPTY, Subject, takeUntil } from 'rxjs';

import { CreatePraticienRequest, PageResponse, Praticien, Specialite, UpdatePraticienRequest } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { PraticienService } from '../../../services/praticien.service';
import { SpecialiteService } from '../../../services/specialite.service';

@Component({
  selector: 'app-practitioner-list',
  templateUrl: './practitioner-list.component.html',
  standalone: false
})
export class PractitionerListComponent implements OnInit, OnDestroy {
  private readonly praticienService = inject(PraticienService);
  private readonly specialiteService = inject(SpecialiteService);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;

  praticiens: PageResponse<Praticien> | null = null;
  specialites: Specialite[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  showForm = false;
  editTarget: Praticien | null = null;
  deleteTarget: number | null = null;
  destroy$ = new Subject<void>();
  searchTerm = '';

  readonly columns: ColumnDef[] = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'specialiteId', label: 'Spécialité', formatter: (value) => this.specialiteName(value) },
    { key: 'actif', label: 'Statut', formatter: (value) => value ? 'Actif' : 'Inactif' }
  ];

  ngOnInit(): void {
    this.loadPraticiens();
    this.loadSpecialites();
  }

  loadPraticiens(): void {
    this.loading = true;
    this.error = null;
    this.praticienService.getAll({ page: this.currentPage, size: this.pageSize, sort: 'id' }).pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des praticiens';
        this.loading = false;
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.praticiens = page;
      this.loading = false;
    });
  }

  loadSpecialites(): void {
    this.specialiteService.getAll({ page: 0, size: 100 }).pipe(
      catchError(() => EMPTY),
      takeUntil(this.destroy$)
    ).subscribe((page) => this.specialites = page.content);
  }

  get rows(): Praticien[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const rows = this.praticiens?.content ?? [];
    return term
      ? rows.filter((praticien) => `${praticien.nom} ${praticien.prenom} ${praticien.email}`.toLocaleLowerCase().includes(term))
      : rows;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 0;
    this.loadPraticiens();
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadPraticiens();
  }

  onRowClick(row: unknown): void {
    if (this.isPraticien(row)) {
      this.onEdit(row);
    }
  }

  onEdit(praticien: Praticien): void {
    this.editTarget = praticien;
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

  onFormSubmit(req: CreatePraticienRequest | UpdatePraticienRequest): void {
    this.loading = true;
    const request = this.editTarget
      ? this.praticienService.update(this.editTarget.id!, req as UpdatePraticienRequest)
      : this.praticienService.create(req as CreatePraticienRequest);
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
      this.loadPraticiens();
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
    this.praticienService.delete(this.deleteTarget).pipe(
      catchError(() => {
        this.error = 'Erreur lors de la suppression';
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleteTarget = null;
      this.loadPraticiens();
    });
  }

  onDeleteCancel(): void {
    this.deleteTarget = null;
  }

  onToggleStatus(event: { id: number; actif: boolean }): void {
    this.praticienService.changeStatus(event.id, event.actif).pipe(
      catchError(() => {
        this.error = 'Erreur lors du changement de statut';
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadPraticiens());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private specialiteName(value: unknown): string {
    const id = Number(value);
    return this.specialites.find((specialite) => specialite.id === id)?.nom ?? String(value ?? '');
  }

  private isPraticien(value: unknown): value is Praticien {
    return typeof value === 'object' && value !== null && 'nom' in value && 'email' in value;
  }
}
