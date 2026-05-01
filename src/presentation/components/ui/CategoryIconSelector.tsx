import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../../app/hooks/useColors';

const ICONS = ['home', 'egg', 'truck', 'heart', 'film', 'book', 'credit-card', 'briefcase', 'dots-horizontal', 'shopping', 'car', 'medical', 'flight', 'gift', 'star'];

interface CategoryIconSelectorProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export function CategoryIconSelector({ selected, onSelect }: CategoryIconSelectorProps) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity 
        style={[styles.trigger, { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          borderWidth: 1,
        }]} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name={selected as React.ComponentProps<typeof Ionicons>['name']} size={20} color={colors.text} />
        <Text style={[styles.triggerText, { color: colors.text }]}>{selected}</Text>
      </TouchableOpacity>
      
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="fade"
      >
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: colors.overlay }]} 
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.grid, { backgroundColor: colors.surface }]}>
            {ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconBtn, 
                  { 
                    backgroundColor: selected === icon ? colors.primary : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => { onSelect(icon); setModalVisible(false); }}
                accessibilityLabel={`Selecionar ícone ${icon}`}
              >
                <Ionicons 
                  name={icon as React.ComponentProps<typeof Ionicons>['name']} 
                  size={24} 
                  color={selected === icon ? '#FFFFFF' : colors.text} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 12, 
    borderRadius: 10,
    gap: 8,
  },
  triggerText: { 
    fontSize: 14,
  },
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: 260, 
    borderRadius: 14, 
    padding: 12,
    zIndex: 1000,
  },
  iconBtn: { 
    width: 52, 
    height: 52, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 10, 
    margin: 4 
  },
  iconText: { 
    fontSize: 12,
  },
});
