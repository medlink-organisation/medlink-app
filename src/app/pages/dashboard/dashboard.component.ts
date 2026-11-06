import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout().catch(() => undefined);
  }

  emailVerificationLabel(): string {
    const verified = this.auth.getProfile()?.emailVerified;
    return verified === true ? 'Vérifiée' : verified === false ? 'Non vérifiée' : 'Inconnu';
  }
}
