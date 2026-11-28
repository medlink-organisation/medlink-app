import { Component } from '@angular/core';

import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  standalone: false
})
export class PatientLayoutComponent {
  readonly items: NavigationItem[] = [
    { label: 'Tableau de bord', route: '/patient/dashboard', icon: 'dashboard', exact: true },
    { label: 'Prendre rendez-vous', route: '/patient/reservation', icon: 'calendar' },
    { label: 'Mes rendez-vous', route: '/patient/rendez-vous', icon: 'clipboard' },
    { label: 'Mon dossier médical', route: '/patient/dossier-medical', icon: 'file' },
    { label: 'Mes documents', route: '/patient/documents', icon: 'file' },
    { label: 'Notifications', route: '/patient/notifications', icon: 'bell' },
    { label: 'Mon profil', route: '/patient/profil', icon: 'user' }
  ];
}
