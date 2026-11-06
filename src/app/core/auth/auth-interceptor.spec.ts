import { TestBed } from '@angular/core/testing';
import { HttpContext, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { authInterceptor, SKIP_AUTH } from './auth-interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const authService = {
    isAuthenticated: () => true,
    getAccessToken: () => Promise.resolve('test-access-token'),
    refreshToken: () => Promise.resolve('refreshed-test-token'),
    reportHttpError: () => undefined
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }]
    });
  });

  it('adds a bearer token to Gateway requests', async () => {
    const request = new HttpRequest('GET', 'http://localhost:8081/api/profile');
    let authorization: string | null = null;

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, (handledRequest) => {
      authorization = handledRequest.headers.get('Authorization');
      return of(new HttpResponse({ status: 200 }));
    })));

    expect(authorization).toBe('Bearer test-access-token');
  });

  it('does not add a token to external URLs', async () => {
    const request = new HttpRequest('GET', 'https://example.org/public');
    let authorization: string | null = null;

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, (handledRequest) => {
      authorization = handledRequest.headers.get('Authorization');
      return of(new HttpResponse({ status: 200 }));
    })));

    expect(authorization).toBeNull();
  });

  it('honors the public-request opt-out for Gateway URLs', async () => {
    const request = new HttpRequest('GET', 'http://localhost:8081/api/public', {
      context: new HttpContext().set(SKIP_AUTH, true)
    });
    let authorization: string | null = null;

    await firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, (handledRequest) => {
      authorization = handledRequest.headers.get('Authorization');
      return of(new HttpResponse({ status: 200 }));
    })));

    expect(authorization).toBeNull();
  });
});
