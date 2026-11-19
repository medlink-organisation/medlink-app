import { Component, Input } from '@angular/core';

export type AlertVariant = 'default' | 'destructive';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  standalone: false
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'default';
  @Input() title = '';
}
