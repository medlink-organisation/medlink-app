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