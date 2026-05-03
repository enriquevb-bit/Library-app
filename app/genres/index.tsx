import { useState, useCallback } from 'react';
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
import { getGenres } from '@/services/api';
import { GenreDTO } from '@/types';
import { colors } from '@/constants/theme';

export default function GenresScreen() {
  const router = useRouter();
  const [genres, setGenres] = useState<GenreDTO[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGenres = useCallback(async (pageNum = 0, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGenres({
        name: name || undefined,
        pageNumber: pageNum + 1,
        pageSize: 10,
      });
      setGenres(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message || 'Error al cargar géneros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGenres(0, search);
    }, [search, loadGenres])
  );

  const handleSearch = () => loadGenres(0, search);

  const loadMore = () => {
    if (page + 1 < totalPages && !loading) {
      loadGenres(page + 1, search);
    }
  };

  const renderGenre = ({ item }: { item: GenreDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/genres/${item.id}`)}
    >
      <View style={styles.icon}>
        <Ionicons name="pricetag" size={22} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        {item.description && (
          <Text style={styles.cardSub} numberOfLines={2}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
          <TouchableOpacity onPress={() => loadGenres(0, search)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={genres}
        keyExtractor={(item) => item.id!}
        renderItem={renderGenre}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No se encontraron géneros</Text> : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/genres/form')}
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
    flex: 1, backgroundColor: colors.surface, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  searchBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  icon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary,
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  errorBox: { backgroundColor: colors.errorLight, margin: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  errorText: { color: colors.error, fontSize: 14 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 15 },
});
