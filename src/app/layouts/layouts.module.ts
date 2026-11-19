import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UiModule } from '../shared/ui/ui.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { PraticienLayoutComponent } from './praticien-layout/praticien-layout.component';

const LAYOUTS = [AdminLayoutComponent, PatientLayoutComponent, PraticienLayoutComponent];

@NgModule({
  declarations: LAYOUTS,
  imports: [CommonModule, RouterModule, UiModule],
  exports: LAYOUTS
})
export class LayoutsModule {}
