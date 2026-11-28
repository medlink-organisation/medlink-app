export interface ResultatExamen {
  id: string | null;
  dossierMedicalId: number | null;
  documentMedicalId: number | null;
  typeExamen: string | null;
  dateExamen: string | null;
  conclusion: string | null;
  datePublication: string | null;
  nomFichier: string | null;
  tailleOctets: number | null;
  praticienNomComplet: string | null;
}

export interface CreateResultatExamenRequest {
  typeExamen: string;
  dateExamen: string;
  conclusion?: string;
  file: File;
}
