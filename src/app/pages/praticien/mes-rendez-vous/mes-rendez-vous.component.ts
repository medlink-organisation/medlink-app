import { Component, OnInit, inject } from '@angular/core';

import { PageResponse, RendezVous, RendezVousAgenda } from '../../../models';
import { RendezVousService } from '../../../services';

@Component({
  selector: 'app-mes-rendez-vous-praticien',
  templateUrl: './mes-rendez-vous.component.html',
  standalone: false
})
export class MesRendezVousPraticienComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  rendezVous: PageResponse<RendezVous> = { content: [], totalElements: 0, totalPages: 0, size: 50, number: 0, first: true, last: true };
  loading = true;
  error = '';

  ngOnInit(): void {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date(new Date().getFullYear() + 1, 0, 1);

    this.rendezVousService.getMyAgenda(start.toISOString(), end.toISOString()).subscribe({
      next: (appointments: RendezVousAgenda[]) => {
        this.rendezVous = {
          content: appointments,
          totalElements: appointments.length,
          totalPages: appointments.length === 0 ? 0 : 1,
          size: appointments.length,
          number: 0,
          first: true,
          last: true
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos rendez-vous.';
        this.loading = false;
      }
    });
  }
}
