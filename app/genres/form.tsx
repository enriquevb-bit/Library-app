import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getGenre, createGenre, updateGenre } from '@/services/api';
import { GenreDTO } from '@/types';
import { colors } from '@/constants/theme';

export default function GenreFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing) loadExisting();
  }, [id]);

  const loadExisting = async () => {
    try {
      const genre = await getGenre(id!);
      setName(genre.name);
      setDescription(genre.description || '');
      setVersion(genre.version);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el género');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    const genre: GenreDTO = {
      name: name.trim(),
      description: description.trim() || undefined,
      version,
    };

    setLoading(true);
    try {
      if (isEditing) await updateGenre(id!, genre);
      else await createGenre(genre);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Fantasía" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción del género..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Guardar cambios' : 'Crear género'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
