import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const gatewayUrl = environment.gatewayUrl.replace(/\/+$/, '');

  if (!isGatewayRequest(req.url, gatewayUrl) || req.context.get(SKIP_AUTH) || !authService.isAuthenticated()) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      return next(withBearerToken(req, token)).pipe(
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
          }

          if (error.status === 401 && !req.context.get(AUTH_RETRIED)) {
            return from(authService.refreshToken(true)).pipe(
              switchMap((refreshedToken) => refreshedToken
                ? next(withBearerToken(req.clone({ context: req.context.set(AUTH_RETRIED, true) }), refreshedToken))
                : throwError(() => error)
              ),
              catchError((refreshError: unknown) => {
                authService.reportHttpError(401);
                return throwError(() => refreshError);
              })
            );
          }

          if (error.status === 401 || error.status === 403) {
            authService.reportHttpError(error.status);
          }
          return throwError(() => error);
        })
      );
    }),
    catchError((error: unknown) => throwError(() => error))
  );
};

function isGatewayRequest(requestUrl: string, gatewayUrl: string): boolean {
  return requestUrl === gatewayUrl ||
    requestUrl.startsWith(`${gatewayUrl}/`) ||
    requestUrl.startsWith(`${gatewayUrl}?`);
}

function withBearerToken(req: Parameters<HttpInterceptorFn>[0], token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
