import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreateResultatExamenRequest, PageResponse, PageableQuery, ResultatExamen } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class ResultatExamenService {
  private readonly api = inject(ApiClientService);

  create(dossierId: number, req: CreateResultatExamenRequest): Observable<ResultatExamen> {
    const formData = new FormData();
    formData.append('typeExamen', req.typeExamen);
    formData.append('dateExamen', req.dateExamen);
    if (req.conclusion !== undefined) {
      formData.append('conclusion', req.conclusion);
    }
    formData.append('file', req.file);
    return this.api.postForm(`/medical-record-service/medical-records/${dossierId}/exam-results`, formData);
  }

  getById(id: string): Observable<ResultatExamen> {
    return this.api.get(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}`);
  }

  getByDossier(dossierId: number, query: PageableQuery): Observable<PageResponse<ResultatExamen>> {
    return this.api.get(`/medical-record-service/medical-records/${dossierId}/exam-results`, toHttpParams(query as Record<string, unknown>));
  }

  download(id: string): Observable<Blob> {
    return this.api.getBlob(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}/download`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}`);
  }
}