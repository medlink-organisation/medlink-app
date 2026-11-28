export interface CompteRendu {
  id: string | null;
  dossierMedicalId: number | null;
  rendezVousId: string | null;
  praticienId: number | null;
  praticienNom: string | null;
  praticienPrenom: string | null;
  cliniqueId: number | null;
  dateConsultation: string | null;
  dateRedaction: string | null;
  contenu: string | null;
  motif: string | null;
  symptomes: string | null;
  diagnostic: string | null;
  observations: string | null;
  traitementRecommande: string | null;
  examensComplementaires: string | null;
  recommandations: string | null;
  controleRequis: boolean | null;
}

export interface CreateCompteRenduRequest {
  dossierMedicalId: number;
  rendezVousId: string;
  praticienId: number;
  contenu: string;
}
