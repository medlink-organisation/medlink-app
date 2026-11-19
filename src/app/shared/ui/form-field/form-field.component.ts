import { AfterContentInit, Component, ContentChild, ElementRef, Input, OnInit } from '@angular/core';
import { HlmInput } from '../primitives/input/src';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  standalone: false
})
export class FormFieldComponent implements OnInit, AfterContentInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() error = '';

  @ContentChild(HlmInput, { read: ElementRef })
  private control?: ElementRef<HTMLElement>;

  fieldId = '';

  ngOnInit(): void {
    this.fieldId = `field-${Math.random().toString(36).slice(2)}`;
  }

  ngAfterContentInit(): void {
    const control = this.control?.nativeElement;
    if (!control) {
      return;
    }

    control.id = this.fieldId;
    const describedBy = [
      this.hint ? `${this.fieldId}-hint` : '',
      this.error ? `${this.fieldId}-error` : ''
    ].filter(Boolean);

    if (describedBy.length > 0) {
      control.setAttribute('aria-describedby', describedBy.join(' '));
    }
  }
}
