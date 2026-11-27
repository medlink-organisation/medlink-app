export interface ServiceMedicale {
  id: number | null;
  code: string | null;
  libelle: string | null;
  description: string | null;
  cliniqueId: number | null;
  blocId: number | null;
  actif: boolean;
}

export interface CreateServiceMedicaleRequest {
  code: string;
  libelle: string;
  description?: string;
  cliniqueId: number;
  blocId?: number | null;
  actif?: boolean;
}

export type UpdateServiceMedicaleRequest = CreateServiceMedicaleRequest;
