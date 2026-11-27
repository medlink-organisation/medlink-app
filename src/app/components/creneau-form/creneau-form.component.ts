import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Clinique, CreateCreneauRequest, Creneau, Praticien, UpdateCreneauRequest } from '../../models';

@Component({
  selector: 'app-creneau-form',
  templateUrl: './creneau-form.component.html',
  standalone: false
})
export class CreneauFormComponent implements OnChanges {
  @Input() initialValues: Partial<Creneau> | null = null;
  @Input() praticiens: Praticien[] = [];
  @Input() cliniques: Clinique[] = [];
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateCreneauRequest | UpdateCreneauRequest>();
  @Output() cancelled = new EventEmitter<void>();
  formError = '';

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    praticienId: ['', Validators.required],
    cliniqueId: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formError = '';
      this.formGroup.patchValue({
        praticienId: this.initialValues?.praticienId == null ? '' : String(this.initialValues.praticienId),
        cliniqueId: this.initialValues?.cliniqueId == null ? '' : String(this.initialValues.cliniqueId),
        dateDebut: this.initialValues?.dateDebut ?? '',
        dateFin: this.initialValues?.dateFin ?? ''
      });
    }
  }

  submit(): void {
    if (this.formGroup.invalid || this.loading) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.getRawValue();
    const start = new Date(value.dateDebut);
    const end = new Date(value.dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      this.formError = 'La date de fin doit être postérieure à la date de début.';
      return;
    }
    if (!this.initialValues?.id && start <= new Date()) {
      this.formError = 'La date de début doit être située dans le futur.';
      return;
    }
    this.formError = '';
    this.formSubmit.emit({
      praticienId: Number(value.praticienId),
      cliniqueId: Number(value.cliniqueId),
      dateDebut: value.dateDebut,
      dateFin: value.dateFin
    });
  }
}
