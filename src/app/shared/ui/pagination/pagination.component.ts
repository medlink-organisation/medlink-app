import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  standalone: false
})
export class PaginationComponent {
  private static nextId = 0;

  readonly pageSizeControlId = `ml-page-size-${PaginationComponent.nextId++}`;

  @Input() currentPage = 0;
  @Input() pageSize = 10;
  @Input() totalElements = 0;
  @Input() pageSizeOptions: number[] = [10, 25, 50];
  @Output() pageChange = new EventEmitter<{ page: number; size: number }>();

  get totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(Math.max(0, this.totalElements) / this.pageSize) : 0;
  }

  get rangeStart(): number {
    return this.totalElements > 0 ? this.currentPage * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.pageSize - 1, this.totalElements);
  }

  get hasPrev(): boolean {
    return this.currentPage > 0;
  }

  get hasNext(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  get pageSizeValue(): string {
    return String(this.pageSize);
  }

  prev(): void {
    if (this.hasPrev) {
      this.pageChange.emit({ page: this.currentPage - 1, size: this.pageSize });
    }
  }

  next(): void {
    if (this.hasNext) {
      this.pageChange.emit({ page: this.currentPage + 1, size: this.pageSize });
    }
  }

  onSizeChange(size: string): void {
    const parsedSize = Number(size);
    if (Number.isFinite(parsedSize) && parsedSize > 0) {
      this.pageChange.emit({ page: 0, size: parsedSize });
    }
  }
}
