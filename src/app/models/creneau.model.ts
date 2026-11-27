export type StatutCreneau = 'DISPONIBLE' | 'RESERVE' | 'BLOQUE' | 'INDISPONIBLE';

export interface Creneau {
  id: number | null;
  praticienId: number | null;
  cliniqueId: number | null;
  dateDebut: string | null;
  dateFin: string | null;
  statut: StatutCreneau | null;
}

export interface CreateCreneauRequest {
  praticienId: number;
  cliniqueId: number;
  dateDebut: string;
  dateFin: string;
}

export interface UpdateCreneauRequest {
  praticienId?: number;
  cliniqueId?: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface GenerationCreneauxRequest {
  praticienId: number;
  cliniqueId: number;
  dates: string[];
  heureDebut: string;
  heureFin: string;
  dureeCreneauMinutes: number;
}

export type CreneauDayStatus = 'TRAVAIL' | 'CONGE' | 'REPOS' | 'INDISPONIBLE' | 'NON_CONFIGURE' | 'HORS_PERIODE_ACTIVITE';
export type CreneauReservationStatus = 'DISPONIBLE' | 'COMPLET' | 'INDISPONIBLE' | 'AUCUN_CRENEAU';

export interface CreneauDayRange {
  heureDebut: string;
  heureFin: string;
  cliniqueId: number;
}

export interface CreneauDaySummary {
  date: string;
  statutPlanning: CreneauDayStatus;
  statutReservation: CreneauReservationStatus;
  motif: string | null;
  plages: CreneauDayRange[];
  totalCreneaux: number;
  creneauxDisponibles: number;
  rendezVousReserves: number;
  creneauxBloques: number;
}

export interface CreneauMonth {
  praticienId: number;
  mois: string;
  dateDebutActivite: string;
  dateFinActivite: string | null;
  jours: CreneauDaySummary[];
}

export interface CreneauAppointmentSummary {
  id: string;
  heureDebut: string;
  heureFin: string;
  patientId: number;
  cliniqueId: number;
  statut: string;
}

export interface CreneauDayDetails {
  resume: CreneauDaySummary;
  rendezVous: CreneauAppointmentSummary[];
}

export interface GenerationCreneauxResponse {
  createdCount: number;
  creneaux: Creneau[];
}
