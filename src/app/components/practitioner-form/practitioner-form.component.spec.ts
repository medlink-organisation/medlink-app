import { TestBed } from '@angular/core/testing';

import { AppModule } from '../../app-module';
import { PractitionerFormSubmission } from '../../models';
import { PractitionerFormComponent } from './practitioner-form.component';

describe('PractitionerFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
  });

  it('keeps multiple clinic selections and submits persistent identifiers', () => {
    const fixture = TestBed.createComponent(PractitionerFormComponent);
    const component = fixture.componentInstance;
    component.specialites = [{ id: 7, code: 'CARDIOLOGIE', nom: 'Cardiologie', description: null, actif: true }];
    component.cliniques = [
      { id: 11, nom: 'Clinique MedLink Sousse', ville: 'Sousse', adresse: null, telephone: null, email: null, blocs: [], services: [] },
      { id: 12, nom: 'Clinique MedLink Tunis', ville: 'Tunis', adresse: null, telephone: null, email: null, blocs: [], services: [] }
    ];
    component.ngOnChanges({ initialValues: { currentValue: null, previousValue: undefined, firstChange: true, isFirstChange: () => true } });
    component.formGroup.patchValue({
      nom: 'Ben Ali', prenom: 'Sarra', email: 'sarra@example.test', phone: '+21622111222',
      numeroOrdre: 'ORD-42', specialiteId: '7'
    });
    component.toggleClinic(11, true);
    component.toggleClinic(12, true);
    let submitted: PractitionerFormSubmission | undefined;
    component.formSubmit.subscribe(value => submitted = value);

    component.submit();

    expect(submitted?.practitioner.specialiteId).toBe(7);
    expect(submitted?.cliniqueIds).toEqual([11, 12]);
  });

  it('does not submit without a specialty and at least one clinic', () => {
    const fixture = TestBed.createComponent(PractitionerFormComponent);
    const component = fixture.componentInstance;
    component.ngOnChanges({ initialValues: { currentValue: null, previousValue: undefined, firstChange: true, isFirstChange: () => true } });
    const submit = vi.fn();
    component.formSubmit.subscribe(submit);

    component.submit();

    expect(submit).not.toHaveBeenCalled();
    expect(component.formGroup.invalid).toBe(true);
  });
});
