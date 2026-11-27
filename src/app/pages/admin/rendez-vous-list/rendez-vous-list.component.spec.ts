import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppModule } from '../../../app-module';
import { PageResponse, AdminRendezVous } from '../../../models';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { SchedulingInternalService } from '../../../services/scheduling-internal.service';
import { RendezVousListComponent } from './rendez-vous-list.component';

describe('RendezVousListComponent', () => {
  const appointment: AdminRendezVous = {
    id: '1a4a0870-24ee-4fea-9e5f-4684aef3805a',
    patientId: '4303278309522443300',
    patientNom: 'Ben Ali',
    patientPrenom: 'Ahmed',
    praticienId: 56,
    praticienNom: 'Trabelsi',
    praticienPrenom: 'Mohamed',
    creneauId: 15,
    cliniqueId: 3,
    dateDebut: '2026-11-27T09:00:00',
    dateFin: '2026-11-27T09:30:00',
    type: 'CONSULTATION',
    status: 'TERMINE',
  };

  const page: PageResponse<AdminRendezVous> = {
    content: [appointment],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  const getAll = vi.fn().mockReturnValue(of(page));

  beforeEach(async () => {
    getAll.mockClear();
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        { provide: RendezVousService, useValue: { getAll } },
        { provide: SchedulingInternalService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('affiche les identités et les horaires sans convertir le patientId', () => {
    const fixture = TestBed.createComponent(RendezVousListComponent);
    fixture.detectChanges();

    expect(getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      sort: 'creneau.dateDebut,desc',
    });
    expect(fixture.componentInstance.rows[0]).toMatchObject({
      patientId: '4303278309522443300',
      patient: 'Ben Ali Ahmed',
      praticien: 'Trabelsi Mohamed',
      dateRendezVous: '27/11/2026',
      heureDebut: '09:00',
      heureFin: '09:30',
    });
    expect(fixture.componentInstance.columns.map((column) => column.key))
      .toEqual([
        'patient',
        'praticien',
        'dateRendezVous',
        'heureDebut',
        'heureFin',
        'type',
        'status',
      ]);
  });
});
