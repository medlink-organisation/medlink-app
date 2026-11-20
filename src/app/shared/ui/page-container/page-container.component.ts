import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  templateUrl: './page-container.component.html',
  standalone: false
})
export class PageContainerComponent {
  @Input() spacious = false;
}
