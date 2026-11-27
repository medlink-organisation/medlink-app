import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { BookingClinique, BookingPraticien, BookingSpecialite, Creneau } from '../../../models';
import { AffectationPraticienService } from '../../../services/affectation-praticien.service';
import { CliniqueService } from '../../../services/clinique.service';
import { CreneauService } from '../../../services/creneau.service';
import { PraticienService } from '../../../services/praticien.service';
import { SpecialiteService } from '../../../services/specialite.service';
import { WorkflowService } from '../../../services/workflow.service';
import { StepperItem } from '../../../shared/ui/stepper/stepper.component';
import { TimeSlot } from '../../../shared/ui/time-slot.model';

@Component({
  selector: 'app-prendre-rendez-vous',
  templateUrl: './prendre-rendez-vous.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PrendreRendezVousComponent implements OnInit {
  private readonly specialiteService = inject(SpecialiteService);
  private readonly cliniqueService = inject(CliniqueService);
  private readonly praticienService = inject(PraticienService);
  private readonly affectationService = inject(AffectationPraticienService);
  private readonly creneauService = inject(CreneauService);
  private readonly workflowService = inject(WorkflowService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly steps: StepperItem[] = [
    { label: 'Spécialité' },
    { label: 'Clinique' },
    { label: 'Praticien' },
    { label: 'Date et heure' },
    { label: 'Confirmation' }
  ];
  readonly reason = new FormControl('', { nonNullable: true });

  currentIndex = 0;
  specialites: BookingSpecialite[] = [];
  cliniques: BookingClinique[] = [];
  praticiens: BookingPraticien[] = [];
  slots: TimeSlot[] = [];
  selectedSpecialite: BookingSpecialite | null = null;
  selectedClinique: BookingClinique | null = null;
  selectedPraticien: BookingPraticien | null = null;
  selectedSlotId: number | null = null;
  loading = true;
  submitting = false;
  error = '';
  confirmationId = '';
  private idempotencyKey = crypto.randomUUID();

  ngOnInit(): void {
    forkJoin({
      specialites: this.specialiteService.getActiveForBooking({ page: 0, size: 100, sort: 'nom' }),
      cliniques: this.cliniqueService.getActiveForBooking({ page: 0, size: 100, sort: 'nom' })
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: ({ specialites, cliniques }) => {
        this.specialites = specialites.content;
        this.cliniques = cliniques.content;
      },
      error: (error: unknown) => this.error = this.businessError(error)
    });
  }

  selectSpecialite(specialite: BookingSpecialite): void {
    this.selectedSpecialite = specialite;
    this.selectedClinique = null;
    this.selectedPraticien = null;
    this.selectedSlotId = null;
  }

  selectClinique(clinique: BookingClinique): void {
    if (!clinique.id || !this.selectedSpecialite?.id) return;
    this.selectedClinique = clinique;
    this.selectedPraticien = null;
    this.selectedSlotId = null;
    this.loading = true;
    this.error = '';
    forkJoin({
      affectations: this.affectationService.getBookingByClinique(clinique.id, { page: 0, size: 500 }),
      praticiens: this.praticienService.getActiveForBooking(this.selectedSpecialite.id, { page: 0, size: 500, sort: 'nom' })
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: ({ affectations, praticiens }) => {
        const assignedIds = new Set(affectations.content.map(item => item.praticienId));
        this.praticiens = praticiens.content.filter(item => item.id !== null && assignedIds.has(item.id));
      },
      error: (error: unknown) => this.error = this.businessError(error)
    });
  }

  selectPraticien(praticien: BookingPraticien): void {
    if (!praticien.id || !this.selectedClinique?.id) return;
    this.selectedPraticien = praticien;
    this.selectedSlotId = null;
    this.loading = true;
    this.error = '';
    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 60);
    this.creneauService.getAvailableForBooking(
      praticien.id,
      this.selectedClinique.id,
      this.localDateTime(from),
      this.localDateTime(to)
    ).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (slots: Creneau[]) => this.slots = slots
        .filter(slot => slot.id !== null && slot.dateDebut !== null && slot.dateFin !== null)
        .map(slot => ({ id: slot.id!, dateDebut: slot.dateDebut!, dateFin: slot.dateFin!, statut: 'DISPONIBLE' })),
      error: (error: unknown) => this.error = this.businessError(error)
    });
  }

  selectSlot(slotId: number): void {
    this.selectedSlotId = slotId;
  }

  next(): void {
    if (this.canContinue() && this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.error = '';
    }
  }

  previous(): void {
    if (this.currentIndex > 0 && !this.submitting) {
      this.currentIndex--;
      this.error = '';
    }
  }

  canContinue(): boolean {
    return [
      this.selectedSpecialite !== null,
      this.selectedClinique !== null,
      this.selectedPraticien !== null,
      this.selectedSlotId !== null,
      true
    ][this.currentIndex];
  }

  confirm(): void {
    if (!this.selectedSlotId || this.submitting) return;
    this.submitting = true;
    this.error = '';
    this.workflowService.bookPatientAppointment({
      slotId: this.selectedSlotId,
      reason: this.reason.value.trim(),
      idempotencyKey: this.idempotencyKey
    }).pipe(finalize(() => {
      this.submitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: response => this.confirmationId = response.rendezVousId,
      error: (error: unknown) => this.error = this.businessError(error)
    });
  }

  selectedSlot(): TimeSlot | undefined {
    return this.slots.find(slot => slot.id === this.selectedSlotId);
  }

  private businessError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
      if (error.status === 403) return 'Votre compte ne permet pas cette opération.';
      if (error.status === 409) return 'Ce créneau vient d’être réservé. Choisissez un autre horaire.';
    }
    return 'La réservation n’a pas pu être effectuée. Veuillez réessayer.';
  }

  private localDateTime(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
  }
}
