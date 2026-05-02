import React, {useRef, useEffect} from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Animated,
  Easing,
  Keyboard,
  BackHandler,
} from 'react-native';
import {useColors} from '../../hooks/useColors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  accessibilityLabel?: string;
}

export function Modal({
  visible,
  onClose,
  children,
  isLoading = false,
  accessibilityLabel = 'Modal',
}: ModalProps) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const modalRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {}
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {}
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => subscription.remove();
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <Pressable
        onPress={onClose}
        style={[styles.backdropPressable, {backgroundColor: colors.overlay}]}
        accessibilityLabel="Fechar modal"
        accessibilityRole="button"
      />

      <Animated.View
        ref={modalRef}
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
            backgroundColor: colors.surface,
          },
        ]}
        accessibilityViewIsModal
        accessible
        accessibilityLabel={accessibilityLabel}
      >
        <Pressable
          onPress={onClose}
          style={[styles.closeButton, {backgroundColor: colors.primary}]}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <View style={styles.content}>
          {children}
          {isLoading && (
            <View
              style={[styles.loadingOverlay, {backgroundColor: colors.overlay}]}
            >
              <Text style={[styles.loadingText, {color: colors.text}]}>
                Carregando...
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '85%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  content: {
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 20,
    marginTop: -2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 16,
  },
});
