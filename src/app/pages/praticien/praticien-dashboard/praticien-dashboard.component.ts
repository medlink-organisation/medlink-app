import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Creneau, RendezVousAgenda } from '../../../models';
import { CreneauService } from '../../../services/creneau.service';
import { RendezVousService } from '../../../services/rendez-vous.service';

@Component({
  selector: 'app-praticien-dashboard',
  templateUrl: './praticien-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PraticienDashboardComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly rendezVousService = inject(RendezVousService);
  private readonly creneauService = inject(CreneauService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  agenda: RendezVousAgenda[] = [];
  creneaux: Creneau[] = [];
  loading = true;
  error = '';

  get displayName(): string {
    return this.auth.getProfile()?.firstName || this.auth.getUsername() || 'Praticien';
  }

  get todayAppointments(): RendezVousAgenda[] {
    const today = this.dateKey(new Date());
    return this.agenda.filter(item => item.dateDebut.startsWith(today));
  }

  get upcomingAppointments(): RendezVousAgenda[] {
    const now = Date.now();
    return this.agenda.filter(item => new Date(item.dateDebut).getTime() > now).slice(0, 5);
  }

  get availableSlotCount(): number {
    return this.creneaux.filter(item => item.statut === 'DISPONIBLE').length;
  }

  get clinicCount(): number {
    return new Set(this.creneaux.map(item => item.cliniqueId).filter(id => id !== null)).size;
  }

  ngOnInit(): void {
    const start = this.startOfDay(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    forkJoin({
      agenda: this.rendezVousService.getMyAgenda(start.toISOString(), end.toISOString()).pipe(catchError(() => of(null))),
      creneaux: this.creneauService.getMyCalendar(start.toISOString(), end.toISOString()).pipe(catchError(() => of(null)))
    }).pipe(takeUntil(this.destroy$)).subscribe(({ agenda, creneaux }) => {
      this.agenda = [...(agenda ?? [])].sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
      this.creneaux = [...(creneaux ?? [])].sort((a, b) => (a.dateDebut ?? '').localeCompare(b.dateDebut ?? ''));
      this.error = !agenda || !creneaux ? 'Une partie de votre planning est temporairement indisponible.' : '';
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startOfDay(value: Date): Date {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private dateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
