import { Component, Input } from '@angular/core';
import { BadgeTone } from '../badge/badge.component';
import { IconName } from '../icon/icon.component';

interface StatusPresentation {
  label: string;
  tone: BadgeTone;
  icon: IconName;
}

const STATUS_MAP: Record<string, StatusPresentation> = {
  ACTIVE: { label: 'Actif', tone: 'success', icon: 'circle-check' },
  ACTIF: { label: 'Actif', tone: 'success', icon: 'circle-check' },
  INACTIVE: { label: 'Inactif', tone: 'neutral', icon: 'minus' },
  INACTIF: { label: 'Inactif', tone: 'neutral', icon: 'minus' },
  PENDING: { label: 'En attente', tone: 'warning', icon: 'clock' },
  EN_ATTENTE: { label: 'En attente', tone: 'warning', icon: 'clock' },
  CONFIRMED: { label: 'Confirmé', tone: 'info', icon: 'circle-check' },
  CONFIRME: { label: 'Confirmé', tone: 'info', icon: 'circle-check' },
  CANCELLED: { label: 'Annulé', tone: 'danger', icon: 'circle-x' },
  ANNULE: { label: 'Annulé', tone: 'danger', icon: 'circle-x' },
  COMPLETED: { label: 'Terminé', tone: 'success', icon: 'check' },
  TERMINE: { label: 'Terminé', tone: 'success', icon: 'check' },
  AVAILABLE: { label: 'Disponible', tone: 'success', icon: 'circle-check' },
  DISPONIBLE: { label: 'Disponible', tone: 'success', icon: 'circle-check' },
  UNAVAILABLE: { label: 'Indisponible', tone: 'neutral', icon: 'calendar-x' },
  INDISPONIBLE: { label: 'Indisponible', tone: 'neutral', icon: 'calendar-x' },
  RESERVE: { label: 'Réservé', tone: 'info', icon: 'calendar' },
  BLOQUE: { label: 'Bloqué', tone: 'danger', icon: 'circle-x' },
  ABSENT: { label: 'Absent', tone: 'warning', icon: 'circle-alert' },
  REJECTED: { label: 'Rejeté', tone: 'danger', icon: 'circle-x' },
  VALIDATED: { label: 'Validé', tone: 'success', icon: 'circle-check' },
  SCANNING: { label: 'Analyse en cours', tone: 'info', icon: 'loader' },
  UPLOADING: { label: 'Envoi en cours', tone: 'info', icon: 'upload' }
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  standalone: false
})
export class StatusBadgeComponent {
  @Input() value: boolean | string = false;
  @Input() trueLabel = 'Actif';
  @Input() falseLabel = 'Inactif';

  get presentation(): StatusPresentation {
    if (typeof this.value === 'boolean') {
      return this.value
        ? { label: this.trueLabel, tone: 'success', icon: 'circle-check' }
        : { label: this.falseLabel, tone: 'neutral', icon: 'minus' };
    }
    const key = this.value.trim().toUpperCase();
    return STATUS_MAP[key] ?? { label: this.humanize(key), tone: 'neutral', icon: 'info' };
  }

  get label(): string {
    return this.presentation.label;
  }

  private humanize(value: string): string {
    if (!value) {
      return 'Non renseigné';
    }
    const normalized = value.replace(/_/g, ' ').toLocaleLowerCase('fr');
    return normalized.charAt(0).toLocaleUpperCase('fr') + normalized.slice(1);
  }
}
