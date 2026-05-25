import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyLoan } from '@/services/api';
import { LoanDTO } from '@/types';
import { colors, LOAN_STATE_COLORS, LOAN_STATE_LABELS } from '@/constants/theme';
import { DetailRow } from '@/components/DetailRow';

export default function MemberLoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loan, setLoan] = useState<LoanDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyLoan(id!);
      setLoan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => (dateStr ? dateStr.split('T')[0] : 'N/A');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !loan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Préstamo no encontrado'}</Text>
        <TouchableOpacity onPress={loadLoan}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: LOAN_STATE_COLORS[loan.loanState] + '20' }]}>
          <Ionicons name="swap-horizontal" size={40} color={LOAN_STATE_COLORS[loan.loanState]} />
        </View>
        <View style={[styles.badge, { backgroundColor: LOAN_STATE_COLORS[loan.loanState] }]}>
          <Text style={styles.badgeText}>{LOAN_STATE_LABELS[loan.loanState]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del préstamo</Text>
        <DetailRow label="Fecha del préstamo" value={formatDate(loan.loanDate)} />
        <DetailRow label="Fecha de expiración" value={formatDate(loan.expiringDate)} />
        <DetailRow label="Fecha de devolución" value={formatDate(loan.dueDate)} />
      </View>

      {loan.loanLines && loan.loanLines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Libros prestados</Text>
          {loan.loanLines.map((line, index) => (
            <View key={line.id || index} style={styles.loanLineRow}>
              <Ionicons name="book-outline" size={18} color={colors.primary} />
              <View style={styles.loanLineContent}>
                <Text style={styles.loanLineTitle} numberOfLines={1}>
                  {line.book?.title || 'Libro desconocido'}
                </Text>
                <Text style={styles.loanLineDetail}>
                  Cantidad: {line.orderedQuantity}
                  {line.returnedQuantity != null ? ` | Devueltos: ${line.returnedQuantity}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, marginTop: 12 },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  loanLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 10,
  },
  loanLineContent: { flex: 1 },
  loanLineTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  loanLineDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
