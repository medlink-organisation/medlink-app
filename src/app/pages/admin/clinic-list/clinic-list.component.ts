import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Observable, Subject, catchError, finalize, forkJoin, of, takeUntil } from 'rxjs';

import {
  AffectationPraticien, Bloc, Clinique, CreateBlocRequest, CreateCliniqueRequest,
  CreateServiceMedicaleRequest, PageResponse, Praticien, ServiceMedicale, Specialite
} from '../../../models';
import { AffectationPraticienService } from '../../../services/affectation-praticien.service';
import { BlocService } from '../../../services/bloc.service';
import { CliniqueService } from '../../../services/clinique.service';
import { PraticienService } from '../../../services/praticien.service';
import { ServiceMedicaleService } from '../../../services/service-medicale.service';
import { SpecialiteService } from '../../../services/specialite.service';
import { EntityDetailItem } from '../../../components/entity-details-history/entity-details-history.component';
import { ColumnDef } from '../../../shared/ui/column-def.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { DataTableRowAction, DataTableRowActionEvent } from '../../../shared/ui/data-table/data-table.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

type ConfigurationSection = 'cliniques' | 'organisation';
type ClinicDetailTab = 'general' | 'blocs' | 'services' | 'praticiens';
type DeleteKind = 'cliniques' | 'blocs' | 'services';

@Component({ selector: 'app-clinic-list', templateUrl: './clinic-list.component.html', standalone: false })
export class ClinicListComponent implements OnInit, OnDestroy {
  private readonly cliniqueService = inject(CliniqueService);
  private readonly blocService = inject(BlocService);
  private readonly serviceMedicaleService = inject(ServiceMedicaleService);
  private readonly assignmentService = inject(AffectationPraticienService);
  private readonly practitionerService = inject(PraticienService);
  private readonly specialtyService = inject(SpecialiteService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('cliniqueDialog') private cliniqueDialog?: ModalComponent;
  @ViewChild('blocDialog') private blocDialog?: ModalComponent;
  @ViewChild('serviceDialog') private serviceDialog?: ModalComponent;
  @ViewChild('directoryDetailsDialog') private directoryDetailsDialog?: ModalComponent;
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;

  activeSection: ConfigurationSection = 'cliniques';
  detailTab: ClinicDetailTab = 'general';
  cliniques: PageResponse<Clinique> | null = null;
  blocs: PageResponse<Bloc> | null = null;
  services: PageResponse<ServiceMedicale> | null = null;
  cliniqueOptions: Clinique[] = [];
  blocOptions: Bloc[] = [];
  specialtyOptions: Specialite[] = [];
  editClinique: Clinique | null = null;
  editBloc: Bloc | null = null;
  editService: ServiceMedicale | null = null;
  detailClinique: Clinique | null = null;
  detailBloc: Bloc | null = null;
  clinicContextBlocks: Bloc[] = [];
  clinicContextServices: ServiceMedicale[] = [];
  clinicAssignments: AffectationPraticien[] = [];
  clinicPractitioners = new Map<number, Praticien>();
  contextLoading = false;
  contextError = '';
  deleteTarget: { kind: DeleteKind; id: number; label: string } | null = null;
  loading = false;
  saving = false;
  error = '';
  searchTerm = '';
  cliniquePage = 0;
  blocPage = 0;
  servicePage = 0;
  pageSize = 10;

  readonly serviceForm = this.formBuilder.nonNullable.group({
    code: ['', Validators.required], libelle: ['', Validators.required], description: [''],
    cliniqueId: ['', Validators.required], blocId: [''], actif: [true]
  });

  readonly cliniqueColumns: ColumnDef[] = [
    { key: 'nom', label: 'Clinique' }, { key: 'ville', label: 'Ville' },
    { key: 'adresse', label: 'Adresse' }, { key: 'telephone', label: 'Téléphone' }, { key: 'email', label: 'E-mail' }
  ];
  readonly blocColumns: ColumnDef[] = [
    { key: 'code', label: 'Code' }, { key: 'nom', label: 'Bloc' },
    { key: 'cliniqueId', label: 'Clinique', formatter: value => this.cliniqueName(value) },
    { key: 'description', label: 'Description' }
  ];
  readonly serviceColumns: ColumnDef[] = [
    { key: 'code', label: 'Code' }, { key: 'libelle', label: 'Service médical' },
    { key: 'cliniqueId', label: 'Clinique', formatter: value => this.cliniqueName(value) },
    { key: 'blocId', label: 'Bloc', formatter: value => this.blocName(value) },
    { key: 'actif', label: 'Statut', formatter: value => value ? 'Actif' : 'Inactif' }
  ];
  readonly rowActions: DataTableRowAction[] = [
    { id: 'details', label: 'Plus de détails', icon: 'eye' }, { id: 'edit', label: 'Modifier', icon: 'edit' },
    { id: 'delete', label: 'Supprimer', icon: 'trash', destructive: true }
  ];
  readonly manageActions: DataTableRowAction[] = [
    { id: 'edit', label: 'Modifier', icon: 'edit' }, { id: 'delete', label: 'Supprimer', icon: 'trash', destructive: true }
  ];

  ngOnInit(): void {
    this.activeSection = this.route.snapshot.queryParamMap.get('section') === 'organisation' ? 'organisation' : 'cliniques';
    this.loadCliniqueOptions();
    this.loadSpecialties();
    this.activeSection === 'cliniques' ? this.loadCliniques() : this.loadOrganization();
  }

  setSection(section: ConfigurationSection): void {
    if (this.activeSection === section) return;
    this.activeSection = section;
    this.searchTerm = '';
    section === 'cliniques' ? this.loadCliniques() : this.loadOrganization();
  }
  setDetailTab(tab: ClinicDetailTab): void { this.detailTab = tab; }

  onSearch(term: string): void {
    this.searchTerm = term.trim();
    if (this.activeSection === 'cliniques') { this.cliniquePage = 0; this.loadCliniques(); }
    else { this.blocPage = 0; this.servicePage = 0; this.loadOrganization(); }
  }

  openNewClinique(): void { this.editClinique = null; this.cliniqueDialog?.show(); }
  openNewBloc(clinique: Clinique | null = null): void {
    this.editBloc = clinique?.id == null ? null : { id: null, code: '', nom: '', description: '', cliniqueId: clinique.id };
    this.blocDialog?.show();
  }
  openNewService(clinique: Clinique | null = null): void {
    this.editService = null;
    this.serviceForm.reset({ code: '', libelle: '', description: '', cliniqueId: clinique?.id == null ? '' : String(clinique.id), blocId: '', actif: true });
    this.serviceDialog?.show();
  }

  onCliniqueRow(row: unknown): void { if (this.isClinique(row)) this.openCliniqueDetails(row); }
  onCliniqueAction(event: DataTableRowActionEvent): void {
    if (!this.isClinique(event.row)) return;
    if (event.action === 'details') this.openCliniqueDetails(event.row);
    else if (event.action === 'edit') this.openCliniqueEdit(event.row);
    else if (event.action === 'delete' && event.row.id !== null) this.requestDelete('cliniques', event.row.id, event.row.nom ?? `Clinique #${event.row.id}`);
  }
  onBlocAction(event: DataTableRowActionEvent): void {
    if (!this.isBloc(event.row)) return;
    if (event.action === 'details') this.openBlocDetails(event.row);
    else if (event.action === 'edit') { this.editBloc = event.row; this.blocDialog?.show(); }
    else if (event.action === 'delete' && event.row.id !== null) this.requestDelete('blocs', event.row.id, event.row.nom ?? `Bloc #${event.row.id}`);
  }
  onServiceAction(event: DataTableRowActionEvent): void {
    if (!this.isService(event.row)) return;
    if (event.action === 'edit') this.openServiceEdit(event.row);
    else if (event.action === 'delete' && event.row.id !== null) this.requestDelete('services', event.row.id, event.row.libelle ?? `Service #${event.row.id}`);
  }

  openCliniqueDetails(clinique: Clinique): void {
    this.detailClinique = clinique; this.detailBloc = null; this.detailTab = 'general';
    this.directoryDetailsDialog?.show(); this.loadClinicContext(clinique);
  }
  openBlocDetails(bloc: Bloc): void { this.detailBloc = bloc; this.detailClinique = null; this.directoryDetailsDialog?.show(); }
  openCliniqueEdit(clinique: Clinique): void {
    this.directoryDetailsDialog?.hide(); this.editClinique = clinique; this.cliniqueDialog?.show();
  }
  openServiceEdit(service: ServiceMedicale): void {
    this.editService = service;
    this.serviceForm.reset({
      code: service.code ?? '', libelle: service.libelle ?? '', description: service.description ?? '',
      cliniqueId: service.cliniqueId == null ? '' : String(service.cliniqueId),
      blocId: service.blocId == null ? '' : String(service.blocId), actif: service.actif
    });
    this.serviceDialog?.show();
  }

  cliniqueDetails(clinique: Clinique): EntityDetailItem[] {
    return [
      { label: 'Nom', value: clinique.nom }, { label: 'Ville', value: clinique.ville }, { label: 'Adresse', value: clinique.adresse },
      { label: 'Téléphone', value: clinique.telephone }, { label: 'E-mail', value: clinique.email }
    ];
  }
  blocDetails(bloc: Bloc): EntityDetailItem[] {
    return [
      { label: 'Code', value: bloc.code }, { label: 'Nom', value: bloc.nom },
      { label: 'Clinique', value: this.cliniqueName(bloc.cliniqueId) }, { label: 'Description', value: bloc.description }
    ];
  }
  assignedPractitioner(assignment: AffectationPraticien): Praticien | undefined {
    return assignment.praticienId == null ? undefined : this.clinicPractitioners.get(assignment.praticienId);
  }
  practitionerSpecialty(practitioner: Praticien | undefined): string {
    return this.specialtyOptions.find(item => item.id === practitioner?.specialiteId)?.nom ?? 'Spécialité non renseignée';
  }
  blocksForServiceForm(): Bloc[] {
    const cliniqueId = Number(this.serviceForm.controls.cliniqueId.value);
    const source = this.detailClinique?.id === cliniqueId ? this.clinicContextBlocks : this.blocOptions;
    return source.filter(bloc => bloc.cliniqueId === cliniqueId);
  }

  requestDelete(kind: DeleteKind, id: number, label: string): void { this.deleteTarget = { kind, id, label }; this.confirmDeleteDialog?.show(); }
  onDeleteConfirm(): void {
    if (!this.deleteTarget) return;
    const target = this.deleteTarget;
    this.saving = true;
    let operation: Observable<void>;
    if (target.kind === 'cliniques') operation = this.cliniqueService.delete(target.id);
    else if (target.kind === 'blocs') operation = this.blocService.delete(target.id);
    else operation = this.serviceMedicaleService.delete(target.id);
    operation.pipe(
      catchError(() => { this.error = `Impossible de supprimer ${target.label}. Vérifiez qu’aucun élément ne lui est encore associé.`; return EMPTY; }),
      finalize(() => { this.saving = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleteTarget = null; this.loadCliniqueOptions();
      this.activeSection === 'cliniques' ? this.loadCliniques() : this.loadOrganization();
      if (this.detailClinique) this.loadClinicContext(this.detailClinique);
    });
  }
  cancelDelete(): void { this.deleteTarget = null; }

  saveClinique(request: CreateCliniqueRequest): void {
    this.saving = true; this.error = '';
    const operation = this.editClinique?.id ? this.cliniqueService.update(this.editClinique.id, request) : this.cliniqueService.create(request);
    operation.pipe(
      catchError(() => { this.error = 'Impossible d’enregistrer la clinique.'; return EMPTY; }),
      finalize(() => { this.saving = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(clinique => {
      this.cliniqueDialog?.hide(); this.editClinique = null;
      this.detailClinique = this.detailClinique?.id === clinique.id ? clinique : this.detailClinique;
      this.loadCliniqueOptions(); this.loadCliniques();
    });
  }
  saveBloc(request: CreateBlocRequest): void {
    this.saving = true; this.error = '';
    const operation = this.editBloc?.id ? this.blocService.update(this.editBloc.id, request) : this.blocService.create(request);
    operation.pipe(
      catchError(() => { this.error = 'Impossible d’enregistrer le bloc. Le code doit être unique dans la clinique.'; return EMPTY; }),
      finalize(() => { this.saving = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(() => {
      this.blocDialog?.hide(); this.editBloc = null; this.loadOrganization(); this.loadCliniqueOptions();
      if (this.detailClinique) this.loadClinicContext(this.detailClinique);
    });
  }
  saveService(): void {
    if (this.serviceForm.invalid) { this.serviceForm.markAllAsTouched(); return; }
    const value = this.serviceForm.getRawValue();
    const request: CreateServiceMedicaleRequest = {
      code: value.code.trim(), libelle: value.libelle.trim(), description: value.description.trim() || undefined,
      cliniqueId: Number(value.cliniqueId), blocId: value.blocId ? Number(value.blocId) : null, actif: value.actif
    };
    this.saving = true; this.error = '';
    const operation = this.editService?.id ? this.serviceMedicaleService.update(this.editService.id, request) : this.serviceMedicaleService.create(request);
    operation.pipe(
      catchError(() => { this.error = 'Impossible d’enregistrer le service médical.'; return EMPTY; }),
      finalize(() => { this.saving = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(() => {
      this.serviceDialog?.hide(); this.editService = null; this.loadOrganization();
      if (this.detailClinique) this.loadClinicContext(this.detailClinique);
    });
  }

  onCliniquePage(event: { page: number; size: number }): void { this.cliniquePage = event.page; this.pageSize = event.size; this.loadCliniques(); }
  onBlocPage(event: { page: number; size: number }): void { this.blocPage = event.page; this.pageSize = event.size; this.loadOrganization(); }
  onServicePage(event: { page: number; size: number }): void { this.servicePage = event.page; this.pageSize = event.size; this.loadOrganization(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadCliniques(): void {
    this.loading = true; this.error = '';
    const query = { page: this.cliniquePage, size: this.pageSize, sort: 'id' };
    const request = this.searchTerm ? this.cliniqueService.search(this.searchTerm, query) : this.cliniqueService.getAll(query);
    request.pipe(
      catchError(() => { this.error = 'Impossible de charger les cliniques.'; return EMPTY; }),
      finalize(() => { this.loading = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(page => { this.cliniques = page; this.changeDetectorRef.markForCheck(); });
  }
  private loadOrganization(): void {
    this.loading = true; this.error = '';
    const blocQuery = { page: this.blocPage, size: this.pageSize, sort: 'idBloc' };
    const serviceQuery = { page: this.servicePage, size: this.pageSize, sort: 'id' };
    forkJoin({
      blocs: (this.searchTerm ? this.blocService.search(this.searchTerm, blocQuery) : this.blocService.getAll(blocQuery)).pipe(catchError(() => of(null))),
      services: (this.searchTerm ? this.serviceMedicaleService.search(this.searchTerm, serviceQuery) : this.serviceMedicaleService.getAll(serviceQuery)).pipe(catchError(() => of(null)))
    }).pipe(finalize(() => { this.loading = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$))
      .subscribe(({ blocs, services }) => {
        if (blocs) this.blocs = blocs; if (services) this.services = services;
        if (!blocs || !services) this.error = 'Certaines données d’organisation n’ont pas pu être chargées.';
      });
  }
  private loadClinicContext(clinique: Clinique): void {
    if (clinique.id == null) return;
    this.contextLoading = true; this.contextError = '';
    forkJoin({
      blocs: this.blocService.getByClinique(clinique.id, { page: 0, size: 500, sort: 'idBloc' }).pipe(catchError(() => of(null))),
      services: this.serviceMedicaleService.getByClinique(clinique.id, { page: 0, size: 500, sort: 'id' }).pipe(catchError(() => of(null))),
      assignments: this.assignmentService.getActiveByClinique(clinique.id, { page: 0, size: 500, sort: 'id' }).pipe(catchError(() => of(null)))
    }).pipe(takeUntil(this.destroy$)).subscribe(({ blocs, services, assignments }) => {
      this.clinicContextBlocks = blocs?.content ?? []; this.clinicContextServices = services?.content ?? [];
      this.clinicAssignments = (assignments?.content ?? []).filter(item => item.actif && !item.deleted);
      if (!blocs || !services || !assignments) this.contextError = 'Certaines informations de la clinique sont temporairement indisponibles.';
      this.loadAssignedPractitioners();
    });
  }
  private loadAssignedPractitioners(): void {
    const ids = [...new Set(this.clinicAssignments.map(item => item.praticienId).filter((id): id is number => id !== null))];
    if (!ids.length) { this.clinicPractitioners.clear(); this.contextLoading = false; this.changeDetectorRef.markForCheck(); return; }
    forkJoin(ids.map(id => this.practitionerService.getById(id).pipe(catchError(() => of(null))))).pipe(
      finalize(() => { this.contextLoading = false; this.changeDetectorRef.markForCheck(); }), takeUntil(this.destroy$)
    ).subscribe(practitioners => {
      this.clinicPractitioners = new Map(practitioners.filter((item): item is Praticien => item !== null && item.id !== null).map(item => [item.id!, item]));
      if (practitioners.some(item => item === null)) this.contextError = 'Une partie des fiches praticiens n’a pas pu être chargée.';
    });
  }
  private loadCliniqueOptions(): void {
    forkJoin({
      cliniques: this.cliniqueService.getAll({ page: 0, size: 500, sort: 'nom' }),
      blocs: this.blocService.getAll({ page: 0, size: 500, sort: 'nom' })
    }).pipe(catchError(() => EMPTY), takeUntil(this.destroy$)).subscribe(({ cliniques, blocs }) => {
      this.cliniqueOptions = cliniques.content;
      this.blocOptions = blocs.content;
      this.changeDetectorRef.markForCheck();
    });
  }
  private loadSpecialties(): void {
    this.specialtyService.getAll({ page: 0, size: 500, sort: 'nom' }).pipe(catchError(() => EMPTY), takeUntil(this.destroy$))
      .subscribe(page => { this.specialtyOptions = page.content; this.changeDetectorRef.markForCheck(); });
  }
  private cliniqueName(value: unknown): string {
    return this.cliniqueOptions.find(clinique => clinique.id === Number(value))?.nom ?? `Clinique #${value ?? '—'}`;
  }
  private blocName(value: unknown): string {
    if (value == null || value === '') return 'Aucun bloc';
    const id = Number(value);
    return [...this.blocOptions, ...this.clinicContextBlocks].find(bloc => bloc.id === id)?.nom ?? `Bloc #${id}`;
  }
  private isClinique(value: unknown): value is Clinique { return typeof value === 'object' && value !== null && 'nom' in value && 'ville' in value; }
  private isBloc(value: unknown): value is Bloc { return typeof value === 'object' && value !== null && 'code' in value && 'cliniqueId' in value && 'nom' in value; }
  private isService(value: unknown): value is ServiceMedicale { return typeof value === 'object' && value !== null && 'libelle' in value && 'cliniqueId' in value; }
}
