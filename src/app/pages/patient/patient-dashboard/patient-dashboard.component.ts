import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { MedLinkNotification } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PatientDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  notifications: MedLinkNotification[] = [];
  unreadCount = 0;
  loading = true;
  error = '';

  get firstName(): string {
    return this.authService.getProfile()?.firstName || this.authService.getUsername() || 'Patient';
  }

  ngOnInit(): void {
    forkJoin({
      notifications: this.notificationService.getMine({ page: 0, size: 3, sort: 'createdAt,desc' }).pipe(catchError(() => of(null))),
      unread: this.notificationService.refreshUnreadCount().pipe(catchError(() => of(null)))
    }).subscribe(({ notifications, unread }) => {
      this.notifications = notifications?.content ?? [];
      this.unreadCount = unread ?? 0;
      this.error = notifications === null || unread === null ? 'Les notifications sont temporairement indisponibles.' : '';
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
  }
}
