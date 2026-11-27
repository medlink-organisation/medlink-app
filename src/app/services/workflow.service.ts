import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';
import { PraticienWorkflowTask } from '../models';
import { toHttpParams } from './http-params';

export interface PatientBookingRequest {
  slotId: number;
  reason: string;
  idempotencyKey: string;
}

export interface PatientBookingResponse {
  processInstanceId: string;
  active: boolean;
  currentActivityId: string;
  rendezVousId: string;
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly api = inject(ApiClientService);

  bookPatientAppointment(request: PatientBookingRequest): Observable<PatientBookingResponse> {
    return this.api.post('/workflow-service/api/patient/appointments', request);
  }

  cancelPatientAppointment(
    rendezVousId: string,
    reason = 'Annulation demandée par le patient'
  ): Observable<PatientBookingResponse> {
    return this.api.patch(
      `/workflow-service/api/patient/appointments/${encodeURIComponent(rendezVousId)}/annuler`,
      null,
      toHttpParams({ reason })
    );
  }

  reschedulePatientAppointment(
    rendezVousId: string,
    newSlotId: number
  ): Observable<PatientBookingResponse> {
    return this.api.patch(
      `/workflow-service/api/patient/appointments/${encodeURIComponent(rendezVousId)}/reporter/${newSlotId}`,
      null
    );
  }

  getMyTasks(): Observable<PraticienWorkflowTask[]> {
    return this.api.get('/workflow-service/api/workflows/tasks/me');
  }

  completeMyTask(
    processInstanceId: string,
    taskId: string,
    variables: Record<string, unknown>
  ): Observable<unknown> {
    const process = encodeURIComponent(processInstanceId);
    const task = encodeURIComponent(taskId);
    return this.api.post(`/workflow-service/api/workflows/${process}/tasks/${task}/complete-mine`, { variables });
  }
}
