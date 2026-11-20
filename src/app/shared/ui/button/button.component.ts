import { Component, Input } from '@angular/core';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'danger' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'md' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  standalone: false
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel = '';

  get primitiveVariant(): 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' {
    if (this.variant === 'primary') {
      return 'default';
    }
    if (this.variant === 'danger') {
      return 'destructive';
    }
    return this.variant;
  }

  get primitiveSize(): 'default' | 'sm' | 'lg' | 'icon' {
    return this.size === 'md' ? 'default' : this.size;
  }
}
