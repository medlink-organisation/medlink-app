import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, EMPTY, finalize, forkJoin, map, Subject, switchMap, takeUntil, tap } from 'rxjs';

import {
  Clinique,
  Creneau,
  CreneauDayDetails,
  CreneauDaySummary,
  CreneauMonth,
  CreateCreneauRequest,
  GenerationCreneauxRequest,
  Praticien,
  UpdateCreneauRequest
} from '../../../models';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreneauService } from '../../../services/creneau.service';
import { CliniqueService } from '../../../services/clinique.service';
import { PraticienService } from '../../../services/praticien.service';
import { AffectationPraticienService } from '../../../services/affectation-praticien.service';

@Component({
  selector: 'app-creneau-list',
  templateUrl: './creneau-list.component.html',
  standalone: false
})
export class CreneauListComponent implements OnInit, OnDestroy {
  private readonly creneauService = inject(CreneauService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly praticienService = inject(PraticienService);
  private readonly affectationService = inject(AffectationPraticienService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('confirmDelete') private confirmDeleteDialog?: ConfirmDialogComponent;
  @ViewChild('creneauDialog') private creneauDialog?: ModalComponent;
  @ViewChild('planningDialog') private planningDialog?: ModalComponent;
  @ViewChild('daySummaryDialog') private daySummaryDialog?: ModalComponent;
  @ViewChild('dayDetailDialog') private dayDetailDialog?: ModalComponent;

  loading = false;
  error: string | null = null;
  editTarget: Creneau | null = null;
  deleteTarget: number | null = null;
  praticiens: Praticien[] = [];
  cliniques: Clinique[] = [];
  assignedCliniques: Clinique[] = [];
  monthSummary: CreneauMonth | null = null;
  private daySummaries = new Map<string, CreneauDaySummary>();
  selectedDayDetails: CreneauDayDetails | null = null;
  selectedDaySlots: Creneau[] = [];
  readonly minimumDate = new Date(2026, 10, 1);
  calendarStart = this.clampCalendarStart(new Date());
  calendarDays = this.buildCalendarDays(this.calendarStart);
  calendarLoading = false;
  dayLoading = false;
  detailLoading = false;
  detailStatusFilter = '';
  detailClinicFilter = '';
  planningSaving = false;
  planningMessage = '';
  selectedDate: Date | null = null;
  selectedDates = new Set<string>();
  destroy$ = new Subject<void>();
  private readonly practitionerRequest$ = new Subject<number>();
  private readonly calendarRequest$ = new Subject<{ praticienId: number; month: string }>();

  readonly monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(2024, index, 1))
  }));
  readonly yearOptions = Array.from(
    { length: Math.max(8, new Date().getFullYear() - 2026 + 8) },
    (_, index) => 2026 + index
  );

  readonly planningForm = this.formBuilder.group({
    praticienId: ['', Validators.required],
    cliniqueId: ['', Validators.required],
    heureDebut: ['08:00', Validators.required],
    heureFin: ['12:00', Validators.required],
    dureeConsultation: [30, [Validators.required, Validators.min(5), Validators.max(480)]]
  });

  ngOnInit(): void {
    this.loadReferences();
    this.initializeSelectionRequests();
  }

  get selectedPraticienId(): number | null {
    const value = Number(this.planningForm.controls.praticienId.value);
    return value > 0 ? value : null;
  }

  get availableMonthOptions(): ReadonlyArray<{ value: number; label: string }> {
    return this.calendarStart.getFullYear() === 2026
      ? this.monthOptions.filter(month => month.value >= 10)
      : this.monthOptions;
  }

  get calendarTitle(): string {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this.calendarStart);
  }

  get selectedDateTitle(): string {
    return this.selectedDate
      ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(this.selectedDate)
      : 'Résumé journalier';
  }

  get selectedDetailTitle(): string {
    return this.selectedDate ? `Détail du ${new Intl.DateTimeFormat('fr-FR').format(this.selectedDate)}` : 'Détail journalier';
  }

  get cannotGoPrevious(): boolean {
    const minimumMonth = this.minimumCalendarMonth();
    return this.calendarStart <= minimumMonth;
  }

  get filteredDetailSlots(): Creneau[] {
    return this.selectedDaySlots.filter(slot => (!this.detailStatusFilter || slot.statut === this.detailStatusFilter)
      && (!this.detailClinicFilter || slot.cliniqueId === Number(this.detailClinicFilter)));
  }

  get selectedDatesSummary(): string {
    return [...this.selectedDates].sort().map(value =>
      new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(this.parseLocalDate(value))
    ).join(', ');
  }

  get workedDaysCount(): number {
    return this.monthSummary?.jours.filter(day => day.statutPlanning === 'TRAVAIL').length ?? 0;
  }

  get leaveDaysCount(): number {
    return this.monthSummary?.jours.filter(day => day.statutPlanning === 'CONGE').length ?? 0;
  }

  get appointmentsCount(): number {
    return this.monthSummary?.jours.reduce((total, day) => total + day.rendezVousReserves, 0) ?? 0;
  }

  onPraticienChange(): void {
    this.assignedCliniques = [];
    this.monthSummary = null;
    this.daySummaries.clear();
    this.selectedDates.clear();
    const praticienId = this.selectedPraticienId;
    if (!praticienId) {
      return;
    }
    this.practitionerRequest$.next(praticienId);
  }

  openPlanning(): void {
    if (!this.selectedPraticienId || !this.selectedDates.size) {
      this.error = 'Sélectionnez un praticien et au moins une date valide.';
      return;
    }
    this.planningDialog?.show();
  }

  toggleDateSelection(day: Date, checked: boolean): void {
    if (!this.isDateSelectable(day)) return;
    const value = this.toDateInput(day);
    checked ? this.selectedDates.add(value) : this.selectedDates.delete(value);
  }

  readonly trackCalendarDay = (_index: number, day: Date): number => day.getTime();

  clearSelectedDates(): void {
    this.selectedDates.clear();
  }

  isDateSelected(day: Date): boolean {
    return this.selectedDates.has(this.toDateInput(day));
  }

  isDateSelectable(day: Date): boolean {
    return !this.isDayDisabled(day) && this.toDateInput(day) >= this.toDateInput(new Date());
  }

  get slotsToGenerate(): number {
    const duration = Number(this.planningForm.controls.dureeConsultation.value);
    const start = this.planningForm.controls.heureDebut.value ?? '';
    const end = this.planningForm.controls.heureFin.value ?? '';
    if (!start || !end || duration <= 0 || start >= end) return 0;
    return Math.floor((this.timeMinutes(end) - this.timeMinutes(start)) / duration) * this.selectedDates.size;
  }

  savePlanning(): void {
    if (this.planningForm.invalid || this.planningSaving || !this.selectedDates.size) {
      this.planningForm.markAllAsTouched();
      if (!this.selectedDates.size) this.error = 'Sélectionnez au moins une date dans le calendrier.';
      return;
    }
    const value = this.planningForm.getRawValue();
    if (!value.heureDebut || !value.heureFin || value.heureDebut >= value.heureFin) {
      this.error = 'L’heure de fin doit être strictement postérieure à l’heure de début.';
      return;
    }
    const request: GenerationCreneauxRequest = {
      praticienId: Number(value.praticienId),
      cliniqueId: Number(value.cliniqueId),
      dates: [...this.selectedDates].sort(),
      heureDebut: value.heureDebut,
      heureFin: value.heureFin,
      dureeCreneauMinutes: Number(value.dureeConsultation)
    };
    this.planningSaving = true;
    this.error = null;
    this.creneauService.generate(request).pipe(
      catchError(err => { this.error = this.apiError(err, 'Impossible de générer les créneaux.'); return EMPTY; }),
      finalize(() => {
        this.planningSaving = false;
        this.changeDetector.markForCheck();
      }), takeUntil(this.destroy$)
    ).subscribe(response => {
      this.planningMessage = `${response.createdCount} créneau(x) généré(s) pour ${this.selectedDates.size} jour(s).`;
      this.planningDialog?.hide();
      this.selectedDates.clear();
      this.loadCalendar();
    });
  }

  selectDay(day: Date): void {
    const praticienId = this.selectedPraticienId;
    const summary = this.summaryForDay(day);
    if (!praticienId || !summary || this.isDayDisabled(day)) return;
    this.selectedDate = day;
    this.selectedDayDetails = null;
    this.dayLoading = true;
    this.daySummaryDialog?.show();
    this.creneauService.getDay(praticienId, this.toDateInput(day)).pipe(
      catchError(err => { this.error = this.apiError(err, 'Impossible de charger le résumé de la journée.'); return EMPTY; }),
      finalize(() => {
        this.dayLoading = false;
        this.changeDetector.markForCheck();
      }), takeUntil(this.destroy$)
    ).subscribe(details => this.selectedDayDetails = details);
  }

  openDayDetails(): void {
    const praticienId = this.selectedPraticienId;
    if (!praticienId || !this.selectedDate) return;
    const start = this.selectedDate;
    const end = this.addDays(start, 1);
    this.detailLoading = true;
    this.selectedDaySlots = [];
    this.daySummaryDialog?.hide();
    this.dayDetailDialog?.show();
    this.creneauService.getCalendar(praticienId, null, this.toApiDateTime(start), this.toApiDateTime(end)).pipe(
      catchError(err => { this.error = this.apiError(err, 'Impossible de charger les créneaux de la journée.'); return EMPTY; }),
      finalize(() => {
        this.detailLoading = false;
        this.changeDetector.markForCheck();
      }), takeUntil(this.destroy$)
    ).subscribe(slots => this.selectedDaySlots = slots);
  }

  changePeriod(offset: number): void {
    if (offset < 0 && this.cannotGoPrevious) return;
    const next = new Date(this.calendarStart);
    next.setMonth(next.getMonth() + offset);
    this.setCalendarStart(next);
    this.selectedDates.clear();
    this.loadCalendar();
  }

  selectMonth(month: number): void {
    this.setCalendarStart(new Date(this.calendarStart.getFullYear(), month, 1));
    this.selectedDates.clear();
    this.loadCalendar();
  }

  selectYear(year: number): void {
    const month = year === 2026 ? Math.max(10, this.calendarStart.getMonth()) : this.calendarStart.getMonth();
    this.setCalendarStart(new Date(year, month, 1));
    this.selectedDates.clear();
    this.loadCalendar();
  }

  goToToday(): void {
    this.setCalendarStart(new Date());
    this.selectedDates.clear();
    this.loadCalendar();
  }

  isOutsideMonth(day: Date): boolean { return day.getMonth() !== this.calendarStart.getMonth(); }
  isDayDisabled(day: Date): boolean {
    return this.isOutsideMonth(day)
      || day < this.minimumDate
      || (!!this.monthSummary?.dateDebutActivite && this.toDateInput(day) < this.monthSummary.dateDebutActivite);
  }
  summaryForDay(day: Date): CreneauDaySummary | null {
    return this.daySummaries.get(this.toDateInput(day)) ?? null;
  }
  planningStatusLabel(status: string): string {
    return ({ TRAVAIL: 'Travail', CONGE: 'Congé', REPOS: 'Repos', INDISPONIBLE: 'Indisponible', NON_CONFIGURE: 'Non configuré', HORS_PERIODE_ACTIVITE: 'Hors période' } as Record<string, string>)[status] ?? status;
  }
  reservationStatusLabel(status: string): string {
    return ({ DISPONIBLE: 'Disponible', COMPLET: 'Complet', INDISPONIBLE: 'Indisponible', AUCUN_CRENEAU: 'Aucun créneau' } as Record<string, string>)[status] ?? status;
  }
  hasReservedSlots(_day: Date): boolean { return (this.selectedDayDetails?.resume.rendezVousReserves ?? 0) > 0; }

  praticienName(value: unknown): string {
    const praticien = this.praticiens.find(item => item.id === Number(value));
    return praticien ? `${praticien.prenom} ${praticien.nom}` : `Praticien #${value ?? '—'}`;
  }

  cliniqueName(value: unknown): string {
    return this.cliniques.find(item => item.id === Number(value))?.nom ?? `Clinique #${value ?? '—'}`;
  }

  onEdit(creneau: Creneau): void {
    this.editTarget = creneau;
    this.creneauDialog?.show();
  }

  onFormCancel(): void {
    this.creneauDialog?.hide();
    this.editTarget = null;
  }

  onFormSubmit(req: CreateCreneauRequest | UpdateCreneauRequest): void {
    this.loading = true;
    const request = this.editTarget
      ? this.creneauService.update(this.editTarget.id!, req as UpdateCreneauRequest)
      : this.creneauService.create(req as CreateCreneauRequest);
    request.pipe(
      catchError(() => {
        this.error = 'Erreur lors de l’enregistrement du créneau';
        this.loading = false;
        this.changeDetector.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.creneauDialog?.hide();
      this.editTarget = null;
      this.loadCalendar();
      this.reloadSelectedDay();
      this.changeDetector.markForCheck();
    });
  }

  onDeleteRequest(id: number): void {
    this.deleteTarget = id;
    this.confirmDeleteDialog?.show();
  }

  onDeleteConfirm(): void {
    if (this.deleteTarget === null) {
      return;
    }
    this.creneauService.delete(this.deleteTarget).pipe(
      catchError((error: unknown) => {
        this.error = this.deleteBusinessError(error);
        this.changeDetector.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleteTarget = null;
      this.loadCalendar();
      this.reloadSelectedDay();
      this.changeDetector.markForCheck();
    });
  }

  onDeleteCancel(): void {
    this.deleteTarget = null;
  }

  private deleteBusinessError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }
    return 'Erreur lors de la suppression du créneau';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSelectionRequests(): void {
    this.practitionerRequest$.pipe(
      tap(() => { this.calendarLoading = true; this.error = null; }),
      switchMap(praticienId => forkJoin({
        affectations: this.affectationService.getActiveByPraticien(praticienId, { page: 0, size: 100 }),
        firstSlots: this.creneauService.getByPraticienId(praticienId, { page: 0, size: 1, sort: 'dateDebut,asc' })
      }).pipe(
        map(result => ({ praticienId, ...result })),
        catchError(err => {
          this.calendarLoading = false;
          this.error = this.apiError(err, 'Impossible de charger le praticien et ses affectations.');
          this.changeDetector.markForCheck();
          return EMPTY;
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe(({ praticienId, affectations, firstSlots }) => {
      const ids = new Set(affectations.content.filter(item => item.actif && !item.deleted && item.cliniqueId !== null).map(item => item.cliniqueId as number));
      this.assignedCliniques = this.cliniques.filter(clinique => clinique.id !== null && ids.has(clinique.id));
      if (this.assignedCliniques.length === 1) {
        this.planningForm.controls.cliniqueId.setValue(String(this.assignedCliniques[0].id));
      } else {
        this.planningForm.controls.cliniqueId.setValue('');
      }
      const firstSlot = firstSlots.content[0];
      if (firstSlot?.dateDebut) {
        const activityMonth = this.startOfMonth(new Date(firstSlot.dateDebut));
        if (this.calendarStart < activityMonth) this.setCalendarStart(activityMonth);
        this.calendarLoading = false;
        this.loadCalendar();
      } else {
        this.calendarLoading = false;
        this.loadCalendar();
      }
      this.changeDetector.markForCheck();
    });

    this.calendarRequest$.pipe(
      tap(() => { this.calendarLoading = true; this.error = null; }),
      switchMap(request => this.creneauService.getMonth(request.praticienId, request.month).pipe(
        map(month => ({ request, month })),
        catchError(err => {
          this.calendarLoading = false;
          this.monthSummary = null;
          this.daySummaries.clear();
          this.error = this.apiError(err, 'Impossible de charger le calendrier mensuel.');
          this.changeDetector.markForCheck();
          return EMPTY;
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe(({ month }) => {
      this.monthSummary = month;
      this.daySummaries = new Map(month.jours.map(day => [day.date, day]));
      this.calendarLoading = false;
      this.changeDetector.markForCheck();
    });
  }

  private reloadSelectedDay(): void {
    const praticienId = this.selectedPraticienId;
    if (!praticienId || !this.selectedDate) return;
    const start = this.selectedDate;
    forkJoin({
      details: this.creneauService.getDay(praticienId, this.toDateInput(start)),
      slots: this.creneauService.getCalendar(praticienId, null, this.toApiDateTime(start), this.toApiDateTime(this.addDays(start, 1)))
    }).pipe(catchError(() => EMPTY), takeUntil(this.destroy$)).subscribe(({ details, slots }) => {
      this.selectedDayDetails = details;
      this.selectedDaySlots = slots;
      this.changeDetector.markForCheck();
    });
  }

  private loadReferences(): void {
    forkJoin({
      praticiens: this.praticienService.getAll({ page: 0, size: 100, sort: 'nom,asc' }),
      cliniques: this.cliniqueService.getAll({ page: 0, size: 100, sort: 'nom,asc' })
    }).pipe(
      catchError(() => {
        this.error = 'Impossible de charger la liste des praticiens ou des cliniques.';
        this.changeDetector.markForCheck();
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(({ praticiens, cliniques }) => {
      this.praticiens = praticiens.content.filter((item) => item.id !== null && item.actif !== false);
      this.cliniques = cliniques.content.filter((item) => item.id !== null);
      this.changeDetector.markForCheck();
    });
  }

  loadCalendar(): void {
    const praticienId = this.selectedPraticienId;
    if (!praticienId) return;
    this.calendarRequest$.next({ praticienId, month: this.toMonthInput(this.calendarStart) });
  }

  private timeMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  private startOfWeek(value: Date): Date {
    const date = new Date(value);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private buildCalendarDays(value: Date): Date[] {
    const start = this.startOfWeek(this.startOfMonth(value));
    return Array.from({ length: 42 }, (_, index) => this.addDays(start, index));
  }

  private minimumCalendarMonth(): Date {
    const configuredMinimum = this.startOfMonth(this.minimumDate);
    const activityMinimum = this.monthSummary?.dateDebutActivite
      ? this.startOfMonth(this.parseLocalDate(this.monthSummary.dateDebutActivite))
      : configuredMinimum;
    return activityMinimum > configuredMinimum ? activityMinimum : configuredMinimum;
  }

  private clampCalendarStart(value: Date): Date {
    const requested = this.startOfMonth(value);
    const minimum = this.minimumCalendarMonth();
    return requested < minimum ? minimum : requested;
  }

  private setCalendarStart(value: Date): void {
    this.calendarStart = this.clampCalendarStart(value);
    this.calendarDays = this.buildCalendarDays(this.calendarStart);
  }

  private startOfMonth(value: Date): Date {
    const date = new Date(value.getFullYear(), value.getMonth(), 1);
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

  private toMonthInput(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  }

  private parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.detail || fallback;
  }
}
