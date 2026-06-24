# HiddenViews Mobile App Development Guide

## 📱 Project Overview

This document provides comprehensive instructions for creating a React Native Expo mobile application for the HiddenViews web platform. The mobile app will provide native iOS and Android experiences while maintaining feature parity with the web application.

## 🎯 Mobile App Objectives

### **Primary Goals**
- Create native mobile apps for iOS and Android
- Maintain 100% feature parity with web application
- Provide superior mobile user experience
- Enable offline functionality for core features
- Implement push notifications for real-time updates
- Optimize for mobile-specific interactions and gestures

### **Target Platforms**
- **iOS**: iOS 13.0+ (iPhone 6s and newer)
- **Android**: Android 7.0+ (API level 24+)
- **Expo SDK**: Version 50+ for latest features and stability

## 🏗️ Technical Architecture

### **Core Technology Stack**
```typescript
// Mobile Development Stack
- React Native (via Expo)
- TypeScript for type safety
- Expo SDK 50+
- React Navigation 6 for navigation
- React Query for state management and caching
- AsyncStorage for local data persistence
- Expo SecureStore for sensitive data
- React Hook Form + Zod for form validation
- NativeWind for styling (Tailwind CSS for React Native)
```

### **Key Dependencies**
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "expo-secure-store": "~12.8.0",
    "expo-notifications": "~0.27.0",
    "expo-camera": "~14.1.0",
    "expo-image-picker": "~14.7.0",
    "nativewind": "^2.0.11",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0"
  }
}
```

## 📊 Data Architecture & API Integration

### **API Client Configuration**
```typescript
// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://hiddenreviews.yashcore.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);
```

### **Data Models (TypeScript Interfaces)**
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
```

## 🧭 Navigation Architecture

### **Navigation Structure**
```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Stack Navigator Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetails: { slug: string };
  CreateEvent: undefined;
  Settings: undefined;
  Profile: undefined;
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

// Navigation Components
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
```

### **Tab Navigation Configuration**
```typescript
// Bottom tab navigation with custom icons and styling
function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
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
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5227FF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Dashboard" component={DashboardScreen} />
      <MainTab.Screen name="Events" component={EventsScreen} />
      <MainTab.Screen name="Analytics" component={AnalyticsScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}
```

## 🎨 UI/UX Design System

### **Design Principles**
- **Native Feel**: Use platform-specific design patterns
- **Consistent Branding**: Maintain HiddenViews visual identity
- **Accessibility**: Support screen readers and accessibility features
- **Performance**: Smooth 60fps animations and interactions
- **Responsive**: Adapt to different screen sizes and orientations

### **Color System**
```typescript
// src/constants/Colors.ts
export const Colors = {
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
```

### **Typography System**
```typescript
// src/constants/Typography.ts
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};
```

## 🔐 Authentication System

### **Authentication Flow**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signin', { email, password });
    const { user, token } = response.data;
    
    await SecureStore.setItemAsync('auth_token', token);
    setUser(user);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **Biometric Authentication**
```typescript
// src/services/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  static async authenticate(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access HiddenViews',
      fallbackLabel: 'Use passcode',
    });
    return result.success;
  }

  static async enableBiometricLogin(token: string): Promise<void> {
    const isAuthenticated = await this.authenticate();
    if (isAuthenticated) {
      await SecureStore.setItemAsync('biometric_token', token);
    }
  }

  static async getBiometricToken(): Promise<string | null> {
    const isAuthenticated = await this.authenticate();
    if (isAuthenticated) {
      return await SecureStore.getItemAsync('biometric_token');
    }
    return null;
  }
}
```

## 📱 Core Screen Components

### **Dashboard Screen**
```typescript
// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '../components/StatsCard';
import { EventCard } from '../components/EventCard';
import { CreateEventFAB } from '../components/CreateEventFAB';

export function DashboardScreen() {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/events').then(res => res.data.events),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.get('/profile-summary').then(res => res.data.stats),
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        className="flex-1"
      >
        {/* Stats Overview */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-text mb-4">Dashboard</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatsCard
              title="Total Events"
              value={stats?.totalEvents || 0}
              icon="calendar"
              color="blue"
            />
            <StatsCard
              title="Total Reviews"
              value={stats?.totalReviews || 0}
              icon="star"
              color="yellow"
            />
            <StatsCard
              title="Total Queries"
              value={stats?.totalQueries || 0}
              icon="message-circle"
              color="green"
            />
            <StatsCard
              title="Avg Rating"
              value={stats?.averageRating?.toFixed(1) || '0.0'}
              icon="trending-up"
              color="purple"
            />
          </View>
        </View>

        {/* Recent Events */}
        <View className="p-4">
          <Text className="text-xl font-semibold text-text mb-3">Recent Events</Text>
          {events?.map((event: Event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </View>
      </ScrollView>

      <CreateEventFAB />
    </View>
  );
}
```

### **Event Details Screen**
```typescript
// src/screens/EventDetailsScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { ReviewForm } from '../components/ReviewForm';
import { QueryForm } from '../components/QueryForm';
import { QASection } from '../components/QASection';

type Props = {
  route: RouteProp<RootStackParamList, 'EventDetails'>;
  navigation: StackNavigationProp<RootStackParamList, 'EventDetails'>;
};

export function EventDetailsScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [activeTab, setActiveTab] = useState<'review' | 'query' | 'qa'>('review');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => apiClient.get(`/events/${slug}`).then(res => res.data.event),
  });

  const shareEvent = async () => {
    const url = `https://hiddenreviews.yashcore.app/e/${slug}`;
    await Share.share({
      message: `Check out this event: ${event?.title}\n${url}`,
      url,
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Event Header */}
        <View className="p-4 border-b border-border">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">{event?.title}</Text>
              <Text className="text-textSecondary mt-1">{event?.description}</Text>
            </View>
            <TouchableOpacity onPress={shareEvent} className="ml-3">
              <Ionicons name="share-outline" size={24} color="#5227FF" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center gap-4 mt-3">
            <Badge text={event?.eventType} />
            <StarRating rating={event?.stats.averageRating} readonly />
            <Text className="text-textSecondary">
              {event?.stats.totalReviews} reviews
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-surface">
          <TabButton
            title="Review"
            active={activeTab === 'review'}
            onPress={() => setActiveTab('review')}
            disabled={!event?.settings.isAcceptingReviews}
          />
          <TabButton
            title="Ask Question"
            active={activeTab === 'query'}
            onPress={() => setActiveTab('query')}
            disabled={!event?.settings.isAcceptingQueries}
          />
          <TabButton
            title="Q&A"
            active={activeTab === 'qa'}
            onPress={() => setActiveTab('qa')}
          />
        </View>

        {/* Tab Content */}
        <View className="p-4">
          {activeTab === 'review' && <ReviewForm eventSlug={slug} />}
          {activeTab === 'query' && <QueryForm eventSlug={slug} />}
          {activeTab === 'qa' && <QASection eventSlug={slug} />}
        </View>
      </ScrollView>
    </View>
  );
}
```

## 🔔 Push Notifications

### **Notification Setup**
```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5227FF',
      });
    }

    return token;
  }

  static async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: { seconds: 1 },
    });
  }
}
```

### **Notification Types**
```typescript
// Notification categories and handling
export enum NotificationType {
  NEW_REVIEW = 'new_review',
  NEW_QUERY = 'new_query',
  QUERY_REPLIED = 'query_replied',
  EVENT_MILESTONE = 'event_milestone',
}

export interface NotificationData {
  type: NotificationType;
  eventId: string;
  eventTitle: string;
  message: string;
}
```

## 💾 Offline Functionality

### **Data Caching Strategy**
```typescript
// src/services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Offline queue for pending actions
export class OfflineQueue {
  private static QUEUE_KEY = 'offline_queue';

  static async addToQueue(action: OfflineAction): Promise<void> {
    const queue = await this.getQueue();
    queue.push(action);
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    
    for (const action of queue) {
      try {
        await this.executeAction(action);
        await this.removeFromQueue(action.id);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
  }

  private static async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_EVENT':
        await apiClient.post('/events', action.data);
        break;
      case 'SUBMIT_REVIEW':
        await apiClient.post('/send-review', action.data);
        break;
      case 'SUBMIT_QUERY':
        await apiClient.post('/send-query', action.data);
        break;
    }
  }
}
```

## 📊 Analytics Integration

### **Analytics Service**
```typescript
// src/services/analytics.ts
import * as Analytics from 'expo-analytics-segment';

export class AnalyticsService {
  static initialize() {
    Analytics.initialize({
      androidWriteKey: 'YOUR_ANDROID_WRITE_KEY',
      iosWriteKey: 'YOUR_IOS_WRITE_KEY',
    });
  }

  static trackEvent(event: string, properties?: Record<string, any>) {
    Analytics.track(event, properties);
  }

  static trackScreen(screenName: string, properties?: Record<string, any>) {
    Analytics.screen(screenName, properties);
  }

  static identifyUser(userId: string, traits?: Record<string, any>) {
    Analytics.identify(userId, traits);
  }

  // App-specific tracking methods
  static trackEventCreated(eventType: string) {
    this.trackEvent('Event Created', { eventType });
  }

  static trackReviewSubmitted(rating: number, eventType: string) {
    this.trackEvent('Review Submitted', { rating, eventType });
  }

  static trackQuerySubmitted(category: string, eventType: string) {
    this.trackEvent('Query Submitted', { category, eventType });
  }
}
```

## 🧪 Testing Strategy

### **Testing Setup**
```typescript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};

// src/test/setup.ts
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

### **Component Testing**
```typescript
// src/components/__tests__/EventCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventCard } from '../EventCard';

const mockEvent = {
  _id: '1',
  title: 'Test Event',
  eventType: 'Workshop',
  slug: 'test-event',
  stats: { averageRating: 4.5, totalReviews: 10 },
};

describe('EventCard', () => {
  it('renders event information correctly', () => {
    const { getByText } = render(<EventCard event={mockEvent} />);
    
    expect(getByText('Test Event')).toBeTruthy();
    expect(getByText('Workshop')).toBeTruthy();
    expect(getByText('10 reviews')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<EventCard event={mockEvent} onPress={onPress} />);
    
    fireEvent.press(getByTestId('event-card'));
    expect(onPress).toHaveBeenCalledWith(mockEvent);
  });
});
```

## 🚀 Build & Deployment

### **Build Configuration**
```json
// app.json
{
  "expo": {
    "name": "HiddenViews",
    "slug": "hiddenviews",
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
      "bundleIdentifier": "com.hiddenviews.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#080808"
      },
      "package": "com.hiddenviews.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-notifications",
      "expo-camera",
      "expo-image-picker",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
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

### **EAS Build Configuration**
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## 🔧 Development Workflow

### **Project Setup Commands**
```bash
# Initialize Expo project
npx create-expo-app HiddenViewsMobile --template

# Install dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @tanstack/react-query axios react-hook-form zod
npm install expo-secure-store expo-notifications expo-camera expo-image-picker
npm install nativewind react-native-reanimated react-native-gesture-handler

# Development commands
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run on web browser

# Build commands
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### **Code Quality Tools**
```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 📋 Feature Parity Checklist

### **Authentication Features**
- [ ] User registration with email verification
- [ ] User login with email/password
- [ ] Biometric authentication (Face ID/Touch ID/Fingerprint)
- [ ] Password reset functionality
- [ ] Social login (Google/Apple) - Future enhancement
- [ ] Secure token storage

### **Event Management**
- [ ] Create new events with all form fields
- [ ] View list of user's events
- [ ] Edit event details and settings
- [ ] Delete events with confirmation
- [ ] Share event links
- [ ] Event statistics and analytics

### **Anonymous Feedback**
- [ ] Submit anonymous reviews with star ratings
- [ ] Submit anonymous questions with categories
- [ ] View public Q&A for events
- [ ] AI-powered suggestion system
- [ ] Offline submission with sync

### **User Experience**
- [ ] Dark/light theme support with system preference
- [ ] Pull-to-refresh functionality
- [ ] Infinite scroll for long lists
- [ ] Search and filter capabilities
- [ ] Push notifications for new feedback
- [ ] Haptic feedback for interactions

### **Advanced Features**
- [ ] AI analytics dashboard
- [ ] Export functionality (PDF/CSV)
- [ ] Offline mode with data sync
- [ ] Camera integration for profile pictures
- [ ] Deep linking support
- [ ] App shortcuts and widgets

## 🎯 Success Metrics

### **Technical Metrics**
- App startup time < 3 seconds
- 60fps smooth animations
- < 100MB app size
- 99.9% crash-free sessions
- < 2 second API response times

### **User Experience Metrics**
- App Store rating > 4.5 stars
- User retention rate > 70% (7-day)
- Feature adoption rate > 80%
- Support ticket volume < 5% of users
- User satisfaction score > 4.0/5.0

### **Business Metrics**
- Mobile app downloads > 10K in first month
- Mobile-to-web conversion rate > 15%
- Mobile user engagement > web users
- Revenue attribution from mobile > 30%
- Cross-platform user retention > 85%

This comprehensive mobile development guide provides all the necessary information, code examples, and implementation details needed to create a feature-complete React Native Expo mobile application for HiddenViews. The guide ensures that the mobile app maintains full feature parity with the web application while providing an optimized native mobile experience.
## 🌐 B
ackend Integration & Multi-Frontend Architecture

### **No Separate Backend Required**
The HiddenViews mobile app uses the **exact same Next.js backend** as the web application. No additional backend development is needed.

### **Shared Backend Benefits**
- ✅ **Same API endpoints** for both web and mobile
- ✅ **Unified authentication system** with NextAuth.js
- ✅ **Single database** (MongoDB) for all platforms
- ✅ **Consistent business logic** and validation
- ✅ **Real-time data sync** between web and mobile
- ✅ **Cost-effective** - no duplicate infrastructure

### **Multi-Frontend Architecture**
```
┌─────────────────────────────────────┐
│     Next.js Backend (API Routes)    │
│   https://hiddenreviews.yashcore.app│
│                                     │
│  ┌─────────────────────────────────┐│
│  │        API Endpoints            ││
│  │  /api/auth, /api/events, etc.   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Web App   │ │ Mobile App  │ │ Future Apps │
│ (Same Site) │ │   (Expo)    │ │ (Admin/etc) │
└─────────────┘ └─────────────┘ └─────────────┘
```

### **Deployment Scenarios**

#### **Scenario 1: Same Domain (Current)**
```
Web App:    https://hiddenreviews.yashcore.app/
API:        https://hiddenreviews.yashcore.app/api/
Mobile App: → Connects to same API
```

#### **Scenario 2: Separate Frontend Domain**
```
Web App:    https://hiddenviews-web.vercel.app/
API:        https://hiddenreviews.yashcore.app/api/  (same backend)
Mobile App: → Connects to same API
```

#### **Scenario 3: Multiple Deployments**
```
Main Web:   https://hiddenreviews.yashcore.app/
Admin Web:  https://admin.hiddenviews.com/
Mobile App: Native iOS/Android
API:        https://api.hiddenviews.com/api/  (same backend)
```

### **CORS Configuration (Already Implemented)**
Your existing Next.js backend already supports cross-origin requests:

```javascript
// next.config.js - Already configured
headers: [
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.NODE_ENV === 'production' 
          ? (process.env.NEXTAUTH_URL || '*')
          : 'http://localhost:3000'
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS'
      },
      // ... other CORS headers
    ],
  },
]
```

### **API Client Configuration for Different Domains**
```typescript
// src/services/api.ts - Flexible backend URL
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api'  // Local development
    : process.env.EXPO_PUBLIC_API_URL || 'https://hiddenreviews.yashcore.app/api',
  TIMEOUT: 10000,
};

// Environment-specific configuration
// .env.local (development)
EXPO_PUBLIC_API_URL=http://localhost:3000/api

// .env.production (production)
EXPO_PUBLIC_API_URL=https://hiddenreviews.yashcore.app/api

// .env.staging (staging)
EXPO_PUBLIC_API_URL=https://staging.hiddenviews.com/api
```

### **Cross-Platform Data Synchronization**
Since both web and mobile use the same backend:
- **User creates event on web** → **Immediately available on mobile**
- **Anonymous feedback on mobile** → **Instantly visible on web dashboard**
- **Profile changes on mobile** → **Reflected on web immediately**
- **AI analytics updates** → **Consistent across all platforms**

### **Security Considerations**
- **Same JWT tokens** work for both platforms
- **Unified rate limiting** protects all endpoints
- **Consistent validation** with Zod schemas
- **Shared authentication middleware**

### **Development Workflow**
1. **Local Development**: Mobile app connects to `http://localhost:3000/api`
2. **Testing**: Same database, same data as web app
3. **Production**: Mobile app connects to production API
4. **Deployment**: No backend changes needed for mobile app deployment

This architecture ensures perfect feature parity between web and mobile while maintaining a single, maintainable backend codebase.