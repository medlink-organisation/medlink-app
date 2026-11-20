import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  standalone: false
})
export class TopbarComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() roleLabel = '';
  @Input() profileRoute = '';
  @Output() menuToggle = new EventEmitter<void>();
}
