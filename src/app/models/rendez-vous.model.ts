export type StatusRendezVous = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'ABSENT';
export type TypeRendezVous = 'CONSULTATION' | 'CONTROLE' | 'URGENCE';

export interface RendezVous {
  id: string | null;
  creneauId: number | null;
  patientId: string | null;
  status: StatusRendezVous | null;
  type: TypeRendezVous | null;
}

export interface AdminRendezVous {
  id: string;
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  praticienId: number;
  praticienNom: string;
  praticienPrenom: string;
  creneauId: number;
  cliniqueId: number;
  dateDebut: string;
  dateFin: string;
  type: TypeRendezVous;
  status: StatusRendezVous;
}

export interface CreateRendezVousRequest {
  creneauId: number;
  patientId: string;
  type: TypeRendezVous;
}

export interface RendezVousAgenda {
  id: string;
  patientId: string;
  patientNom: string;
  patientPrenom: string;
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
  praticienNom: string;
  praticienPrenom: string;
  cliniqueId: number;
  dateDebut: string;
  dateFin: string;
  status: StatusRendezVous;
  type: TypeRendezVous;
}

export interface PraticienPatient {
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  lastRendezVousId: string;
  lastRendezVousAt: string;
  cliniqueId: number;
  status: StatusRendezVous;
}
