import { MemberState, LoanState } from '@/types';

export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#333333',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  primary: '#4CAF50',
  primaryLight: '#4CAF5020',
  accent: '#81C784',
  error: '#EF5350',
  errorLight: '#EF535020',
  warning: '#FFA726',
};

export const MEMBER_STATE_COLORS: Record<MemberState, string> = {
  ACTIVE: '#4CAF50',
  PENDING: '#FFA726',
  SUSPENDED: '#EF5350',
  BLOCKED: '#888888',
  INACTIVE: '#555555',
};

export const MEMBER_STATE_LABELS: Record<MemberState, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  SUSPENDED: 'Suspendido',
  BLOCKED: 'Bloqueado',
  INACTIVE: 'Inactivo',
};

export const LOAN_STATE_COLORS: Record<LoanState, string> = {
  ACTIVE: '#4CAF50',
  RETURNED: '#81C784',
  OVERDUE: '#EF5350',
  CANCELLED: '#888888',
};

export const LOAN_STATE_LABELS: Record<LoanState, string> = {
  ACTIVE: 'Activo',
  RETURNED: 'Devuelto',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
};
