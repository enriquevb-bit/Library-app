import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMembers } from '@/services/api';
import { MemberDTO } from '@/types';
import { colors, MEMBER_STATE_COLORS, MEMBER_STATE_LABELS } from '@/constants/theme';

export default function MembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadMembers = useCallback(async (pageNum = 0, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers({
        name: name || undefined,
        pageNumber: pageNum + 1,
        pageSize: 5,
      });
      setMembers(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message || 'Error al cargar miembros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMembers(0, search);
    }, [search, loadMembers])
  );

  const handleSearch = () => {
    loadMembers(0, search);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages && !loading) {
      loadMembers(pageNum, search);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  const renderMember = ({ item }: { item: MemberDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/members/${item.id}`)}
    >
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
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadMembers(0, search)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={members}
        keyExtractor={(item) => item.id!}
        renderItem={renderMember}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No se encontraron miembros</Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/members/form')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
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
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
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
});
