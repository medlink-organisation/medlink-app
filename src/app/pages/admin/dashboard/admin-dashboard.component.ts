import { Component, OnInit, inject } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';

import { RendezVous } from '../../../models';
import { CliniqueService } from '../../../services/clinique.service';
import { PatientAdminService } from '../../../services/patient-admin.service';
import { PraticienService } from '../../../services/praticien.service';
import { RendezVousService } from '../../../services/rendez-vous.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: false
})
export class AdminDashboardComponent implements OnInit {
  private readonly praticienService = inject(PraticienService);
  private readonly patientService = inject(PatientAdminService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly rendezVousService = inject(RendezVousService);

  praticienCount = 0;
  patientCount: number | string = 0;
  cliniqueCount = 0;
  rendezVousCount = 0;
  recentRendezVous: RendezVous[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    forkJoin({
      praticiens: this.praticienService.getAll({ page: 0, size: 1 }).pipe(catchError(() => of(null))),
      patients: this.patientService.getAll(0, 100).pipe(catchError(() => of(null))),
      cliniques: this.cliniqueService.getAll({ page: 0, size: 1 }).pipe(catchError(() => of(null))),
      rendezVous: this.rendezVousService.getAll({ page: 0, size: 5, sort: 'id,desc' }).pipe(catchError(() => of(null)))
    }).subscribe(({ praticiens, patients, cliniques, rendezVous }) => {
      this.praticienCount = praticiens?.totalElements ?? 0;
      this.patientCount = patients ? `${patients.content.length}${patients.hasNext ? '+' : ''}` : 0;
      this.cliniqueCount = cliniques?.totalElements ?? 0;
      this.rendezVousCount = rendezVous?.totalElements ?? 0;
      this.recentRendezVous = rendezVous?.content ?? [];
      this.error = [praticiens, patients, cliniques, rendezVous].some(value => value === null)
        ? 'Certaines données de supervision sont temporairement indisponibles.'
        : '';
      this.loading = false;
    });
  }
}
