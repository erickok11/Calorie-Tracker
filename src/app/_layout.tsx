import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

import { FoodProvider } from '@/context/FoodContext';
import { Stack } from "expo-router";
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <FoodProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />

        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false}}
          />
          <Stack.Screen
            name="add-food"
            options={{
              headerShown: false,
              presentation: "modal"
            }}
          />
        </Stack>
      </ThemeProvider>
    </FoodProvider>
  );
}
