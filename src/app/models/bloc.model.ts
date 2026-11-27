export interface Bloc {
  id: number | null;
  code: string | null;
  nom: string | null;
  description: string | null;
  cliniqueId: number | null;
}

export interface CreateBlocRequest {
  code: string;
  nom: string;
  description?: string;
  cliniqueId: number;
}

export type UpdateBlocRequest = CreateBlocRequest;
