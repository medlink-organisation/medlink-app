import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CreateResultatExamenRequest, RendezVousAgenda } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { ResultatExamenService } from '../../../services/resultat-examen.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-resultat-examen-upload',
  templateUrl: './resultat-examen-upload.component.html',
  standalone: false
})
export class ResultatExamenUploadComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly resultatService = inject(ResultatExamenService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('uploadDialog') private uploadDialog?: ModalComponent;

  consultations: RendezVousAgenda[] = [];
  selectedAppointment: RendezVousAgenda | null = null;
  selectedFile: File | null = null;
  loading = true;
  saving = false;
  error = '';
  dialogError = '';
  success = '';
  readonly maxExamDate = this.today();

  readonly formGroup = this.formBuilder.group({
    typeExamen: ['', [Validators.required, Validators.maxLength(150)]],
    dateExamen: [this.maxExamDate, Validators.required],
    conclusion: ['', Validators.maxLength(4000)]
  });

  ngOnInit(): void {
    this.loadConsultations();
  }

  openUpload(appointment: RendezVousAgenda): void {
    this.selectedAppointment = appointment;
    this.selectedFile = null;
    this.error = '';
    this.dialogError = '';
    this.formGroup.reset({ typeExamen: '', dateExamen: this.maxExamDate, conclusion: '' });
    this.uploadDialog?.show();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      this.selectedFile = null;
      input.value = '';
      this.dialogError = 'Seuls les fichiers portant l’extension .pdf sont acceptés.';
      this.cdr.markForCheck();
      return;
    }
    this.selectedFile = file && file.type !== 'application/pdf'
      ? new File([file], file.name, { type: 'application/pdf', lastModified: file.lastModified })
      : file;
    this.dialogError = '';
    this.cdr.markForCheck();
  }

  submit(): void {
    if (this.formGroup.invalid || !this.selectedAppointment || !this.selectedFile || this.saving) {
      this.formGroup.markAllAsTouched();
      this.dialogError = !this.selectedAppointment
        ? 'La consultation sélectionnée est introuvable.'
        : !this.selectedFile
          ? 'Sélectionnez le PDF du résultat.'
          : 'Renseignez le type et la date de l’examen.';
      this.cdr.markForCheck();
      return;
    }

    const value = this.formGroup.getRawValue();
    const request: CreateResultatExamenRequest = {
      typeExamen: value.typeExamen ?? '',
      dateExamen: value.dateExamen ?? '',
      conclusion: value.conclusion?.trim() || undefined,
      file: this.selectedFile
    };
    this.saving = true;
    this.error = '';
    this.dialogError = '';
    this.resultatService.createForAppointment(this.selectedAppointment.id, request).subscribe({
      next: () => {
        this.saving = false;
        this.uploadDialog?.hide();
        this.success = 'Le résultat a été ajouté au dossier médical du patient.';
        this.selectedAppointment = null;
        this.selectedFile = null;
        this.cdr.markForCheck();
      },
      error: (uploadError: unknown) => {
        this.saving = false;
        this.dialogError = this.businessError(
          uploadError,
          'Impossible d’ajouter ce résultat. Vérifiez le PDF et le rendez-vous sélectionné.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  private loadConsultations(): void {
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const start = new Date();
    start.setDate(start.getDate() - 180);
    this.rendezVousService.getMyAgenda(this.toApiDateTime(start), this.toApiDateTime(end)).subscribe({
      next: (appointments) => {
        this.consultations = appointments
          .filter((appointment) => appointment.status === 'TERMINE')
          .sort((left, right) => right.dateDebut.localeCompare(left.dateDebut));
        this.loading = false;
        const requestedId = this.route.snapshot.queryParamMap.get('rendezVousId');
        const requestedAppointment = this.consultations.find(
          appointment => appointment.id === requestedId
        );
        if (requestedAppointment) {
          queueMicrotask(() => this.openUpload(requestedAppointment));
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les consultations terminées.';
        this.cdr.markForCheck();
      }
    });
  }

  private today(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toApiDateTime(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    const seconds = String(value.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private businessError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
      if (error.status === 0) {
        return 'Le service médical est momentanément inaccessible.';
      }
    }
    return fallback;
  }
}
