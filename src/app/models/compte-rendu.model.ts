export interface CompteRendu {
  id: string | null;
  dossierMedicalId: number | null;
  rendezVousId: string | null;
  praticienId: string | null;
  dateRedaction: string | null;
  contenu: string | null;
}

export interface CreateCompteRenduRequest {
  dossierMedicalId: number;
  rendezVousId: string;
  praticienId: string;
  contenu: string;
}