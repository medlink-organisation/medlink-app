import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DossierMedical, PageResponse, PraticienPatient, ResultatExamen } from '../../../models';
import { MedicalRecordService } from '../../../services/medical-record.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { ResultatExamenService } from '../../../services/resultat-examen.service';

@Component({
  selector: 'app-mes-patients',
  templateUrl: './mes-patients.component.html',
  standalone: false,
})
export class MesPatientsComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly resultatExamenService = inject(ResultatExamenService);
  private readonly cdr = inject(ChangeDetectorRef);
  patients: PageResponse<PraticienPatient> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 12,
    number: 0,
    first: true,
    last: true,
  };
  selected: PraticienPatient | null = null;
  dossier: DossierMedical | null = null;
  resultats: ResultatExamen[] = [];
  loading = true;
  loadingRecord = false;
  downloading = false;
  downloadingResultId: string | null = null;
  error = '';

  ngOnInit(): void {
    this.loadPatients();
  }

  onPageChange(event: { page: number; size: number }): void {
    this.loadPatients(event.page, event.size);
  }

  select(patient: PraticienPatient): void {
    this.selected = patient;
    this.dossier = null;
    this.resultats = [];
    this.error = '';
    this.loadingRecord = false;

    if (patient.status !== 'TERMINE') {
      this.cdr.markForCheck();
      return;
    }

    this.loadingRecord = true;

    forkJoin({
      dossier: this.medicalRecordService.getForAppointment(patient.lastRendezVousId),

      resultats: this.medicalRecordService.getResultsForAppointment(patient.lastRendezVousId, {
        page: 0,
        size: 50,
        sort: 'dateExamen,desc',
      }),
    }).subscribe({
      next: ({ dossier, resultats }) => {
        this.dossier = dossier;
        this.resultats = resultats.content;
        this.loadingRecord = false;

        this.cdr.markForCheck();
      },

      error: (err) => {
        this.loadingRecord = false;

        this.error = 'Ce dossier médical ne peut pas être chargé.';

        console.error(err);

        this.cdr.markForCheck();
      },
    });
  }
  downloadRecord(): void {
    if (!this.selected || this.downloading) {
      return;
    }
    this.downloading = true;
    this.error = '';
    this.medicalRecordService.downloadForAppointment(this.selected.lastRendezVousId).subscribe({
      next: (blob) => {
        this.save(blob, `dossier-medical-patient-${this.selected?.patientId}.pdf`);
        this.downloading = false;
      },
      error: () => {
        this.downloading = false;
        this.error = 'Le téléchargement du dossier médical a échoué.';
      },
    });
  }

  downloadResult(resultat: ResultatExamen): void {
    if (!resultat.id || this.downloadingResultId) {
      return;
    }
    this.downloadingResultId = resultat.id;
    this.error = '';
    this.resultatExamenService.download(resultat.id).subscribe({
      next: (blob) => {
        const type = resultat.typeExamen?.trim().replace(/[^a-zA-Z0-9-_]+/g, '-') || 'examen';
        this.save(blob, `resultat-${type}.pdf`);
        this.downloadingResultId = null;
      },
      error: () => {
        this.downloadingResultId = null;
        this.error = 'Le téléchargement du résultat a échoué.';
      },
    });
  }

  private loadPatients(page = 0, size = this.patients.size): void {
    this.loading = true;
    this.error = '';

    this.rendezVousService
      .getMyPatients({
        page,
        size,
      })
      .subscribe({
        next: (patients) => {
          this.patients = patients;
          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (err) => {
          this.loading = false;
          this.error = 'Impossible de charger vos patients.';

          console.error('Erreur getMyPatients:', err);

          this.cdr.markForCheck();
        },
      });
  }
  private save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
