export const AdminAccountStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

export type AdminAccountStatus =
  (typeof AdminAccountStatus)[keyof typeof AdminAccountStatus];
