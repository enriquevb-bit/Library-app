import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuthor, createAuthor, updateAuthor } from '@/services/api';
import { AuthorDTO } from '@/types';
import { colors } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const [year, month, day] = s.split('-').map(Number);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

export default function AuthorFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;
  const { alert } = useConfirm();

  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [version, setVersion] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing) loadExisting();
  }, [id]);

  const loadExisting = async () => {
    try {
      const author = await getAuthor(id!);
      setFullName(author.fullName);
      setNationality(author.nationality || '');
      setBirthDate(author.birthDate || '');
      setVersion(author.version);
    } catch {
      alert({ title: 'Error', message: 'No se pudo cargar el autor' });
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      alert({ title: 'Error', message: 'El nombre es obligatorio' });
      return;
    }

    const trimmedDate = birthDate.trim();
    if (trimmedDate && !isValidIsoDate(trimmedDate)) {
      alert({ title: 'Error', message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD (ej. 1950-05-01).' });
      return;
    }

    const author: AuthorDTO = {
      fullName: fullName.trim(),
      nationality: nationality.trim() || undefined,
      birthDate: trimmedDate || undefined,
      version,
    };

    setLoading(true);
    try {
      if (isEditing) await updateAuthor(id!, author);
      else await createAuthor(author);
      router.back();
    } catch (e) {
      alert({ title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="J.R.R. Tolkien" placeholderTextColor={colors.textMuted} maxLength={50} />

        <Text style={styles.label}>Nacionalidad</Text>
        <TextInput style={styles.input} value={nationality} onChangeText={setNationality} placeholder="Británico" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} maxLength={10} />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Guardar cambios' : 'Crear autor'}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
