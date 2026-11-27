import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { PageResponse, RendezVousAgenda } from '../../../models';

import { RendezVousService } from '../../../services';

@Component({
  selector: 'app-mes-rendez-vous-praticien',
  templateUrl: './mes-rendez-vous.component.html',
  standalone: false,
})
export class MesRendezVousPraticienComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly cdr = inject(ChangeDetectorRef);

  rendezVous: PageResponse<RendezVousAgenda> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 50,
    number: 0,
    first: true,
    last: true,
  };

  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadRendezVous();
  }

  private loadRendezVous(): void {
    this.loading = true;
    this.error = '';

    const year = new Date().getFullYear();

    const debut = `${year}-01-01T00:00:00`;
    const fin = `${year + 1}-01-01T00:00:00`;

    this.rendezVousService.getMyAgenda(debut, fin).subscribe({
      next: (appointments) => {
        this.rendezVous = {
          content: appointments,
          totalElements: appointments.length,
          totalPages: appointments.length === 0 ? 0 : 1,
          size: appointments.length,
          number: 0,
          first: true,
          last: true,
        };

        this.loading = false;
        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error('Erreur agenda praticien:', err);

        this.error = 'Impossible de charger vos rendez-vous.';
        this.loading = false;

        this.cdr.markForCheck();
      },
    });
  }
}
