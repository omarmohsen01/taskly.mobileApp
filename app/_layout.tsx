import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppColors } from '@/constants/theme';

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

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomDarkTheme}>
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
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
