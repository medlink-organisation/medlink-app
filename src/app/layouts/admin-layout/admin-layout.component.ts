import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  standalone: false
})
export class AdminLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Praticiens', route: '/admin/practitioners', icon: 'users' },
    { label: 'Spécialités', route: '/admin/specialties', icon: 'tag' },
    { label: 'Créneaux', route: '/admin/creneaux', icon: 'calendar' },
    { label: 'Rendez-vous', route: '/admin/rendez-vous', icon: 'clipboard' }
  ];
}