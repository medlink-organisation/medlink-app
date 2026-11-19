import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import { Creneau, CreateRendezVousRequest, TypeRendezVous } from '../../../models';
import { CreneauService } from '../../../services/creneau.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { TimeSlot } from '../../../shared/ui/time-slot.model';

@Component({
  selector: 'app-prendre-rendez-vous',
  templateUrl: './prendre-rendez-vous.component.html',
  standalone: false
})
export class PrendreRendezVousComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly creneauService = inject(CreneauService);
  private readonly rendezVousService = inject(RendezVousService);
  creneaux: Creneau[] = [];
  selectedCreneauId: number | null = null;
  patientId: number | null = null;
  noPatientId = false;
  loading = false;
  saving = false;
  error = '';

  get slots(): TimeSlot[] {
    return this.creneaux.flatMap((creneau) => {
      if (creneau.id === null || creneau.dateDebut === null || creneau.dateFin === null) {
        return [];
      }
      return [{
        id: creneau.id,
        dateDebut: creneau.dateDebut,
        dateFin: creneau.dateFin,
        statut: creneau.statut ?? 'INDISPONIBLE'
      }];
    });
  }

  ngOnInit(): void {
    this.patientId = this.authService.getPatientId();
    this.noPatientId = this.patientId === null;
    this.loading = true;
    this.creneauService.getAll({ page: 0, size: 50 }).subscribe({
      next: (page) => {
        this.creneaux = page.content;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les créneaux disponibles.';
        this.loading = false;
      }
    });
  }

  onSlotSelected(id: number): void {
    this.selectedCreneauId = id;
  }

  onConfirm(): void {
    if (this.selectedCreneauId === null || this.patientId === null || this.saving) {
      if (this.patientId === null) {
        this.noPatientId = true;
      }
      return;
    }
    const request: CreateRendezVousRequest = {
      creneauId: this.selectedCreneauId,
      patientId: this.patientId,
      type: 'CONSULTATION' satisfies TypeRendezVous
    };
    this.saving = true;
    this.error = '';
    this.rendezVousService.create(request).subscribe({
      next: () => {
        this.saving = false;
        this.selectedCreneauId = null;
      },
      error: () => {
        this.saving = false;
        this.error = 'Impossible de réserver ce créneau.';
      }
    });
  }
}
