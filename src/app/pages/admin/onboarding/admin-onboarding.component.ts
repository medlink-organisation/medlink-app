import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, forkJoin } from 'rxjs';

import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { StepperItem } from '../../../shared/ui/stepper/stepper.component';
import {
  Bloc,
  Clinique,
  CreateBlocRequest,
  CreateCliniqueRequest,
  CreateSpecialiteRequest,
  Specialite,
  UpdateSpecialiteRequest
} from '../../../models';
import {
  BlocService,
  CliniqueService,
  SpecialiteService
} from '../../../services';
import { ADMIN_ONBOARDING_REQUIREMENTS } from './admin-onboarding.config';
import { AdminOnboardingService } from './admin-onboarding.service';

@Component({
  selector: 'app-admin-onboarding',
  templateUrl: './admin-onboarding.component.html',
  standalone: false
})
export class AdminOnboardingComponent implements OnInit {
  @ViewChild('clinicModal') private clinicModal?: ModalComponent;
  @ViewChild('specialtyModal') private specialtyModal?: ModalComponent;
  @ViewChild('blockModal') private blockModal?: ModalComponent;

  private readonly clinicService = inject(CliniqueService);
  private readonly specialtyService = inject(SpecialiteService);
  private readonly blockService = inject(BlocService);
  private readonly onboarding = inject(AdminOnboardingService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly requirements = inject(ADMIN_ONBOARDING_REQUIREMENTS);
  readonly steps: StepperItem[] = [
    { label: 'Clinique', description: 'Établissement principal' },
    { label: 'Spécialités', description: 'Offre de soins' },
    { label: 'Blocs', description: 'Organisation médicale' },
    { label: 'Activation', description: 'Vérification finale' }
  ];

  currentStep = 0;
  loading = true;
  saving = false;
  errorMessage = '';
  validationMessage = '';
  clinics: Clinique[] = [];
  specialties: Specialite[] = [];
  blocks: Bloc[] = [];
  selectedClinicId: number | null = null;
  selectedSpecialtyIds = new Set<number>();
  selectedBlockIds = new Set<number>();

  ngOnInit(): void {
    this.loadData();
  }

  get selectedClinic(): Clinique | undefined {
    return this.clinics.find(clinic => clinic.id === this.selectedClinicId);
  }

  get clinicBlocks(): Bloc[] {
    return this.blocks.filter(block => block.cliniqueId === this.selectedClinicId);
  }

  get selectedSpecialties(): Specialite[] {
    return this.specialties.filter(item => item.id != null && this.selectedSpecialtyIds.has(item.id));
  }

  get selectedBlocks(): Bloc[] {
    return this.blocks.filter(item => item.id != null && this.selectedBlockIds.has(item.id));
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const page = { page: 0, size: 500 };
    forkJoin({
      clinics: this.clinicService.getAll(page),
      specialties: this.specialtyService.getAll(page),
      blocks: this.blockService.getAll(page)
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: ({ clinics, specialties, blocks }) => {
        this.clinics = clinics.content;
        this.specialties = specialties.content;
        this.blocks = blocks.content;
        if (this.selectedClinicId == null && this.clinics.length === 1) {
          this.selectClinic(this.clinics[0]);
        }
        this.specialties.forEach(item => item.id != null && this.selectedSpecialtyIds.add(item.id));
        this.prefillClinicBlocks();
      },
      error: () => this.errorMessage = 'Impossible de charger la configuration de l’organisation. Réessayez.'
    });
  }

  selectClinic(clinic: Clinique): void {
    if (clinic.id == null || this.selectedClinicId === clinic.id) return;
    this.selectedClinicId = clinic.id;
    this.selectedBlockIds.clear();
    this.prefillClinicBlocks();
    this.validationMessage = '';
  }

  toggleSpecialty(item: Specialite, selected: boolean): void {
    this.toggleSet(this.selectedSpecialtyIds, item.id, selected);
  }

  toggleBlock(item: Bloc, selected: boolean): void {
    this.toggleSet(this.selectedBlockIds, item.id, selected);
  }

  previous(): void {
    this.validationMessage = '';
    this.currentStep = Math.max(0, this.currentStep - 1);
  }

  next(): void {
    this.validationMessage = this.validateStep();
    if (!this.validationMessage) this.currentStep = Math.min(this.steps.length - 1, this.currentStep + 1);
  }

  openClinicForm(): void { this.clinicModal?.show(); }
  openSpecialtyForm(): void { this.specialtyModal?.show(); }
  openBlockForm(): void { this.blockModal?.show(); }

  createClinic(request: CreateCliniqueRequest): void {
    this.persist(this.clinicService.create(request), clinic => {
      this.clinics = [...this.clinics, clinic];
      this.selectClinic(clinic);
      this.clinicModal?.hide();
    });
  }

  createSpecialty(request: CreateSpecialiteRequest | UpdateSpecialiteRequest): void {
    this.persist(this.specialtyService.create(request as CreateSpecialiteRequest), specialty => {
      this.specialties = [...this.specialties, specialty];
      if (specialty.id != null) this.selectedSpecialtyIds.add(specialty.id);
      this.specialtyModal?.hide();
    });
  }

  createBlock(request: CreateBlocRequest): void {
    this.persist(this.blockService.create({ ...request, cliniqueId: this.selectedClinicId ?? request.cliniqueId }), block => {
      this.blocks = [...this.blocks, block];
      if (block.id != null) this.selectedBlockIds.add(block.id);
      this.blockModal?.hide();
    });
  }

  activate(): void {
    if (this.selectedClinicId == null || this.validateAll()) return;
    this.saving = true;
    this.errorMessage = '';
    this.verifyAndFinish();
  }

  private verifyAndFinish(): void {
    this.onboarding.getStatus().pipe(finalize(() => {
      this.saving = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: status => status.complete
        ? void this.router.navigate(['/admin/dashboard'], { queryParams: { setup: 'complete' } })
        : this.finishWithError('La configuration enregistrée reste incomplète. Vérifiez les blocs et affectations.'),
      error: () => this.finishWithError('La configuration est enregistrée, mais sa validation est momentanément indisponible.')
    });
  }

  private validateStep(): string {
    if (this.currentStep === 0 && this.selectedClinicId == null) return 'Sélectionnez ou créez une clinique.';
    if (this.currentStep === 1 && this.selectedSpecialtyIds.size < this.requirements.minimumSpecialties) {
      return `Sélectionnez au moins ${this.requirements.minimumSpecialties} spécialités.`;
    }
    if (this.currentStep === 2 && this.selectedBlockIds.size < this.requirements.minimumBlocks) {
      return `Configurez au moins ${this.requirements.minimumBlocks} bloc médical pour cette clinique.`;
    }
    return '';
  }

  private validateAll(): boolean {
    for (let index = 0; index < 3; index++) {
      this.currentStep = index;
      this.validationMessage = this.validateStep();
      if (this.validationMessage) return true;
    }
    this.currentStep = 3;
    return false;
  }

  private prefillClinicBlocks(): void {
    this.clinicBlocks.forEach(item => item.id != null && this.selectedBlockIds.add(item.id));
  }

  private toggleSet(target: Set<number>, id: number | null, selected: boolean): void {
    if (id == null) return;
    selected ? target.add(id) : target.delete(id);
    this.validationMessage = '';
  }

  private persist<T>(request: Observable<T>, onSuccess: (value: T) => void): void {
    this.saving = true;
    this.errorMessage = '';
    request.pipe(finalize(() => {
      this.saving = false;
      this.cdr.markForCheck();
    })).subscribe({ next: onSuccess, error: () => this.errorMessage = 'L’enregistrement a échoué. Vérifiez les informations saisies.' });
  }

  private finishWithError(message: string): void {
    this.saving = false;
    this.errorMessage = message;
    this.cdr.markForCheck();
  }
}
