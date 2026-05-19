import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLoans, getMyLoans } from '@/services/api';
import { LoanDTO, LoanState } from '@/types';
import { colors, LOAN_STATE_COLORS, LOAN_STATE_LABELS } from '@/constants/theme';
import { useRole } from '@/services/role';

const FILTERS: (LoanState | 'ALL')[] = ['ALL', 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED'];

export default function LoansScreen() {
  const router = useRouter();
  const role = useRole();
  const isAdmin = role === 'ADMIN';
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [filter, setFilter] = useState<LoanState | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadLoans = useCallback(async (pageNum = 0, state: LoanState | 'ALL' = 'ALL', admin = true) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        loanState: state === 'ALL' ? undefined : state,
        pageNumber: pageNum + 1,
        pageSize: 5,
      };
      const data = admin ? await getLoans(params) : await getMyLoans(params);
      setLoans(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message || 'Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (role) loadLoans(0, filter, role === 'ADMIN');
    }, [filter, loadLoans, role])
  );

  const handleFilter = (state: LoanState | 'ALL') => {
    setFilter(state);
    loadLoans(0, state, isAdmin);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages && !loading) {
      loadLoans(pageNum, filter, isAdmin);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('T')[0];
  };

  const renderLoan = ({ item }: { item: LoanDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/loans/${item.id}`)}
    >
      <View style={[styles.stateBar, { backgroundColor: LOAN_STATE_COLORS[item.loanState] }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardMember} numberOfLines={1}>
            {item.member?.name || 'Miembro desconocido'}
          </Text>
          <View style={[styles.badge, { backgroundColor: LOAN_STATE_COLORS[item.loanState] }]}>
            <Text style={styles.badgeText}>{LOAN_STATE_LABELS[item.loanState]}</Text>
          </View>
        </View>
        <Text style={styles.cardDate}>Fecha: {formatDate(item.loanDate)}</Text>
        <Text style={styles.cardDate}>Expira: {formatDate(item.expiringDate)}</Text>
        {item.loanLines && (
          <Text style={styles.cardBooks}>
            {item.loanLines.length} {item.loanLines.length === 1 ? 'libro' : 'libros'}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((state) => (
          <TouchableOpacity
            key={state}
            style={[styles.filterChip, filter === state && styles.filterChipActive]}
            onPress={() => handleFilter(state)}
          >
            <Text style={[styles.filterText, filter === state && styles.filterTextActive]}>
              {state === 'ALL' ? 'Todos' : LOAN_STATE_LABELS[state]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadLoans(0, filter)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={loans}
        keyExtractor={(item) => item.id!}
        renderItem={renderLoan}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No se encontraron préstamos</Text>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null
        }
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => goToPage(page - 1)}
            disabled={page === 0}
          >
            <Ionicons name="chevron-back" size={20} color={page === 0 ? colors.textMuted : '#fff'} />
          </TouchableOpacity>
          <Text style={styles.pageText}>
            {page + 1} / {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageBtn, page + 1 >= totalPages && styles.pageBtnDisabled]}
            onPress={() => goToPage(page + 1)}
            disabled={page + 1 >= totalPages}
          >
            <Ionicons name="chevron-forward" size={20} color={page + 1 >= totalPages ? colors.textMuted : '#fff'} />
          </TouchableOpacity>
        </View>
      )}

      {isAdmin ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/loans/create')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('/loans/create')}
          >
            <Ionicons name="bookmark" size={18} color="#fff" />
            <Text style={styles.primaryActionText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '600' },
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
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMember: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardBooks: { fontSize: 13, color: colors.primary, marginTop: 4, fontWeight: '500' },
  errorBox: {
    backgroundColor: colors.errorLight,
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: { color: colors.error, fontSize: 14 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 15 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 80,
    gap: 16,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
