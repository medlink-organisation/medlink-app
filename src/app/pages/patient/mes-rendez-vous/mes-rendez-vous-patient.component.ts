import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { BookingClinique, BookingPraticien, BookingSpecialite, Creneau, PatientRendezVous } from '../../../models';
import { CliniqueService } from '../../../services/clinique.service';
import { CreneauService } from '../../../services/creneau.service';
import { PraticienService } from '../../../services/praticien.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { SpecialiteService } from '../../../services/specialite.service';
import { WorkflowService } from '../../../services/workflow.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { TimeSlot } from '../../../shared/ui/time-slot.model';

type RendezVousFilter = 'upcoming' | 'past' | 'cancelled' | 'all';

@Component({
  selector: 'app-mes-rendez-vous-patient',
  templateUrl: './mes-rendez-vous-patient.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MesRendezVousPatientComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly praticienService = inject(PraticienService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly specialiteService = inject(SpecialiteService);
  private readonly creneauService = inject(CreneauService);
  private readonly workflowService = inject(WorkflowService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('appointmentDialog') private appointmentDialog?: ModalComponent;
  @ViewChild('cancelDialog') private cancelDialog?: ConfirmDialogComponent;

  rendezVous: PatientRendezVous[] = [];
  filter: RendezVousFilter = 'upcoming';
  loading = true;
  error = '';
  actionError = '';
  detailLoading = false;
  actionLoading = false;
  editing = false;
  selectedAppointment: PatientRendezVous | null = null;
  selectedPraticien: BookingPraticien | null = null;
  selectedClinique: BookingClinique | null = null;
  selectedSpecialite: BookingSpecialite | null = null;
  availableSlots: TimeSlot[] = [];
  selectedSlotId: number | null = null;
  readonly rescheduleDate = new FormControl('', { nonNullable: true });
  readonly minRescheduleDate = this.localDate(new Date());
  readonly maxRescheduleDate = this.futureDate(60);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = '';
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

  openAppointment(item: PatientRendezVous): void {
    this.selectedAppointment = item;
    this.selectedPraticien = null;
    this.selectedClinique = null;
    this.selectedSpecialite = null;
    this.actionError = '';
    this.editing = false;
    this.detailLoading = true;
    this.appointmentDialog?.show();

    forkJoin({
      praticien: this.praticienService.getForBooking(item.praticienId),
      clinique: this.cliniqueService.getForBooking(item.cliniqueId)
    }).pipe(
      switchMap(({ praticien, clinique }) => {
        if (!praticien.specialiteId) {
          return of({ praticien, clinique, specialite: null });
        }
        return this.specialiteService.getForBooking(praticien.specialiteId).pipe(
          map(specialite => ({ praticien, clinique, specialite }))
        );
      }),
      finalize(() => {
        this.detailLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ praticien, clinique, specialite }) => {
        this.selectedPraticien = praticien;
        this.selectedClinique = clinique;
        this.selectedSpecialite = specialite;
      },
      error: (error: unknown) => this.actionError = this.businessError(error)
    });
  }

  canModify(item: PatientRendezVous | null = this.selectedAppointment): boolean {
    return !!item
      && (item.status === 'EN_ATTENTE' || item.status === 'CONFIRME')
      && new Date(item.dateDebut).getTime() > Date.now();
  }

  startEditing(): void {
    const appointment = this.selectedAppointment;
    if (!this.canModify(appointment) || this.actionLoading) return;

    this.editing = true;
    this.actionError = '';
    this.selectedSlotId = null;
    this.availableSlots = [];
    this.rescheduleDate.setValue(appointment!.dateDebut.slice(0, 10));
    this.actionLoading = true;

    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 60);
    this.creneauService.getAvailableForBooking(
      appointment!.praticienId,
      appointment!.cliniqueId,
      this.localDateTime(from),
      this.localDateTime(to)
    ).pipe(finalize(() => {
      this.actionLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (slots: Creneau[]) => {
        this.availableSlots = slots
          .filter(slot => slot.id !== null
            && slot.dateDebut !== null
            && slot.dateFin !== null
            && new Date(slot.dateDebut).getTime() > Date.now())
          .map(slot => ({
            id: slot.id!,
            dateDebut: slot.dateDebut!,
            dateFin: slot.dateFin!,
            statut: 'DISPONIBLE'
          }));
        if (!this.filteredSlots().length && this.availableSlots.length) {
          this.rescheduleDate.setValue(this.availableSlots[0].dateDebut.slice(0, 10));
        }
      },
      error: (error: unknown) => this.actionError = this.businessError(error)
    });
  }

  filteredSlots(): TimeSlot[] {
    const selectedDate = this.rescheduleDate.value;
    return selectedDate
      ? this.availableSlots.filter(slot => slot.dateDebut.slice(0, 10) === selectedDate)
      : [];
  }

  selectSlot(slotId: number): void {
    this.selectedSlotId = slotId;
  }

  typeLabel(item: PatientRendezVous): string {
    if (item.type === 'CONTROLE') return 'Consultation de contrôle';
    if (item.type === 'URGENCE') return 'Consultation urgente';
    return 'Consultation';
  }

  submitReschedule(): void {
    if (!this.selectedAppointment || !this.selectedSlotId || this.actionLoading) return;
    this.actionLoading = true;
    this.actionError = '';
    this.workflowService.reschedulePatientAppointment(
      this.selectedAppointment.id,
      this.selectedSlotId
    ).pipe(finalize(() => {
      this.actionLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => this.finishAction(),
      error: (error: unknown) => this.actionError = this.businessError(error)
    });
  }

  requestCancel(): void {
    if (this.canModify() && !this.actionLoading) this.cancelDialog?.show();
  }

  confirmCancel(): void {
    if (!this.selectedAppointment || this.actionLoading) return;
    this.actionLoading = true;
    this.actionError = '';
    this.workflowService.cancelPatientAppointment(this.selectedAppointment.id)
      .pipe(finalize(() => {
        this.actionLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => this.finishAction(),
        error: (error: unknown) => this.actionError = this.businessError(error)
      });
  }

  closeAppointment(): void {
    if (!this.actionLoading) this.appointmentDialog?.hide();
  }

  resetDialog(): void {
    this.selectedAppointment = null;
    this.editing = false;
    this.availableSlots = [];
    this.selectedSlotId = null;
    this.actionError = '';
  }

  private finishAction(): void {
    this.appointmentDialog?.hide();
    this.loadAppointments();
  }

  private businessError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
      if (error.status === 403) return 'Votre compte ne permet pas de consulter ces rendez-vous.';
      if (error.status === 409) return detail || 'Cette opération entre en conflit avec un autre rendez-vous.';
    }
    return 'Impossible de charger vos rendez-vous. Veuillez réessayer.';
  }

  private localDateTime(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
  }

  private localDate(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  private futureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.localDate(date);
  }
}
