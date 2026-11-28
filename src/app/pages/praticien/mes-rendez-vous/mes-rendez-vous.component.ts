import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Creneau, PageResponse, PraticienWorkflowTask, RendezVousAgenda } from '../../../models';

import { CreneauService, RendezVousService, WorkflowService } from '../../../services';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-mes-rendez-vous-praticien',
  templateUrl: './mes-rendez-vous.component.html',
  standalone: false,
})
export class MesRendezVousPraticienComponent implements OnInit {
  private readonly rendezVousService = inject(RendezVousService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly workflowService = inject(WorkflowService);
  private readonly creneauService = inject(CreneauService);
  private readonly formBuilder = inject(FormBuilder);

  @ViewChild('reportDialog') private reportDialog?: ModalComponent;
  @ViewChild('followUpDialog') private followUpDialog?: ModalComponent;
  @ViewChild('detailsDialog') private detailsDialog?: ModalComponent;

  rendezVous: PageResponse<RendezVousAgenda> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 50,
    number: 0,
    first: true,
    last: true,
  };

  loading = true;
  error = '';
  success = '';
  saving = false;
  tasks: PraticienWorkflowTask[] = [];
  selectedTask: PraticienWorkflowTask | null = null;
  selectedFollowUpTask: PraticienWorkflowTask | null = null;
  selectedAppointment: RendezVousAgenda | null = null;
  followUpSlots: Creneau[] = [];
  followUpLoading = false;

  readonly reportForm = this.formBuilder.group({
    motifConsultation: ['', [Validators.required, Validators.maxLength(2000)]],
    symptomes: ['', [Validators.required, Validators.maxLength(5000)]],
    diagnostic: ['', [Validators.required, Validators.maxLength(5000)]],
    observations: ['', [Validators.required, Validators.maxLength(10000)]],
    traitementRecommande: ['', [Validators.required, Validators.maxLength(5000)]],
    examensComplementaires: ['', [Validators.required, Validators.maxLength(5000)]],
    recommandations: ['', [Validators.required, Validators.maxLength(5000)]],
    controleRequis: [false, Validators.required],
  });

  readonly followUpForm = this.formBuilder.group({
    creneauId: [null as number | null, Validators.required],
    motifControle: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.loadRendezVous();
  }

  onAction(event: { id: string; action: string }): void {
    if (event.action === 'terminer') {
      this.openReport(event.id);
    } else if (event.action === 'absent') {
      const task = this.taskFor(event.id, 'sid-A9B6D073-5318-4305-976A-0EED79871E79');
      if (task) {
        this.completePresence(task, false);
      }
    }
  }

  openDetails(appointment: RendezVousAgenda): void {
    this.selectedAppointment = appointment;
    this.detailsDialog?.show();
  }

  closeDetails(): void {
    this.detailsDialog?.hide();
  }

  submitReport(): void {
    if (this.reportForm.invalid || !this.selectedTask || this.saving) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    this.workflowService.completeMyTask(
      this.selectedTask.processInstanceId,
      this.selectedTask.id,
      this.reportForm.getRawValue()
    ).subscribe({
      next: () => {
        this.saving = false;
        this.reportDialog?.hide();
        this.selectedTask = null;
        this.success = 'La consultation et son compte rendu ont été enregistrés.';
        this.loadRendezVous();
      },
      error: () => {
        this.saving = false;
        this.error = 'Le compte rendu n’a pas pu être enregistré. Le rendez-vous reste non terminé.';
      }
    });
  }

  followUpTasks(): PraticienWorkflowTask[] {
    return this.tasks.filter(task =>
      task.definitionKey === 'sid-93365DB8-C583-43C8-9A1E-0AAE5A1189F3'
    );
  }

  openFollowUp(task: PraticienWorkflowTask): void {
    this.selectedFollowUpTask = task;
    this.followUpSlots = [];
    this.followUpLoading = true;
    this.error = '';
    this.followUpForm.reset({ creneauId: null, motifControle: '' });

    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 6);

    this.creneauService.getMyCalendar(
      this.toLocalDateTime(start),
      this.toLocalDateTime(end)
    ).subscribe({
      next: slots => {
        this.followUpSlots = slots.filter(slot =>
          slot.id !== null
          && slot.statut === 'DISPONIBLE'
          && !!slot.dateDebut
          && new Date(slot.dateDebut).getTime() > Date.now()
        );
        this.followUpLoading = false;
        this.followUpDialog?.show();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.followUpLoading = false;
        this.error = this.businessError(
          error,
          'Impossible de charger les créneaux disponibles pour le contrôle.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  submitFollowUp(): void {
    if (this.followUpForm.invalid || !this.selectedFollowUpTask || this.saving) {
      this.followUpForm.markAllAsTouched();
      return;
    }

    const value = this.followUpForm.getRawValue();
    this.saving = true;
    this.error = '';
    this.workflowService.completeMyTask(
      this.selectedFollowUpTask.processInstanceId,
      this.selectedFollowUpTask.id,
      {
        creneauId: Number(value.creneauId),
        motifControle: value.motifControle?.trim() ?? ''
      }
    ).subscribe({
      next: () => {
        this.saving = false;
        this.followUpDialog?.hide();
        this.selectedFollowUpTask = null;
        this.success = 'Le rendez-vous de contrôle a été créé.';
        this.loadRendezVous();
      },
      error: (error: unknown) => {
        this.saving = false;
        this.error = this.businessError(
          error,
          'Le rendez-vous de contrôle n’a pas pu être créé.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  private loadRendezVous(): void {
    this.loading = true;
    this.error = '';

    const year = new Date().getFullYear();

    const debut = `${year}-01-01T00:00:00`;
    const fin = `${year + 1}-01-01T00:00:00`;

    forkJoin({
      appointments: this.rendezVousService.getMyAgenda(debut, fin),
      tasks: this.workflowService.getMyTasks(),
    }).subscribe({
      next: ({ appointments, tasks }) => {
        this.tasks = tasks;
        this.rendezVous = {
          content: appointments,
          totalElements: appointments.length,
          totalPages: appointments.length === 0 ? 0 : 1,
          size: appointments.length,
          number: 0,
          first: true,
          last: true,
        };

        this.loading = false;
        this.cdr.markForCheck();
      },

      error: () => {
        this.error = 'Impossible de charger vos rendez-vous.';
        this.loading = false;

        this.cdr.markForCheck();
      },
    });
  }

  private openReport(rendezVousId: string): void {
    const finalTask = this.taskFor(rendezVousId, 'sid-67B03EB7-8B5A-44E7-9A78-55F7CE14FDAB');
    if (finalTask) {
      this.showReport(finalTask);
      return;
    }
    const presenceTask = this.taskFor(rendezVousId, 'sid-A9B6D073-5318-4305-976A-0EED79871E79');
    if (!presenceTask) {
      this.error = 'Aucune tâche de consultation active ne correspond à ce rendez-vous.';
      return;
    }
    this.saving = true;
    this.workflowService.completeMyTask(
      presenceTask.processInstanceId,
      presenceTask.id,
      { patientPresent: true }
    ).subscribe({
      next: () => this.workflowService.getMyTasks().subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.saving = false;
          const task = this.taskFor(rendezVousId, 'sid-67B03EB7-8B5A-44E7-9A78-55F7CE14FDAB');
          task ? this.showReport(task) : this.error = 'La tâche de finalisation est indisponible.';
        },
        error: () => {
          this.saving = false;
          this.error = 'Impossible de charger la tâche de finalisation.';
        }
      }),
      error: () => {
        this.saving = false;
        this.error = 'La présence du patient n’a pas pu être confirmée.';
      }
    });
  }

  private completePresence(task: PraticienWorkflowTask, patientPresent: boolean): void {
    this.saving = true;
    this.workflowService.completeMyTask(task.processInstanceId, task.id, { patientPresent }).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'L’absence du patient a été enregistrée.';
        this.loadRendezVous();
      },
      error: () => {
        this.saving = false;
        this.error = 'L’absence n’a pas pu être enregistrée.';
      }
    });
  }

  private showReport(task: PraticienWorkflowTask): void {
    this.selectedTask = task;
    this.reportForm.reset({
      motifConsultation: '', symptomes: '', diagnostic: '', observations: '',
      traitementRecommande: '', examensComplementaires: '', recommandations: '',
      controleRequis: false,
    });
    this.reportDialog?.show();
  }

  private taskFor(rendezVousId: string, definitionKey: string): PraticienWorkflowTask | undefined {
    return this.tasks.find(task => task.rendezVousId === rendezVousId && task.definitionKey === definitionKey);
  }

  private toLocalDateTime(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private businessError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }
    return fallback;
  }
}
