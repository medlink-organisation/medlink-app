import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

interface PatientFeaturePageData {
  title: string;
  subtitle: string;
  unavailableTitle: string;
  unavailableDescription: string;
}

@Component({
  selector: 'app-patient-feature-unavailable',
  templateUrl: './patient-feature-unavailable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PatientFeatureUnavailableComponent {
  private readonly route = inject(ActivatedRoute);

  readonly pageData$ = this.route.data.pipe(
    map((data): PatientFeaturePageData => ({
      title: this.readText(data['title'], 'Espace Patient'),
      subtitle: this.readText(data['subtitle'], ''),
      unavailableTitle: this.readText(data['unavailableTitle'], 'Fonctionnalité temporairement indisponible'),
      unavailableDescription: this.readText(
        data['unavailableDescription'],
        'Le service sécurisé nécessaire à cette fonctionnalité n’est pas encore disponible.'
      )
    }))
  );

  private readText(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
  }
}
