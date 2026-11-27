import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { AuditRevision, AuditSource, PageResponse, PageableQuery } from '../models';
import { toHttpParams } from './http-params';

export interface AuditCreationQuery extends PageableQuery {
  entityType?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = inject(ApiClientService);

  getCreations(source: AuditSource, query: AuditCreationQuery): Observable<PageResponse<AuditRevision>> {
    const { entityType, ...pageable } = query;
    return this.api.get(
      `/api/admin/audit/${source}`,
      toHttpParams({ ...pageable, entityType, operation: 'ADD' })
    );
  }

  getEntities(source: AuditSource): Observable<string[]> {
    return this.api.get(`/api/admin/audit/${source}/entities`);
  }

  getHistory(
    source: AuditSource,
    entityType: string,
    entityId: string | number,
    query: PageableQuery = {}
  ): Observable<PageResponse<AuditRevision>> {
    return this.api.get(
      `/api/admin/audit/${source}/${encodeURIComponent(entityType)}/${encodeURIComponent(String(entityId))}`,
      toHttpParams(query as Record<string, unknown>)
    );
  }
}
