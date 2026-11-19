import { Component, Input } from '@angular/core';
import { NavigationItem } from '../ui-navigation-item';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false
})
export class NavbarComponent {
  @Input() brand = '';
  @Input() items: NavigationItem[] = [];

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
