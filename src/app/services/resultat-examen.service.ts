import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreateResultatExamenRequest, PageResponse, PageableQuery, ResultatExamen } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class ResultatExamenService {
  private readonly api = inject(ApiClientService);

  createForAppointment(rendezVousId: string, req: CreateResultatExamenRequest): Observable<ResultatExamen> {
    const formData = this.toFormData(req);
    return this.api.postForm(
      `/medical-record-service/medical-records/appointments/${encodeURIComponent(rendezVousId)}/exam-results`,
      formData
    );
  }

  getById(id: string): Observable<ResultatExamen> {
    return this.api.get(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}`);
  }

  getByDossier(dossierId: number, query: PageableQuery): Observable<PageResponse<ResultatExamen>> {
    return this.api.get(`/medical-record-service/medical-records/${dossierId}/exam-results`, toHttpParams(query as Record<string, unknown>));
  }

  getMine(query: PageableQuery): Observable<PageResponse<ResultatExamen>> {
    return this.api.get(
      '/medical-record-service/medical-records/me/exam-results',
      toHttpParams(query as Record<string, unknown>)
    );
  }

  download(id: string): Observable<Blob> {
    return this.api.getBlob(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}/download`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/medical-record-service/medical-records/exam-results/${encodeURIComponent(id)}`);
  }

  private toFormData(req: CreateResultatExamenRequest): FormData {
    const formData = new FormData();
    formData.append('typeExamen', req.typeExamen);
    formData.append('dateExamen', req.dateExamen);
    if (req.conclusion !== undefined && req.conclusion.trim()) {
      formData.append('conclusion', req.conclusion.trim());
    }
    formData.append('file', req.file);
    return formData;
  }
}
