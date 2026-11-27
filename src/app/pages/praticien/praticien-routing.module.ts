import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PraticienLayoutComponent } from '../../layouts/praticien-layout/praticien-layout.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { MesCreneauxComponent } from './mes-creneaux/mes-creneaux.component';
import { MesRendezVousPraticienComponent } from './mes-rendez-vous/mes-rendez-vous.component';
import { PraticienDashboardComponent } from './praticien-dashboard/praticien-dashboard.component';
import { ResultatExamenUploadComponent } from './resultat-examen-upload/resultat-examen-upload.component';
import { MesPatientsComponent } from './mes-patients/mes-patients.component';

const routes: Routes = [
  {
    path: '',
    component: PraticienLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PraticienDashboardComponent },
      { path: 'creneaux', component: MesCreneauxComponent },
      { path: 'rendez-vous', component: MesRendezVousPraticienComponent },
      { path: 'patients', component: MesPatientsComponent, title: 'Mes patients | MedLink' },
      { path: 'resultats', component: ResultatExamenUploadComponent, title: 'Résultats d’examens | MedLink' },
      { path: 'notifications', component: NotificationCenterComponent, title: 'Notifications | MedLink' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PraticienRoutingModule {}
