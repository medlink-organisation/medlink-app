import { Component, OnInit, inject } from '@angular/core';

import { PraticienService } from '../../../services/praticien.service';
import { SpecialiteService } from '../../../services/specialite.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: false
})
export class AdminDashboardComponent implements OnInit {
  private readonly praticienService = inject(PraticienService);
  private readonly specialiteService = inject(SpecialiteService);
  praticienCount = 0;
  specialiteCount = 0;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.praticienService.getAll({ page: 0, size: 1 }).subscribe({
      next: (page) => {
        this.praticienCount = page.totalElements;
        this.checkLoaded();
      },
      error: () => {
        this.error = 'Impossible de charger le nombre de praticiens.';
        this.checkLoaded();
      }
    });
    this.specialiteService.getAll({ page: 0, size: 1 }).subscribe({
      next: (page) => {
        this.specialiteCount = page.totalElements;
        this.checkLoaded();
      },
      error: () => {
        this.error = 'Impossible de charger le nombre de spécialités.';
        this.checkLoaded();
      }
    });
  }

  private loadedCount = 0;
  private checkLoaded(): void {
    this.loadedCount += 1;
    this.loading = this.loadedCount < 2;
  }
}
