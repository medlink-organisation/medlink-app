import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeSlot } from '../time-slot.model';

@Component({
  selector: 'app-time-slot-picker',
  templateUrl: './time-slot-picker.component.html',
  standalone: false
})
export class TimeSlotPickerComponent {
  @Input() slots: TimeSlot[] = [];
  @Input() selectedSlotId: number | null = null;
  @Output() slotSelected = new EventEmitter<number>();

  isDisabled(slot: TimeSlot): boolean {
    return slot.statut !== 'DISPONIBLE';
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  select(slot: TimeSlot): void {
    if (!this.isDisabled(slot)) {
      this.slotSelected.emit(slot.id);
    }
  }
}
