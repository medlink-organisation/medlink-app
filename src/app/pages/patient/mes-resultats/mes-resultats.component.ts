import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DossierMedical, PageResponse, ResultatExamen } from '../../../models';
import { MedicalRecordService } from '../../../services/medical-record.service';
import { ResultatExamenService } from '../../../services/resultat-examen.service';

@Component({
  selector: 'app-mes-resultats',
  templateUrl: './mes-resultats.component.html',
  standalone: false
})
export class MesResultatsComponent implements OnInit {
  private readonly resultatService = inject(ResultatExamenService);
  private readonly medicalRecordService = inject(MedicalRecordService);

  resultats: PageResponse<ResultatExamen> = {
    content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true
  };
  dossier: DossierMedical | null = null;
  loading = true;
  downloadingId: string | null = null;
  downloadingRecord = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  onPageChange(event: { page: number; size: number }): void {
    this.load(event.page, event.size);
  }

  download(resultat: ResultatExamen): void {
    if (!resultat.id || this.downloadingId) {
      return;
    }
    this.downloadingId = resultat.id;
    this.error = '';
    this.resultatService.download(resultat.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.filename(resultat);
        link.click();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: () => {
        this.downloadingId = null;
        this.error = 'Le téléchargement du résultat a échoué.';
      }
    });
  }

  downloadRecord(): void {
    if (this.downloadingRecord) {
      return;
    }
    this.downloadingRecord = true;
    this.error = '';
    this.medicalRecordService.downloadMine().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mon-dossier-medical.pdf';
        link.click();
        URL.revokeObjectURL(url);
        this.downloadingRecord = false;
      },
      error: () => {
        this.downloadingRecord = false;
        this.error = 'Le téléchargement de votre dossier médical a échoué.';
      }
    });
  }

  private load(page = 0, size = this.resultats.size): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      dossier: this.medicalRecordService.getMine(),
      resultats: this.medicalRecordService.getMyResults({ page, size, sort: 'datePublication,desc' })
    }).subscribe({
      next: ({ dossier, resultats }) => {
        this.dossier = dossier;
        this.resultats = resultats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos résultats d’examens.';
      }
    });
  }

  private filename(resultat: ResultatExamen): string {
    const type = (resultat.typeExamen || 'resultat-examen')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-');
    return `${type}-${resultat.dateExamen || 'medical'}.pdf`;
  }
}
