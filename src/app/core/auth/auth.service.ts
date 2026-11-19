import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { map, Observable } from 'rxjs';

import { keycloak, keycloakInitOptions } from './keycloak.config';

export interface AuthProfile {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

export interface AuthState {
  initialized: boolean;
  loading: boolean;
  authenticated: boolean;
  profile: AuthProfile | null;
  roles: string[];
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  initialized: false,
  loading: true,
  authenticated: false,
  profile: null,
  roles: [],
  error: null
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly stateSignal = signal<AuthState>(INITIAL_STATE);
  private refreshTimer?: ReturnType<typeof setTimeout>;

  readonly state = this.stateSignal.asReadonly();
  readonly patientId$: Observable<number | null> = toObservable(this.state).pipe(
    map(() => this.getPatientId())
  );

  async initialize(): Promise<void> {
    this.registerKeycloakEvents();

    try {
      const authenticated = await keycloak.init(keycloakInitOptions);
      await this.synchronizeState(authenticated, true);
    } catch {
      this.stateSignal.set({
        ...INITIAL_STATE,
        initialized: true,
        loading: false,
        error: 'Impossible de contacter le service d’authentification Keycloak.'
      });
    }
  }

  async login(returnUrl = '/auth/login'): Promise<void> {
    this.stateSignal.update((state) => ({ ...state, loading: true, error: null }));
    try {
      await keycloak.login({ redirectUri: this.getSafeRedirectUri(returnUrl) });
    } catch {
      this.stateSignal.update((state) => ({
        ...state,
        loading: false,
        error: 'La redirection vers Keycloak a échoué.'
      }));
      throw new Error('La redirection vers Keycloak a échoué.');
    }
  }

  async logout(): Promise<void> {
    this.clearRefreshTimer();
    this.stateSignal.update((state) => ({ ...state, loading: true, error: null }));
    try {
      await keycloak.logout({ redirectUri: `${window.location.origin}/` });
    } catch {
      this.stateSignal.update((state) => ({
        ...state,
        loading: false,
        error: 'La déconnexion Keycloak a échoué.'
      }));
      throw new Error('La déconnexion Keycloak a échoué.');
    }
  }

  isAuthenticated(): boolean {
    return this.stateSignal().authenticated;
  }

  getUsername(): string | undefined {
    return this.stateSignal().profile?.username;
  }

  getEmail(): string | undefined {
    return this.stateSignal().profile?.email;
  }

  getRoles(): string[] {
    return [...this.stateSignal().roles];
  }

  hasRole(role: string): boolean {
    return this.stateSignal().roles.includes(role.toUpperCase());
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      await this.refreshToken(false);
      return keycloak.token ?? null;
    } catch {
      return null;
    }
  }

  getProfile(): AuthProfile | null {
    return this.stateSignal().profile;
  }

  /**
   * TODO: patient-service integration
   * When a patient-service is available, replace this method with
   * a call to GET /patient-service/patients/me using the
   * authenticated user's keycloakId. The response should contain
   * the numeric patient ID to store here.
   * Until then, the token claim 'patient_id' acts as a bridge:
   * set it in Keycloak via a custom mapper on the medilink client.
   */
  getPatientId(): number | null {
    const patientId = keycloak.tokenParsed?.['patient_id'];
    return typeof patientId === 'number' && Number.isSafeInteger(patientId) && patientId > 0
      ? patientId
      : null;
  }

  async refreshToken(force: boolean): Promise<string | null> {
    if (!keycloak.authenticated) {
      return null;
    }

    try {
      await keycloak.updateToken(force ? -1 : 60);
      await this.synchronizeState(true, false);
      return keycloak.token ?? null;
    } catch {
      this.clearRefreshTimer();
      keycloak.clearToken();
      await this.synchronizeState(false, false);
      throw new Error('La session Keycloak a expiré.');
    }
  }

  reportHttpError(status: 401 | 403): void {
    const message = status === 401
      ? 'Votre session n’est plus valide. Veuillez vous reconnecter.'
      : 'Vous ne disposez pas des permissions nécessaires pour cette action.';

    this.stateSignal.update((state) => ({ ...state, error: message }));
  }

  private registerKeycloakEvents(): void {
    keycloak.onAuthSuccess = () => {
      void this.synchronizeState(true, true);
    };
    keycloak.onAuthRefreshSuccess = () => {
      void this.synchronizeState(true, false);
    };
    keycloak.onAuthLogout = () => {
      void this.synchronizeState(false, false);
    };
    keycloak.onAuthError = () => {
      this.stateSignal.update((state) => ({
        ...state,
        loading: false,
        error: 'L’authentification Keycloak a échoué.'
      }));
    };
    keycloak.onAuthRefreshError = () => {
      this.clearRefreshTimer();
      keycloak.clearToken();
      void this.synchronizeState(false, false);
    };
    keycloak.onTokenExpired = () => {
      void this.refreshToken(true).catch(() => undefined);
    };
  }

  private async synchronizeState(authenticated: boolean, loadRemoteProfile: boolean): Promise<void> {
    if (!authenticated) {
      this.clearRefreshTimer();
      this.stateSignal.set({
        initialized: true,
        loading: false,
        authenticated: false,
        profile: null,
        roles: [],
        error: null
      });
      return;
    }

    let keycloakProfile: KeycloakProfile | undefined;
    if (loadRemoteProfile) {
      try {
        keycloakProfile = await keycloak.loadUserProfile();
      } catch {
        // Les claims du token restent suffisants si l'endpoint UserInfo est indisponible.
      }
    }

    const token = keycloak.tokenParsed;
    const profile = this.buildProfile(token, keycloakProfile ?? keycloak.profile);
    const roles = [...(keycloak.realmAccess?.roles ?? token?.realm_access?.roles ?? [])];

    this.stateSignal.set({
      initialized: true,
      loading: false,
      authenticated: true,
      profile,
      roles,
      error: null
    });
    this.scheduleTokenRefresh(token);
  }

  private buildProfile(token?: KeycloakTokenParsed, profile?: KeycloakProfile): AuthProfile {
    const emailVerifiedClaim = token?.['email_verified'];
    const emailVerified = profile?.emailVerified ??
      (typeof emailVerifiedClaim === 'boolean' ? emailVerifiedClaim : undefined);

    return {
      username: profile?.username ?? this.readStringClaim(token, 'preferred_username'),
      email: profile?.email ?? this.readStringClaim(token, 'email'),
      firstName: profile?.firstName ?? this.readStringClaim(token, 'given_name'),
      lastName: profile?.lastName ?? this.readStringClaim(token, 'family_name'),
      emailVerified
    };
  }

  private readStringClaim(token: KeycloakTokenParsed | undefined, claim: string): string | undefined {
    const value = token?.[claim];
    return typeof value === 'string' ? value : undefined;
  }

  private scheduleTokenRefresh(token?: KeycloakTokenParsed): void {
    this.clearRefreshTimer();
    if (!token?.exp) {
      return;
    }

    const skew = keycloak.timeSkew ?? 0;
    const refreshAt = token.exp * 1000 - Date.now() + skew * 1000 - 60_000;
    this.refreshTimer = setTimeout(() => {
      void this.refreshToken(false).catch(() => undefined);
    }, Math.max(refreshAt, 1_000));
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer !== undefined) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private getSafeRedirectUri(returnUrl: string): string {
    const path = returnUrl.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/dashboard';
    return new URL(path, window.location.origin).toString();
  }
}
