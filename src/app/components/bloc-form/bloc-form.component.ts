import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Bloc, Clinique, CreateBlocRequest } from '../../models';

@Component({
  selector: 'app-bloc-form',
  templateUrl: './bloc-form.component.html',
  standalone: false
})
export class BlocFormComponent implements OnChanges {
  @Input() initialValues: Partial<Bloc> | null = null;
  @Input() cliniques: Clinique[] = [];
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateBlocRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    cliniqueId: [0, [Validators.required, Validators.min(1)]],
    description: ['', Validators.maxLength(500)]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
      this.formGroup.reset({
        code: this.initialValues?.code ?? '',
        nom: this.initialValues?.nom ?? '',
        cliniqueId: this.initialValues?.cliniqueId ?? 0,
        description: this.initialValues?.description ?? ''
      });
    }
  }

  errorFor(name: string): string {
    const control = this.formGroup.get(name);
    if (!control?.touched || !control.invalid) {
      return '';
    }
    return control.hasError('required') || control.hasError('min')
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
      code: value.code.trim(),
      nom: value.nom.trim(),
      cliniqueId: value.cliniqueId,
      ...(value.description.trim() ? { description: value.description.trim() } : {})
    });
  }
}
