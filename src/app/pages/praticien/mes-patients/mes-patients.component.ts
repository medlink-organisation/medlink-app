import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { CompteRendu, DossierMedical, PageResponse, PraticienPatient, ResultatExamen } from '../../../models';
import { MedicalRecordService } from '../../../services/medical-record.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-mes-patients',
  templateUrl: './mes-patients.component.html',
  standalone: false,
})
export class MesPatientsComponent implements OnInit, OnDestroy {
  @ViewChild('resultDialog') private resultDialog?: ModalComponent;

  private readonly rendezVousService = inject(RendezVousService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  patients: PageResponse<PraticienPatient> = {
    content: [], totalElements: 0, totalPages: 0, size: 12, number: 0, first: true, last: true,
  };
  selected: PraticienPatient | null = null;
  dossier: DossierMedical | null = null;
  resultats: ResultatExamen[] = [];
  activeTab = 'overview';
  loading = true;
  loadingRecord = false;
  downloading = false;
  downloadingResultId: string | null = null;
  previewLoading = false;
  selectedResult: ResultatExamen | null = null;
  previewUrl: SafeResourceUrl | null = null;
  error = '';
  searchTerm = '';
  typeFilter = '';
  dateFilter = '';
  readonly expandedReports = new Set<string>();
  private previewObjectUrl: string | null = null;

  ngOnInit(): void {
    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.releasePreview();
  }

  get sortedReports(): CompteRendu[] {
    return [...(this.dossier?.comptesRendus ?? [])].sort((left, right) =>
      this.reportDate(right).localeCompare(this.reportDate(left))
    );
  }

  get filteredResults(): ResultatExamen[] {
    const search = this.searchTerm.trim().toLocaleLowerCase('fr');
    return this.resultats.filter(result => {
      const haystack = [result.typeExamen, result.conclusion, result.praticienNomComplet, result.nomFichier]
        .filter(Boolean).join(' ').toLocaleLowerCase('fr');
      return (!search || haystack.includes(search))
        && (!this.typeFilter || result.typeExamen === this.typeFilter)
        && (!this.dateFilter || result.dateExamen === this.dateFilter);
    });
  }

  get resultTypes(): string[] {
    return [...new Set(this.resultats.map(result => result.typeExamen).filter((value): value is string => !!value))]
      .sort((left, right) => left.localeCompare(right, 'fr'));
  }

  onPageChange(event: { page: number; size: number }): void {
    this.loadPatients(event.page, event.size);
  }

  select(patient: PraticienPatient): void {
    this.selected = patient;
    this.dossier = null;
    this.resultats = [];
    this.activeTab = 'overview';
    this.expandedReports.clear();
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
        page: 0, size: 50, sort: 'dateExamen,desc',
      }),
    }).subscribe({
      next: ({ dossier, resultats }) => {
        this.dossier = dossier;
        this.resultats = resultats.content;
        this.loadingRecord = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingRecord = false;
        this.error = 'Ce dossier médical ne peut pas être chargé.';
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  setTypeFilter(event: Event): void {
    this.typeFilter = (event.target as HTMLSelectElement).value;
  }

  setDateFilter(event: Event): void {
    this.dateFilter = (event.target as HTMLInputElement).value;
  }

  toggleReport(report: CompteRendu, index: number): void {
    const key = this.reportKey(report, index);
    this.expandedReports.has(key) ? this.expandedReports.delete(key) : this.expandedReports.add(key);
  }

  isExpanded(report: CompteRendu, index: number): boolean {
    return this.expandedReports.has(this.reportKey(report, index));
  }

  downloadRecord(): void {
    if (!this.selected || this.downloading) return;
    this.downloading = true;
    this.error = '';
    this.medicalRecordService.downloadForAppointment(this.selected.lastRendezVousId).subscribe({
      next: blob => {
        const name = `${this.selected?.patientPrenom || 'patient'}-${this.selected?.patientNom || ''}`
          .trim().replace(/[^a-zA-Z0-9-_]+/g, '-');
        this.save(blob, `dossier-medical-${name || 'patient'}.pdf`);
        this.downloading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloading = false;
        this.error = 'Le téléchargement du dossier médical a échoué.';
        this.cdr.markForCheck();
      },
    });
  }

  openResult(resultat: ResultatExamen): void {
    if (!this.selected || !resultat.id) return;
    this.releasePreview();
    this.selectedResult = resultat;
    this.previewLoading = true;
    this.resultDialog?.show();
    this.medicalRecordService.downloadResultForAppointment(this.selected.lastRendezVousId, resultat.id)
      .subscribe({
        next: blob => {
          this.previewObjectUrl = URL.createObjectURL(blob);
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewObjectUrl);
          this.previewLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.previewLoading = false;
          this.previewUrl = null;
          this.cdr.markForCheck();
        },
      });
  }

  closeResult(): void {
    this.releasePreview();
    this.selectedResult = null;
  }

  downloadResult(resultat: ResultatExamen): void {
    if (!this.selected || !resultat.id || this.downloadingResultId) return;
    this.downloadingResultId = resultat.id;
    this.error = '';
    this.medicalRecordService.downloadResultForAppointment(this.selected.lastRendezVousId, resultat.id)
      .subscribe({
        next: blob => {
          this.save(blob, resultat.nomFichier || 'resultat-examen.pdf');
          this.downloadingResultId = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.downloadingResultId = null;
          this.error = 'Le téléchargement du résultat a échoué.';
          this.cdr.markForCheck();
        },
      });
  }

  reportDate(report: CompteRendu): string {
    return report.dateConsultation || report.dateRedaction || '';
  }

  private loadPatients(page = 0, size = this.patients.size): void {
    this.loading = true;
    this.error = '';
    this.rendezVousService.getMyPatients({ page, size }).subscribe({
      next: patients => {
        this.patients = patients;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos patients.';
        this.cdr.markForCheck();
      },
    });
  }

  private reportKey(report: CompteRendu, index: number): string {
    return report.id || `${this.reportDate(report)}-${index}`;
  }

  private save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private releasePreview(): void {
    if (this.previewObjectUrl) URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = null;
    this.previewUrl = null;
  }
}
