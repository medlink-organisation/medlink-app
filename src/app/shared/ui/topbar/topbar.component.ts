import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError } from 'rxjs';

import { NotificationService } from '../../../services/notification.service';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  standalone: false
})
export class TopbarComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() roleLabel = '';
  @Input() profileRoute = '';
  @Input() notificationRoute = '';
  @Output() menuToggle = new EventEmitter<void>();

  readonly unreadCount$ = this.notificationService.unreadCount$;

  ngOnInit(): void {
    if (!this.notificationRoute) {
      return;
    }

    this.notificationService.refreshUnreadCount().pipe(
      catchError(() => EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
