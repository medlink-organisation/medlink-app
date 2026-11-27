import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profil-patient',
  templateUrl: './profil-patient.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ProfilPatientComponent {
  readonly authService = inject(AuthService);
  openingAccount = false;

  get displayName(): string {
    const profile = this.authService.getProfile();
    return [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
      || profile?.username
      || 'Patient MedLink';
  }

  async changePassword(): Promise<void> {
    if (this.openingAccount) {
      return;
    }

    this.openingAccount = true;
    try {
      await this.authService.changePassword();
    } finally {
      this.openingAccount = false;
    }
  }
}
