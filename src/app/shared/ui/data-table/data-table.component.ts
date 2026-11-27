import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDef } from '../column-def.model';
import { IconName } from '../icon/icon.component';

export interface DataTableRowAction {
  id: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  visible?: (row: unknown) => boolean;
}

export interface DataTableRowActionEvent {
  action: string;
  row: unknown;
}

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
  @Input() rowActions: DataTableRowAction[] = [];
  @Input() inlineRowActions = false;
  @Output() rowClick = new EventEmitter<unknown>();
  @Output() rowAction = new EventEmitter<DataTableRowActionEvent>();

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

  actionsFor(row: unknown): DataTableRowAction[] {
    return this.rowActions.filter((action) => !action.visible || action.visible(row));
  }

  selectRow(row: unknown): void {
    this.rowClick.emit(row);
  }

  performAction(action: DataTableRowAction, row: unknown, event: Event): void {
    event.stopPropagation();
    const details = (event.currentTarget as HTMLElement | null)?.closest('details');
    if (details instanceof HTMLDetailsElement) {
      details.open = false;
    }
    this.rowAction.emit({ action: action.id, row });
  }
}
