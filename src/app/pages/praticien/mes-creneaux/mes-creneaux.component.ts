import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';

import { Creneau, RendezVousAgenda } from '../../../models';
import { CreneauService } from '../../../services/creneau.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-mes-creneaux',
  templateUrl: './mes-creneaux.component.html',
  standalone: false
})
export class MesCreneauxComponent implements AfterViewInit, OnDestroy {
  private readonly creneauService = inject(CreneauService);
  private readonly rendezVousService = inject(RendezVousService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('dayAppointmentsDialog') private dayAppointmentsDialog?: ModalComponent;

  creneaux: Creneau[] = [];
  rendezVous: RendezVousAgenda[] = [];
  selectedDay: Date | null = null;
  weekStart = this.startOfWeek(new Date());
  loading = true;
  error = '';

  ngAfterViewInit(): void {
    this.load();
  }

  get weekDays(): Date[] {
    return Array.from({ length: 7 }, (_, index) => this.addDays(this.weekStart, index));
  }

  changeWeek(offset: number): void {
    this.weekStart = this.addDays(this.weekStart, offset * 7);
    this.load();
  }

  slotsForDay(day: Date): Creneau[] {
    const key = this.toDateInput(day);
    return this.creneaux.filter((slot) => slot.dateDebut?.startsWith(key));
  }

  workingHoursForDay(day: Date): string {
    const ranges = this.slotsForDay(day)
      .filter((slot): slot is Creneau & { dateDebut: string; dateFin: string } =>
        !!slot.dateDebut && !!slot.dateFin)
      .map(slot => ({ start: new Date(slot.dateDebut), end: new Date(slot.dateFin) }))
      .sort((left, right) => left.start.getTime() - right.start.getTime());

    const merged: Array<{ start: Date; end: Date }> = [];
    for (const range of ranges) {
      const previous = merged.at(-1);
      if (previous && range.start.getTime() <= previous.end.getTime()) {
        if (range.end > previous.end) previous.end = range.end;
      } else {
        merged.push({ start: range.start, end: range.end });
      }
    }
    return merged.map(range => `${this.time(range.start)}–${this.time(range.end)}`).join(' · ');
  }

  selectDay(day: Date): void {
    this.selectedDay = new Date(day);
    this.dayAppointmentsDialog?.show();
    this.cdr.detectChanges();
  }

  appointmentsForDay(day: Date | null): RendezVousAgenda[] {
    if (!day) return [];
    const key = this.toDateInput(day);
    return this.rendezVous.filter(appointment => appointment.dateDebut.startsWith(key));
  }

  patientName(appointment: RendezVousAgenda): string {
    return `${appointment.patientPrenom ?? ''} ${appointment.patientNom ?? ''}`.trim()
      || `Patient ${appointment.patientId}`;
  }

  isSelectedDay(day: Date): boolean {
    return !!this.selectedDay && this.toDateInput(this.selectedDay) === this.toDateInput(day);
  }

  goToCurrentWeek(): void {
    this.weekStart = this.startOfWeek(new Date());
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    const debut = this.toApiDateTime(this.weekStart);
    const fin = this.toApiDateTime(this.addDays(this.weekStart, 7));
    forkJoin({
      creneaux: this.creneauService.getMyCalendar(debut, fin),
      rendezVous: this.rendezVousService.getMyAgenda(debut, fin)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ creneaux, rendezVous }) => {
        this.creneaux = creneaux;
        this.rendezVous = rendezVous;
        if (this.selectedDay && !this.weekDays.some(day => this.isSelectedDay(day))) {
          this.selectedDay = null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos heures de travail.';
        this.cdr.detectChanges();
      }
    });
  }

  private startOfWeek(value: Date): Date {
    const date = new Date(value);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private addDays(value: Date, count: number): Date {
    const date = new Date(value);
    date.setDate(date.getDate() + count);
    return date;
  }

  private toDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toApiDateTime(value: Date): string {
    return `${this.toDateInput(value)}T00:00:00`;
  }

  private time(value: Date): string {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
}
