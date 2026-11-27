import { InjectionToken } from '@angular/core';

export interface AdminOnboardingRequirements {
  minimumClinics: number;
  minimumSpecialties: number;
  minimumBlocks: number;
}

export const DEFAULT_ADMIN_ONBOARDING_REQUIREMENTS: AdminOnboardingRequirements = {
  minimumClinics: 1,
  minimumSpecialties: 3,
  minimumBlocks: 1
};

export const ADMIN_ONBOARDING_REQUIREMENTS = new InjectionToken<AdminOnboardingRequirements>(
  'ADMIN_ONBOARDING_REQUIREMENTS',
  { factory: () => DEFAULT_ADMIN_ONBOARDING_REQUIREMENTS }
);
