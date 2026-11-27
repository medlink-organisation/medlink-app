import { Component, inject, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  standalone: false
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  dashboardLink(): string {
    if (this.auth.hasRole('ADMIN')) return '/admin/dashboard';
    if (this.auth.hasRole('PRATICIEN')) return '/praticien/dashboard';
    if (this.auth.hasRole('PATIENT')) return '/patient/dashboard';
    return '/auth/login';
  }
}
