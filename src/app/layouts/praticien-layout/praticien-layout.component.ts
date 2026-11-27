import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-praticien-layout',
  templateUrl: './praticien-layout.component.html',
  standalone: false
})
export class PraticienLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/praticien/dashboard', icon: 'dashboard', exact: true },
    { label: 'Mes créneaux', route: '/praticien/creneaux', icon: 'calendar' },
    { label: 'Mes rendez-vous', route: '/praticien/rendez-vous', icon: 'clipboard' },
    { label: 'Mes patients', route: '/praticien/patients', icon: 'users' },
    { label: 'Résultats d’examens', route: '/praticien/resultats', icon: 'activity' },
    { label: 'Notifications', route: '/praticien/notifications', icon: 'bell' },
  ];
}
