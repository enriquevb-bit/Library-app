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
import { getAuthor, deleteAuthor } from '@/services/api';
import { AuthorDTO } from '@/types';
import { colors } from '@/constants/theme';

export default function AuthorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [author, setAuthor] = useState<AuthorDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadAuthor(); }, [id]);

  const loadAuthor = async () => {
    setLoading(true);
    setError(null);
    try {
      setAuthor(await getAuthor(id!));
    } catch (e: any) {
      setError(e.message || 'Error al cargar el autor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar autor', `¿Seguro que quieres eliminar a "${author?.fullName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await deleteAuthor(id!); router.back(); }
          catch (e: any) { Alert.alert('Error', e.message || 'No se pudo eliminar'); }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (error || !author) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Autor no encontrado'}</Text>
        <TouchableOpacity onPress={loadAuthor}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>{author.fullName}</Text>
      </View>

      <View style={styles.section}>
        <DetailRow label="Nacionalidad" value={author.nationality || 'N/A'} />
        <DetailRow label="Fecha de nacimiento" value={author.birthDate || 'N/A'} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push({ pathname: '/authors/form', params: { id: author.id } })}
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
    alignItems: 'center', paddingVertical: 24, backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12 },
  section: {
    backgroundColor: colors.surface, marginTop: 12, marginHorizontal: 12, borderRadius: 10,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  label: { fontSize: 15, color: colors.textSecondary },
  value: { fontSize: 15, fontWeight: '500', color: colors.text },
  actions: {
    flexDirection: 'row', justifyContent: 'center', gap: 12,
    marginTop: 24, paddingHorizontal: 16, paddingBottom: 32,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, gap: 8,
  },
  editBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.error },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
