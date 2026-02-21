import React from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, FETCH_TIMEOUT_MS, POLL_INTERVAL_MS } from '@/src/config';

// ─── Info rows ────────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  value: string;
  mono?: boolean;
  cardBg: string;
  borderColor: string;
  textColor: string;
  subColor: string;
}

function InfoRow({ label, value, mono, cardBg, borderColor, textColor, subColor }: RowProps) {
  return (
    <View style={[styles.row, { backgroundColor: cardBg, borderColor }]}>
      <Text style={[styles.rowLabel, { color: subColor }]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          { color: textColor },
          mono && { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
        ]}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const dark = useColorScheme() === 'dark';

  const C = {
    bg: dark ? '#0d0d14' : '#f0f4f8',
    card: dark ? '#17172b' : '#ffffff',
    border: dark ? '#2a2a45' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1a1a2e',
    sub: dark ? '#8892a4' : '#64748b',
    primary: '#6366f1',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={[styles.title, { color: C.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: C.sub }]}>
          Current configuration — edit{' '}
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
            src/config.ts
          </Text>{' '}
          to change values.
        </Text>

        {/* Config section */}
        <Text style={[styles.sectionHeader, { color: C.sub }]}>CONFIGURATION</Text>

        <InfoRow
          label="Pi API Base URL"
          value={API_BASE_URL}
          mono
          cardBg={C.card}
          borderColor={C.border}
          textColor={C.text}
          subColor={C.sub}
        />
        <InfoRow
          label="Poll Interval"
          value={`${POLL_INTERVAL_MS} ms`}
          cardBg={C.card}
          borderColor={C.border}
          textColor={C.text}
          subColor={C.sub}
        />
        <InfoRow
          label="Fetch Timeout"
          value={`${FETCH_TIMEOUT_MS} ms`}
          cardBg={C.card}
          borderColor={C.border}
          textColor={C.text}
          subColor={C.sub}
        />

        {/* How-to card */}
        <Text style={[styles.sectionHeader, { color: C.sub }]}>HOW TO CONNECT</Text>

        <View style={[styles.howToCard, { backgroundColor: C.card, borderColor: C.border }]}>
          {HOW_TO_STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: C.primary + '22' }]}>
                <Text style={[styles.stepNumText, { color: C.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: C.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Endpoints reference */}
        <Text style={[styles.sectionHeader, { color: C.sub }]}>API ENDPOINTS</Text>

        {ENDPOINTS.map((ep) => (
          <View key={ep.path} style={[styles.epCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.epHeader}>
              <View style={[styles.methodBadge, { backgroundColor: ep.method === 'GET' ? '#10b98122' : '#6366f122' }]}>
                <Text style={[styles.method, { color: ep.method === 'GET' ? '#10b981' : '#818cf8' }]}>
                  {ep.method}
                </Text>
              </View>
              <Text
                style={[
                  styles.epPath,
                  { color: C.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
                ]}
              >
                {ep.path}
              </Text>
            </View>
            <Text style={[styles.epDesc, { color: C.sub }]}>{ep.desc}</Text>
            {ep.body != null && (
              <Text
                style={[
                  styles.epBody,
                  { color: C.sub, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
                ]}
              >
                {ep.body}
              </Text>
            )}
          </View>
        ))}

        {/* GitHub link */}
        <TouchableOpacity
          style={[styles.githubBtn, { borderColor: C.border }]}
          onPress={() => void Linking.openURL('https://github.com/AzizAkturin/MakeMIT')}
          activeOpacity={0.7}
        >
          <Text style={[styles.githubText, { color: C.sub }]}>View on GitHub →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const HOW_TO_STEPS = [
  'Make sure your phone and Raspberry Pi are on the same Wi-Fi network.',
  'On the Pi, run `hostname -I` to get its local IP address.',
  'Open app/src/config.ts and set API_BASE_URL to http://<PI_IP>:<PORT>.',
  'Save the file — Expo will hot-reload with the new URL.',
];

const ENDPOINTS: { method: string; path: string; desc: string; body?: string }[] = [
  {
    method: 'POST',
    path: '/session/start',
    desc: 'Starts a session and physically locks the device.',
    body: 'Body: { "minutes": number }',
  },
  {
    method: 'GET',
    path: '/session/status',
    desc: 'Returns current lock state and time remaining.',
    body: 'Returns: { "locked": bool, "remainingSeconds": number }',
  },
  {
    method: 'POST',
    path: '/session/stop',
    desc: 'Immediately unlocks the device (override).',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },

  title: { fontSize: 26, fontWeight: '800', marginBottom: 6, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 28 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 4,
  },

  // InfoRow
  row: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  rowValue: { fontSize: 15, fontWeight: '500' },

  // How-to
  howToCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Endpoints
  epCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  epHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  method: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  epPath: { fontSize: 14, fontWeight: '600' },
  epDesc: { fontSize: 13, lineHeight: 18 },
  epBody: { fontSize: 12, lineHeight: 17 },

  // GitHub
  githubBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  githubText: { fontSize: 14, fontWeight: '600' },
});
