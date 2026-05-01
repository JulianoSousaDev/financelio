import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  PanResponder,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useSemanticColors } from '../../hooks/useColors';
import { TransactionModal } from '../../../src/presentation/components/TransactionModal';
import { useAuth } from '../../../src/presentation/contexts/AuthContext';
import { useFamilyContext } from '../../../src/presentation/contexts/FamilyContext';
import { useCategories } from '../../../src/presentation/hooks/useCategories';
import { Transaction } from '../../../src/shared/types';
import { supabase } from '../../../src/data/supabase/client';

type FilterPeriod = 'this_month' | 'last_week' | 'custom';
type FilterType = 'all' | 'income' | 'expense';

interface SwipeableItemProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}

function SwipeableItem({ children, onEdit, onDelete, colors }: SwipeableItemProps) {
  const translateX = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, -160));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -80) {
            Animated.spring(translateX, {
              toValue: -160,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateX]
  );

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Actions revealed on swipe left */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            closeSwipe();
            onEdit();
          }}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
          onPress={() => {
            closeSwipe();
            onDelete();
          }}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.swipeableContent,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function TransactionsScreen() {
  const colors = useColors();
  const semantic = useSemanticColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isFamilyMode, familyId } = useFamilyContext();
  const { categories } = useCategories();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('this_month');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterIsFixed, setFilterIsFixed] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Date range for custom filter
  const [dateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  const openModal = useCallback((transaction?: Transaction) => {
    setEditingTransaction(transaction || null);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingTransaction(null);
  }, []);

  const getDateRange = useCallback(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (filterPeriod) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        end = now;
        break;
      case 'custom':
        start = dateRange.start;
        end = dateRange.end;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    return { start, end };
  }, [filterPeriod, dateRange]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('transactions')
        .select('*, categories(*)')
        .order('date', { ascending: false });

      // Apply family mode filter
      if (isFamilyMode && familyId) {
        query = query.eq('family_id', familyId);
      } else {
        query = query.eq('user_id', user.id);
      }

      // Apply period filter
      const { start, end } = getDateRange();
      query = query
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0]);

      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      // Apply category filter
      if (filterCategoryId) {
        query = query.eq('category_id', filterCategoryId);
      }

      // Apply fixed/variable filter
      if (filterIsFixed !== null) {
        query = query.eq('is_fixed', filterIsFixed);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isFamilyMode, familyId, filterPeriod, filterType, filterCategoryId, filterIsFixed, getDateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = useCallback((transaction: Transaction) => {
    Alert.alert(
      'Excluir transação',
      `Excluir "${transaction.description || 'esta transação'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transaction.id);

              if (error) throw error;
              setTransactions(prev => prev.filter(t => t.id !== transaction.id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          },
        },
      ]
    );
  }, []);

  // Filter badge count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterPeriod !== 'this_month') count++;
    if (filterType !== 'all') count++;
    if (filterCategoryId) count++;
    if (filterIsFixed !== null) count++;
    return count;
  }, [filterPeriod, filterType, filterCategoryId, filterIsFixed]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <SwipeableItem
      onEdit={() => openModal(item)}
      onDelete={() => handleDelete(item)}
      colors={colors}
    >
      <TouchableOpacity
        style={[styles.transactionItem, { borderBottomColor: colors.border }]}
        onPress={() => openModal(item)}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceSecondary }]}>
            {item.categories?.icon ? (
              <Ionicons name={item.categories.icon as React.ComponentProps<typeof Ionicons>['name']} size={20} color={item.categories.color || colors.text} />
            ) : (
              <Ionicons name="help-circle-outline" size={20} color={colors.textDisabled} />
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionDescription, { color: colors.text }]} numberOfLines={1}>
              {item.description || 'Sem descrição'}
            </Text>
            <View style={styles.transactionMeta}>
              {item.categories && (
                <View style={styles.categoryBadge}>
                  <View style={[styles.categoryDot, { backgroundColor: item.categories.color }]} />
                  <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>
                    {item.categories.name}
                  </Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: item.is_fixed ? colors.primary + '20' : colors.surfaceSecondary }]}>
                <Text style={[styles.badgeText, { color: item.is_fixed ? colors.primary : colors.textSecondary }]}>
                  {item.is_fixed ? 'Fixo' : 'Variável'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === 'income' ? semantic.income : semantic.expense },
            ]}
          >
            {item.type === 'income' ? '+' : '-'} R$ {Number(item.amount).toFixed(2).replace('.', ',')}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  );

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={colors.textDisabled} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Nenhuma transação encontrada
      </Text>
      {activeFilterCount > 0 && (
        <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
          Tente ajustar os filtros
        </Text>
      )}
    </View>
  ), [colors, activeFilterCount]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 80, paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transações</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: showFilters ? colors.primary : colors.surfaceSecondary }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? '#FFFFFF' : colors.text} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.danger }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Period Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Período</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {[
                  { key: 'this_month', label: 'Este mês' },
                  { key: 'last_week', label: 'Última semana' },
                  { key: 'custom', label: 'Personalizado' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: filterPeriod === opt.key ? colors.primary : colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => setFilterPeriod(opt.key as FilterPeriod)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: filterPeriod === opt.key ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Type Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Tipo</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'income', label: 'Receitas' },
                { key: 'expense', label: 'Despesas' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filterType === opt.key ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => setFilterType(opt.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: filterType === opt.key ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filterCategoryId === null ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => setFilterCategoryId(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: filterCategoryId === null ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    Todas
                  </Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: filterCategoryId === cat.id ? colors.primary : colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => setFilterCategoryId(cat.id)}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: filterCategoryId === cat.id ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Fixed/Variable Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Fixos/Variáveis</Text>
            <View style={styles.filterOptions}>
              {[
                { key: null, label: 'Todos' },
                { key: true, label: 'Fixos' },
                { key: false, label: 'Variáveis' },
              ].map(opt => (
                <TouchableOpacity
                  key={String(opt.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filterIsFixed === opt.key ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => setFilterIsFixed(opt.key as boolean | null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: filterIsFixed === opt.key ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Transaction list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => openModal()}
        activeOpacity={0.7}
        accessibilityLabel="Adicionar nova transação"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        onClose={closeModal}
        onSave={fetchTransactions}
        editingTransaction={editingTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.01,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    minHeight: 36,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  swipeableContent: {
    backgroundColor: 'transparent',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
});
