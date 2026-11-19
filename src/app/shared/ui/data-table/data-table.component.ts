import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDef } from '../column-def.model';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  standalone: false
})
export class DataTableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() rows: unknown[] = [];
  @Input() loading = false;
  @Input() emptyLabel = 'Aucun résultat';
  @Output() rowClick = new EventEmitter<unknown>();

  getCellValue(row: unknown, key: string): unknown {
    if (typeof row !== 'object' || row === null || !(key in row)) {
      return undefined;
    }
    return (row as Record<string, unknown>)[key];
  }

  formatCell(row: unknown, column: ColumnDef): string {
    const value = this.getCellValue(row, column.key);
    return column.formatter ? column.formatter(value) : value == null ? '' : String(value);
  }

  selectRow(row: unknown): void {
    this.rowClick.emit(row);
  }
}
