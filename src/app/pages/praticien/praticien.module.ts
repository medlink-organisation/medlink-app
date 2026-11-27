import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from '../../components/components.module';
import { LayoutsModule } from '../../layouts/layouts.module';
import { UiModule } from '../../shared/ui/ui.module';
import { MesCreneauxComponent } from './mes-creneaux/mes-creneaux.component';
import { MesRendezVousPraticienComponent } from './mes-rendez-vous/mes-rendez-vous.component';
import { PraticienDashboardComponent } from './praticien-dashboard/praticien-dashboard.component';
import { PraticienRoutingModule } from './praticien-routing.module';
import { ResultatExamenUploadComponent } from './resultat-examen-upload/resultat-examen-upload.component';
import { MesPatientsComponent } from './mes-patients/mes-patients.component';

@NgModule({
  declarations: [
    PraticienDashboardComponent,
    MesCreneauxComponent,
    MesRendezVousPraticienComponent,
    ResultatExamenUploadComponent,
    MesPatientsComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiModule, ComponentsModule, LayoutsModule, PraticienRoutingModule]
})
export class PraticienModule {}
