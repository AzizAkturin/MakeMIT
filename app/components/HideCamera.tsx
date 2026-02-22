import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function HideCamera({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View style={styles.fill} />;

  if (!permission.granted) {
    return (
      <View style={styles.fill}>
        <Text style={styles.message}>Camera permission is needed.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" />
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    alignSelf: 'stretch',
  },
  fill: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
