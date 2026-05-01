export type TransactionType = 'income' | 'expense';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  is_system: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  family_id?: string;
  type: TransactionType;
  amount: number;
  category_id?: string;
  description?: string;
  date: string;
  is_fixed: boolean;
  is_recurring: boolean;
  recurring_interval?: RecurringInterval;
  created_at: string;
  updated_at: string;
  // Joined data from Supabase
  categories?: Category;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  amount: number;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string;
  description?: string;
  interval_type: RecurringInterval;
  start_date: string;
  next_occurrence?: string;
  is_active: boolean;
  created_at: string;
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  total_amount: number;
}

export interface FinancialInsight {
  type: 'summary' | 'pattern' | 'suggestion' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
}
