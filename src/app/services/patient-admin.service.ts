import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { PatientAccount, PatientAccountPage } from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class PatientAdminService {
  private readonly api = inject(ApiClientService);

  getAll(first = 0, max = 20): Observable<PatientAccountPage> {
    return this.api.get('/auth-service/auth/patients/getall', toHttpParams({ first, max }));
  }

  getById(keycloakId: string): Observable<PatientAccount> {
    return this.api.get(`/auth-service/auth/patients/${encodeURIComponent(keycloakId)}`);
  }
}
