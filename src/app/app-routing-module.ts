import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ClinicsComponent } from './pages/clinics/clinics.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HelpComponent } from './pages/help/help.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'MedLink | Votre réseau de cliniques' },
      { path: 'cliniques', component: ClinicsComponent, title: 'Nos cliniques | MedLink' },
      { path: 'aide', component: HelpComponent, title: 'Aide | MedLink' },
      { path: 'contact', component: ContactComponent, title: 'Contact | MedLink' }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent, data: { mode: 'login' } },
      { path: 'register', component: LoginComponent, data: { mode: 'register' } },
      { path: 'access-denied', component: AccessDeniedComponent }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./pages/admin/admin.module').then((module) => module.AdminModule)
  },
  {
    path: 'praticien',
    canActivate: [authGuard],
    data: { roles: ['PRATICIEN'] },
    loadChildren: () => import('./pages/praticien/praticien.module').then((module) => module.PraticienModule)
  },
  {
    path: 'patient',
    canActivate: [authGuard],
    data: { roles: ['PATIENT'] },
    loadChildren: () => import('./pages/patient/patient.module').then((module) => module.PatientModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
