import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {DashboardCard} from '../../src/presentation/components/DashboardCard';
import {useMonthlySummary} from '../../src/presentation/hooks/useMonthlySummary';
import {ChartFilters} from '../../src/presentation/components/charts/ChartFilters';
import {SpendingProjectionChart} from '../../src/presentation/components/charts/SpendingProjectionChart';
import {MonthlyComparisonChart} from '../../src/presentation/components/charts/MonthlyComparisonChart';
import {CategoryPieChart} from '../../src/presentation/components/charts/CategoryPieChart';
import {useChartFilters} from '../../src/hooks/useChartFilters';
import {
  useColors,
  useSemanticColors,
} from '../../src/presentation/hooks/useColors';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function DashboardScreen() {
  const colors = useColors();
  const semantic = useSemanticColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {filter} = useChartFilters();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const {data, loading, error, refetch} = useMonthlySummary(month, year);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  };

  const formatCurrency = (val: number) =>
    'R$ ' + (val || 0).toFixed(2).replace('.', ',');

  const handleCategoryPress = (categoryId: string) => {
    const params: Record<string, string> = {
      category_id: categoryId,
    };
    if (filter.period) params.period = filter.period;
    if (filter.memberId) params.memberId = filter.memberId;

    router.push({
      pathname: '/(app)/transactions',
      params,
    });
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + 16,
          paddingTop: insets.top + 16,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[styles.title, {color: colors.text}]}>Dashboard</Text>

      {/* Month selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={prevMonth}
          style={[styles.arrow, {backgroundColor: colors.surfaceSecondary}]}
        >
          <Text style={[styles.arrowText, {color: colors.primary}]}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, {color: colors.text}]}>
          {MONTHS[month - 1]} {year}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          style={[styles.arrow, {backgroundColor: colors.surfaceSecondary}]}
        >
          <Text style={[styles.arrowText, {color: colors.primary}]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Chart Filters */}
      <ChartFilters />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View
          style={[
            styles.errorContainer,
            {backgroundColor: colors.dangerBackground},
          ]}
        >
          <Text style={[styles.errorText, {color: colors.danger}]}>
            Erro ao carregar
          </Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={[styles.retryText, {color: colors.primary}]}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.cardsRow}>
            <DashboardCard
              title="Receitas"
              value={formatCurrency(data?.total_income ?? 0)}
              color={semantic.income}
            />
            <DashboardCard
              title="Despesas"
              value={formatCurrency(data?.total_expense ?? 0)}
              color={semantic.expense}
            />
          </View>
          <View style={styles.cardsRow}>
            <DashboardCard
              title="Saldo Líquido"
              value={formatCurrency(data?.net_balance ?? 0)}
              color={
                data?.net_balance && data?.net_balance >= 0
                  ? semantic.income
                  : semantic.expense
              }
            />
          </View>

          {/* Charts Section */}
          <SpendingProjectionChart />
          <MonthlyComparisonChart />
          <CategoryPieChart onCategoryPress={handleCategoryPress} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.01,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  arrow: {
    padding: 12,
    borderRadius: 9999,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {fontSize: 18},
  monthLabel: {fontSize: 18, fontWeight: '600', marginHorizontal: 24},
  cardsRow: {flexDirection: 'row', marginBottom: 8},
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 16,
    borderRadius: 14,
  },
  errorText: {fontSize: 16},
  retryText: {fontSize: 16, marginTop: 8},
  loader: {marginTop: 40},
});
