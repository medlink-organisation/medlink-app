import { Component, ElementRef, HostListener, Input, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  standalone: false
})
export class UserMenuComponent {
  readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() roleLabel = '';
  @Input() profileRoute = '';

  open = false;

  get displayName(): string {
    const profile = this.authService.getProfile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    return fullName || profile?.username || profile?.email || 'Utilisateur MedLink';
  }

  get secondaryLabel(): string {
    return this.roleLabel || this.authService.getRoles()[0] || 'Compte MedLink';
  }

  toggle(): void {
    this.open = !this.open;
  }

  close(): void {
    this.open = false;
  }

  logout(): void {
    this.close();
    void this.authService.logout().catch(() => undefined);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
