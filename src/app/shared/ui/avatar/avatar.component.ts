import { Component, Input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  standalone: false
})
export class AvatarComponent {
  @Input() name = '';
  @Input() imageUrl = '';
  @Input() size: AvatarSize = 'md';

  imageFailed = false;

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'ML';
    }
    return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts.at(-1)?.[0] ?? '' : ''}`.toUpperCase();
  }

  get sizeClass(): string {
    return this.size === 'sm' ? 'size-8 text-xs' : this.size === 'lg' ? 'size-12 text-base' : 'size-10 text-sm';
  }
}
