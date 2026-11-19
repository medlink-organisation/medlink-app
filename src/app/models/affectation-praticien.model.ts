export interface AffectationPraticien {
  id: number | null;
  praticienId: number | null;
  cliniqueId: number | null;
  cliniqueNom: string | null;
  actif: boolean;
  deleted: boolean;
  dateAffectation: string | null;
}