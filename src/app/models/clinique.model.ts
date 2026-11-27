import { Bloc } from './bloc.model';
import { ServiceMedicale } from './service-medicale.model';

export interface Clinique {
  id: number | null;
  nom: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  ville: string | null;
  blocs: Bloc[];
  services: ServiceMedicale[];
}

export interface BookingClinique {
  id: number;
  nom: string;
  ville: string | null;
}

export interface CreateCliniqueRequest {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  ville?: string;
}

export type UpdateCliniqueRequest = CreateCliniqueRequest;
