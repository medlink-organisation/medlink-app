import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Clinique, CreateCliniqueRequest } from '../../models';

@Component({
  selector: 'app-clinique-form',
  templateUrl: './clinique-form.component.html',
  standalone: false
})
export class CliniqueFormComponent implements OnChanges {
  @Input() initialValues: Partial<Clinique> | null = null;
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateCliniqueRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    adresse: ['', Validators.maxLength(255)],
    ville: ['', Validators.maxLength(120)],
    telephone: ['', Validators.maxLength(30)],
    email: ['', [Validators.email, Validators.maxLength(180)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formGroup.reset({
        nom: this.initialValues?.nom ?? '',
        adresse: this.initialValues?.adresse ?? '',
        ville: this.initialValues?.ville ?? '',
        telephone: this.initialValues?.telephone ?? '',
        email: this.initialValues?.email ?? ''
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
      return 'Saisissez une adresse e-mail valide.';
    }
    return 'La longueur maximale est dépassée.';
  }

  submit(): void {
    if (this.formGroup.invalid || this.loading) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const value = this.formGroup.getRawValue();
    this.formSubmit.emit({
      nom: value.nom.trim(),
      ...(value.adresse.trim() ? { adresse: value.adresse.trim() } : {}),
      ...(value.ville.trim() ? { ville: value.ville.trim() } : {}),
      ...(value.telephone.trim() ? { telephone: value.telephone.trim() } : {}),
      ...(value.email.trim() ? { email: value.email.trim() } : {})
    });
  }
}
