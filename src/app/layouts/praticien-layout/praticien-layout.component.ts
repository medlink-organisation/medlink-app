import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-praticien-layout',
  templateUrl: './praticien-layout.component.html',
  standalone: false
})
export class PraticienLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/praticien/dashboard', icon: 'home' },
    { label: 'Mes créneaux', route: '/praticien/creneaux', icon: 'calendar' },
    { label: 'Mes rendez-vous', route: '/praticien/rendez-vous', icon: 'clipboard' },
    { label: 'Mon profil', route: '/praticien/profile', icon: 'user' }
  ];
}