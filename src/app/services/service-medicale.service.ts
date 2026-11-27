import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import {
  CreateServiceMedicaleRequest,
  PageResponse,
  PageableQuery,
  ServiceMedicale,
  UpdateServiceMedicaleRequest
} from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class ServiceMedicaleService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/directory-service/services-medicales';

  create(request: CreateServiceMedicaleRequest): Observable<ServiceMedicale> {
    return this.api.post(this.basePath, request);
  }

  update(id: number, request: UpdateServiceMedicaleRequest): Observable<ServiceMedicale> {
    return this.api.put(`${this.basePath}/${id}`, request);
  }

  getByClinique(cliniqueId: number, query: PageableQuery): Observable<PageResponse<ServiceMedicale>> {
    return this.api.get(`${this.basePath}/by-clinique/${cliniqueId}`, toHttpParams(query as Record<string, unknown>));
  }

  getAll(query: PageableQuery): Observable<PageResponse<ServiceMedicale>> {
    return this.api.get(this.basePath, toHttpParams(query as Record<string, unknown>));
  }

  search(keyword: string, query: PageableQuery): Observable<PageResponse<ServiceMedicale>> {
    return this.api.get(`${this.basePath}/search`, toHttpParams({ keyword, ...query }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${this.basePath}/${id}`);
  }
}
