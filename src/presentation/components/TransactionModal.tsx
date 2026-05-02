import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColors} from '../hooks/useColors';
import {Modal as CustomModal} from './ui/Modal';
import {Input} from './ui/Input';
import {CategoryIconSelector} from './ui/CategoryIconSelector';
import {useCategories} from '../hooks/useCategories';
import {useFamilyMode} from '../hooks/useFamilyMode';
import {useAuth} from '../contexts/AuthContext';
import {supabase} from '../../data/supabase/client';
import type {Transaction} from '../../shared/types';

const COLOR_PALETTE = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
];

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editingTransaction?: Transaction | null;
}

// Simple date picker component
function SimpleDatePicker({
  value,
  onChange,
  colors,
}: {
  value: Date;
  onChange: (date: Date) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  const years = Array.from(
    {length: 5},
    (_, i) => new Date().getFullYear() - 2 + i
  );
  const months = [
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

  const days = Array.from({length: 31}, (_, i) => i + 1);

  const handleConfirm = () => {
    onChange(selectedDate);
    setShowPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.text} />
        <Text style={[styles.dateText, {color: colors.text}]}>
          {value.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={[styles.pickerOverlay, {backgroundColor: colors.overlay}]}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View
            style={[styles.pickerContainer, {backgroundColor: colors.surface}]}
          >
            <Text style={[styles.pickerTitle, {color: colors.text}]}>
              Selecione a data
            </Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text
                  style={[styles.pickerLabel, {color: colors.textSecondary}]}
                >
                  Dia
                </Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            selectedDate.getDate() === day
                              ? colors.primary
                              : 'transparent',
                        },
                      ]}
                      onPress={() =>
                        setSelectedDate(new Date(selectedDate.setDate(day)))
                      }
                    >
                      <Text
                        style={{
                          color:
                            selectedDate.getDate() === day
                              ? '#FFFFFF'
                              : colors.text,
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text
                  style={[styles.pickerLabel, {color: colors.textSecondary}]}
                >
                  Mês
                </Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {months.map((month, idx) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            selectedDate.getMonth() === idx
                              ? colors.primary
                              : 'transparent',
                        },
                      ]}
                      onPress={() =>
                        setSelectedDate(new Date(selectedDate.setMonth(idx)))
                      }
                    >
                      <Text
                        style={{
                          color:
                            selectedDate.getMonth() === idx
                              ? '#FFFFFF'
                              : colors.text,
                        }}
                      >
                        {month.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text
                  style={[styles.pickerLabel, {color: colors.textSecondary}]}
                >
                  Ano
                </Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            selectedDate.getFullYear() === year
                              ? colors.primary
                              : 'transparent',
                        },
                      ]}
                      onPress={() =>
                        setSelectedDate(
                          new Date(selectedDate.setFullYear(year))
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            selectedDate.getFullYear() === year
                              ? '#FFFFFF'
                              : colors.text,
                        }}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={[styles.pickerBtn, {borderColor: colors.border}]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={{color: colors.textSecondary}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerBtn, {backgroundColor: colors.primary}]}
                onPress={handleConfirm}
              >
                <Text style={{color: '#FFFFFF', fontWeight: '600'}}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function TransactionModal({
  visible,
  onClose,
  onSave,
  editingTransaction,
}: TransactionModalProps) {
  const colors = useColors();
  const {user} = useAuth();
  const {isFamilyMode, familyId} = useFamilyMode();
  const {categories, create} = useCategories();

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [date, setDate] = useState(new Date());
  const [isFixed, setIsFixed] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    'weekly' | 'monthly'
  >('monthly');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{description?: string; amount?: string}>(
    {}
  );

  // New category inline creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState('home');

  // Reset form when modal opens/closes or editing transaction changes
  useEffect(() => {
    if (visible) {
      if (editingTransaction) {
        setDescription(editingTransaction.description || '');
        setAmount(String(editingTransaction.amount));
        setType(editingTransaction.type);
        setSelectedCategoryId(editingTransaction.category_id || null);
        setDate(new Date(editingTransaction.date));
        setIsFixed(editingTransaction.is_fixed || false);
        setIsRecurring(editingTransaction.is_recurring);
        setRecurringFrequency(
          (editingTransaction.recurring_interval as 'weekly' | 'monthly') ||
            'monthly'
        );
      } else {
        resetForm();
      }
    }
  }, [visible, editingTransaction]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setSelectedCategoryId(null);
    setDate(new Date());
    setIsFixed(false);
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setErrors({});
    setShowNewCategory(false);
    setNewCategoryName('');
    setNewCategoryColor(COLOR_PALETTE[0]);
    setNewCategoryIcon('home');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: {description?: string; amount?: string} = {};
    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Valor inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate() || !user) return;

    setIsSaving(true);
    try {
      const transactionData: Record<string, unknown> = {
        user_id: user.id,
        type,
        amount: parseFloat(amount.replace(',', '.')),
        description: description.trim() || null,
        category_id: selectedCategoryId,
        date: date.toISOString().split('T')[0],
        is_fixed: isFixed,
      };

      // Include family_id when in family mode
      if (isFamilyMode && familyId) {
        transactionData.family_id = familyId;
      }

      if (editingTransaction) {
        const {error} = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        if (error) throw error;
      } else {
        const {error} = await supabase
          .from('transactions')
          .insert([transactionData]);
        if (error) throw error;
      }

      handleClose();
      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    user,
    type,
    amount,
    description,
    selectedCategoryId,
    date,
    isRecurring,
    recurringFrequency,
    isFixed,
    isFamilyMode,
    familyId,
    editingTransaction,
    onSave,
  ]);

  const handleAmountChange = (text: string) => {
    // Allow only numbers and comma/period
    const cleaned = text.replace(/[^0-9.,]/g, '');
    setAmount(cleaned);
  };

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await create(
        newCategoryName,
        newCategoryColor,
        newCategoryIcon
      );
      setShowNewCategory(false);
      setNewCategoryName('');
      setNewCategoryColor(COLOR_PALETTE[0]);
      setNewCategoryIcon('home');
    } catch (e) {
      console.error('Error creating category:', e);
    }
  };

  const filteredCategories = categories.filter(
    c => (c as Record<string, unknown>).type === type
  );

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      isLoading={isSaving}
      accessibilityLabel={
        editingTransaction ? 'Editar transação' : 'Nova transação'
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.modalTitle, {color: colors.text}]}>
          {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        </Text>

        {/* Description */}
        <Input
          label="Descrição"
          placeholder="Digite a descrição"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
        />

        {/* Amount */}
        <Input
          label="Valor"
          placeholder="R$ 0,00"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          error={errors.amount}
        />

        {/* Type Toggle */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Tipo:</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    type === 'income'
                      ? colors.success
                      : colors.surfaceSecondary,
                  borderColor:
                    type === 'income' ? colors.success : colors.border,
                },
              ]}
              onPress={() => setType('income')}
            >
              <Ionicons
                name={type === 'income' ? 'arrow-up' : 'arrow-up-outline'}
                size={18}
                color={type === 'income' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  {color: type === 'income' ? '#FFFFFF' : colors.textSecondary},
                ]}
              >
                Receita
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    type === 'expense'
                      ? colors.danger
                      : colors.surfaceSecondary,
                  borderColor:
                    type === 'expense' ? colors.danger : colors.border,
                },
              ]}
              onPress={() => setType('expense')}
            >
              <Ionicons
                name={type === 'expense' ? 'arrow-down' : 'arrow-down-outline'}
                size={18}
                color={type === 'expense' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      type === 'expense' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                Despesa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Categoria:</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategoryId === null
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    selectedCategoryId === null
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedCategoryId(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      selectedCategoryId === null
                        ? '#FFFFFF'
                        : colors.textSecondary,
                  },
                ]}
              >
                Sem categoria
              </Text>
            </TouchableOpacity>
            {filteredCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategoryId === cat.id
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      selectedCategoryId === cat.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <View
                  style={[styles.categoryDot, {backgroundColor: cat.color}]}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        selectedCategoryId === cat.id
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.categoryChip,
                styles.addCategoryChip,
                {borderColor: colors.primary},
              ]}
              onPress={() => setShowNewCategory(true)}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.categoryChipText, {color: colors.primary}]}>
                Nova
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Data:</Text>
          <SimpleDatePicker
            value={date}
            onChange={handleDateChange}
            colors={colors}
          />
        </View>

        {/* Fixed / Variable Toggle */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: colors.text}]}>
            Fixos ou Variáveis:
          </Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isFixed
                    ? colors.primary
                    : colors.surfaceSecondary,
                  borderColor: isFixed ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setIsFixed(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {color: isFixed ? '#FFFFFF' : colors.textSecondary},
                ]}
              >
                Fixo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: !isFixed
                    ? colors.primary
                    : colors.surfaceSecondary,
                  borderColor: !isFixed ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setIsFixed(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {color: !isFixed ? '#FFFFFF' : colors.textSecondary},
                ]}
              >
                Variável
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recurring Toggle */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Recorrente?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isRecurring
                    ? colors.primary
                    : colors.surfaceSecondary,
                  borderColor: isRecurring ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setIsRecurring(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {color: isRecurring ? '#FFFFFF' : colors.textSecondary},
                ]}
              >
                Sim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: !isRecurring
                    ? colors.primary
                    : colors.surfaceSecondary,
                  borderColor: !isRecurring ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setIsRecurring(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {color: !isRecurring ? '#FFFFFF' : colors.textSecondary},
                ]}
              >
                Não
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recurring Frequency */}
        {isRecurring && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, {color: colors.text}]}>
              Frequência:
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      recurringFrequency === 'weekly'
                        ? colors.primary
                        : colors.surfaceSecondary,
                    borderColor:
                      recurringFrequency === 'weekly'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setRecurringFrequency('weekly')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        recurringFrequency === 'weekly'
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Semanal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      recurringFrequency === 'monthly'
                        ? colors.primary
                        : colors.surfaceSecondary,
                    borderColor:
                      recurringFrequency === 'monthly'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setRecurringFrequency('monthly')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        recurringFrequency === 'monthly'
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Mensal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, {borderColor: colors.border}]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelText, {color: colors.textSecondary}]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, {backgroundColor: colors.primary}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveText}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inline New Category Modal */}
        {showNewCategory && (
          <View
            style={[
              styles.newCategoryOverlay,
              {backgroundColor: colors.overlay},
            ]}
          >
            <View
              style={[
                styles.newCategoryContainer,
                {backgroundColor: colors.surface},
              ]}
            >
              <View style={styles.newCategoryHeader}>
                <Text style={[styles.newCategoryTitle, {color: colors.text}]}>
                  Nova Categoria
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Input
                label="Nome"
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />

              <Text style={[styles.colorLabel, {color: colors.textSecondary}]}>
                Cor
              </Text>
              <View style={styles.colorRow}>
                {COLOR_PALETTE.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorOption,
                      {backgroundColor: c},
                      newCategoryColor === c && styles.colorSelected,
                    ]}
                    onPress={() => setNewCategoryColor(c)}
                  />
                ))}
              </View>

              <Text style={[styles.colorLabel, {color: colors.textSecondary}]}>
                Ícone
              </Text>
              <CategoryIconSelector
                selected={newCategoryIcon}
                onSelect={setNewCategoryIcon}
              />

              <View style={styles.newCategoryActions}>
                <TouchableOpacity
                  style={[styles.newCategoryBtn, {borderColor: colors.border}]}
                  onPress={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  <Text style={{color: colors.textSecondary}}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.newCategoryBtn,
                    {backgroundColor: colors.primary},
                  ]}
                  onPress={handleCreateCategory}
                >
                  <Text style={{color: '#FFFFFF', fontWeight: '600'}}>
                    Criar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 44,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 44,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    minHeight: 44,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New category inline styles
  newCategoryOverlay: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  newCategoryContainer: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  newCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  newCategoryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  newCategoryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
  },
  addCategoryChip: {
    borderStyle: 'dashed',
  },
  // SimpleDatePicker styles
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 180,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
  },
});
