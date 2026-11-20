import { Component, Input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  standalone: false
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
