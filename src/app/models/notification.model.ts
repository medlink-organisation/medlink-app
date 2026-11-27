export type NotificationRecipientType = 'PATIENT' | 'PRATICIEN' | 'ADMIN';

export type NotificationType =
  | 'RENDEZ_VOUS_CONFIRMATION'
  | 'RENDEZ_VOUS_ANNULATION'
  | 'RENDEZ_VOUS_RAPPEL'
  | 'SYSTEME'
  | 'GENERALE';

export interface MedLinkNotification {
  id: string;
  recipientType: NotificationRecipientType;
  notificationType: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  emailSent: boolean;
  correlationId: string | null;
  createdAt: string;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface MarkedReadCount {
  count: number;
}
