import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/src/hooks/useSession';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: 'Custom', minutes: 0 },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LockScreen() {
  const { status, connection, error, isStarting, isStopping, start, stop } =
    useSession();

  const [selectedPreset, setSelectedPreset] = useState<number>(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  // ── Derived state ────────────────────────────────────────────────────────────
  const sessionMinutes = isCustom ? (parseInt(customMinutes, 10) || 0) : selectedPreset;
  const isLocked = status?.locked ?? false;
  const isConnected = connection === 'connected';
  const isBusy = isStarting || isStopping;

  // ── Colors ───────────────────────────────────────────────────────────────────
  const C = {
    bg: dark ? '#0d0d14' : '#f0f4f8',
    card: dark ? '#17172b' : '#ffffff',
    border: dark ? '#2a2a45' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1a1a2e',
    sub: dark ? '#8892a4' : '#64748b',
    primary: '#6366f1',
    locked: '#f43f5e',
    unlocked: '#10b981',
    warn: '#f59e0b',
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function handlePreset(minutes: number, custom: boolean) {
    setIsCustom(custom);
    if (!custom) setSelectedPreset(minutes);
  }

  async function handleStart() {
    if (sessionMinutes <= 0) {
      Alert.alert('Invalid Duration', 'Please choose or enter a duration greater than 0 minutes.');
      return;
    }
    await start(sessionMinutes);
  }

  function handleStop() {
    Alert.alert(
      'End Session Early?',
      'This will unlock the device before the timer runs out.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlock Now', style: 'destructive', onPress: () => void stop() },
      ],
    );
  }

  // ── Connection dot ────────────────────────────────────────────────────────────
  const dotColor =
    connection === 'connected' ? C.unlocked :
    connection === 'error'     ? C.locked   : C.warn;

  const connectionLabel =
    connection === 'connected' ? 'Connected' :
    connection === 'error'     ? 'Disconnected' : 'Connecting…';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: C.text }]}>PhoneLock</Text>
            <View style={[styles.connectionPill, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={[styles.connectionLabel, { color: C.sub }]}>{connectionLabel}</Text>
            </View>
          </View>

          {/* ── Status card ──────────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isLocked ? '#f43f5e18' : '#10b98118' },
              ]}
            >
              <Text style={styles.lockEmoji}>{isLocked ? '🔒' : '🔓'}</Text>
            </View>

            <Text style={[styles.lockLabel, { color: isLocked ? C.locked : C.unlocked }]}>
              {isLocked ? 'LOCKED' : 'UNLOCKED'}
            </Text>

            {isLocked && status != null && (
              <>
                <Text style={[styles.countdown, { color: C.text }]}>
                  {formatTime(status.remainingSeconds)}
                </Text>
                <Text style={[styles.countdownSub, { color: C.sub }]}>remaining</Text>
              </>
            )}

            {!isLocked && (
              <Text style={[styles.idleHint, { color: C.sub }]}>
                Choose a duration and start a session.
              </Text>
            )}
          </View>

          {/* ── Error banner ─────────────────────────────────────────────────── */}
          {error != null && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          {/* ── Duration picker (only when unlocked) ─────────────────────────── */}
          {!isLocked && (
            <View style={[styles.card, styles.pickerCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.sectionLabel, { color: C.sub }]}>SESSION DURATION</Text>

              <View style={styles.presetRow}>
                {PRESETS.map((p) => {
                  const active = p.minutes === 0
                    ? isCustom
                    : !isCustom && selectedPreset === p.minutes;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? C.primary : C.bg,
                          borderColor: active ? C.primary : C.border,
                        },
                      ]}
                      onPress={() => handlePreset(p.minutes, p.minutes === 0)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.chipText, { color: active ? '#fff' : C.text }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isCustom && (
                <View style={[styles.customRow, { borderColor: C.border }]}>
                  <TextInput
                    style={[styles.customInput, { color: C.text, borderColor: C.border, backgroundColor: C.bg }]}
                    placeholder="0"
                    placeholderTextColor={C.sub}
                    keyboardType="number-pad"
                    value={customMinutes}
                    onChangeText={setCustomMinutes}
                    maxLength={3}
                    returnKeyType="done"
                  />
                  <Text style={[styles.customSuffix, { color: C.sub }]}>minutes</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Action button ────────────────────────────────────────────────── */}
          <View style={styles.actionSection}>
            {isLocked ? (
              <TouchableOpacity
                style={[styles.btn, styles.stopBtn]}
                onPress={handleStop}
                disabled={isBusy || !isConnected}
                activeOpacity={0.8}
              >
                {isStopping
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>End Session Early</Text>
                }
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: C.primary },
                  (!isConnected || sessionMinutes <= 0) && styles.btnDisabled,
                ]}
                onPress={() => void handleStart()}
                disabled={isBusy || !isConnected || sessionMinutes <= 0}
                activeOpacity={0.8}
              >
                {isStarting
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <Text style={styles.btnText}>
                      {sessionMinutes > 0
                        ? `Start ${sessionMinutes} min Session`
                        : 'Start Session'}
                    </Text>
                  )
                }
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.footer, { color: C.sub }]}>
            Pi IP → src/config.ts › API_BASE_URL
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Cards
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
  },
  pickerCard: {
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Lock status
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockEmoji: {
    fontSize: 44,
  },
  lockLabel: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  countdown: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -2,
    lineHeight: 68,
  },
  countdownSub: {
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  idleHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Error
  errorBanner: {
    backgroundColor: '#f43f5e22',
    borderWidth: 1,
    borderColor: '#f43f5e55',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 13,
    lineHeight: 18,
  },

  // Duration picker
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  customInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    width: 90,
    textAlign: 'center',
  },
  customSuffix: {
    fontSize: 16,
  },

  // Action button
  actionSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  btn: {
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#f43f5e',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
