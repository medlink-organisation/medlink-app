import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: false
})
export class FormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() submitted = new EventEmitter<void>();
}
