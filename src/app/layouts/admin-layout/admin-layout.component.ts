import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  standalone: false
})
export class AdminLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', icon: 'dashboard', exact: true },
    { label: 'Praticiens', route: '/admin/practitioners', icon: 'users' },
    { label: 'Patients', route: '/admin/patients', icon: 'user' },
    { label: 'Configuration', route: '/admin/cliniques', icon: 'building' },
    { label: 'Créneaux', route: '/admin/creneaux', icon: 'calendar' },
    { label: 'Rendez-vous', route: '/admin/rendez-vous', icon: 'clipboard' },
    { label: 'Notifications', route: '/admin/notifications', icon: 'bell' },
    { label: 'Historique', route: '/admin/audit', icon: 'activity' }
  ];
}
