import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, catchError, map, of, switchMap, takeUntil, timer } from 'rxjs';

import { PatientRendezVous, RendezVousAgenda } from '../../models';
import { RendezVousService } from '../../services/rendez-vous.service';

@Component({
  selector: 'app-next-appointment-widget',
  templateUrl: './next-appointment-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class NextAppointmentWidgetComponent implements OnInit, OnDestroy {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @Input() audience: 'praticien' | 'patient' = 'praticien';

  appointment: RendezVousAgenda | PatientRendezVous | null = null;
  expanded = false;
  loading = true;
  now = Date.now();

  get participantName(): string {
    if (!this.appointment) return '';
    if (this.audience === 'patient' && 'praticienNom' in this.appointment) {
      return `${this.appointment.praticienPrenom ?? ''} ${this.appointment.praticienNom ?? ''}`.trim()
        || 'Praticien';
    }
    if ('patientNom' in this.appointment) {
      return `${this.appointment.patientPrenom ?? ''} ${this.appointment.patientNom ?? ''}`.trim()
        || 'Patient';
    }
    return 'Prochain rendez-vous';
  }

  get durationMinutes(): number {
    if (!this.appointment) return 0;
    return Math.max(0, Math.round(
      (new Date(this.appointment.dateFin).getTime() - new Date(this.appointment.dateDebut).getTime()) / 60_000
    ));
  }

  get countdown(): string {
    if (!this.appointment) return '';
    const start = new Date(this.appointment.dateDebut).getTime();
    const end = new Date(this.appointment.dateFin).getTime();
    if (this.now >= start && this.now < end) {
      return `En cours · reste ${this.formatDuration(end - this.now)}`;
    }
    return `Dans ${this.formatDuration(Math.max(0, start - this.now))}`;
  }

  ngOnInit(): void {
    timer(0, 60_000).pipe(
      switchMap(() => this.loadNextAppointment()),
      takeUntil(this.destroy$)
    ).subscribe(appointments => {
      const now = Date.now();
      this.appointment = appointments
        .filter(item => item.status === 'CONFIRME' || item.status === 'EN_ATTENTE')
        .filter(item => new Date(item.dateFin).getTime() > now)
        .sort((left, right) => left.dateDebut.localeCompare(right.dateDebut))[0] ?? null;
      this.loading = false;
      this.cdr.markForCheck();
    });

    timer(0, 1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.now = Date.now();
      this.cdr.markForCheck();
    });
  }

  toggle(): void {
    this.expanded = !this.expanded;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNextAppointment() {
    if (this.audience === 'patient') {
      return this.rendezVousService.getMine({
        page: 0,
        size: 100,
        sort: 'creneau.dateDebut,asc'
      }).pipe(
        map(page => page.content),
        catchError(() => of([] as PatientRendezVous[]))
      );
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return this.rendezVousService.getMyAgenda(
      this.toLocalDateTime(start),
      this.toLocalDateTime(end)
    ).pipe(catchError(() => of([] as Array<RendezVousAgenda | PatientRendezVous>)));
  }

  private formatDuration(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const clock = [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
    return days > 0 ? `${days}j ${clock}` : clock;
  }

  private toLocalDateTime(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    const seconds = String(value.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
