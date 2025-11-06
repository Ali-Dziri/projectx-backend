export const AdminAccountStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

export type AdminAccountStatus =
  (typeof AdminAccountStatus)[keyof typeof AdminAccountStatus];

export type UserType = {
  id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  phone: {
    code: string;
    number: string;
  };
};
