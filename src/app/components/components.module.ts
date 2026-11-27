import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UiModule } from '../shared/ui/ui.module';
import { CreneauFormComponent } from './creneau-form/creneau-form.component';
import { EntityDetailsHistoryComponent } from './entity-details-history/entity-details-history.component';
import { BlocFormComponent } from './bloc-form/bloc-form.component';
import { CliniqueFormComponent } from './clinique-form/clinique-form.component';
import { PractitionerFormComponent } from './practitioner-form/practitioner-form.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { RendezVousCardComponent } from './rendez-vous-card/rendez-vous-card.component';
import { SpecialtyFormComponent } from './speciality-form/specialty-form.component';
import { StatusToggleComponent } from './status-toggle/status-toggle.component';

const COMPONENTS = [
  BlocFormComponent,
  CliniqueFormComponent,
  CreneauFormComponent,
  EntityDetailsHistoryComponent,
  PractitionerFormComponent,
  NotificationCenterComponent,
  RendezVousCardComponent,
  SpecialtyFormComponent,
  StatusToggleComponent
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, UiModule],
  exports: COMPONENTS
})
export class ComponentsModule {}
