import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { Bloc, CreateBlocRequest, PageResponse, PageableQuery, UpdateBlocRequest } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class BlocService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/directory-service/blocs';

  create(request: CreateBlocRequest): Observable<Bloc> {
    return this.api.post(this.basePath, request);
  }

  update(id: number, request: UpdateBlocRequest): Observable<Bloc> {
    return this.api.put(`${this.basePath}/${id}`, request);
  }

  getById(id: number): Observable<Bloc> {
    return this.api.get(`${this.basePath}/${id}`);
  }

  getAll(query: PageableQuery): Observable<PageResponse<Bloc>> {
    return this.api.get(this.basePath, toHttpParams(query as Record<string, unknown>));
  }

  getByClinique(cliniqueId: number, query: PageableQuery): Observable<PageResponse<Bloc>> {
    return this.api.get(`${this.basePath}/by-clinique/${cliniqueId}`, toHttpParams(query as Record<string, unknown>));
  }

  search(keyword: string, query: PageableQuery): Observable<PageResponse<Bloc>> {
    return this.api.get(`${this.basePath}/search`, toHttpParams({ keyword, ...query }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
