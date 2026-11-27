import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { AffectationPraticien, PageResponse, PageableQuery } from '../models';
import { toHttpParams } from './http-params';

export interface CreateAffectationPraticienRequest {
  praticienId: number;
  cliniqueId: number;
}

@Injectable({ providedIn: 'root' })
export class AffectationPraticienService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/directory-service/affectations-praticiens';

  create(request: CreateAffectationPraticienRequest): Observable<AffectationPraticien> {
    return this.api.post(this.basePath, request);
  }

  getAll(query: PageableQuery): Observable<PageResponse<AffectationPraticien>> {
    return this.api.get(this.basePath, toHttpParams(query as Record<string, unknown>));
  }

  getActiveByClinique(cliniqueId: number, query: PageableQuery): Observable<PageResponse<AffectationPraticien>> {
    return this.api.get(`${this.basePath}/active/by-clinique/${cliniqueId}`, toHttpParams(query as Record<string, unknown>));
  }

  getBookingByClinique(cliniqueId: number, query: PageableQuery): Observable<PageResponse<AffectationPraticien>> {
    return this.api.get(`${this.basePath}/booking/active/by-clinique/${cliniqueId}`, toHttpParams(query as Record<string, unknown>));
  }

  getByPraticien(praticienId: number, query: PageableQuery): Observable<PageResponse<AffectationPraticien>> {
    return this.api.get(`${this.basePath}/by-praticien/${praticienId}`, toHttpParams(query as Record<string, unknown>));
  }

  getActiveByPraticien(praticienId: number, query: PageableQuery): Observable<PageResponse<AffectationPraticien>> {
    return this.api.get(`${this.basePath}/active/by-praticien/${praticienId}`, toHttpParams(query as Record<string, unknown>));
  }

  deactivate(id: number): Observable<AffectationPraticien> {
    return this.api.patch(`${this.basePath}/${id}/deactivate`, null);
  }

  reactivate(id: number): Observable<AffectationPraticien> {
    return this.api.patch(`${this.basePath}/${id}/reactivate`, null);
  }

}
