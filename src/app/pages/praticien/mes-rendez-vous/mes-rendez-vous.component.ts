import { Component, OnInit, inject } from '@angular/core';

import { PageResponse, RendezVous } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';

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
    this.rendezVousService.getAll({ page: 0, size: 50 }).subscribe({
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
