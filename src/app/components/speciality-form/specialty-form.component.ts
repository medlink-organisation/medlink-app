import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CreateSpecialiteRequest, Specialite, UpdateSpecialiteRequest } from '../../models';

@Component({
  selector: 'app-specialty-form',
  templateUrl: './specialty-form.component.html',
  standalone: false
})
export class SpecialtyFormComponent implements OnChanges {
  @Input() initialValues: Partial<Specialite> | null = null;
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateSpecialiteRequest | UpdateSpecialiteRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(500)]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formGroup.patchValue({
        code: this.initialValues?.code ?? '',
        nom: this.initialValues?.nom ?? '',
        description: this.initialValues?.description ?? ''
      });
    }
  }

  errorFor(name: string): string {
    const control = this.formGroup.get(name);
    if (!control?.touched || !control.invalid) {
      return '';
    }
    return control.hasError('required')
      ? 'Ce champ est obligatoire.'
      : 'La longueur maximale est dépassée.';
  }

  submit(): void {
    if (this.formGroup.invalid || this.loading) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.getRawValue();
    this.formSubmit.emit({
      code: value.code,
      nom: value.nom,
      ...(value.description ? { description: value.description } : {})
    });
  }
}