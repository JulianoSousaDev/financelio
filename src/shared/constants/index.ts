export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export const RECURRING_INTERVALS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const RISK_PROFILES = {
  CONSERVATIVE: 'conservative',
  MODERATE: 'moderate',
  AGGRESSIVE: 'aggressive',
} as const;

export const DEFAULT_CATEGORIES = [
  { name: 'Salário', type: 'income', icon: '💰', color: '#22C55E', is_system: true },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#10B981', is_system: true },
  { name: 'Investimentos', type: 'income', icon: '📈', color: '#06B6D4', is_system: true },
  { name: 'Moradia', type: 'expense', icon: '🏠', color: '#F59E0B', is_system: true },
  { name: 'Alimentação', type: 'expense', icon: '🍔', color: '#EF4444', is_system: true },
  { name: 'Transporte', type: 'expense', icon: '🚗', color: '#3B82F6', is_system: true },
  { name: 'Saúde', type: 'expense', icon: '💊', color: '#EC4899', is_system: true },
  { name: 'Lazer', type: 'expense', icon: '🎮', color: '#8B5CF6', is_system: true },
  { name: 'Educação', type: 'expense', icon: '📚', color: '#14B8A6', is_system: true },
  { name: 'Outros', type: 'expense', icon: '📦', color: '#6B7280', is_system: true },
];
