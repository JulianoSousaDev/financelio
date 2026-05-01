import { supabase } from './client';

export interface MonthlySummaryResult {
  total_income: number;
  total_expense: number;
  net_balance: number;
}

function getMonthDateRange(month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

export async function fetchMonthlySummary(
  userId: string,
  month: number,
  year: number
): Promise<MonthlySummaryResult> {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  let total_income = 0;
  let total_expense = 0;

  for (const tx of transactions || []) {
    if (tx.type === 'income') total_income += tx.amount;
    else if (tx.type === 'expense') total_expense += tx.amount;
  }

  return {
    total_income,
    total_expense,
    net_balance: total_income - total_expense,
  };
}
