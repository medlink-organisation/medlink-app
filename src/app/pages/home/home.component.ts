import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly auth = inject(AuthService);

  login(): void {
    void this.auth.login('/dashboard').catch(() => undefined);
  }

  logout(): void {
    void this.auth.logout().catch(() => undefined);
  }
}
