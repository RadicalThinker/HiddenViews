# Phase 1: Project Setup & Core Infrastructure

## 🎯 Phase Overview

**Duration**: 1-2 weeks  
**Priority**: Critical Foundation  
**Goal**: Establish the complete project foundation, development environment, and core infrastructure for the HiddenViews mobile application.

## 📋 Phase Objectives

### **Primary Deliverables**
1. Complete Expo React Native project setup
2. Development environment configuration
3. Core navigation structure implementation
4. Authentication system foundation
5. API client and data layer setup
6. UI design system and theming
7. Basic project structure and architecture

### **Success Criteria**
- [ ] Project builds successfully on both iOS and Android
- [ ] Navigation flows between screens work correctly
- [ ] Authentication context and API client are functional
- [ ] Theme system supports light/dark modes
- [ ] Code quality tools are configured and working
- [ ] Development workflow is established

## 🛠️ Technical Implementation

### **1. Project Initialization**

#### **Create Expo Project**
```bash
# Initialize new Expo project with TypeScript template
npx create-expo-app HiddenViewsMobile --template blank-typescript

# Navigate to project directory
cd HiddenViewsMobile

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query axios
npm install react-hook-form @hookform/resolvers zod
npm install expo-secure-store expo-constants expo-status-bar
npm install nativewind tailwindcss react-native-reanimated
npm install @expo/vector-icons react-native-gesture-handler

# Install development dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

#### **Configure app.json**
```json
{
  "expo": {
    "name": "HiddenViews",
    "slug": "hiddenviews-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#080808"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hiddenviews.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#080808"
      },
      "package": "com.hiddenviews.mobile"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ]
  }
}
```

### **2. Project Structure Setup**

#### **Create Directory Structure**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── forms/           # Form components
│   └── common/          # Common components
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── dashboard/      # Dashboard screens
│   └── events/         # Event-related screens
├── navigation/          # Navigation configuration
├── services/           # API and external services
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── constants/          # App constants
├── types/              # TypeScript type definitions
└── assets/             # Images, fonts, etc.
```

#### **Create Core Files**
```bash
# Create directory structure
mkdir -p src/{components/{ui,forms,common},screens/{auth,dashboard,events},navigation,services,contexts,hooks,utils,constants,types,assets}

# Create index files
touch src/components/index.ts
touch src/screens/index.ts
touch src/navigation/index.ts
touch src/services/index.ts
touch src/contexts/index.ts
touch src/hooks/index.ts
touch src/utils/index.ts
touch src/constants/index.ts
touch src/types/index.ts
```

### **3. TypeScript Configuration**

#### **Configure tsconfig.json**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/screens/*": ["src/screens/*"],
      "@/navigation/*": ["src/navigation/*"],
      "@/services/*": ["src/services/*"],
      "@/contexts/*": ["src/contexts/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/constants/*": ["src/constants/*"],
      "@/types/*": ["src/types/*"],
      "@/assets/*": ["src/assets/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

#### **Create Type Definitions**
```typescript
// src/types/index.ts
export interface User {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  theme: 'light' | 'dark' | 'system';
  profileStats: {
    totalEvents: number;
    totalReviews: number;
    totalQueries: number;
    averageRating: number;
  };
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventType: 'Workshop' | 'Course' | 'Webinar' | 'Meeting' | 'Project' | 'Other';
  slug: string;
  isActive: boolean;
  createdAt: string;
  settings: {
    isAcceptingReviews: boolean;
    isAcceptingQueries: boolean;
    requireEmail: boolean;
    customMessage?: string;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    totalQueries: number;
    resolvedQueries: number;
  };
}

export interface Review {
  _id: string;
  content: string;
  rating: number;
  createdAt: string;
  senderEmail?: string;
}

export interface Query {
  _id: string;
  content: string;
  category: string;
  createdAt: string;
  isResolved: boolean;
  reply?: {
    content: string;
    createdAt: string;
  };
  senderEmail?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetails: { slug: string };
  CreateEvent: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Events: undefined;
  Analytics: undefined;
  Profile: undefined;
};
```

### **4. Constants and Configuration**

#### **App Constants**
```typescript
// src/constants/index.ts
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://hiddenreviews.yashcore.app/api',
  TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

export const COLORS = {
  light: {
    primary: '#5227FF',
    secondary: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    primary: '#5227FF',
    secondary: '#9CA3AF',
    background: '#080808',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: 'normal' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: 'normal' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: 'normal' as const, lineHeight: 16 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const EVENT_TYPES = [
  'Workshop',
  'Course', 
  'Webinar',
  'Meeting',
  'Project',
  'Other'
] as const;

export const QUERY_CATEGORIES = [
  'General',
  'Technical',
  'Feedback',
  'Other'
] as const;
```

### **5. API Client Setup**

#### **API Service Configuration**
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, STORAGE_KEYS } from '@/constants';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
          // Navigate to login screen - will be handled by auth context
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async signIn(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/signin', { email, password });
    return response.data;
  }

  async signUp(username: string, email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/sign-up', { username, email, password });
    return response.data;
  }

  async verifyEmail(email: string, code: string): Promise<ApiResponse> {
    const response = await this.client.post('/verify-code', { email, code });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/reset-password', { token, password });
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/profile', data);
    return response.data;
  }

  // Event endpoints
  async getEvents(): Promise<ApiResponse> {
    const response = await this.client.get('/events');
    return response.data;
  }

  async getEvent(slug: string): Promise<ApiResponse> {
    const response = await this.client.get(`/events/${slug}`);
    return response.data;
  }

  async createEvent(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/events', data);
    return response.data;
  }

  async updateEvent(slug: string, data: any): Promise<ApiResponse> {
    const response = await this.client.put(`/events/${slug}`, data);
    return response.data;
  }

  async deleteEvent(slug: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/events/${slug}`);
    return response.data;
  }

  // Anonymous feedback endpoints
  async submitReview(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/send-review', data);
    return response.data;
  }

  async submitQuery(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/send-query', data);
    return response.data;
  }

  async getPublicQueries(slug: string): Promise<ApiResponse> {
    const response = await this.client.get(`/public-queries/${slug}`);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(eventId?: string): Promise<ApiResponse> {
    const url = eventId ? `/ai-analytics?eventId=${eventId}` : '/ai-analytics';
    const response = await this.client.get(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### **6. Authentication Context**

#### **Auth Context Implementation**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/services/api';
import { User, ApiResponse } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Verify token is still valid
        try {
          const response = await apiClient.getProfile();
          if (response.success) {
            setUser(response.data);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
          }
        } catch (error) {
          // Token is invalid, clear stored data
          await signOut();
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        setUser(user);
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.signUp(username, email, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await apiClient.verifyEmail(email, code);
      
      if (!response.success) {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await apiClient.forgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiClient.resetPassword(token, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **7. Theme Context**

#### **Theme Context Implementation**
```typescript
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, STORAGE_KEYS } from '@/constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof COLORS.light;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();
  const colors = COLORS[effectiveTheme];
  const isDark = effectiveTheme === 'dark';

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### **8. Navigation Setup**

#### **Navigation Configuration**
```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '@/types';

// Import screens (will be created in later phases)
import { LoadingScreen } from '@/screens/LoadingScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { EventsScreen } from '@/screens/events/EventsScreen';
import { AnalyticsScreen } from '@/screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  const { colors } = useTheme();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <MainTab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <MainTab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### **9. Basic UI Components**

#### **Button Component**
```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textSecondary : colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.border : colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? colors.textSecondary : colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: disabled ? colors.textSecondary : colors.text,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), leftIcon && { marginLeft: 8 }, rightIcon && { marginRight: 8 }]}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
```

### **10. Code Quality Configuration**

#### **ESLint Configuration**
```json
// .eslintrc.js
module.exports = {
  extends: [
    'expo',
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
  },
};
```

#### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### **11. Main App Component**

#### **App.tsx**
```typescript
// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppNavigator } from '@/navigation/AppNavigator';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## 📋 Phase 1 Checklist

### **Setup & Configuration**
- [ ] Expo project initialized with TypeScript template
- [ ] All core dependencies installed and configured
- [ ] Project directory structure created
- [ ] TypeScript configuration completed
- [ ] ESLint and Prettier configured

### **Core Infrastructure**
- [ ] API client service implemented
- [ ] Authentication context created and functional
- [ ] Theme context implemented with light/dark support
- [ ] Navigation structure configured
- [ ] Type definitions created for all data models

### **Basic Components**
- [ ] Button component implemented with variants
- [ ] Loading screen component created
- [ ] Basic screen placeholders created
- [ ] Theme system working across components

### **Development Environment**
- [ ] Project builds successfully on iOS simulator
- [ ] Project builds successfully on Android emulator
- [ ] Hot reload working correctly
- [ ] TypeScript compilation without errors
- [ ] Linting passes without errors

### **Testing**
- [ ] Basic navigation flow tested
- [ ] Theme switching functionality tested
- [ ] API client connection tested (mock responses)
- [ ] Authentication context state management tested

## 🎯 Success Metrics

### **Technical Metrics**
- [ ] Build time < 30 seconds for development builds
- [ ] TypeScript compilation with 0 errors
- [ ] ESLint passes with 0 errors, < 5 warnings
- [ ] App startup time < 3 seconds on device
- [ ] Memory usage < 100MB on app launch

### **Code Quality Metrics**
- [ ] 100% TypeScript coverage for new code
- [ ] Consistent code formatting via Prettier
- [ ] Proper error handling in all async operations
- [ ] Comprehensive type definitions for all interfaces
- [ ] Clean architecture with proper separation of concerns

## 🚀 Next Steps

Upon completion of Phase 1, you will have:
- A fully configured React Native Expo project
- Complete development environment setup
- Core infrastructure and architecture in place
- Basic navigation and theming working
- Foundation for building all app features

**Ready for Phase 2**: Authentication screens and user management functionality.

This phase establishes the critical foundation that all subsequent phases will build upon. Ensure all checklist items are completed before proceeding to Phase 2.