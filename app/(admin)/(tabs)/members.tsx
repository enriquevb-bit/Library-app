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
import { getMembers } from '@/services/api';
import { MemberDTO, MemberState } from '@/types';
import { colors, MEMBER_STATE_COLORS, MEMBER_STATE_LABELS } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyList } from '@/components/EmptyList';
import { Pagination } from '@/components/Pagination';
import { Fab } from '@/components/Fab';

const FILTERS: (MemberState | 'ALL')[] = ['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'INACTIVE'];

export default function AdminMembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemberState | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadMembers = useCallback(async (pageNum = 0, name = '', state: MemberState | 'ALL' = 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers({
        name: name || undefined,
        memberState: state === 'ALL' ? undefined : state,
        pageNumber: pageNum + 1,
        pageSize: 5,
      });
      setMembers(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar miembros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMembers(0, search, filter);
    }, [search, filter, loadMembers])
  );

  const handleFilter = (state: MemberState | 'ALL') => {
    setFilter(state);
    loadMembers(0, search, state);
  };

  const goToPage = (pageNum: number) => {
    if (!loading) {
      loadMembers(pageNum, search, filter);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  const renderMember = ({ item }: { item: MemberDTO }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/members/${item.id}`)}>
      <View style={[styles.avatar, { backgroundColor: MEMBER_STATE_COLORS[item.memberState] + '20' }]}>
        <Ionicons name="person" size={24} color={MEMBER_STATE_COLORS[item.memberState]} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: MEMBER_STATE_COLORS[item.memberState] }]}>
        <Text style={styles.badgeText}>{MEMBER_STATE_LABELS[item.memberState]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={() => loadMembers(0, search, filter)}
        placeholder="Buscar por nombre..."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((state) => (
          <TouchableOpacity
            key={state}
            style={[styles.filterChip, filter === state && styles.filterChipActive]}
            onPress={() => handleFilter(state)}
          >
            <Text style={[styles.filterText, filter === state && styles.filterTextActive]}>
              {state === 'ALL' ? 'Todos' : MEMBER_STATE_LABELS[state]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && <ErrorBox message={error} onRetry={() => loadMembers(0, search, filter)} />}

      <FlatList
        ref={listRef}
        data={members}
        keyExtractor={(item) => item.id!}
        renderItem={renderMember}
        ListEmptyComponent={!loading ? <EmptyList text="No se encontraron miembros" /> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
      />

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} disabled={loading} />

      <Fab onPress={() => router.push('/members/form')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { paddingHorizontal: 12, paddingBottom: 14, flexGrow: 0, flexShrink: 0 },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
