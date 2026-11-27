import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let mode: 'login' | 'register';
  let authenticated: boolean;
  let roles: string[];
  let loginTarget: string | undefined;
  let registerTarget: string | undefined;
  let navigationTarget: string | undefined;

  const authService = {
    isAuthenticated: () => authenticated,
    hasRole: (role: string) => roles.includes(role),
    login: (target: string) => {
      loginTarget = target;
      return Promise.resolve();
    },
    registerPatient: (target: string) => {
      registerTarget = target;
      return Promise.resolve();
    }
  };

  beforeEach(async () => {
    mode = 'login';
    authenticated = false;
    roles = [];
    loginTarget = undefined;
    registerTarget = undefined;
    navigationTarget = undefined;

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: { snapshot: { data: new Proxy({}, { get: () => mode }) } } },
        {
          provide: Router,
          useValue: {
            navigateByUrl: (target: string) => {
              navigationTarget = target;
              return Promise.resolve(true);
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('redirects directly to Keycloak login without rendering a login button', () => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(loginTarget).toBe('/auth/login');
    expect(registerTarget).toBeUndefined();
    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeNull();
  });

  it('redirects directly to Patient registration', () => {
    mode = 'register';
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(registerTarget).toBe('/patient/dashboard');
    expect(loginTarget).toBeUndefined();
  });

  it('redirects an authenticated administrator to the admin dashboard', () => {
    authenticated = true;
    roles = ['ADMIN'];
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(navigationTarget).toBe('/admin/dashboard');
    expect(loginTarget).toBeUndefined();
  });
});
