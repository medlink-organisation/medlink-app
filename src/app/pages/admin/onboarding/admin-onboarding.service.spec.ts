import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BlocService, CliniqueService, SpecialiteService } from '../../../services';
import { PageResponse } from '../../../models';
import { AdminOnboardingService } from './admin-onboarding.service';

function page<T>(content: T[], totalElements = content.length): PageResponse<T> {
  return { content, totalElements, totalPages: 1, size: 500, number: 0, first: true, last: true };
}

describe('AdminOnboardingService', () => {
  const clinics = [{ id: 10, nom: 'Clinique Centrale', adresse: null, telephone: null, email: null, ville: null, blocs: [], services: [] }];
  const specialties = Array.from({ length: 3 }, (_, index) => ({ id: index + 1, code: `S${index}`, nom: `Spécialité ${index}`, description: null, actif: true }));
  const blocks = [{ id: 1, code: 'B1', nom: 'Bloc 1', description: null, cliniqueId: 10 }];

  function configure(overrides: { blocks?: typeof blocks; specialties?: typeof specialties } = {}): AdminOnboardingService {
    TestBed.configureTestingModule({
      providers: [
        { provide: CliniqueService, useValue: { getAll: () => of(page(clinics)) } },
        { provide: SpecialiteService, useValue: { getAll: () => of(page(overrides.specialties ?? specialties)) } },
        { provide: BlocService, useValue: { getAll: () => of(page(overrides.blocks ?? blocks)) } }
      ]
    });
    return TestBed.inject(AdminOnboardingService);
  }

  it('marks setup complete only when a clinic has the required persisted relationships', () => {
    const service = configure();
    service.getStatus().subscribe(status => {
      expect(status.complete).toBe(true);
      expect(status.configuredClinicId).toBe(10);
    });
  });

  it('keeps setup incomplete when the clinic has no block', () => {
    const service = configure({ blocks: [] });
    service.getStatus().subscribe(status => {
      expect(status.complete).toBe(false);
      expect(status.configuredClinicId).toBeNull();
    });
  });

  it('keeps setup incomplete below the specialty requirement', () => {
    const service = configure({ specialties: specialties.slice(0, 2) });
    service.getStatus().subscribe(status => expect(status.complete).toBe(false));
  });
});
