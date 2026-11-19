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