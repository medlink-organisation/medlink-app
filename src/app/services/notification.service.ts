import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import {
  MarkedReadCount,
  MedLinkNotification,
  PageResponse,
  PageableQuery,
  UnreadNotificationCount
} from '../models';
import { ApiClientService } from '../core/http/api-client.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiClientService);
  private readonly endpoint = '/notification-service/api/notifications';
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);

  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  getMine(query: PageableQuery & { unreadOnly?: boolean } = {}): Observable<PageResponse<MedLinkNotification>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 20))
      .set('sort', query.sort ?? 'createdAt,desc')
      .set('unreadOnly', String(query.unreadOnly ?? false));

    return this.api.get<PageResponse<MedLinkNotification>>(this.endpoint, params);
  }

  refreshUnreadCount(): Observable<number> {
    return this.api.get<UnreadNotificationCount>(`${this.endpoint}/unread-count`).pipe(
      map((response) => response.count),
      tap((count) => this.unreadCountSubject.next(Math.max(0, count)))
    );
  }

  markAsRead(notificationId: string): Observable<MedLinkNotification> {
    return this.api.patch<MedLinkNotification>(`${this.endpoint}/${notificationId}/read`).pipe(
      tap((notification) => {
        if (notification.read) {
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }
      })
    );
  }

  markAllAsRead(): Observable<MarkedReadCount> {
    return this.api.patch<MarkedReadCount>(`${this.endpoint}/read-all`).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}
