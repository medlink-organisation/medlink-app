export interface ServiceMedicale {
  id: number | null;
  code: string | null;
  libelle: string | null;
  description: string | null;
  cliniqueId: number | null;
  blocId: number | null;
  actif: boolean;
}