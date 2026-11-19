import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CreatePraticienRequest, Praticien, Specialite, UpdatePraticienRequest } from '../../models';

@Component({
  selector: 'app-practitioner-form',
  templateUrl: './practitioner-form.component.html',
  standalone: false
})
export class PractitionerFormComponent implements OnChanges {
  @Input() initialValues: Partial<Praticien> | null = null;
  @Input() specialites: Specialite[] = [];
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreatePraticienRequest | UpdatePraticienRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)],
    numeroOrdre: ['', Validators.required],
    specialiteId: ['', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formGroup.patchValue({
        nom: this.initialValues?.nom ?? '',
        prenom: this.initialValues?.prenom ?? '',
        email: this.initialValues?.email ?? '',
        phone: this.initialValues?.phone ?? '',
        numeroOrdre: this.initialValues?.numeroOrdre ?? '',
        specialiteId: this.initialValues?.specialiteId == null ? '' : String(this.initialValues.specialiteId)
      });
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
      return 'Le numéro doit contenir 8 à 15 chiffres.';
    }
    return '';
  }

  submit(): void {
    if (this.formGroup.invalid || this.loading) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.getRawValue();
    this.formSubmit.emit({
      nom: value.nom,
      prenom: value.prenom,
      email: value.email,
      phone: value.phone,
      numeroOrdre: value.numeroOrdre,
      specialiteId: Number(value.specialiteId)
    });
  }
}