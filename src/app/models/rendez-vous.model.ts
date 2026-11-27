export type StatusRendezVous = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'ABSENT';
export type TypeRendezVous = 'CONSULTATION' | 'CONTROLE' | 'URGENCE';

export interface RendezVous {
  id: string | null;
  creneauId: number | null;
  patientId: number | null;
  status: StatusRendezVous | null;
  type: TypeRendezVous | null;
}

export interface CreateRendezVousRequest {
  creneauId: number;
  patientId: number;
  type: TypeRendezVous;
}

export interface RendezVousAgenda {
  id: string;
  patientId: number;
  praticienId: number;
  cliniqueId: number;
  creneauId: number;
  dateDebut: string;
  dateFin: string;
  status: StatusRendezVous;
  type: TypeRendezVous;
}

export interface PatientRendezVous {
  id: string;
  creneauId: number;
  praticienId: number;
  cliniqueId: number;
  dateDebut: string;
  dateFin: string;
  status: StatusRendezVous;
  type: TypeRendezVous;
}

export interface PraticienPatient {
  patientId: string;
  lastRendezVousId: string;
  lastRendezVousAt: string;
  cliniqueId: number;
  status: StatusRendezVous;
}
