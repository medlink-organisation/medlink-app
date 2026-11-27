import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import {
  Creneau,
  CreneauDayDetails,
  CreneauMonth,
  CreateCreneauRequest,
  PageResponse,
  PageableQuery,
  GenerationCreneauxRequest,
  GenerationCreneauxResponse,
  UpdateCreneauRequest
} from '../models';
import { toHttpParams } from './http-params';

@Injectable({ providedIn: 'root' })
export class CreneauService {
  private readonly api = inject(ApiClientService);

  create(req: CreateCreneauRequest): Observable<Creneau> {
    return this.api.post('/scheduling-service/creneaux/create', req);
  }

  update(id: number, req: UpdateCreneauRequest): Observable<Creneau> {
    return this.api.patch(`/scheduling-service/creneaux/update/${id}`, req);
  }

  getById(id: number): Observable<Creneau> {
    return this.api.get(`/scheduling-service/creneaux/get-by-id/${id}`);
  }

  getAll(query: PageableQuery): Observable<PageResponse<Creneau>> {
    return this.api.get('/scheduling-service/creneaux', toHttpParams(query as Record<string, unknown>));
  }

  getByPraticienId(praticienId: number, query: PageableQuery): Observable<PageResponse<Creneau>> {
    return this.api.get(`/scheduling-service/creneaux/get-by-praticien-id/${praticienId}`, toHttpParams(query as Record<string, unknown>));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`/scheduling-service/creneaux/delete/${id}`);
  }

  generate(request: GenerationCreneauxRequest): Observable<GenerationCreneauxResponse> {
    return this.api.post('/scheduling-service/creneaux/generate', request);
  }

  getCalendar(praticienId: number | null, cliniqueId: number | null, debut: string, fin: string): Observable<Creneau[]> {
    return this.api.get('/scheduling-service/creneaux/calendar', toHttpParams({ praticienId, cliniqueId, debut, fin }));
  }

  getAvailableForBooking(praticienId: number, cliniqueId: number, debut: string, fin: string): Observable<Creneau[]> {
    return this.api.get('/scheduling-service/creneaux/booking/available', toHttpParams({ praticienId, cliniqueId, debut, fin }));
  }

  getMonth(praticienId: number, month: string): Observable<CreneauMonth> {
    return this.api.get('/scheduling-service/creneaux/calendar/month', toHttpParams({ praticienId, month }));
  }

  getDay(praticienId: number, date: string): Observable<CreneauDayDetails> {
    return this.api.get('/scheduling-service/creneaux/calendar/day', toHttpParams({ praticienId, date }));
  }

  getMyCalendar(debut: string, fin: string): Observable<Creneau[]> {
    return this.api.get('/scheduling-service/creneaux/me/calendar', toHttpParams({ debut, fin }));
  }
}
