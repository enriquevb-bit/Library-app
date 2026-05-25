import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface Props {
  visible: boolean;
  title: string;
  // single (default) cierra al elegir; multiple deja marcar varios y confirmar
  multiple?: boolean;
  // selección actual con sus etiquetas, para no perder los nombres ya elegidos
  selected: SelectOption[];
  loadOptions: (search: string) => Promise<SelectOption[]>;
  searchPlaceholder?: string;
  emptyText?: string;
  onClose: () => void;
  onConfirm: (items: SelectOption[]) => void;
}

export function SelectModal({
  visible,
  title,
  multiple = false,
  selected,
  loadOptions,
  searchPlaceholder = 'Buscar...',
  emptyText = 'No hay resultados',
  onClose,
  onConfirm,
}: Props) {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState<SelectOption[]>([]);

  const fetchOptions = async (q: string) => {
    setLoading(true);
    try {
      setOptions(await loadOptions(q));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    setTemp(selected);
    fetchOptions('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const isSelected = (id: string) => temp.some((o) => o.id === id);

  const handlePress = (option: SelectOption) => {
    if (!multiple) {
      onConfirm([option]);
      onClose();
      return;
    }
    setTemp((prev) =>
      prev.some((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => fetchOptions(search)}
              returnKeyType="search"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => fetchOptions(search)}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
              renderItem={({ item }) => {
                const checked = isSelected(item.id);
                return (
                  <TouchableOpacity style={styles.row} onPress={() => handlePress(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      {item.sublabel ? <Text style={styles.rowSub}>{item.sublabel}</Text> : null}
                    </View>
                    <Ionicons
                      name={checked ? (multiple ? 'checkbox' : 'radio-button-on') : multiple ? 'square-outline' : 'radio-button-off'}
                      size={22}
                      color={checked ? colors.primary : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {multiple && (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onConfirm(temp);
                onClose();
              }}
            >
              <Text style={styles.confirmText}>
                Confirmar{temp.length > 0 ? ` (${temp.length})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 16,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 15, color: colors.text },
  rowSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 32, fontSize: 15 },
  confirmBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
