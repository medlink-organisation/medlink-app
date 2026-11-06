import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { RoleDashboardComponent } from './pages/role-dashboard/role-dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: RoleDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'], role: 'ADMIN', title: 'Administration MedLink' }
  },
  {
    path: 'patient',
    component: RoleDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['PATIENT'], role: 'PATIENT', title: 'Espace patient' }
  },
  {
    path: 'praticien',
    component: RoleDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['PRATICIEN'], role: 'PRATICIEN', title: 'Espace praticien' }
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
