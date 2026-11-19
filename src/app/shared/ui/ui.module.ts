import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HlmAlertImports } from './primitives/alert/src';
import { HlmBadgeImports } from './primitives/badge/src';
import { HlmButtonImports } from './primitives/button/src';
import { HlmCardImports } from './primitives/card/src';
import { HlmDialogImports } from './primitives/dialog/src';
import { HlmFieldImports } from './primitives/field/src';
import { HlmInputImports } from './primitives/input/src';
import { HlmLabelImports } from './primitives/label/src';
import { HlmSelectImports } from './primitives/select/src';
import { HlmSkeletonImports } from './primitives/skeleton/src';
import { HlmTableImports } from './primitives/table/src';
import { AlertComponent } from './alert/alert.component';
import { BadgeComponent } from './badge/badge.component';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from './data-table/data-table.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FormControlDirective } from './form-control/form-control.directive';
import { FormFieldComponent } from './form-field/form-field.component';
import { FormComponent } from './form/form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { PaginationComponent } from './pagination/pagination.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { StatCardComponent } from './stat-card/stat-card.component';
import { StatusBadgeComponent } from './status-badge/status-badge.component';
import { TimeSlotPickerComponent } from './time-slot-picker/time-slot-picker.component';

const SPARTAN_IMPORTS = [
  ...HlmAlertImports,
  ...HlmBadgeImports,
  ...HlmButtonImports,
  ...HlmCardImports,
  ...HlmDialogImports,
  ...HlmFieldImports,
  ...HlmInputImports,
  ...HlmLabelImports,
  ...HlmSelectImports,
  ...HlmSkeletonImports,
  ...HlmTableImports
];

const UI_DECLARATIONS = [
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
  DataTableComponent,
  DatePickerComponent,
  EmptyStateComponent,
  FileUploadComponent,
  FormControlDirective,
  FormFieldComponent,
  FormComponent,
  NavbarComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SidebarComponent,
  SkeletonComponent,
  StatCardComponent,
  StatusBadgeComponent,
  TimeSlotPickerComponent
];

@NgModule({
  declarations: UI_DECLARATIONS,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SPARTAN_IMPORTS
  ],
  exports: [
    ...UI_DECLARATIONS,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class UiModule {}