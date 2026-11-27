import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';

import { PatientRendezVous } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';

type RendezVousFilter = 'upcoming' | 'past' | 'cancelled' | 'all';

@Component({
  selector: 'app-mes-rendez-vous-patient',
  templateUrl: './mes-rendez-vous-patient.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MesRendezVousPatientComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly cdr = inject(ChangeDetectorRef);

  rendezVous: PatientRendezVous[] = [];
  filter: RendezVousFilter = 'upcoming';
  loading = true;
  error = '';

  ngOnInit(): void {
    this.rendezVousService.getMine({
      page: 0,
      size: 100,
      sort: 'creneau.dateDebut,desc'
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: page => this.rendezVous = page.content,
      error: (error: unknown) => this.error = this.businessError(error)
    });
  }

  selectFilter(filter: RendezVousFilter): void {
    this.filter = filter;
  }

  filteredAppointments(): PatientRendezVous[] {
    const now = Date.now();
    return this.rendezVous.filter(item => {
      if (this.filter === 'all') return true;
      if (this.filter === 'cancelled') return item.status === 'ANNULE';
      if (item.status === 'ANNULE') return false;

      const ended = new Date(item.dateFin).getTime() < now;
      const closed = item.status === 'TERMINE' || item.status === 'ABSENT';
      return this.filter === 'past' ? ended || closed : !ended && !closed;
    });
  }

  trackById(_index: number, item: PatientRendezVous): string {
    return item.id;
  }

  private businessError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
      if (error.status === 403) return 'Votre compte ne permet pas de consulter ces rendez-vous.';
    }
    return 'Impossible de charger vos rendez-vous. Veuillez réessayer.';
  }
}
