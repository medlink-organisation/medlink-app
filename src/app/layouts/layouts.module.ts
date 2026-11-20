import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';

import { UiModule } from '../shared/ui/ui.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AppShellComponent } from './app-shell/app-shell.component';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { PraticienLayoutComponent } from './praticien-layout/praticien-layout.component';

const LAYOUTS = [AdminLayoutComponent, AppShellComponent, PatientLayoutComponent, PraticienLayoutComponent];

@NgModule({
  declarations: LAYOUTS,
  imports: [A11yModule, CommonModule, RouterModule, UiModule],
  exports: LAYOUTS
})
export class LayoutsModule {}
