import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from '../components/components.module';
import { UiModule } from '../shared/ui/ui.module';

@NgModule({
  imports: [CommonModule, ComponentsModule, ReactiveFormsModule, RouterModule, UiModule]
})
export class PagesModule {}
