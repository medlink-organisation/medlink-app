import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Clinique, PractitionerFormSubmission, Praticien, Specialite } from '../../models';

@Component({
  selector: 'app-practitioner-form',
  templateUrl: './practitioner-form.component.html',
  standalone: false
})
export class PractitionerFormComponent implements OnChanges {
  @Input() initialValues: Partial<Praticien> | null = null;
  @Input() specialites: Specialite[] = [];
  @Input() cliniques: Clinique[] = [];
  @Input() referenceDataLoading = false;
  @Input() referenceDataError: string | null = null;
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<PractitionerFormSubmission>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+[1-9][0-9]{7,14}$/)]],
    numeroOrdre: ['', Validators.required],
    specialiteId: ['', Validators.required],
    cliniqueIds: this.formBuilder.nonNullable.control<number[]>([])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formGroup.patchValue({
        nom: this.initialValues?.nom ?? '',
        prenom: this.initialValues?.prenom ?? '',
        email: this.initialValues?.email ?? '',
        phone: this.initialValues?.phone ?? '',
        numeroOrdre: this.initialValues?.numeroOrdre ?? '',
        specialiteId: this.initialValues?.specialiteId == null ? '' : String(this.initialValues.specialiteId),
        cliniqueIds: []
      });
      const cliniqueControl = this.formGroup.controls.cliniqueIds;
      if (this.isCreating) {
        cliniqueControl.addValidators(Validators.required);
      } else {
        cliniqueControl.clearValidators();
      }
      cliniqueControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  errorFor(name: string): string {
    const control = this.formGroup.get(name);
    if (!control?.touched || !control.invalid) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Ce champ est obligatoire.';
    }
    if (control.hasError('email')) {
      return 'Adresse e-mail invalide.';
    }
    if (control.hasError('pattern')) {
      return 'Utilisez le format international, par exemple +21612345678.';
    }
    return '';
  }

  submit(): void {
    if (this.formGroup.invalid || this.loading || this.referenceDataLoading) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.getRawValue();
    this.formSubmit.emit({
      practitioner: {
        nom: value.nom,
        prenom: value.prenom,
        email: value.email,
        phone: value.phone,
        numeroOrdre: value.numeroOrdre,
        specialiteId: Number(value.specialiteId)
      },
      cliniqueIds: value.cliniqueIds
    });
  }

  get isCreating(): boolean {
    return this.initialValues?.id == null;
  }

  isClinicSelected(id: number | null): boolean {
    return id !== null && this.formGroup.controls.cliniqueIds.value.includes(id);
  }

  toggleClinic(id: number | null, selected: boolean): void {
    if (id === null) return;
    const current = this.formGroup.controls.cliniqueIds.value;
    const next = selected ? [...new Set([...current, id])] : current.filter(value => value !== id);
    this.formGroup.controls.cliniqueIds.setValue(next);
    this.formGroup.controls.cliniqueIds.markAsTouched();
  }
}
