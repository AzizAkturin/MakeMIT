import { Pressable, Text, StyleSheet } from 'react-native';

export function GoHideButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>Go Hide</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
