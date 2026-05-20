// src/navigation/index.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  createStackNavigator, 
  CardStyleInterpolators, 
  TransitionPresets,
  StackNavigationOptions 
} from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, Text } from 'react-native';

// Import screens
import HomeScreen from '../screens/Home';
import JobApplicationScreen from '../screens/JobApplication';
import JobApplicationForm from '../screens/JobApplicationForm';
import CVScreen from '../screens/CV';
import CVForm from '../screens/CVForm';
import ResignationScreen from '../screens/Resignation';
import ResignationForm from '../screens/ResignationForm';
import PreviewScreen from '../screens/Preview';
import theme from '../theme';

// Define navigation types
export type RootStackParamList = {
  Main: undefined;
  JobApplicationForm: { draftId?: string };
  CVForm: { draftId?: string };
  ResignationForm: { draftId?: string };
  Preview: { documentType: 'jobApplication' | 'cv' | 'resignation', data: any, fromJobApplicationForm?: boolean };
};

export type MainTabParamList = {
  Home: undefined;
  JobApplication: undefined;
  CV: undefined;
  Resignation: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Common transition configuration for smooth animations
const transitionConfig: StackNavigationOptions = Platform.select({
  ios: {
    ...TransitionPresets.SlideFromRightIOS,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    gestureEnabled: true,
  },
  android: {
    ...TransitionPresets.FadeFromBottomAndroid,
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
    gestureEnabled: true,
  },
}) || {};

// Custom TabBar to handle safe area insets
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      flexDirection: 'row', 
      backgroundColor: 'white',
      paddingBottom: Math.max(insets.bottom, 8), // Add padding based on safe area, minimum 8
      borderTopWidth: 1,
      borderTopColor: theme.colors.light,
      elevation: 8,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: -2 },
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon component
        const Icon = options.tabBarIcon ? 
          options.tabBarIcon({ 
            color: isFocused ? theme.colors.primary : theme.colors.medium, 
            size: 24,
            focused: isFocused 
          }) : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              paddingVertical: 8,
            }}
          >
            {Icon}
            <Text 
              style={{ 
                color: isFocused ? theme.colors.primary : theme.colors.medium, 
                fontSize: 12,
                fontWeight: '500',
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Bottom tab navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.medium,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        // Smooth tab animation
        tabBarItemStyle: {
          padding: 4,
        },
        // Improves transition experience
        lazy: false,
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="JobApplication" 
        component={JobApplicationScreen} 
        options={{
          title: 'Surat Lamaran',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="CV" 
        component={CVScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-details" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Resignation" 
        component={ResignationScreen} 
        options={{
          title: 'Pengunduran Diri',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="exit-to-app" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator (without NavigationContainer)
const AppNavigation = () => {
  return (
    <Stack.Navigator
      detachInactiveScreens={false} // This prop needs to be here, not in screenOptions
      screenOptions={{
        headerShown: false,
        ...transitionConfig,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="JobApplicationForm" 
        component={JobApplicationForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CVForm" 
        component={CVForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ResignationForm" 
        component={ResignationForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Preview" 
        component={PreviewScreen} 
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS, // Different animation for preview
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigation;