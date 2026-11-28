import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AdminRendezVous, RendezVous, RendezVousAgenda } from '../../models';

@Component({
  selector: 'app-rendez-vous-card',
  templateUrl: './rendez-vous-card.component.html',
  standalone: false
})
export class RendezVousCardComponent {
  @Input({ required: true }) rendezVous!: RendezVous | AdminRendezVous | RendezVousAgenda;
  @Output() action = new EventEmitter<{ id: string; action: string }>();
  @Output() selected = new EventEmitter<void>();

  get dateDebut(): string | null {
    return 'dateDebut' in this.rendezVous ? this.rendezVous.dateDebut : null;
  }

  get dateFin(): string | null {
    return 'dateFin' in this.rendezVous ? this.rendezVous.dateFin : null;
  }

  get patientName(): string {
    if ('patientNom' in this.rendezVous) {
      const fullName = `${this.rendezVous.patientPrenom ?? ''} ${this.rendezVous.patientNom ?? ''}`.trim();
      if (fullName) return fullName;
    }
    return this.rendezVous.patientId ? `Patient ${this.rendezVous.patientId}` : 'Patient non renseigné';
  }

  emitSelected(): void {
    this.selected.emit();
  }

  emitAction(action: string, event: Event): void {
    event.stopPropagation();
    if (this.rendezVous.id) {
      this.action.emit({ id: this.rendezVous.id, action });
    }
  }
}
