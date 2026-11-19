import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientLayoutComponent } from '../../layouts/patient-layout/patient-layout.component';
import { MesRendezVousPatientComponent } from './mes-rendez-vous/mes-rendez-vous-patient.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { PrendreRendezVousComponent } from './prendre-rendez-vous/prendre-rendez-vous.component';

const routes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent },
      { path: 'rendez-vous', component: MesRendezVousPatientComponent },
      { path: 'rendez-vous/new', component: PrendreRendezVousComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule {}
