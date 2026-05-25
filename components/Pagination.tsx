import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, onChange, disabled }: Props) {
  if (totalPages <= 1) return null;

  const prevDisabled = disabled || page === 0;
  const nextDisabled = disabled || page + 1 >= totalPages;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, prevDisabled && styles.btnDisabled]}
        onPress={() => onChange(page - 1)}
        disabled={prevDisabled}
      >
        <Ionicons name="chevron-back" size={20} color={prevDisabled ? colors.textMuted : '#fff'} />
      </TouchableOpacity>
      <Text style={styles.text}>{page + 1} / {totalPages}</Text>
      <TouchableOpacity
        style={[styles.btn, nextDisabled && styles.btnDisabled]}
        onPress={() => onChange(page + 1)}
        disabled={nextDisabled}
      >
        <Ionicons name="chevron-forward" size={20} color={nextDisabled ? colors.textMuted : '#fff'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 80,
    gap: 16,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  text: { fontSize: 15, fontWeight: '600', color: colors.text },
});
