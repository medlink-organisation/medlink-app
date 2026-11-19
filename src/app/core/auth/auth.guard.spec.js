import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
describe('authGuard', () => {
    let authenticated = false;
    let roles = [];
    let requestedLoginUrl;
    const deniedTree = {};
    const authService = {
        isAuthenticated: () => authenticated,
        hasRole: (role) => roles.includes(role),
        login: (url) => {
            requestedLoginUrl = url;
            return Promise.resolve();
        }
    };
    beforeEach(() => {
        authenticated = false;
        roles = [];
        requestedLoginUrl = undefined;
        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: { createUrlTree: () => deniedTree } }
            ]
        });
    });
    it('redirects an unauthenticated user to Keycloak and preserves the requested route', () => {
        const result = runGuard(['PATIENT'], '/patient?tab=documents');
        expect(result).toBe(false);
        expect(requestedLoginUrl).toBe('/patient?tab=documents');
    });
    it('allows an authenticated user with the required realm role', () => {
        authenticated = true;
        roles = ['PATIENT'];
        expect(runGuard(['PATIENT'], '/patient')).toBe(true);
    });
    it('returns the access-denied UrlTree when the role is missing', () => {
        authenticated = true;
        roles = ['PATIENT'];
        expect(runGuard(['ADMIN'], '/admin')).toBe(deniedTree);
    });
    function runGuard(requiredRoles, url) {
        const route = { data: { roles: requiredRoles } };
        const state = { url };
        return TestBed.runInInjectionContext(() => authGuard(route, state));
    }
});
