import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  error = '';

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    const destination = this.authService.hasRole('ADMIN')
      ? '/admin/dashboard'
      : this.authService.hasRole('PRATICIEN')
        ? '/praticien/dashboard'
        : this.authService.hasRole('PATIENT')
          ? '/patient/dashboard'
          : null;
    if (destination) {
      void this.router.navigateByUrl(destination);
    } else {
      this.error = 'Votre compte ne possède aucun rôle MedLink reconnu.';
    }
  }

  login(): void {
    this.error = '';
    void this.authService.login().catch(() => {
      this.error = this.authService.state().error ?? 'La connexion a échoué.';
    });
  }
}
