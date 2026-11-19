import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreatePraticienRequest, Praticien } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthPraticienService {
  private readonly api = inject(ApiClientService);

  register(req: CreatePraticienRequest): Observable<Praticien> {
    return this.api.post('/auth-service/auth/practitioners', req);
  }
}