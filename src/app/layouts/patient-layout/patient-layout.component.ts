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
    { label: 'Trouver un praticien', route: '/patient/praticiens', icon: 'search' },
    { label: 'Prendre rendez-vous', route: '/patient/reservation', icon: 'calendar' },
    { label: 'Mes rendez-vous', route: '/patient/rendez-vous', icon: 'clipboard' },
    { label: 'Mon dossier médical', route: '/patient/dossier-medical', icon: 'file' },
    { label: 'Mes résultats', route: '/patient/resultats', icon: 'activity' },
    { label: 'Mes documents', route: '/patient/documents', icon: 'file' },
    { label: 'Notifications', route: '/patient/notifications', icon: 'bell' },
    { label: 'Mon profil', route: '/patient/profil', icon: 'user' },
    { label: 'Confidentialité', route: '/patient/confidentialite', icon: 'shield' }
  ];
}
