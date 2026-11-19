import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    void authService.login(state.url).catch(() => undefined);
    return false;
  }

  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];
  if (requiredRoles.length > 0 && !requiredRoles.some((role) => authService.hasRole(role))) {
    return router.createUrlTree(['/auth/access-denied']);
  }

  return true;
};
