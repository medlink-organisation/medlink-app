import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { DossierMedical, PageResponse, PageableQuery, ResultatExamen } from '../models';
import { toHttpParams } from './http-params';

type RawDossierMedical = Omit<DossierMedical, 'patientId'> & {
  patientId: string | number | null;
};

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private readonly api = inject(ApiClientService);

  getMine(): Observable<DossierMedical> {
    return this.record('/medical-record-service/medical-records/me');
  }

  getMyResults(query: PageableQuery): Observable<PageResponse<ResultatExamen>> {
    return this.api.get(
      '/medical-record-service/medical-records/me/exam-results',
      toHttpParams(query as Record<string, unknown>)
    );
  }

  getForAppointment(rendezVousId: string): Observable<DossierMedical> {
    return this.record(`/medical-record-service/medical-records/appointments/${encodeURIComponent(rendezVousId)}`);
  }

  getResultsForAppointment(rendezVousId: string, query: PageableQuery): Observable<PageResponse<ResultatExamen>> {
    return this.api.get(
      `/medical-record-service/medical-records/appointments/${encodeURIComponent(rendezVousId)}/exam-results`,
      toHttpParams(query as Record<string, unknown>)
    );
  }

  downloadForAppointment(rendezVousId: string): Observable<Blob> {
    return this.api.getBlob(
      `/medical-record-service/medical-records/appointments/${encodeURIComponent(rendezVousId)}/pdf`
    );
  }

  downloadMine(): Observable<Blob> {
    return this.api.getBlob('/medical-record-service/medical-records/me/pdf');
  }

  private record(path: string): Observable<DossierMedical> {
    return this.api.get<RawDossierMedical>(path).pipe(
      map(record => ({
        ...record,
        patientId: record.patientId == null ? null : String(record.patientId),
        comptesRendus: record.comptesRendus ?? [],
        resultatsExamens: record.resultatsExamens ?? [],
        documentsMedicaux: record.documentsMedicaux ?? [],
      }))
    );
  }
}
