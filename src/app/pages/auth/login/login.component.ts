import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      const mode = this.route.snapshot.data['mode'];
      const redirect = mode === 'register'
        ? this.authService.registerPatient('/patient/dashboard')
        : this.authService.login('/auth/login');
      void redirect.catch(() => this.router.navigateByUrl('/'));
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
      void this.router.navigateByUrl('/auth/access-denied');
    }
  }
}
