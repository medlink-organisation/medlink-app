import { Component, signal } from '@angular/core';

@Component({ selector: 'app-contact', templateUrl: './contact.component.html', standalone: false })
export class ContactComponent {
  readonly submitted = signal(false);

  submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }
}
