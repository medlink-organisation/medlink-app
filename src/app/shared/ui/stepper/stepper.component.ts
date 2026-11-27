import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface StepperItem {
  label: string;
  description?: string;
}

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StepperComponent {
  @Input() steps: StepperItem[] = [];
  @Input() currentIndex = 0;

  stateFor(index: number): 'complete' | 'current' | 'upcoming' {
    return index < this.currentIndex ? 'complete' : index === this.currentIndex ? 'current' : 'upcoming';
  }
}
