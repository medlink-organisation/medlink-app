import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-role-dashboard',
  standalone: false,
  templateUrl: './role-dashboard.component.html'
})
export class RoleDashboardComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] as string;
  readonly role = this.route.snapshot.data['role'] as string;
}
