import { Stack } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function HiddenLayout() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerTitle: 'HakooLab',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerRight: () => null, // Remove theme toggle from headers
        headerShown: true, // Show header for calculator screens
      }}
    />
  );
}