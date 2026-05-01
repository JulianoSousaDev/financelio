import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../src/presentation/hooks/useColors';
import { useCategories } from '../../../src/presentation/hooks/useCategories';
import { Modal } from '../../../src/presentation/components/ui/Modal';
import { Input } from '../../../src/presentation/components/ui/Input';
import { CategoryIconSelector } from '../../../src/presentation/components/ui/CategoryIconSelector';
import { Button } from '../../../src/presentation/components/ui/Button';
import { Category } from '../../../src/data/supabase/categories';

const COLOR_PALETTE = ['#EF4444','#F97316','#EAB308','#22C55E','#10B981','#06B6D4','#3B82F6','#8B5CF6','#EC4899','#6B7280'];

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, loading, create, update, remove, refetch } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState('home');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const openCreate = () => { setEditing(null); setName(''); setColor(COLOR_PALETTE[0]); setIcon('home'); setModalVisible(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setName(cat.name); setColor(cat.color); setIcon(cat.icon); setModalVisible(true); };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'Nome é obrigatório'); return; }
    try {
      if (editing) await update(editing.id, name, color, icon);
      else await create(name, color, icon);
      setModalVisible(false);
    } catch (e) { Alert.alert('Erro', (e as Error).message); }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Excluir categoria', `Excluir "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove(cat.id) },
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]} 
      onPress={() => openEdit(item)}
    >
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 80, paddingTop: insets.top + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textSecondary }]}>Nenhuma categoria</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
      
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        onPress={openCreate}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{editing ? 'Editar' : 'Nova'} Categoria</Text>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Nome da categoria" />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Cor</Text>
          <View style={styles.colorRow}>
            {COLOR_PALETTE.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[
                  styles.colorOption, 
                  { backgroundColor: c }, 
                  color === c && [styles.colorSelected, { borderColor: colors.text }]
                ]} 
                onPress={() => setColor(c)} 
              />
            ))}
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Ícone</Text>
          <CategoryIconSelector selected={icon} onSelect={setIcon} />
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} />
            <Button title="Salvar" variant="primary" onPress={handleSave} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, letterSpacing: -0.01 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  colorDot: { width: 24, height: 24, borderRadius: 12, marginRight: 12 },
  itemName: { flex: 1, fontSize: 16 },
  deleteBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  fab: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    width: 56, 
    height: 56, 
    borderRadius: 9999, // full
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginTop: -2 },
  modalContent: { padding: 8 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  label: { fontSize: 14, marginTop: 16, marginBottom: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
