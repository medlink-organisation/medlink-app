import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  standalone: false
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Rechercher...';
  @Input() debounceMs = 400;
  @Output() search = new EventEmitter<string>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  private valueChangesSubscription?: Subscription;

  ngOnInit(): void {
    this.valueChangesSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(Math.max(0, this.debounceMs)), distinctUntilChanged())
      .subscribe((value) => this.search.emit(value));
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  clear(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.search.emit('');
  }
}
