import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { GoHideButton } from '@/components/GoHideButton';
import { HideCamera } from '@/components/HideCamera';

export default function HomeScreen() {
  const [cameraOpen, setCameraOpen] = useState(false);

  if (cameraOpen) {
    return <HideCamera onClose={() => setCameraOpen(false)} />;
  }

  return (
    <View style={styles.container}>
      <GoHideButton onPress={() => setCameraOpen(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
