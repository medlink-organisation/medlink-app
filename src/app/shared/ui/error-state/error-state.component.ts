import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  standalone: false
})
export class ErrorStateComponent {
  @Input() title = 'Impossible de charger les données';
  @Input() description = 'Une erreur est survenue. Veuillez réessayer.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
