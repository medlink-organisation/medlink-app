import { Component, OnInit, inject } from '@angular/core';

import { CreneauService } from '../../../services/creneau.service';
import { RendezVousService } from '../../../services/rendez-vous.service';

@Component({
  selector: 'app-praticien-dashboard',
  templateUrl: './praticien-dashboard.component.html',
  standalone: false
})
export class PraticienDashboardComponent implements OnInit {
  private readonly creneauService = inject(CreneauService);
  private readonly rendezVousService = inject(RendezVousService);
  creneauCount = 0;
  rendezVousCount = 0;
  loading = true;
  error = '';
  private loadedCount = 0;

  ngOnInit(): void {
    this.creneauService.getAll({ page: 0, size: 1 }).subscribe({
      next: (page) => {
        this.creneauCount = page.totalElements;
        this.markLoaded();
      },
      error: () => {
        this.error = 'Impossible de charger les créneaux.';
        this.markLoaded();
      }
    });
    this.rendezVousService.getAll({ page: 0, size: 1 }).subscribe({
      next: (page) => {
        this.rendezVousCount = page.totalElements;
        this.markLoaded();
      },
      error: () => {
        this.error = 'Impossible de charger les rendez-vous.';
        this.markLoaded();
      }
    });
  }

  private markLoaded(): void {
    this.loadedCount += 1;
    this.loading = this.loadedCount < 2;
  }
}