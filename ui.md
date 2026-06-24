# HiddenViews Mobile UI Design System

## 🎨 Design Overview

This comprehensive UI guide translates the HiddenViews web application's design system into mobile-optimized React Native components. The design maintains the sophisticated dark theme, smooth animations, and premium feel while adapting to mobile interaction patterns.

## 🌈 Color System

### **Primary Brand Colors**
```typescript
// src/constants/Colors.ts
export const Colors = {
  light: {
    primary: '#5227FF',        // Brand purple
    secondary: '#6B7280',      // Gray-500
    background: '#FFFFFF',     // Pure white
    surface: '#F9FAFB',        // Gray-50
    text: '#111827',           // Gray-900
    textSecondary: '#6B7280',  // Gray-500
    border: '#E5E7EB',         // Gray-200
    success: '#10B981',        // Emerald-500
    warning: '#F59E0B',        // Amber-500
    error: '#EF4444',          // Red-500
  },
  dark: {
    primary: '#5227FF',        // Brand purple
    secondary: '#9CA3AF',      // Gray-400
    background: '#080808',     // Near black
    surface: '#1F2937',        // Gray-800
    text: '#F9FAFB',          // Gray-50
    textSecondary: '#D1D5DB',  // Gray-300
    border: '#374151',         // Gray-700
    success: '#34D399',        // Emerald-400
    warning: '#FBBF24',        // Amber-400
    error: '#F87171',          // Red-400
  },
};

// Custom brand colors from web app
export const BrandColors = {
  customPrimary: {
    100: '#2E2E2E',
    200: '#575757', 
    300: '#5227FF',  // Main brand color
  },
  customAccent: {
    100: '#FF6600',
    200: '#ffffa1',
  },
  text: {
    100: '#FFFFFF',
    200: '#e0e0e0',
  },
  bg: {
    100: '#080808',  // Main dark background
    200: '#1A1A1A',  // Card background
    300: '#292929',  // Elevated background
  },
  star: {
    filled: '#FFD700',  // Gold for filled stars
    empty: '#D1D5DB',   // Gray for empty stars
  },
};
```

## 📱 Typography System

### **Font Configuration**
```typescript
// src/constants/Typography.ts
export const Typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  
  // UI text
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
};
```

## 🎯 Core UI Components

### **1. Button Component**
```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { duration: 150 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingHorizontal: size === 'small' ? 16 : size === 'large' ? 24 : 20,
      paddingVertical: size === 'small' ? 10 : size === 'large' ? 16 : 14,
      minHeight: size === 'small' ? 40 : size === 'large' ? 56 : 48,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: disabled ? 0 : 0.3,
          shadowRadius: 8,
          elevation: disabled ? 0 : 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
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
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...Typography.button,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
      case 'destructive':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.text,
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

  const iconSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;
  const iconColor = variant === 'primary' || variant === 'destructive' 
    ? '#FFFFFF' 
    : variant === 'outline' 
      ? (disabled ? colors.textSecondary : colors.primary)
      : colors.text;

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={iconSize} 
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons 
              name={rightIcon} 
              size={iconSize} 
              color={iconColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </AnimatedTouchableOpacity>
  );
}
```### **2. 
Card Component**
```typescript
// src/components/ui/Card.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  interactive?: boolean;
  onPress?: () => void;
}

export function Card({ 
  children, 
  style, 
  elevated = false, 
  interactive = false,
  onPress 
}: CardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(elevated ? 0.1 : 0.05);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    if (interactive) {
      scale.value = withSpring(0.98);
      shadowOpacity.value = withSpring(0.15);
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scale.value = withSpring(1);
      shadowOpacity.value = withSpring(elevated ? 0.1 : 0.05);
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: elevated ? 4 : 2 },
    shadowRadius: elevated ? 12 : 8,
    elevation: elevated ? 4 : 2,
  };

  if (interactive && onPress) {
    return (
      <Animated.View style={[cardStyle, style, animatedStyle]}>
        <Animated.View
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
          onTouchCancel={handlePressOut}
        >
          {children}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[cardStyle, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ padding: 20, paddingBottom: 12 }, style]}>
      {children}
    </View>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ padding: 20, paddingTop: 0 }, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ padding: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center' }, style]}>
      {children}
    </View>
  );
}
```

### **3. Input Component**
```typescript
// src/components/ui/Input.tsx
import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
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
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? colors.error : colors.border, error ? colors.error : colors.primary]
    );

    return {
      borderColor,
      shadowOpacity: focusAnimation.value * 0.1,
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const getInputContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    minHeight: 52,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  });

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    ...Typography.body,
    color: colors.text,
    paddingVertical: 0,
  });

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text style={[
          {
            ...Typography.label,
            color: colors.text,
            marginBottom: 8,
          },
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <Animated.View style={[getInputContainerStyle(), style, animatedContainerStyle]}>
        {leftIcon && (
          <View style={{ marginRight: 12 }}>
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={isFocused ? colors.primary : colors.textSecondary} 
            />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={{ marginLeft: 12 }}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={isFocused ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text style={[
          {
            ...Typography.caption,
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

### **4. Badge Component**
```typescript
// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'medium',
  style,
  textStyle 
}: BadgeProps) {
  const { colors } = useTheme();

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      paddingVertical: size === 'small' ? 4 : size === 'large' ? 8 : 6,
      borderRadius: size === 'small' ? 12 : size === 'large' ? 20 : 16,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: colors.primary + '20',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colors.success + '20',
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colors.warning + '20',
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: colors.error + '20',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 11 : size === 'large' ? 14 : 12,
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          color: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.text,
        };
      case 'success':
        return {
          ...baseStyle,
          color: colors.success,
        };
      case 'warning':
        return {
          ...baseStyle,
          color: colors.warning,
        };
      case 'error':
        return {
          ...baseStyle,
          color: colors.error,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.text,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>
        {children}
      </Text>
    </View>
  );
}
```

### **5. Star Rating Component**
```typescript
// src/components/ui/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { BrandColors } from '@/constants/Colors';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  maxRating?: number;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  size = 'medium', 
  interactive = false,
  maxRating = 5 
}: StarRatingProps) {
  const { colors } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const starSize = getSize();

  const handleStarPress = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: maxRating }, (_, index) => (
        <StarButton
          key={index}
          filled={index < rating}
          size={starSize}
          interactive={interactive}
          onPress={() => handleStarPress(index)}
        />
      ))}
    </View>
  );
}

interface StarButtonProps {
  filled: boolean;
  size: number;
  interactive: boolean;
  onPress: () => void;
}

function StarButton({ filled, size, interactive, onPress }: StarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (interactive) {
      scale.value = withSequence(
        withSpring(1.3, { duration: 150 }),
        withSpring(1, { duration: 150 })
      );
      onPress();
    }
  };

  if (interactive) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Animated.View style={animatedStyle}>
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? BrandColors.star.filled : BrandColors.star.empty}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Ionicons
      name={filled ? 'star' : 'star-outline'}
      size={size}
      color={filled ? BrandColors.star.filled : BrandColors.star.empty}
    />
  );
}
```

## 🎭 Animation System

### **Animation Presets**
```typescript
// src/constants/Animations.ts
export const AnimationPresets = {
  // Spring animations
  spring: {
    gentle: { damping: 20, stiffness: 300 },
    bouncy: { damping: 10, stiffness: 400 },
    smooth: { damping: 25, stiffness: 200 },
  },
  
  // Timing animations
  timing: {
    fast: { duration: 150 },
    normal: { duration: 300 },
    slow: { duration: 500 },
  },
  
  // Easing curves
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

// Common animation utilities
export const createFadeIn = (delay = 0) => ({
  from: { opacity: 0, transform: [{ translateY: 20 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
  config: { ...AnimationPresets.spring.smooth, delay },
});

export const createSlideIn = (direction: 'left' | 'right' | 'up' | 'down', delay = 0) => {
  const transforms = {
    left: [{ translateX: -50 }],
    right: [{ translateX: 50 }],
    up: [{ translateY: -50 }],
    down: [{ translateY: 50 }],
  };

  return {
    from: { opacity: 0, transform: transforms[direction] },
    to: { opacity: 1, transform: [{ translateX: 0 }, { translateY: 0 }] },
    config: { ...AnimationPresets.spring.smooth, delay },
  };
};

export const createScale = (delay = 0) => ({
  from: { opacity: 0, transform: [{ scale: 0.8 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
  config: { ...AnimationPresets.spring.bouncy, delay },
});
```

### **Animated List Item**
```typescript
// src/components/ui/AnimatedListItem.tsx
import React from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  onAnimationComplete?: () => void;
}

export function AnimatedListItem({ 
  children, 
  index, 
  delay = 100,
  onAnimationComplete 
}: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    const animationDelay = index * delay;
    
    opacity.value = withDelay(
      animationDelay,
      withSpring(1, { damping: 20, stiffness: 300 })
    );
    
    translateY.value = withDelay(
      animationDelay,
      withSpring(0, { damping: 20, stiffness: 300 })
    );
    
    scale.value = withDelay(
      animationDelay,
      withSpring(1, { 
        damping: 15, 
        stiffness: 400,
      }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, [index, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
```

## 📐 Layout System

### **Spacing Constants**
```typescript
// src/constants/Spacing.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Screen padding
export const ScreenPadding = {
  horizontal: 20,
  vertical: 16,
  top: 40, // Safe area + extra
  bottom: 20,
};

// Component spacing
export const ComponentSpacing = {
  cardPadding: 20,
  sectionGap: 24,
  itemGap: 16,
  buttonHeight: 48,
  inputHeight: 52,
};
```

### **Responsive Utilities**
```typescript
// src/utils/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Screen size breakpoints
export const Breakpoints = {
  small: 375,   // iPhone SE
  medium: 414,  // iPhone 11 Pro Max
  large: 768,   // iPad Mini
  xlarge: 1024, // iPad Pro
};

export const isSmallScreen = () => SCREEN_WIDTH < Breakpoints.medium;
export const isMediumScreen = () => SCREEN_WIDTH >= Breakpoints.medium && SCREEN_WIDTH < Breakpoints.large;
export const isLargeScreen = () => SCREEN_WIDTH >= Breakpoints.large;

// Responsive font scaling
export const responsiveFont = (size: number) => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone SE width
  const newSize = size * scale;
  return Math.max(12, PixelRatio.roundToNearestPixel(newSize));
};

// Responsive spacing
export const responsiveSpacing = (size: number) => {
  if (isSmallScreen()) return size * 0.8;
  if (isLargeScreen()) return size * 1.2;
  return size;
};
```## 🎨 Spe
cialized Components

### **6. Event Card Component**
```typescript
// src/components/events/EventCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Typography } from '@/constants/Typography';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  showActions?: boolean;
}

export function EventCard({ event, onPress, showActions = true }: EventCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getEventTypeColor = (type: string) => {
    const colorMap = {
      Workshop: '#3B82F6',
      Course: '#10B981',
      Webinar: '#8B5CF6',
      Meeting: '#F59E0B',
      Project: '#EF4444',
    };
    return colorMap[type as keyof typeof colorMap] || colors.textSecondary;
  };

  const handleShare = async () => {
    try {
      const url = `https://hiddenreviews.yashcore.app/e/${event.slug}`;
      await Share.share({
        message: `Check out my event: ${event.title}\n\nGive anonymous feedback: ${url}`,
        url,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 20 }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <Badge
                    variant="outline"
                    size="small"
                    style={{ 
                      backgroundColor: getEventTypeColor(event.eventType) + '20',
                      borderColor: getEventTypeColor(event.eventType),
                    }}
                    textStyle={{ color: getEventTypeColor(event.eventType) }}
                  >
                    {event.eventType}
                  </Badge>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: event.isActive ? colors.success : colors.textSecondary,
                    marginLeft: 8,
                  }} />
                </View>

                <Text style={{
                  ...Typography.h4,
                  color: colors.text,
                  marginBottom: 4,
                }}>
                  {event.title}
                </Text>

                {event.description && (
                  <Text style={{
                    ...Typography.bodySmall,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
              </View>

              {showActions && (
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Stats */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <StarRating rating={event.stats.averageRating} size="small" />
                  <Text style={{
                    ...Typography.bodySmall,
                    fontWeight: '600',
                    color: colors.text,
                    marginLeft: 4,
                  }}>
                    {event.stats.averageRating.toFixed(1)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="chatbubble" size={16} color={colors.textSecondary} />
                  <Text style={{
                    ...Typography.bodySmall,
                    color: colors.textSecondary,
                    marginLeft: 4,
                  }}>
                    {event.stats.totalReviews}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="help-circle" size={16} color={colors.textSecondary} />
                  <Text style={{
                    ...Typography.bodySmall,
                    color: colors.textSecondary,
                    marginLeft: 4,
                  }}>
                    {event.stats.totalQueries}
                  </Text>
                </View>
              </View>

              <Text style={{
                ...Typography.caption,
                color: colors.textSecondary,
              }}>
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

### **7. Stats Card Component**
```typescript
// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/constants/Typography';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  change?: number;
  style?: ViewStyle;
  index?: number;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  change,
  style,
  index = 0 
}: StatsCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 100;
    
    opacity.value = withDelay(delay, withSpring(1));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 400 }));
    
    if (change !== undefined) {
      progress.value = withDelay(
        delay + 300,
        withSpring(Math.abs(change) / 100, { duration: 1000 })
      );
    }
  }, [index, change]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const getChangeColor = () => {
    if (change === undefined) return colors.textSecondary;
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.textSecondary;
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return 'trending-up';
    if (change < 0) return 'trending-down';
    return 'remove';
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Card elevated>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: color + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={icon} size={24} color={color} />
            </View>

            {change !== undefined && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: getChangeColor() + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                {getChangeIcon() && (
                  <Ionicons 
                    name={getChangeIcon()!} 
                    size={12} 
                    color={getChangeColor()}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={{
                  ...Typography.caption,
                  fontWeight: '600',
                  color: getChangeColor(),
                }}>
                  {Math.abs(change)}%
                </Text>
              </View>
            )}
          </View>

          {/* Value */}
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
          }}>
            {value}
          </Text>

          {/* Title */}
          <Text style={{
            ...Typography.bodySmall,
            color: colors.textSecondary,
            fontWeight: '500',
          }}>
            {title}
          </Text>

          {/* Progress Indicator */}
          {change !== undefined && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: colors.border,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              overflow: 'hidden',
            }}>
              <Animated.View
                style={[
                  {
                    height: '100%',
                    backgroundColor: getChangeColor(),
                  },
                  progressStyle,
                ]}
              />
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
```

### **8. Floating Action Button (FAB)**
```typescript
// src/components/ui/FloatingActionButton.tsx
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export function FloatingActionButton({ 
  onPress, 
  icon = 'add',
  style,
  size = 'medium' 
}: FloatingActionButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    rotation.value = withSequence(
      withSpring(-5, { duration: 100 }),
      withSpring(5, { duration: 100 }),
      withSpring(0, { duration: 100 })
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'medium':
        return 56;
      case 'large':
        return 64;
      default:
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const fabSize = getSize();
  const iconSize = getIconSize();

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        },
        style,
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={1}
      >
        <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}
```

## 🌊 Loading States & Skeletons

### **Loading Skeleton Component**
```typescript
// src/components/ui/Skeleton.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

// Skeleton presets for common components
export function SkeletonCard() {
  return (
    <View style={{ padding: 20, backgroundColor: 'transparent' }}>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={12} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}
```

### **Loading Spinner Component**
```typescript
// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  size = 'medium', 
  text,
  overlay = false 
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const spinnerSize = getSize();

  const content = (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <Animated.View style={animatedStyle}>
        <View style={{
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: 3,
          borderColor: colors.border,
          borderTopColor: colors.primary,
        }} />
      </Animated.View>
      
      {text && (
        <Text style={{
          ...Typography.bodySmall,
          color: colors.textSecondary,
          marginTop: 12,
          textAlign: 'center',
        }}>
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        {content}
      </View>
    );
  }

  return content;
}
```

## 🎨 Theme Integration

### **Theme Hook Usage**
```typescript
// Example of using theme in components
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, theme, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {theme}
      </Text>
      <Button 
        title={`Switch to ${isDark ? 'Light' : 'Dark'}`}
        onPress={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </View>
  );
}
```

### **Dark Mode Optimizations**
```typescript
// src/utils/theme.ts
export const getOptimalTextColor = (backgroundColor: string, lightColor: string, darkColor: string) => {
  // Simple luminance calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? darkColor : lightColor;
};

export const addOpacity = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${hex}${alpha}`;
};
```

## 📱 Mobile-Specific Patterns

### **Pull-to-Refresh Implementation**
```typescript
// src/components/ui/RefreshableScrollView.tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface RefreshableScrollViewProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
}

export function RefreshableScrollView({ 
  children, 
  onRefresh,
  refreshing: externalRefreshing 
}: RefreshableScrollViewProps) {
  const { colors } = useTheme();
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  
  const isRefreshing = externalRefreshing ?? internalRefreshing;

  const handleRefresh = async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }
    
    try {
      await onRefresh();
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
```

This comprehensive UI guide provides all the essential components and patterns needed to create a mobile app that perfectly matches your web application's design system. The components are optimized for mobile interactions while maintaining the sophisticated dark theme and smooth animations that define the HiddenViews brand.