import React, { useState, useEffect } from 'react';
import { StatusBar, Platform, useColorScheme, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, Theme, DefaultTheme } from '@react-navigation/native';
import AppNavigation from './src/navigation';
import { lightTheme, darkTheme } from './src/theme';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

// Suppress specific warnings to keep console clean
LogBox.ignoreLogs([
  'Animated: `useNativeDriver`',
  'Non-serializable values were found in the navigation state',
]);

// Enhanced navigation theme with better transition settings
const enhancedLightNavTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text,
    border: lightTheme.colors.disabled,
    notification: lightTheme.colors.primary,
  },
};

const enhancedDarkNavTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.text,
    border: darkTheme.colors.disabled,
    notification: darkTheme.colors.primary,
  },
};

export default function App() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Load resources
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Artificial delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Handle app ready state
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  // Use the appropriate theme based on colorScheme
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navTheme = colorScheme === 'dark' ? enhancedDarkNavTheme : enhancedLightNavTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar 
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
          <NavigationContainer theme={navTheme}>
            <AppNavigation />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}