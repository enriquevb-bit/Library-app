import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoanDTO } from '@/types';
import { colors, LOAN_STATE_COLORS, LOAN_STATE_LABELS } from '@/constants/theme';

interface Props {
  loan: LoanDTO;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.stateBar, { backgroundColor: LOAN_STATE_COLORS[loan.loanState] }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.member} numberOfLines={1}>
            {loan.member?.name || 'Miembro desconocido'}
          </Text>
          <View style={[styles.badge, { backgroundColor: LOAN_STATE_COLORS[loan.loanState] }]}>
            <Text style={styles.badgeText}>{LOAN_STATE_LABELS[loan.loanState]}</Text>
          </View>
        </View>
        <Text style={styles.date}>Fecha: {formatDate(loan.loanDate)}</Text>
        <Text style={styles.date}>Expira: {formatDate(loan.expiringDate)}</Text>
        {loan.loanLines && (
          <Text style={styles.books}>
            {loan.loanLines.length} {loan.loanLines.length === 1 ? 'libro' : 'libros'}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return dateStr.split('T')[0];
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateBar: { width: 4, alignSelf: 'stretch' },
  content: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  member: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  books: { fontSize: 13, color: colors.primary, marginTop: 4, fontWeight: '500' },
});
