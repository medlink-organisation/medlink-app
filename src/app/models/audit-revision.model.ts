export type AuditOperation = 'ADD' | 'MOD' | 'DEL';
export type AuditActorType = 'USER' | 'SERVICE' | 'SYSTEM' | 'UNKNOWN';
export type AuditSource = 'directory' | 'praticien';

export interface AuditFieldChange {
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditRevision {
  entityName: string;
  entityId: string;
  revisionId: number;
  timestamp: string;
  userId: string | null;
  username: string | null;
  actorType: AuditActorType;
  operation: AuditOperation;
  serviceName: string;
  changes: AuditFieldChange[];
}
