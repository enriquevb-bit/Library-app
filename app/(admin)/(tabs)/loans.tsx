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
import { getLoans } from '@/services/api';
import { LoanDTO, LoanState } from '@/types';
import { colors, LOAN_STATE_LABELS } from '@/constants/theme';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyList } from '@/components/EmptyList';
import { Pagination } from '@/components/Pagination';
import { LoanCard } from '@/components/LoanCard';
import { Fab } from '@/components/Fab';

const FILTERS: (LoanState | 'ALL')[] = ['ALL', 'RESERVED', 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED'];

export default function AdminLoansScreen() {
  const router = useRouter();
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [filter, setFilter] = useState<LoanState | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadLoans = useCallback(async (pageNum = 0, state: LoanState | 'ALL' = 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoans({
        loanState: state === 'ALL' ? undefined : state,
        pageNumber: pageNum + 1,
        pageSize: 5,
      });
      setLoans(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLoans(0, filter);
    }, [filter, loadLoans])
  );

  const handleFilter = (state: LoanState | 'ALL') => {
    setFilter(state);
    loadLoans(0, state);
  };

  const goToPage = (pageNum: number) => {
    if (!loading) {
      loadLoans(pageNum, filter);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

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

      {error && <ErrorBox message={error} onRetry={() => loadLoans(0, filter)} />}

      <FlatList
        ref={listRef}
        data={loans}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <LoanCard loan={item} onPress={() => router.push(`/loans/${item.id}`)} />
        )}
        ListEmptyComponent={!loading ? <EmptyList text="No se encontraron préstamos" /> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
      />

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} disabled={loading} />

      <Fab onPress={() => router.push('/loans/create')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 0, flexShrink: 0 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '600' },
});
