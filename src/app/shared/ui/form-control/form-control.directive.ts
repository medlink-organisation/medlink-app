import { Directive } from '@angular/core';
import { HlmInput } from '../primitives/input/src';

@Directive({
  selector: 'input[appFormControl], textarea[appFormControl], select[appFormControl]',
  hostDirectives: [HlmInput],
  standalone: false
})
export class FormControlDirective {}
