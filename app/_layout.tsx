import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { AppColors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-store';

// Custom dark theme matching our design
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: AppColors.accent,
    background: AppColors.background,
    card: AppColors.cardBackground,
    text: AppColors.white,
    border: AppColors.border,
    notification: AppColors.accent,
  },
};

export const unstable_settings = {
  initialRouteName: '(auth)',
};

/** Redirects unauthenticated users to (auth) and authenticated users away from (auth). */
function AuthGuard() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // still hydrating — wait

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Not logged in → send to welcome screen
      router.replace('/(auth)/welcome');
    } else if (token && inAuthGroup) {
      // Already logged in → send to main app
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={CustomDarkTheme}>
        <AuthGuard />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: AppColors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-task"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="task-details"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="packages"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="subscription-success"
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="create-workspace"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="create-space"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="create-folder"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}
