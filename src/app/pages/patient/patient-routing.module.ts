import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientLayoutComponent } from '../../layouts/patient-layout/patient-layout.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { MesRendezVousPatientComponent } from './mes-rendez-vous/mes-rendez-vous-patient.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { PrendreRendezVousComponent } from './prendre-rendez-vous/prendre-rendez-vous.component';
import { ProfilPatientComponent } from './profil/profil-patient.component';
import { MesResultatsComponent } from './mes-resultats/mes-resultats.component';

const routes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent, title: 'Tableau de bord patient | MedLink' },
      { path: 'reservation', component: PrendreRendezVousComponent, title: 'Prendre rendez-vous | MedLink' },
      { path: 'rendez-vous/new', redirectTo: 'reservation', pathMatch: 'full' },
      { path: 'rendez-vous', component: MesRendezVousPatientComponent, title: 'Mes rendez-vous | MedLink' },
      {
        path: 'dossier-medical',
        component: MesResultatsComponent,
        title: 'Mon dossier médical | MedLink',
        data: { view: 'record' }
      },
      { path: 'resultats', redirectTo: 'documents', pathMatch: 'full' },
      {
        path: 'documents',
        component: MesResultatsComponent,
        title: 'Mes documents | MedLink',
        data: { view: 'documents' }
      },
      {
        path: 'notifications',
        component: NotificationCenterComponent,
        title: 'Notifications | MedLink'
      },
      { path: 'profil', component: ProfilPatientComponent, title: 'Mon profil | MedLink' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule {}
