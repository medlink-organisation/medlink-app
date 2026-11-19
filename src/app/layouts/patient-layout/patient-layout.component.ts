import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  standalone: false
})
export class PatientLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/patient/dashboard', icon: 'home' },
    { label: 'Prendre RDV', route: '/patient/rendez-vous/new', icon: 'plus' },
    { label: 'Mes rendez-vous', route: '/patient/rendez-vous', icon: 'clipboard' }
  ];
}