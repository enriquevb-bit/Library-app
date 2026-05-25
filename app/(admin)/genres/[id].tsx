import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getGenre, deleteGenre } from '@/services/api';
import { GenreDTO } from '@/types';
import { colors } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';
import { DetailRow } from '@/components/DetailRow';

export default function GenreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { confirm, alert } = useConfirm();
  const [genre, setGenre] = useState<GenreDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadGenre(); }, [id]);

  const loadGenre = async () => {
    setLoading(true);
    setError(null);
    try {
      setGenre(await getGenre(id!));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el género');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Eliminar género',
      message: `¿Seguro que quieres eliminar "${genre?.name}"?`,
      confirmLabel: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteGenre(id!);
          router.back();
        } catch (e) {
          alert({ title: 'Error', message: e instanceof Error ? e.message : 'No se pudo eliminar' });
        }
      },
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (error || !genre) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Género no encontrado'}</Text>
        <TouchableOpacity onPress={loadGenre}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconLarge}>
          <Ionicons name="pricetag" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>{genre.name}</Text>
      </View>

      <View style={styles.section}>
        <DetailRow label="Nombre" value={genre.name} />
        <DetailRow label="Descripción" value={genre.description || 'Sin descripción'} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push({ pathname: '/genres/form', params: { id: genre.id } })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
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
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12 },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 24, paddingHorizontal: 16, paddingBottom: 32 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, gap: 8 },
  editBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.error },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
