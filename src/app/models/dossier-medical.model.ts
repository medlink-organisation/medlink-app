export interface DossierMedical {
  id: number | null;
  patientId: number | null;
  dateCreation: string | null;
  derniereModification: string | null;
}

export interface CreateDossierMedicalRequest {
  patientId: number;
}