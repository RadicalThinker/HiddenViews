# Phase 2: Authentication & User Management

## 🎯 Phase Overview

**Duration**: 1-2 weeks  
**Priority**: Critical Core Feature  
**Goal**: Implement complete authentication system with user registration, login, email verification, password reset, and user profile management.

## 📋 Phase Objectives

### **Primary Deliverables**
1. Complete authentication UI screens (Welcome, Sign In, Sign Up)
2. Email verification flow with OTP input
3. Password reset functionality
4. User profile management screen
5. Biometric authentication integration
6. Form validation with error handling
7. Secure token storage and session management

### **Success Criteria**
- [ ] Users can register new accounts with email verification
- [ ] Users can sign in with email/password
- [ ] Password reset flow works end-to-end
- [ ] Biometric authentication (Face ID/Touch ID/Fingerprint) works
- [ ] User profile can be viewed and updated
- [ ] All forms have proper validation and error handling
- [ ] Authentication state persists across app restarts

## 🛠️ Technical Implementation

### **1. Authentication Screens**

#### **Welcome Screen**
```typescript
// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthStackParamList } from '@/types';

const { width, height } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo and Branding */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(1000)}
          style={styles.logoContainer}
        >
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            HiddenViews
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Anonymous feedback that matters
          </Text>
        </Animated.View>

        {/* Feature Highlights */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(1000)}
          style={styles.featuresContainer}
        >
          <FeatureItem
            icon="🔒"
            title="100% Anonymous"
            description="Your identity stays completely hidden"
            colors={colors}
          />
          <FeatureItem
            icon="⚡"
            title="Instant Feedback"
            description="Get honest opinions in real-time"
            colors={colors}
          />
          <FeatureItem
            icon="🤖"
            title="AI Insights"
            description="Smart analytics and recommendations"
            colors={colors}
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(1000)}
          style={styles.buttonContainer}
        >
          <Button
            title="Get Started"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.primaryButton}
          />
          <Button
            title="I already have an account"
            variant="ghost"
            size="medium"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.secondaryButton}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
}

function FeatureItem({ icon, title, description, colors }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
});
```

#### **Enhanced Input Component**
```typescript
// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  style,
  ...props
}, ref) => {
  const { colors } = useTheme();

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  });

  const getContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: error ? colors.error : colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    minHeight: 56,
  });

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text style={[
          {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          },
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[getContainerStyle(), style]}>
        {leftIcon && (
          <View style={{ marginRight: 12 }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        
        {rightIcon && (
          <View style={{ marginLeft: 12 }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={[
          {
            fontSize: 12,
            color: colors.error,
            marginTop: 4,
            marginLeft: 4,
          },
          errorStyle
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
```

### **2. Biometric Authentication Service**

#### **Biometric Service Implementation**
```typescript
// src/services/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants';

export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return hasHardware && isEnrolled && supportedTypes.length > 0;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  static async authenticate(reason?: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authenticate to access HiddenViews',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  static async enableBiometricLogin(token: string): Promise<boolean> {
    try {
      const isAuthenticated = await this.authenticate('Enable biometric login');
      if (isAuthenticated) {
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      return false;
    }
  }

  static async getBiometricToken(): Promise<string | null> {
    try {
      const isAuthenticated = await this.authenticate('Sign in with biometrics');
      if (isAuthenticated) {
        return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric token:', error);
      return null;
    }
  }

  static async disableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error disabling biometric login:', error);
    }
  }

  static getBiometricTypeText(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }
}
```

### **3. Loading Screen**

#### **Loading Screen Component**
```typescript
// src/screens/LoadingScreen.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

export function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#FFFFFF',
          }}>
            H
          </Text>
        </View>

        <ActivityIndicator size="large" color={colors.primary} />
        
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 16,
          textAlign: 'center',
        }}>
          Loading HiddenViews...
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
```

## 📋 Phase 2 Checklist

### **Authentication Screens**
- [ ] Welcome screen with app introduction and branding
- [ ] Sign in screen with email/password form
- [ ] Sign up screen with validation and password strength
- [ ] Email verification screen with OTP input
- [ ] Forgot password screen (basic implementation)
- [ ] Loading screen for app initialization

### **Form Components**
- [ ] Enhanced Input component with icons and validation
- [ ] Button component with loading states
- [ ] Form validation using React Hook Form + Zod
- [ ] Password strength indicator
- [ ] Error handling and user feedback

### **Authentication Features**
- [ ] User registration with email verification
- [ ] User login with credential validation
- [ ] Biometric authentication integration
- [ ] Secure token storage using Expo SecureStore
- [ ] Authentication state persistence
- [ ] Auto-logout on token expiration

### **User Experience**
- [ ] Smooth animations using React Native Reanimated
- [ ] Keyboard handling and auto-focus
- [ ] Loading states and error messages
- [ ] Theme support across all screens
- [ ] Accessibility features (screen reader support)

### **Security Features**
- [ ] Password hashing and secure transmission
- [ ] Biometric authentication setup
- [ ] Secure storage of authentication tokens
- [ ] Input validation and sanitization
- [ ] Error handling without exposing sensitive data

## 🎯 Success Metrics

### **Functional Metrics**
- [ ] 100% success rate for valid registration attempts
- [ ] < 3 second response time for authentication requests
- [ ] Biometric authentication works on 95%+ of supported devices
- [ ] Email verification flow completion rate > 80%
- [ ] Zero security vulnerabilities in authentication flow

### **User Experience Metrics**
- [ ] Form validation provides clear, helpful error messages
- [ ] Smooth animations with 60fps performance
- [ ] Keyboard navigation works seamlessly
- [ ] Theme switching works across all auth screens
- [ ] Accessibility score > 90% on both platforms

## 🚀 Next Steps

Upon completion of Phase 2, you will have:
- Complete authentication system with all user flows
- Secure user registration and login functionality
- Biometric authentication for enhanced security
- Professional UI with smooth animations
- Comprehensive form validation and error handling

**Ready for Phase 3**: Dashboard and event management screens.

This phase establishes the complete user authentication system that will be used throughout the application. Ensure all security measures are properly implemented before proceeding to Phase 3.