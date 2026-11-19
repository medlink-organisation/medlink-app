import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import { PageResponse, RendezVous } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  standalone: false
})
export class PatientDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly rendezVousService = inject(RendezVousService);
  rendezVousCount = 0;
  loading = true;
  noPatientId = false;
  error = '';

  ngOnInit(): void {
    const patientId = this.authService.getPatientId();
    if (patientId === null) {
      this.noPatientId = true;
      this.loading = false;
      return;
    }
    this.rendezVousService.getByPatientId(patientId, { page: 0, size: 1 }).subscribe({
      next: (page) => {
        this.rendezVousCount = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos rendez-vous.';
        this.loading = false;
      }
    });
  }
}
