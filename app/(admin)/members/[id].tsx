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
import { getMember, deleteMember } from '@/services/api';
import { MemberDTO } from '@/types';
import { colors, MEMBER_STATE_COLORS, MEMBER_STATE_LABELS } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';
import { DetailRow } from '@/components/DetailRow';

export default function AdminMemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { confirm, alert } = useConfirm();
  const [member, setMember] = useState<MemberDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMember(id!);
      setMember(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el miembro');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Eliminar miembro',
      message: `¿Seguro que quieres eliminar a "${member?.name}"?`,
      confirmLabel: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteMember(id!);
          router.back();
        } catch (e) {
          alert({ title: 'Error', message: e instanceof Error ? e.message : 'No se pudo eliminar' });
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Miembro no encontrado'}</Text>
        <TouchableOpacity onPress={loadMember}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatarLarge, { backgroundColor: MEMBER_STATE_COLORS[member.memberState] + '20' }]}>
          <Ionicons name="person" size={48} color={MEMBER_STATE_COLORS[member.memberState]} />
        </View>
        <Text style={styles.title}>{member.name}</Text>
        <View style={[styles.badge, { backgroundColor: MEMBER_STATE_COLORS[member.memberState] }]}>
          <Text style={styles.badgeText}>{MEMBER_STATE_LABELS[member.memberState]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <DetailRow label="Email" value={member.email} />
        <DetailRow label="Estado" value={MEMBER_STATE_LABELS[member.memberState]} />
        <DetailRow label="Fecha de registro" value={member.registerDate?.split('T')[0] || 'N/A'} />
      </View>

      <View style={styles.actions}>
        {member.memberState === 'ACTIVE' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.loanBtn]}
            onPress={() => router.push({ pathname: '/loans/create', params: { memberId: member.id } })}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Nuevo préstamo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push({ pathname: '/members/form', params: { id: member.id } })}
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
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  loanBtn: { backgroundColor: colors.primary },
  editBtn: { backgroundColor: colors.accent },
  deleteBtn: { backgroundColor: colors.error },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
