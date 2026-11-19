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