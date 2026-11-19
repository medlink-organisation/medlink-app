import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from '../../components/components.module';
import { LayoutsModule } from '../../layouts/layouts.module';
import { UiModule } from '../../shared/ui/ui.module';
import { MesRendezVousPatientComponent } from './mes-rendez-vous/mes-rendez-vous-patient.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { PatientRoutingModule } from './patient-routing.module';
import { PrendreRendezVousComponent } from './prendre-rendez-vous/prendre-rendez-vous.component';

@NgModule({
  declarations: [
    PatientDashboardComponent,
    MesRendezVousPatientComponent,
    PrendreRendezVousComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiModule, ComponentsModule, LayoutsModule, PatientRoutingModule]
})
export class PatientModule {}
