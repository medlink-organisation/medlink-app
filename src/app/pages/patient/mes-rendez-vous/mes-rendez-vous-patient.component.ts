import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import { PageResponse, RendezVous } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';

@Component({
  selector: 'app-mes-rendez-vous-patient',
  templateUrl: './mes-rendez-vous-patient.component.html',
  standalone: false
})
export class MesRendezVousPatientComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly rendezVousService = inject(RendezVousService);
  rendezVous: PageResponse<RendezVous> = { content: [], totalElements: 0, totalPages: 0, size: 50, number: 0, first: true, last: true };
  loading = false;
  currentPage = 0;
  pageSize = 50;
  noPatientId = false;
  error = '';

  ngOnInit(): void {
    const patientId = this.authService.getPatientId();
    if (patientId === null) {
      this.noPatientId = true;
      return;
    }
    this.loading = true;
    this.loadAppointments(patientId);
  }

  onPageChange(event: { page: number; size: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.size;
    const patientId = this.authService.getPatientId();
    if (patientId !== null) {
      this.loading = true;
      this.loadAppointments(patientId);
    }
  }

  private loadAppointments(patientId: number): void {
    this.rendezVousService.getByPatientId(patientId, { page: this.currentPage, size: this.pageSize }).subscribe({
      next: (page) => {
        this.rendezVous = page;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos rendez-vous.';
        this.loading = false;
      }
    });
  }
}
