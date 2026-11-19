import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreatePraticienRequest, PageResponse, PageableQuery, Praticien, UpdatePraticienRequest } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class PraticienService {
  private readonly api = inject(ApiClientService);

  create(req: CreatePraticienRequest): Observable<Praticien> {
    return this.api.post('/praticien-service/praticiens/create', req);
  }

  update(id: number, req: UpdatePraticienRequest): Observable<Praticien> {
    return this.api.patch(`/praticien-service/praticiens/update/${id}`, req);
  }

  getById(id: number): Observable<Praticien> {
    return this.api.get(`/praticien-service/praticiens/get/${id}`);
  }

  getByKeycloakId(keycloakId: string): Observable<Praticien> {
    return this.api.get(`/praticien-service/praticiens/get-by-idKycloak/${encodeURIComponent(keycloakId)}`);
  }

  getByEmail(email: string): Observable<Praticien> {
    return this.api.get('/praticien-service/praticiens/get-by-email/email', toHttpParams({ email }));
  }

  getAll(query: PageableQuery): Observable<PageResponse<Praticien>> {
    return this.api.get('/praticien-service/praticiens/getAll', toHttpParams(query as Record<string, unknown>));
  }

  getBySpecialite(specialiteId: number, query: PageableQuery): Observable<PageResponse<Praticien>> {
    return this.api.get(`/praticien-service/praticiens/get-by-specialite/${specialiteId}`, toHttpParams(query as Record<string, unknown>));
  }

  changeStatus(id: number, actif: boolean): Observable<Praticien> {
    return this.api.patch(`/praticien-service/praticiens/change-status/${id}`, null, toHttpParams({ actif }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`/praticien-service/praticiens/delete/${id}`);
  }
}