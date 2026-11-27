import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { BookingClinique, Clinique, CreateCliniqueRequest, PageResponse, PageableQuery, UpdateCliniqueRequest } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class CliniqueService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/directory-service/cliniques';

  create(request: CreateCliniqueRequest): Observable<Clinique> {
    return this.api.post(this.basePath, request);
  }

  update(id: number, request: UpdateCliniqueRequest): Observable<Clinique> {
    return this.api.put(`${this.basePath}/${id}`, request);
  }

  getById(id: number): Observable<Clinique> {
    return this.api.get(`${this.basePath}/${id}`);
  }

  getAll(query: PageableQuery): Observable<PageResponse<Clinique>> {
    return this.api.get(this.basePath, toHttpParams(query as Record<string, unknown>));
  }

  getActiveForBooking(query: PageableQuery): Observable<PageResponse<BookingClinique>> {
    return this.api.get(`${this.basePath}/booking/active`, toHttpParams(query as Record<string, unknown>));
  }

  getForBooking(id: number): Observable<BookingClinique> {
    return this.api.get(`${this.basePath}/booking/${id}`);
  }

  search(keyword: string, query: PageableQuery): Observable<PageResponse<Clinique>> {
    return this.api.get(`${this.basePath}/search`, toHttpParams({ keyword, ...query }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
