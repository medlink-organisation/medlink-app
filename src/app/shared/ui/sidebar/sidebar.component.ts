import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationItem } from '../ui-navigation-item';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false
})
export class SidebarComponent {
  @Input() heading = '';
  @Input() roleLabel = '';
  @Input() items: NavigationItem[] = [];
  @Input() collapsed = false;
  @Input() mobile = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<void>();
}
