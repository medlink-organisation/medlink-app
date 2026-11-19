export interface ColumnDef {
  key: string;
  label: string;
  formatter?: (val: unknown) => string;
}
