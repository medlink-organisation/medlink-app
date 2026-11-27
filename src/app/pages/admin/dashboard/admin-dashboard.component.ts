import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';

import { AdminRendezVous } from '../../../models';
import { CliniqueService } from '../../../services';
import { PatientAdminService } from '../../../services';
import { PraticienService } from '../../../services';
import { RendezVousService } from '../../../services';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly praticienService = inject(PraticienService);
  private readonly patientService = inject(PatientAdminService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly rendezVousService = inject(RendezVousService);

  praticienCount = 0;
  patientCount: number | string = 0;
  cliniqueCount = 0;
  rendezVousCount = 0;
  recentRendezVous: AdminRendezVous[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    forkJoin({
      praticiens: this.praticienService
        .getAll({ page: 0, size: 1 })
        .pipe(catchError(() => of(null))),
      patients: this.patientService.getAll(0, 100).pipe(catchError(() => of(null))),
      cliniques: this.cliniqueService.getAll({ page: 0, size: 1 }).pipe(catchError(() => of(null))),
      rendezVous: this.rendezVousService
        .getAll({ page: 0, size: 5, sort: 'creneau.dateDebut,desc' })
        .pipe(catchError(() => of(null))),
    }).subscribe(({ praticiens, patients, cliniques, rendezVous }) => {
      this.praticienCount = praticiens?.totalElements ?? 0;
      this.patientCount = patients
        ? `${patients.content.length}${patients.hasNext ? '+' : ''}`
        : '—';      this.cliniqueCount = cliniques?.totalElements ?? 0;
      this.rendezVousCount = rendezVous?.totalElements ?? 0;
      this.recentRendezVous = rendezVous?.content ?? [];
      this.error = [praticiens, patients, cliniques, rendezVous].some((value) => value === null)
        ? 'Certaines données de supervision sont temporairement indisponibles.'
        : '';
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}
