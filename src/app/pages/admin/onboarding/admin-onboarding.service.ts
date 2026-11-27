import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { BlocService, CliniqueService, SpecialiteService } from '../../../services';
import { ADMIN_ONBOARDING_REQUIREMENTS } from './admin-onboarding.config';

export interface AdminOnboardingStatus {
  complete: boolean;
  clinics: number;
  specialties: number;
  blocks: number;
  configuredClinicId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AdminOnboardingService {
  private readonly cliniques = inject(CliniqueService);
  private readonly specialties = inject(SpecialiteService);
  private readonly blocs = inject(BlocService);
  private readonly requirements = inject(ADMIN_ONBOARDING_REQUIREMENTS);

  getStatus(): Observable<AdminOnboardingStatus> {
    const page = { page: 0, size: 500 };
    return forkJoin({
      clinics: this.cliniques.getAll(page),
      specialties: this.specialties.getAll(page),
      blocks: this.blocs.getAll(page)
    }).pipe(
      map(({ clinics, specialties, blocks }) => {
        const clinicIds = clinics.content.map(clinic => clinic.id).filter((id): id is number => id != null);
        const configuredClinicId = clinicIds.find(clinicId => {
          const clinicBlocks = blocks.content.filter(block => block.cliniqueId === clinicId).length;
          return clinicBlocks >= this.requirements.minimumBlocks;
        }) ?? null;

        return {
          complete: clinics.totalElements >= this.requirements.minimumClinics
            && specialties.totalElements >= this.requirements.minimumSpecialties
            && configuredClinicId != null,
          clinics: clinics.totalElements,
          specialties: specialties.totalElements,
          blocks: blocks.totalElements,
          configuredClinicId
        };
      })
    );
  }
}
