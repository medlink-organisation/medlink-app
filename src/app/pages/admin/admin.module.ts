import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from '../../components/components.module';
import { LayoutsModule } from '../../layouts/layouts.module';
import { UiModule } from '../../shared/ui/ui.module';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AuditListComponent } from './audit-list/audit-list.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ClinicListComponent } from './clinic-list/clinic-list.component';
import { CreneauListComponent } from './creneau-list/creneau-list.component';
import { PractitionerListComponent } from './practitioner-list/practitioner-list.component';
import { RendezVousListComponent } from './rendez-vous-list/rendez-vous-list.component';
import { SpecialtyListComponent } from './specialty-list/specialty-list.component';
import { AdminOnboardingComponent } from './onboarding/admin-onboarding.component';
import { PatientListComponent } from './patient-list/patient-list.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AuditListComponent,
    ClinicListComponent,
    PractitionerListComponent,
    SpecialtyListComponent,
    CreneauListComponent,
    RendezVousListComponent,
    AdminOnboardingComponent,
    PatientListComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiModule, ComponentsModule, LayoutsModule, AdminRoutingModule]
})
export class AdminModule {}
