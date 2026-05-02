// Toast context and provider
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {Animated, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColors} from '../../hooks/useColors';
import {darkColors} from '../../theme/constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

const LIGHT_COLORS: Record<
  ToastType,
  {bg: string; border: string; icon: string}
> = {
  success: {bg: '#ECFDF5', border: '#10B981', icon: '#10B981'},
  error: {bg: '#FEF2F2', border: '#EF4444', icon: '#EF4444'},
  warning: {bg: '#FFFBEB', border: '#F59E0B', icon: '#F59E0B'},
  info: {bg: '#EFF6FF', border: '#3B82F6', icon: '#3B82F6'},
};

const DARK_COLORS: Record<
  ToastType,
  {bg: string; border: string; icon: string}
> = {
  success: {bg: '#0F2F21', border: '#34D399', icon: '#34D399'},
  error: {bg: '#3B1515', border: '#F87171', icon: '#F87171'},
  warning: {bg: '#3B2F15', border: '#FBBF24', icon: '#FBBF24'},
  info: {bg: '#1E3A5F', border: '#60A5FA', icon: '#60A5FA'},
};

const TOAST_DURATION = 3000;

interface ToastItemComponentProps {
  type: ToastType;
  title: string;
  message?: string;
  onDismiss: () => void;
}

function ToastItemComponent({
  type,
  title,
  message,
  onDismiss,
}: ToastItemComponentProps) {
  const colors = useColors();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      dismissToast();
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const dismissToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [translateY, opacity, onDismiss]);

  const isDark = colors.background === darkColors.background;
  const colorSet = isDark ? DARK_COLORS[type] : LIGHT_COLORS[type];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{translateY}],
          opacity,
          backgroundColor: colorSet.bg,
          borderLeftColor: colorSet.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={dismissToast}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: colorSet.bg, borderColor: colorSet.border},
          ]}
        >
          <Ionicons
            name={ICONS[type] as IoniconsName}
            size={20}
            color={colorSet.icon}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.toastTitle, {color: colors.text}]}>{title}</Text>
          {message && (
            <Text style={[styles.toastMessage, {color: colors.textSecondary}]}>
              {message}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({children}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Date.now().toString() + Math.random().toString();
      setToasts(prev => [...prev, {id, type, title, message}]);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => {
      showToast('success', title, message);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast('error', title, message);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast('warning', title, message);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast('info', title, message);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{success, error, warning, info}}>
      {children}
      <View style={styles.toastWrapper} pointerEvents="box-none">
        {toasts.map(toast => (
          <ToastItemComponent
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#1F2937',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
    maxWidth: '90%',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  toastMessage: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    minWidth: 28,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
