import { Component, Input } from '@angular/core';
import { NavigationItem } from '../ui-navigation-item';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false
})
export class SidebarComponent {
  @Input() heading = '';
  @Input() items: NavigationItem[] = [];
}
