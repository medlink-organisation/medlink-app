import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { CreateRendezVousRequest, RendezVous } from '../models';

@Injectable({ providedIn: 'root' })
export class SchedulingInternalService {
  private readonly api = inject(ApiClientService);

  isDisponible(id: number): Observable<boolean> {
    return this.api.get(`/scheduling-service/internal/creneaux/${id}/disponible`);
  }

  reserver(req: CreateRendezVousRequest): Observable<RendezVous> {
    return this.api.post('/scheduling-service/internal/rendez-vous/reserver', req);
  }

  confirmer(id: string): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/internal/rendez-vous/${encodeURIComponent(id)}/confirmer`);
  }

  annuler(id: string): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/internal/rendez-vous/${encodeURIComponent(id)}/annuler`);
  }

  reporter(id: string, nouveauCreneauId: number): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/internal/rendez-vous/${encodeURIComponent(id)}/reporter/${nouveauCreneauId}`);
  }

  absent(id: string): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/internal/rendez-vous/${encodeURIComponent(id)}/absent`);
  }

  terminer(id: string): Observable<RendezVous> {
    return this.api.patch(`/scheduling-service/internal/rendez-vous/${encodeURIComponent(id)}/terminer`);
  }
}