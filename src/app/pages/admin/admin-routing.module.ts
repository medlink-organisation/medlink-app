import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { CreneauListComponent } from './creneau-list/creneau-list.component';
import { PractitionerListComponent } from './practitioner-list/practitioner-list.component';
import { RendezVousListComponent } from './rendez-vous-list/rendez-vous-list.component';
import { SpecialtyListComponent } from './specialty-list/specialty-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'practitioners', component: PractitionerListComponent },
      { path: 'specialties', component: SpecialtyListComponent },
      { path: 'creneaux', component: CreneauListComponent },
      { path: 'rendez-vous', component: RendezVousListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
