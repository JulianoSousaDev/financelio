-- ============================================
-- FINANCELIO - MONTHLY SUMMARY FUNCTION
-- Execute APÓS as tabelas (transactions precisa existir)
-- ============================================

CREATE OR REPLACE FUNCTION monthly_summary(p_month INT, p_year INT, p_user_id UUID)
RETURNS JSON AS '
DECLARE
  total_income NUMERIC;
  total_expense NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM transactions
  WHERE user_id = p_user_id
    AND type = ''income''
    AND EXTRACT(MONTH FROM date) = p_month
    AND EXTRACT(YEAR FROM date) = p_year;

  SELECT COALESCE(SUM(amount), 0) INTO total_expense
  FROM transactions
  WHERE user_id = p_user_id
    AND type = ''expense''
    AND EXTRACT(MONTH FROM date) = p_month
    AND EXTRACT(YEAR FROM date) = p_year;

  RETURN json_build_object(
    ''total_income'', total_income,
    ''total_expense'', total_expense,
    ''net_balance'', total_income - total_expense
  );
END;
' LANGUAGE plpgsql SECURITY DEFINER;
