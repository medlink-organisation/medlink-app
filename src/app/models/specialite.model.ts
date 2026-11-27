export interface Specialite {
  id: number | null;
  code: string;
  nom: string;
  description: string | null;
  actif: boolean | null;
}

export interface BookingSpecialite {
  id: number;
  code: string;
  nom: string;
  description: string | null;
}

export interface CreateSpecialiteRequest {
  code: string;
  nom: string;
  description?: string;
}

export interface UpdateSpecialiteRequest {
  code?: string;
  nom?: string;
  description?: string;
}
