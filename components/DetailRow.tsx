import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

export function DetailRow({ label, value, highlight }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.value, highlight && { color: colors.error }]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 15, color: colors.textSecondary },
  value: { fontSize: 15, fontWeight: '500', color: colors.text },
});
