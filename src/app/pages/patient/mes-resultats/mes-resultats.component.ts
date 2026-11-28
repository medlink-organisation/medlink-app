import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CompteRendu, DossierMedical, PageResponse, ResultatExamen } from '../../../models';
import { MedicalRecordService } from '../../../services/medical-record.service';
import { ResultatExamenService } from '../../../services/resultat-examen.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-mes-resultats',
  templateUrl: './mes-resultats.component.html',
  standalone: false
})
export class MesResultatsComponent implements OnInit, OnDestroy {
  @ViewChild('resultDialog') private resultDialog?: ModalComponent;

  private readonly resultatService = inject(ResultatExamenService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);

  resultats: PageResponse<ResultatExamen> = {
    content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true
  };
  dossier: DossierMedical | null = null;
  activeTab = 'overview';
  loading = true;
  downloadingId: string | null = null;
  downloadingRecord = false;
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
    this.activeTab = this.route.snapshot.data['view'] === 'documents' ? 'results' : 'overview';
    this.load();
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
    return this.resultats.content.filter(result => {
      const haystack = [result.typeExamen, result.conclusion, result.praticienNomComplet, result.nomFichier]
        .filter(Boolean).join(' ').toLocaleLowerCase('fr');
      return (!search || haystack.includes(search))
        && (!this.typeFilter || result.typeExamen === this.typeFilter)
        && (!this.dateFilter || result.dateExamen === this.dateFilter);
    });
  }

  get resultTypes(): string[] {
    return [...new Set(this.resultats.content.map(result => result.typeExamen).filter((value): value is string => !!value))]
      .sort((left, right) => left.localeCompare(right, 'fr'));
  }

  onPageChange(event: { page: number; size: number }): void {
    this.load(event.page, event.size);
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

  openResult(resultat: ResultatExamen): void {
    if (!resultat.id) return;
    this.releasePreview();
    this.selectedResult = resultat;
    this.previewLoading = true;
    this.resultDialog?.show();
    this.resultatService.download(resultat.id).subscribe({
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
      }
    });
  }

  closeResult(): void {
    this.releasePreview();
    this.selectedResult = null;
  }

  download(resultat: ResultatExamen): void {
    if (!resultat.id || this.downloadingId) return;
    this.downloadingId = resultat.id;
    this.error = '';
    this.resultatService.download(resultat.id).subscribe({
      next: blob => {
        this.save(blob, this.filename(resultat));
        this.downloadingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloadingId = null;
        this.error = 'Le téléchargement du résultat a échoué.';
        this.cdr.markForCheck();
      }
    });
  }

  downloadRecord(): void {
    if (this.downloadingRecord) return;
    this.downloadingRecord = true;
    this.error = '';
    this.medicalRecordService.downloadMine().subscribe({
      next: blob => {
        this.save(blob, 'mon-dossier-medical.pdf');
        this.downloadingRecord = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloadingRecord = false;
        this.error = 'Le téléchargement de votre dossier médical a échoué.';
        this.cdr.markForCheck();
      }
    });
  }

  reportDate(report: CompteRendu): string {
    return report.dateConsultation || report.dateRedaction || '';
  }

  private load(page = 0, size = this.resultats.size): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      dossier: this.medicalRecordService.getMine(),
      resultats: this.resultatService.getMine({ page, size, sort: 'dateExamen,desc' })
    }).subscribe({
      next: ({ dossier, resultats }) => {
        this.dossier = dossier;
        this.resultats = resultats;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger votre dossier médical.';
        this.cdr.markForCheck();
      }
    });
  }

  private reportKey(report: CompteRendu, index: number): string {
    return report.id || `${this.reportDate(report)}-${index}`;
  }

  private filename(resultat: ResultatExamen): string {
    if (resultat.nomFichier) return resultat.nomFichier;
    const type = (resultat.typeExamen || 'resultat-examen').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-');
    return `${type}-${resultat.dateExamen || 'medical'}.pdf`;
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
