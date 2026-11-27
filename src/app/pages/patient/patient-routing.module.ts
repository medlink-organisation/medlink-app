import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientLayoutComponent } from '../../layouts/patient-layout/patient-layout.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { MesRendezVousPatientComponent } from './mes-rendez-vous/mes-rendez-vous-patient.component';
import { PatientFeatureUnavailableComponent } from './feature-unavailable/patient-feature-unavailable.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { PrendreRendezVousComponent } from './prendre-rendez-vous/prendre-rendez-vous.component';
import { ProfilPatientComponent } from './profil/profil-patient.component';
import { MesResultatsComponent } from './mes-resultats/mes-resultats.component';

const routes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent, title: 'Tableau de bord patient | MedLink' },
      {
        path: 'praticiens',
        component: PatientFeatureUnavailableComponent,
        title: 'Trouver un praticien | MedLink',
        data: {
          title: 'Trouver un praticien',
          subtitle: 'Recherchez un professionnel de santé selon vos besoins.',
          unavailableTitle: 'L’annuaire Patient n’est pas encore exposé',
          unavailableDescription: 'Les endpoints praticiens et spécialités disponibles sont réservés au rôle ADMIN. Un endpoint de recherche Patient paginé est requis.'
        }
      },
      {
        path: 'praticiens/:id',
        component: PatientFeatureUnavailableComponent,
        title: 'Profil praticien | MedLink',
        data: {
          title: 'Profil du praticien',
          subtitle: 'Informations professionnelles et disponibilités.',
          unavailableTitle: 'Ce profil ne peut pas encore être affiché',
          unavailableDescription: 'Le backend ne fournit pas encore de vue praticien limitée aux données autorisées pour un patient.'
        }
      },
      { path: 'reservation', component: PrendreRendezVousComponent, title: 'Prendre rendez-vous | MedLink' },
      { path: 'rendez-vous/new', redirectTo: 'reservation', pathMatch: 'full' },
      { path: 'rendez-vous', component: MesRendezVousPatientComponent, title: 'Mes rendez-vous | MedLink' },
      {
        path: 'dossier-medical',
        component: MesResultatsComponent,
        title: 'Mon dossier médical | MedLink'
      },
      { path: 'resultats', component: MesResultatsComponent, title: 'Mes résultats | MedLink' },
      {
        path: 'documents',
        component: PatientFeatureUnavailableComponent,
        title: 'Mes documents | MedLink',
        data: {
          title: 'Mes documents médicaux',
          subtitle: 'Consultez et téléchargez vos documents autorisés.',
          unavailableTitle: 'Le téléchargement Patient n’est pas encore disponible',
          unavailableDescription: 'Un endpoint authentifié avec contrôle de propriété et téléchargement temporaire sécurisé doit être fourni par le backend.'
        }
      },
      {
        path: 'notifications',
        component: NotificationCenterComponent,
        title: 'Notifications | MedLink'
      },
      { path: 'profil', component: ProfilPatientComponent, title: 'Mon profil | MedLink' },
      {
        path: 'confidentialite',
        component: PatientFeatureUnavailableComponent,
        title: 'Confidentialité | MedLink',
        data: {
          title: 'Confidentialité et données personnelles',
          subtitle: 'Contrôlez vos consentements et vos demandes relatives aux données.',
          unavailableTitle: 'Les demandes RGPD ne sont pas encore disponibles en libre-service',
          unavailableDescription: 'Les API de consentement, d’export, de suppression et de suivi des demandes doivent être mises en place avant d’activer ces actions.'
        }
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule {}
