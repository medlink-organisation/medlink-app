import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { catchError, EMPTY, finalize, forkJoin, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';

import { AffectationPraticien, Clinique, CreatePraticienRequest, PageResponse, PractitionerFormSubmission, Praticien, Specialite, UpdatePraticienRequest } from '../../../models';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { DataTableRowAction, DataTableRowActionEvent } from '../../../shared/ui/data-table/data-table.component';
import { EntityDetailItem } from '../../../components/entity-details-history/entity-details-history.component';
import { PraticienService } from '../../../services/praticien.service';
import { SpecialiteService } from '../../../services/specialite.service';
import { CliniqueService } from '../../../services/clinique.service';
import { AffectationPraticienService } from '../../../services/affectation-praticien.service';
import { AuthPraticienService } from '../../../services/auth-praticien.service';

@Component({
  selector: 'app-practitioner-list',
  templateUrl: './practitioner-list.component.html',
  standalone: false
})
export class PractitionerListComponent implements OnInit, OnDestroy {
  private readonly praticienService = inject(PraticienService);
  private readonly specialiteService = inject(SpecialiteService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly affectationService = inject(AffectationPraticienService);
  private readonly authPraticienService = inject(AuthPraticienService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;
  @ViewChild('practitionerDialog') private practitionerDialog?: ModalComponent;
  @ViewChild('practitionerDetailsDialog') private practitionerDetailsDialog?: ModalComponent;

  praticiens: PageResponse<Praticien> | null = null;
  specialites: Specialite[] = [];
  cliniques: Clinique[] = [];
  referenceDataLoading = false;
  referenceDataError: string | null = null;
  success: string | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  editTarget: Praticien | null = null;
  detailTarget: Praticien | null = null;
  practitionerAssignments: AffectationPraticien[] = [];
  assignmentsLoading = false;
  assignmentSaving = false;
  assignmentError: string | null = null;
  selectedClinicId = '';
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

  readonly rowActions: DataTableRowAction[] = [
    { id: 'details', label: 'Plus de détails', icon: 'eye' },
    { id: 'edit', label: 'Modifier', icon: 'edit' },
    { id: 'delete', label: 'Supprimer', icon: 'trash', destructive: true }
  ];

  ngOnInit(): void {
    this.loadPraticiens();
    this.loadReferenceData();
  }

  loadPraticiens(): void {
    this.loading = true;
    this.error = null;
    this.praticienService.getAll({ page: this.currentPage, size: this.pageSize, sort: 'id' }).pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des praticiens';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.praticiens = page;
      this.changeDetectorRef.markForCheck();
    });
  }

  loadReferenceData(): void {
    this.referenceDataLoading = true;
    this.referenceDataError = null;
    forkJoin({
      specialties: this.specialiteService.getAll({ page: 0, size: 100, sort: 'nom' }),
      clinics: this.cliniqueService.getAll({ page: 0, size: 100, sort: 'nom' })
    }).pipe(
      catchError(() => {
        this.referenceDataError = 'Impossible de charger les spécialités et les cliniques. Réessayez plus tard.';
        return EMPTY;
      }),
      finalize(() => {
        this.referenceDataLoading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ specialties, clinics }) => {
      this.specialites = specialties.content.filter(item => item.actif !== false);
      this.cliniques = clinics.content;
      this.changeDetectorRef.markForCheck();
    });
  }

  get rows(): Praticien[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const rows = this.praticiens?.content ?? [];
    return term
      ? rows.filter((praticien) => `${praticien.nom} ${praticien.prenom} ${praticien.email}`.toLocaleLowerCase().includes(term))
      : rows;
  }

  get deleteConfirmationMessage(): string {
    const praticien = this.praticiens?.content.find(item => item.id === this.deleteTarget);
    const identity = praticien ? ` ${praticien.prenom} ${praticien.nom}` : '';
    return `Voulez-vous vraiment supprimer le praticien${identity} de la base et de Keycloak ? Cette action est irréversible.`;
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
      this.openDetails(row);
    }
  }

  onTableAction(event: DataTableRowActionEvent): void {
    if (!this.isPraticien(event.row)) {
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

  openDetails(praticien: Praticien): void {
    this.detailTarget = praticien;
    this.selectedClinicId = '';
    this.practitionerDetailsDialog?.show();
    this.loadAssignments(praticien);
  }

  get availableClinics(): Clinique[] {
    const activeClinicIds = new Set(this.practitionerAssignments
      .filter(item => item.actif && !item.deleted)
      .map(item => item.cliniqueId));
    return this.cliniques.filter(item => item.id !== null && !activeClinicIds.has(item.id));
  }

  clinicName(assignment: AffectationPraticien): string {
    return assignment.cliniqueNom
      ?? this.cliniques.find(item => item.id === assignment.cliniqueId)?.nom
      ?? `Clinique #${assignment.cliniqueId ?? '—'}`;
  }

  addAssignment(): void {
    const practitionerId = this.detailTarget?.id;
    const cliniqueId = Number(this.selectedClinicId);
    if (practitionerId == null || !cliniqueId || this.assignmentSaving) return;
    const existing = this.practitionerAssignments.find(item => item.cliniqueId === cliniqueId && !item.actif);
    this.assignmentSaving = true;
    this.assignmentError = null;
    const operation = existing?.id != null
      ? this.affectationService.reactivate(existing.id)
      : this.affectationService.create({ praticienId: practitionerId, cliniqueId });
    operation.pipe(
      catchError(() => {
        this.assignmentError = 'Impossible d’ajouter cette affectation.';
        return EMPTY;
      }),
      finalize(() => {
        this.assignmentSaving = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.selectedClinicId = '';
      if (this.detailTarget) this.loadAssignments(this.detailTarget);
    });
  }

  toggleAssignment(assignment: AffectationPraticien): void {
    if (assignment.id == null || this.assignmentSaving) return;
    this.assignmentSaving = true;
    this.assignmentError = null;
    const operation = assignment.actif && !assignment.deleted
      ? this.affectationService.deactivate(assignment.id)
      : this.affectationService.reactivate(assignment.id);
    operation.pipe(
      catchError(() => {
        this.assignmentError = 'Impossible de modifier cette affectation.';
        return EMPTY;
      }),
      finalize(() => {
        this.assignmentSaving = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.detailTarget) this.loadAssignments(this.detailTarget);
    });
  }

  detailsFor(praticien: Praticien): EntityDetailItem[] {
    return [
      { label: 'Nom complet', value: `${praticien.prenom} ${praticien.nom}` },
      { label: 'E-mail', value: praticien.email },
      { label: 'Téléphone', value: praticien.phone },
      { label: 'Spécialité', value: this.specialiteName(praticien.specialiteId) },
      { label: 'N° ordre', value: praticien.numeroOrdre },
      { label: 'Statut', value: praticien.actif ? 'Actif' : 'Inactif' }
    ];
  }

  onEdit(praticien: Praticien): void {
    this.editTarget = praticien;
    this.practitionerDialog?.show();
  }

  onNew(): void {
    this.editTarget = null;
    this.error = null;
    this.success = null;
    this.practitionerDialog?.show();
  }

  onFormCancel(): void {
    this.practitionerDialog?.hide();
    this.editTarget = null;
  }

  onFormSubmit(submission: PractitionerFormSubmission): void {
    this.loading = true;
    this.error = null;
    this.success = null;
    const request = this.editTarget
      ? this.praticienService.update(this.editTarget.id!, submission.practitioner as UpdatePraticienRequest)
      : this.createPractitionerWithAssignments(submission);
    request.pipe(
      catchError((failure: unknown) => {
        if (failure instanceof ClinicAssignmentError) {
          this.error = 'Le praticien a été créé, mais une ou plusieurs affectations ont échoué. Ouvrez sa fiche pour vérifier et compléter ses cliniques.';
          this.practitionerDialog?.hide();
          this.editTarget = null;
          this.loadPraticiens();
        } else {
          this.error = 'Erreur lors de l’enregistrement du praticien.';
        }
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.success = this.editTarget ? 'Praticien mis à jour.' : 'Praticien créé et affecté aux cliniques sélectionnées.';
      this.practitionerDialog?.hide();
      this.editTarget = null;
      this.loadPraticiens();
      this.loadReferenceData();
    });
  }

  private createPractitionerWithAssignments(submission: PractitionerFormSubmission) {
    return this.authPraticienService.register(submission.practitioner as CreatePraticienRequest).pipe(
      switchMap(praticien => {
        if (praticien.id === null) {
          return throwError(() => new ClinicAssignmentError());
        }
        const assignments = submission.cliniqueIds.map(cliniqueId =>
          this.affectationService.create({ praticienId: praticien.id!, cliniqueId })
        );
        return forkJoin(assignments).pipe(
          map(() => praticien),
          catchError(() => throwError(() => new ClinicAssignmentError()))
        );
      })
    );
  }

  onDeleteRequest(id: number): void {
    this.deleteTarget = id;
    this.confirmDeleteDialog?.show();
  }

  onDeleteConfirm(): void {
    if (this.deleteTarget === null) {
      return;
    }
    const praticienId = this.deleteTarget;
    this.loading = true;
    this.error = null;
    this.success = null;
    this.praticienService.getById(praticienId).pipe(
      switchMap(praticien => this.praticienService.delete(praticienId).pipe(
        switchMap(() => praticien.keycloakId
          ? this.authPraticienService.deleteKeycloakAccount(praticien.keycloakId).pipe(
              catchError(() => throwError(() => new KeycloakDeletionError()))
            )
          : of(void 0)
        )
      )),
      catchError((failure: unknown) => {
        this.loading = false;
        if (failure instanceof KeycloakDeletionError) {
          this.deleteTarget = null;
          this.loadPraticiens();
          this.error = 'La fiche praticien a été supprimée, mais la suppression du compte Keycloak a échoué.';
        } else {
          this.error = 'Erreur lors de la suppression du praticien.';
        }
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.deleteTarget = null;
      this.success = 'Praticien supprimé de la base et de Keycloak.';
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
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadPraticiens());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAssignments(praticien: Praticien): void {
    if (praticien.id == null) return;
    this.assignmentsLoading = true;
    this.assignmentError = null;
    this.affectationService.getByPraticien(praticien.id, { page: 0, size: 500, sort: 'id' }).pipe(
      catchError(() => {
        this.assignmentError = 'Impossible de charger les affectations du praticien.';
        return EMPTY;
      }),
      finalize(() => {
        this.assignmentsLoading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe(page => {
      this.practitionerAssignments = page.content;
      this.changeDetectorRef.markForCheck();
    });
  }

  private specialiteName(value: unknown): string {
    const id = Number(value);
    return this.specialites.find((specialite) => specialite.id === id)?.nom ?? String(value ?? '');
  }

  private isPraticien(value: unknown): value is Praticien {
    return typeof value === 'object' && value !== null && 'nom' in value && 'email' in value;
  }
}

class ClinicAssignmentError extends Error {}
class KeycloakDeletionError extends Error {}
