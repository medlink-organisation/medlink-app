export interface Praticien {
  id: number | null;
  keycloakId: string | null;
  nom: string;
  prenom: string;
  email: string;
  phone: string | null;
  actif: boolean | null;
  numeroOrdre: string | null;
  specialiteId: number | null;
}

export interface CreatePraticienRequest {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  numeroOrdre: string;
  specialiteId: number;
}

export interface UpdatePraticienRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  numeroOrdre?: string;
  specialiteId?: number;
}

export interface PractitionerFormSubmission {
  practitioner: CreatePraticienRequest | UpdatePraticienRequest;
  cliniqueIds: number[];
}
