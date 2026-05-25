import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

type AlertOptions = {
  title: string;
  message: string;
  okLabel?: string;
  onDismiss?: () => void | Promise<void>;
};

function BaseDialog({
  visible,
  title,
  message,
  onRequestClose,
  children,
}: {
  visible: boolean;
  title: string;
  message: string;
  onRequestClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmDialog({
  visible,
  opts,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  opts: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BaseDialog
      visible={visible}
      title={opts?.title ?? ''}
      message={opts?.message ?? ''}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.button} onPress={onCancel}>
        <Text style={styles.cancelText}>{opts?.cancelLabel ?? 'Cancelar'}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onConfirm}>
        <Text style={[styles.confirmText, opts?.destructive && styles.destructive]}>
          {opts?.confirmLabel ?? 'Aceptar'}
        </Text>
      </Pressable>
    </BaseDialog>
  );
}

function AlertDialog({
  visible,
  opts,
  onDismiss,
}: {
  visible: boolean;
  opts: AlertOptions | null;
  onDismiss: () => void;
}) {
  return (
    <BaseDialog
      visible={visible}
      title={opts?.title ?? ''}
      message={opts?.message ?? ''}
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.button} onPress={onDismiss}>
        <Text style={styles.confirmText}>{opts?.okLabel ?? 'Aceptar'}</Text>
      </Pressable>
    </BaseDialog>
  );
}

type Ctx = {
  confirm: (opts: ConfirmOptions) => void;
  alert: (opts: AlertOptions) => void;
};

const ConfirmCtx = createContext<Ctx | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [alertOpts, setAlertOpts] = useState<AlertOptions | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmOpts(opts);
    setConfirmVisible(true);
  }, []);

  const alert = useCallback((opts: AlertOptions) => {
    setAlertOpts(opts);
    setAlertVisible(true);
  }, []);

  // Solo cerramos visibilidad; el contenido (opts) se mantiene para que durante
  // el fade-out del Modal no parpadeen labels ni el estilo destructive.
  const handleConfirm = async () => {
    setConfirmVisible(false);
    if (confirmOpts) await confirmOpts.onConfirm();
  };

  const handleDismiss = async () => {
    setAlertVisible(false);
    if (alertOpts?.onDismiss) await alertOpts.onDismiss();
  };

  return (
    <ConfirmCtx.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmDialog
        visible={confirmVisible}
        opts={confirmOpts}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
      <AlertDialog
        visible={alertVisible}
        opts={alertOpts}
        onDismiss={handleDismiss}
      />
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm: missing ConfirmProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 8 },
  message: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, lineHeight: 21 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  cancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  confirmText: { fontSize: 15, color: colors.primary, fontWeight: '700' },
  destructive: { color: colors.error },
});
