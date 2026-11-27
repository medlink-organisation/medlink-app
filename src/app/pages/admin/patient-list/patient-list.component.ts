import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { PatientAccount, PatientAccountPage } from '../../../models';
import { PatientAdminService } from '../../../services';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  standalone: false,
})
export class PatientListComponent implements OnInit {
  private readonly patientService = inject(PatientAdminService);
  private readonly cdr = inject(ChangeDetectorRef);
  page: PatientAccountPage = { content: [], first: 0, max: 20, hasNext: false };
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load(0);
  }

  previous(): void {
    this.load(Math.max(0, this.page.first - this.page.max));
  }

  next(): void {
    if (this.page.hasNext) {
      this.load(this.page.first + this.page.max);
    }
  }

  fullName(patient: PatientAccount): string {
    return [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.username;
  }

  private load(first: number): void {
    this.loading = true;
    this.error = '';

    this.patientService.getAll(first, this.page.max).subscribe({
      next: (page) => {
        this.page = page;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Impossible de charger les patients depuis Keycloak.';
        console.error('Erreur Get All Patients:', err);
        this.cdr.markForCheck();
      },
    });
  }
}
