import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { clearToken, getStoredEmail } from '@/services/auth';
import { getMyMember } from '@/services/api';
import { useConfirm } from '@/services/confirm';

export default function MemberMoreScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    getStoredEmail().then(setEmail);
    getMyMember().then(m => setMemberName(m.name)).catch(() => {});
  }, []);

  const handleLogout = () => {
    confirm({
      title: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
      destructive: true,
      onConfirm: async () => {
        await clearToken();
        router.replace('/login');
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.userBox}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{email ?? '—'}</Text>
          <Text style={styles.userRole}>{memberName ?? 'Miembro'}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={colors.error} />
        <Text style={[styles.menuText, { color: colors.error }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 15, fontWeight: '600', color: colors.text },
  userRole: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuText: { flex: 1, fontSize: 16, color: colors.text, marginLeft: 12 },
  logoutItem: { marginTop: 24 },
});
