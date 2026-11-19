import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ColumnDef } from '../../../shared/ui/column-def.model';
import { Creneau, CreateCreneauRequest, PageResponse, UpdateCreneauRequest } from '../../../models';
import { CreneauService } from '../../../services/creneau.service';

@Component({
  selector: 'app-mes-creneaux',
  templateUrl: './mes-creneaux.component.html',
  standalone: false
})
export class MesCreneauxComponent implements OnInit {
  private readonly creneauService = inject(CreneauService);
  creneaux: PageResponse<Creneau> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true };
  loading = false;
  saving = false;
  currentPage = 0;
  pageSize = 10;
  showForm = false;
  editTarget: Creneau | null = null;
  error = '';
  readonly columns: ColumnDef[] = [
    { key: 'dateDebut', label: 'Début' },
    { key: 'dateFin', label: 'Fin' },
    { key: 'statut', label: 'Statut' },
    { key: 'cliniqueId', label: 'Clinique' }
  ];

  ngOnInit(): void {
    this.load();
  }

  onRowClick(row: unknown): void {
    if (this.isCreneau(row)) {
      this.editTarget = row;
      this.showForm = true;
    }
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.load();
  }

  onFormSubmit(request: CreateCreneauRequest | UpdateCreneauRequest): void {
    this.saving = true;
    let operation: Observable<Creneau>;
    if (this.editTarget?.id != null) {
      operation = this.creneauService.update(this.editTarget.id, request);
    } else if (this.isCreateRequest(request)) {
      operation = this.creneauService.create(request);
    } else {
      this.saving = false;
      this.error = 'Les informations saisies sont incomplètes.';
      return;
    }
    operation.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.editTarget = null;
        this.load();
      },
      error: () => {
        this.saving = false;
        this.error = 'Impossible d’enregistrer le créneau.';
      }
    });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.creneauService.getAll({ page: this.currentPage, size: this.pageSize }).subscribe({
      next: (page) => {
        this.creneaux = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos créneaux.';
      }
    });
  }

  private isCreneau(value: unknown): value is Creneau {
    return typeof value === 'object' && value !== null && 'dateDebut' in value;
  }

  private isCreateRequest(request: CreateCreneauRequest | UpdateCreneauRequest): request is CreateCreneauRequest {
    return 'praticienId' in request && 'cliniqueId' in request && 'dateDebut' in request && 'dateFin' in request;
  }

}
