import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PraticienLayoutComponent } from '../../layouts/praticien-layout/praticien-layout.component';
import { MesCreneauxComponent } from './mes-creneaux/mes-creneaux.component';
import { MesRendezVousPraticienComponent } from './mes-rendez-vous/mes-rendez-vous.component';
import { PraticienDashboardComponent } from './praticien-dashboard/praticien-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PraticienLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PraticienDashboardComponent },
      { path: 'creneaux', component: MesCreneauxComponent },
      { path: 'rendez-vous', component: MesRendezVousPraticienComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PraticienRoutingModule {}
