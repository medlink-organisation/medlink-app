import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AdminRendezVous, RendezVous } from '../../models';

@Component({
  selector: 'app-rendez-vous-card',
  templateUrl: './rendez-vous-card.component.html',
  standalone: false
})
export class RendezVousCardComponent {
  @Input({ required: true }) rendezVous!: RendezVous | AdminRendezVous;
  @Output() action = new EventEmitter<{ id: string; action: string }>();

  emitAction(action: string): void {
    if (this.rendezVous.id) {
      this.action.emit({ id: this.rendezVous.id, action });
    }
  }
}
