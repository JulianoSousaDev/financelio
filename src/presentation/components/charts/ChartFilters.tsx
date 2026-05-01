import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useChartFilters } from '../../../hooks/useChartFilters';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useColors } from '../../../../app/hooks/useColors';
import type { ChartPeriod } from '../../../shared/types';

const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
];

interface DropdownOption {
  id: string;
  name: string;
}

export function ChartFilters() {
  const colors = useColors();
  const { filter, setFilter, resetFilters } = useChartFilters();
  const { isInFamily } = useFamilyContext();

  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Mock family members - in real app would come from context/hooks
  const familyMembers: DropdownOption[] = [
    { id: 'all', name: 'Todos' },
    { id: 'member1', name: 'Membro 1' },
    { id: 'member2', name: 'Membro 2' },
  ];

  // Mock categories - in real app would come from useCategories hook
  const categories: DropdownOption[] = [
    { id: 'all', name: 'Todas' },
    { id: 'cat1', name: 'Alimentação' },
    { id: 'cat2', name: 'Transporte' },
    { id: 'cat3', name: 'Moradia' },
    { id: 'cat4', name: 'Saúde' },
  ];

  const selectedMember = familyMembers.find((m) => m.id === (filter.memberId || 'all'))?.name || 'Todos';
  const selectedCategory = categories.find((c) => c.id === (filter.categoryId || 'all'))?.name || 'Todas';

  const handlePeriodChange = useCallback(
    (period: ChartPeriod) => {
      setFilter({ period });
    },
    [setFilter]
  );

  const handleMemberChange = useCallback(
    (memberId: string) => {
      setFilter({ memberId: memberId === 'all' ? undefined : memberId });
      setShowMemberDropdown(false);
    },
    [setFilter]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setFilter({ categoryId: categoryId === 'all' ? undefined : categoryId });
      setShowCategoryDropdown(false);
    },
    [setFilter]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Period chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Período</Text>
          <View style={styles.chips}>
            {PERIOD_OPTIONS.map((option) => (
              <PeriodChip
                key={option.value}
                label={option.label}
                selected={filter.period === option.value}
                onPress={() => handlePeriodChange(option.value)}
                activeColor={colors.primary}
                inactiveColor={colors.textSecondary}
              />
            ))}
          </View>
        </View>

        {/* Member dropdown - only in family mode */}
        {isInFamily && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Membro</Text>
            <Dropdown
              label={selectedMember}
              show={showMemberDropdown}
              onToggle={() => {
                setShowMemberDropdown(!showMemberDropdown);
                setShowCategoryDropdown(false);
              }}
              options={familyMembers}
              onSelect={handleMemberChange}
              colors={colors}
            />
          </View>
        )}

        {/* Category dropdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categoria</Text>
          <Dropdown
            label={selectedCategory}
            show={showCategoryDropdown}
            onToggle={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowMemberDropdown(false);
            }}
            options={categories}
            onSelect={handleCategoryChange}
            colors={colors}
          />
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={resetFilters}
        >
          <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Limpar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

interface PeriodChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}

function PeriodChip({ label, selected, onPress, activeColor, inactiveColor }: PeriodChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.periodChip,
        {
          backgroundColor: selected ? activeColor : 'transparent',
          borderColor: selected ? activeColor : inactiveColor,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.periodChipText, { color: selected ? '#FFFFFF' : inactiveColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface DropdownProps {
  label: string;
  show: boolean;
  onToggle: () => void;
  options: DropdownOption[];
  onSelect: (id: string) => void;
  colors: ReturnType<typeof useColors>;
}

function Dropdown({ label, show, onToggle, options, onSelect, colors }: DropdownProps) {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
        onPress={onToggle}
      >
        <Text style={[styles.dropdownTriggerText, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

      {show && (
        <View
          style={[
            styles.dropdownMenu,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dropdownItem,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  section: {
    flexDirection: 'column',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    minWidth: 120,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 101,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
