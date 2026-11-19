import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { LoginComponent } from './pages/auth/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
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
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
