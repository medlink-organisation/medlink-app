import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  standalone: false
})
export class SkeletonComponent {
  @Input() rows = 3;
  @Input() className = '';

  get rowCount(): number[] {
    return Array.from({ length: Math.max(0, Math.floor(this.rows)) }, (_, index) => index);
  }
}
