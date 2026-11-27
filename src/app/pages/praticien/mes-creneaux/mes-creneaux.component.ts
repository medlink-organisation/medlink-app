import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { Creneau } from '../../../models';
import { CreneauService } from '../../../services/creneau.service';

@Component({
  selector: 'app-mes-creneaux',
  templateUrl: './mes-creneaux.component.html',
  standalone: false
})
export class MesCreneauxComponent implements OnInit, OnDestroy {
  private readonly creneauService = inject(CreneauService);
  private readonly destroy$ = new Subject<void>();

  creneaux: Creneau[] = [];
  weekStart = this.startOfWeek(new Date());
  loading = false;
  error = '';
  statusFilter = '';

  ngOnInit(): void {
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

  filteredSlotsForDay(day: Date): Creneau[] {
    const slots = this.slotsForDay(day);
    return this.statusFilter ? slots.filter(slot => slot.statut === this.statusFilter) : slots;
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
    this.creneauService.getMyCalendar(
      this.toApiDateTime(this.weekStart),
      this.toApiDateTime(this.addDays(this.weekStart, 7))
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (creneaux) => {
        this.creneaux = creneaux;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos heures de travail.';
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
}
