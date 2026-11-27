import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AuditListComponent } from './audit-list/audit-list.component';
import { ClinicListComponent } from './clinic-list/clinic-list.component';
import { CreneauListComponent } from './creneau-list/creneau-list.component';
import { PractitionerListComponent } from './practitioner-list/practitioner-list.component';
import { RendezVousListComponent } from './rendez-vous-list/rendez-vous-list.component';
import { SpecialtyListComponent } from './specialty-list/specialty-list.component';
import { AdminOnboardingComponent } from './onboarding/admin-onboarding.component';
import { adminOnboardingGuard } from './onboarding/admin-onboarding.guard';
import { PatientListComponent } from './patient-list/patient-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'setup', component: AdminOnboardingComponent, title: 'Configuration de l’organisation | MedLink' },
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [adminOnboardingGuard] },
      { path: 'audit', component: AuditListComponent, title: 'Historique des créations | MedLink' },
      { path: 'cliniques', component: ClinicListComponent, title: 'Configuration organisationnelle | MedLink' },
      { path: 'practitioners', component: PractitionerListComponent },
      { path: 'patients', component: PatientListComponent, title: 'Patients | MedLink' },
      { path: 'specialties', component: SpecialtyListComponent, title: 'Catalogue des spécialités | MedLink' },
      { path: 'creneaux', component: CreneauListComponent },
      { path: 'rendez-vous', component: RendezVousListComponent },
      { path: 'notifications', component: NotificationCenterComponent, title: 'Notifications | MedLink' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
