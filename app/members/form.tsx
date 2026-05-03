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
import { getMember, createMember, updateMember } from '@/services/api';
import { MemberDTO, MemberState } from '@/types';
import { colors, MEMBER_STATE_LABELS } from '@/constants/theme';

const STATES: MemberState[] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'INACTIVE'];

export default function MemberFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberState, setMemberState] = useState<MemberState>('PENDING');
  const [version, setVersion] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadExistingMember();
    }
  }, [id]);

  const loadExistingMember = async () => {
    try {
      const member = await getMember(id!);
      setName(member.name);
      setEmail(member.email);
      setMemberState(member.memberState);
      setVersion(member.version);
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo cargar el miembro');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Rellena nombre y email');
      return;
    }

    const member: MemberDTO = {
      name: name.trim(),
      email: email.trim(),
      memberState,
      version,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updateMember(id!, member);
      } else {
        await createMember(member);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre completo"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@ejemplo.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Estado</Text>
        <View style={styles.stateRow}>
          {STATES.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.stateChip,
                memberState === state && styles.stateChipActive,
              ]}
              onPress={() => setMemberState(state)}
            >
              <Text
                style={[
                  styles.stateChipText,
                  memberState === state && styles.stateChipTextActive,
                ]}
              >
                {MEMBER_STATE_LABELS[state]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {isEditing ? 'Guardar cambios' : 'Crear miembro'}
            </Text>
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
  stateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateChipText: { fontSize: 13, color: colors.textSecondary },
  stateChipTextActive: { color: '#fff', fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
