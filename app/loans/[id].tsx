import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLoan, returnLoan, deleteLoan } from '@/services/api';
import { LoanDTO } from '@/types';
import { colors, LOAN_STATE_COLORS, LOAN_STATE_LABELS } from '@/constants/theme';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
      const data = await getLoan(id!);
      setLoan(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    Alert.alert(
      'Devolver préstamo',
      '¿Confirmar la devolución de este préstamo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Devolver',
          onPress: async () => {
            try {
              await returnLoan(id!);
              loadLoan();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo devolver');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar préstamo',
      '¿Seguro que quieres eliminar este préstamo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(id!);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('T')[0];
  };

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
        <DetailRow label="Miembro" value={loan.member?.name || 'N/A'} />
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

      <View style={styles.actions}>
        {(loan.loanState === 'ACTIVE' || loan.loanState === 'OVERDUE') && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.returnBtn]}
            onPress={handleReturn}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Devolver préstamo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 12,
  },
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 15, color: colors.textSecondary },
  value: { fontSize: 15, fontWeight: '500', color: colors.text },
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  returnBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.error },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
