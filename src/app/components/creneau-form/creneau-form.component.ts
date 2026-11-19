import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CreateCreneauRequest, Creneau, UpdateCreneauRequest } from '../../models';

@Component({
  selector: 'app-creneau-form',
  templateUrl: './creneau-form.component.html',
  standalone: false
})
export class CreneauFormComponent implements OnChanges {
  @Input() initialValues: Partial<Creneau> | null = null;
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<CreateCreneauRequest | UpdateCreneauRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    praticienId: ['', Validators.required],
    cliniqueId: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues']) {
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
    this.formSubmit.emit({
      praticienId: Number(value.praticienId),
      cliniqueId: Number(value.cliniqueId),
      dateDebut: value.dateDebut,
      dateFin: value.dateFin
    });
  }
}
