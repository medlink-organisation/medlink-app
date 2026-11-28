import { CompteRendu } from './compte-rendu.model';
import { DocumentMedical } from './document-medical.model';
import { ResultatExamen } from './resultat-examen.model';

export interface DossierMedical {
  id: number | null;
  patientId: string | null;
  dateCreation: string | null;
  derniereModification: string | null;
  patientNom: string | null;
  patientPrenom: string | null;
  patientEmail: string | null;
  patientTelephone: string | null;
  patientDateNaissance: string | null;
  patientSexe: string | null;
  comptesRendus: CompteRendu[];
  resultatsExamens: ResultatExamen[];
  documentsMedicaux: DocumentMedical[];
}

export interface CreateDossierMedicalRequest {
  patientId: string;
}
