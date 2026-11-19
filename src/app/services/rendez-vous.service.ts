import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreateRendezVousRequest, PageResponse, PageableQuery, RendezVous } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private readonly api = inject(ApiClientService);

  create(req: CreateRendezVousRequest): Observable<RendezVous> {
    return this.api.post('/scheduling-service/rendez-vous/create', req);
  }

  update(id: string, req: Partial<RendezVous>): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/rendez-vous/update/${encodeURIComponent(id)}`, req);
  }

  getById(id: string): Observable<RendezVous> {
    return this.api.get(`/scheduling-service/rendez-vous/get-by-id/${encodeURIComponent(id)}`);
  }

  getAll(query: PageableQuery): Observable<PageResponse<RendezVous>> {
    return this.api.get('/scheduling-service/rendez-vous/getall', toHttpParams(query as Record<string, unknown>));
  }

  getByPatientId(patientId: number, query: PageableQuery): Observable<PageResponse<RendezVous>> {
    return this.api.get(`/scheduling-service/rendez-vous/get-by-patientid/${patientId}`, toHttpParams(query as Record<string, unknown>));
  }

  getByCreneau(creneauId: number, query: PageableQuery): Observable<PageResponse<RendezVous>> {
    return this.api.get(`/scheduling-service/rendez-vous/get-by-creneau/${creneauId}`, toHttpParams(query as Record<string, unknown>));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/scheduling-service/rendez-vous/delete/${encodeURIComponent(id)}`);
  }
}