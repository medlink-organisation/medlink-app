import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreateSpecialiteRequest, PageResponse, PageableQuery, Specialite, UpdateSpecialiteRequest } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class SpecialiteService {
  private readonly api = inject(ApiClientService);

  create(req: CreateSpecialiteRequest): Observable<Specialite> {
    return this.api.post('/praticien-service/specialites/create', req);
  }

  update(id: number, req: UpdateSpecialiteRequest): Observable<Specialite> {
    return this.api.patch(`/praticien-service/specialites/update/${id}`, req);
  }

  getById(id: number): Observable<Specialite> {
    return this.api.get(`/praticien-service/specialites/get-by-id/${id}`);
  }

  getByCode(code: string): Observable<Specialite> {
    return this.api.get(`/praticien-service/specialites/get-by-code/${encodeURIComponent(code)}`);
  }

  getAll(query: PageableQuery): Observable<PageResponse<Specialite>> {
    return this.api.get('/praticien-service/specialites/getall', toHttpParams(query as Record<string, unknown>));
  }

  getActiveForBooking(query: PageableQuery): Observable<PageResponse<Specialite>> {
    return this.api.get('/praticien-service/specialites/booking/active', toHttpParams(query as Record<string, unknown>));
  }

  changeStatus(id: number, actif: boolean): Observable<Specialite> {
    return this.api.patch(`/praticien-service/specialites/change-status/${id}`, null, toHttpParams({ actif }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`/praticien-service/specialites/delete/${id}`);
  }
}
