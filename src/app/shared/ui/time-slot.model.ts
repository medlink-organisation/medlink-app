export interface TimeSlot {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: 'DISPONIBLE' | 'RESERVE' | 'BLOQUE' | 'INDISPONIBLE';
}
