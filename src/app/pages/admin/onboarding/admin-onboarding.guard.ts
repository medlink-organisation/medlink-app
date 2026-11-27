import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AdminOnboardingService } from './admin-onboarding.service';

export const adminOnboardingGuard: CanActivateFn = () => {
  const onboarding = inject(AdminOnboardingService);
  const router = inject(Router);

  return onboarding.getStatus().pipe(
    map(status => status.complete ? true : router.createUrlTree(['/admin/setup'])),
    // A transient API failure must not trap an administrator in a redirect loop.
    catchError(() => of(true))
  );
};
