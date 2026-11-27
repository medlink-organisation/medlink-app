import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { MedLinkNotification, NotificationType, PageResponse } from '../../models';
import { NotificationService } from '../../services/notification.service';
import { IconName } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class NotificationCenterComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  notifications: PageResponse<MedLinkNotification> | null = null;
  unreadOnly = false;
  loading = false;
  markingAll = false;
  pendingIds = new Set<string>();
  error = '';
  pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  setFilter(unreadOnly: boolean): void {
    if (this.unreadOnly === unreadOnly) {
      return;
    }
    this.unreadOnly = unreadOnly;
    this.load(0, this.pageSize);
  }

  load(page = 0, size = this.pageSize): void {
    this.loading = true;
    this.error = '';
    this.pageSize = size;
    this.notificationService.getMine({ page, size, unreadOnly: this.unreadOnly }).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.errorMessage(error);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  onPageChange(event: { page: number; size: number }): void {
    this.load(event.page, event.size);
  }

  markAsRead(notification: MedLinkNotification): void {
    if (notification.read || this.pendingIds.has(notification.id)) {
      return;
    }

    this.pendingIds = new Set(this.pendingIds).add(notification.id);
    this.notificationService.markAsRead(notification.id).pipe(
      finalize(() => {
        const pendingIds = new Set(this.pendingIds);
        pendingIds.delete(notification.id);
        this.pendingIds = pendingIds;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updated) => {
        if (this.unreadOnly) {
          this.load(this.notifications?.number ?? 0, this.pageSize);
          return;
        }
        this.replaceNotification(updated);
      },
      error: (error: unknown) => {
        this.error = this.errorMessage(error);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  markAllAsRead(): void {
    if (this.markingAll || !this.hasUnread) {
      return;
    }

    this.markingAll = true;
    this.error = '';
    this.notificationService.markAllAsRead().pipe(
      finalize(() => {
        this.markingAll = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.load(0, this.pageSize),
      error: (error: unknown) => {
        this.error = this.errorMessage(error);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  get hasUnread(): boolean {
    return this.notifications?.content.some((notification) => !notification.read) ?? false;
  }

  iconFor(type: NotificationType): IconName {
    if (type === 'RENDEZ_VOUS_ANNULATION') {
      return 'calendar-x';
    }
    if (type.startsWith('RENDEZ_VOUS_')) {
      return 'calendar';
    }
    if (type === 'SYSTEME') {
      return 'settings';
    }
    return 'bell';
  }

  typeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      RENDEZ_VOUS_CONFIRMATION: 'Confirmation',
      RENDEZ_VOUS_ANNULATION: 'Annulation',
      RENDEZ_VOUS_RAPPEL: 'Rappel',
      SYSTEME: 'Système',
      GENERALE: 'Information'
    };
    return labels[type];
  }

  trackById(_index: number, notification: MedLinkNotification): string {
    return notification.id;
  }

  private replaceNotification(updated: MedLinkNotification): void {
    if (!this.notifications) {
      return;
    }
    this.notifications = {
      ...this.notifications,
      content: this.notifications.content.map((notification) =>
        notification.id === updated.id ? updated : notification
      )
    };
    this.changeDetectorRef.markForCheck();
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      }
      if (error.status === 403) {
        return 'Vous ne disposez pas des droits nécessaires pour consulter ces notifications.';
      }
    }
    return 'Impossible de charger les notifications. Veuillez réessayer.';
  }
}
