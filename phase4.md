# Phase 4: Anonymous Feedback System

## 🎯 Phase Overview

**Duration**: 2-3 weeks  
**Priority**: Core Anonymous Feature  
**Goal**: Implement the anonymous feedback system allowing users to submit reviews and questions without authentication, including public event pages and Q&A functionality.

## 📋 Phase Objectives

### **Primary Deliverables**
1. Public event page accessible via deep links
2. Anonymous review submission with star ratings
3. Anonymous question submission system
4. Public Q&A display with answers
5. AI-powered suggestion system
6. Offline feedback submission with sync
7. Theme switching for anonymous users

### **Success Criteria**
- [ ] Anonymous users can access events via shared links
- [ ] Review submission works without authentication
- [ ] Question submission and display functions properly
- [ ] AI suggestions enhance user experience
- [ ] Offline submissions sync when online
- [ ] Public Q&A section displays correctly
- [ ] Theme preferences persist for anonymous users

## 🛠️ Technical Implementation

### **1. Public Event Screen**

#### **Public Event Page Implementation**
```typescript
// src/screens/events/PublicEventScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api';
import { Event } from '@/types';
import { ReviewForm } from '@/components/feedback/ReviewForm';
import { QueryForm } from '@/components/feedback/QueryForm';
import { PublicQASection } from '@/components/feedback/PublicQASection';
import { AISuggestions } from '@/components/feedback/AISuggestions';
import { StarDisplay } from '@/components/ui/StarDisplay';

const { width } = Dimensions.get('window');

type PublicEventScreenProps = {
  route: RouteProp<{ params: { slug: string } }, 'params'>;
  navigation: any;
};

type TabType = 'review' | 'question' | 'qa';

export function PublicEventScreen({ route, navigation }: PublicEventScreenProps) {
  const { slug } = route.params;
  const { colors, theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('review');

  // Load anonymous theme preference
  useEffect(() => {
    loadAnonymousTheme();
  }, []);

  const loadAnonymousTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('anonymous_theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme as any);
      }
    } catch (error) {
      console.error('Error loading anonymous theme:', error);
    }
  };

  const saveAnonymousTheme = async (newTheme: string) => {
    try {
      await AsyncStorage.setItem('anonymous_theme', newTheme);
    } catch (error) {
      console.error('Error saving anonymous theme:', error);
    }
  };

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: async () => {
      const response = await apiClient.getEvent(slug);
      return response.data?.event;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme as any);
    saveAnonymousTheme(nextTheme);
  };

  const handleShare = async () => {
    try {
      const url = `https://hiddenreviews.yashcore.app/e/${slug}`;
      await Share.share({
        message: `Check out this event: ${event?.title}\n\nGive anonymous feedback: ${url}`,
        url,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny-outline';
      case 'dark':
        return 'moon-outline';
      case 'system':
        return 'phone-portrait-outline';
      default:
        return 'sunny-outline';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop':
        return '#3B82F6';
      case 'Course':
        return '#10B981';
      case 'Webinar':
        return '#8B5CF6';
      case 'Meeting':
        return '#F59E0B';
      case 'Project':
        return '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              H
            </Text>
          </View>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Loading event...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Event Not Found
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
          }}>
            The event you're looking for doesn't exist or is no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={handleThemeToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name={getThemeIcon()} size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="share-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 24,
            alignItems: 'center',
          }}
        >
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: getEventTypeColor(event.eventType) + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="calendar" size={40} color={getEventTypeColor(event.eventType)} />
          </View>

          <View style={{
            backgroundColor: getEventTypeColor(event.eventType) + '20',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            marginBottom: 12,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: getEventTypeColor(event.eventType),
            }}>
              {event.eventType}
            </Text>
          </View>

          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            {event.title}
          </Text>

          {event.description && (
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 16,
            }}>
              {event.description}
            </Text>
          )}

          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 16,
          }}>
            by @{event.createdBy?.username}
          </Text>

          {/* Stats */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
          }}>
            <View style={{ alignItems: 'center' }}>
              <StarDisplay rating={event.stats.averageRating} size="lg" />
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}>
                {event.stats.totalReviews} reviews
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}>
                {event.stats.resolvedQueries}/{event.stats.totalQueries}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
              }}>
                answered
              </Text>
            </View>
          </View>

          {event.settings.customMessage && (
            <View style={{
              backgroundColor: colors.primary + '10',
              borderRadius: 12,
              padding: 16,
              marginTop: 20,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}>
              <Text style={{
                fontSize: 16,
                color: colors.text,
                lineHeight: 24,
                textAlign: 'center',
              }}>
                {event.settings.customMessage}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          <TabButton
            title="Review"
            icon="star-outline"
            active={activeTab === 'review'}
            onPress={() => setActiveTab('review')}
            disabled={!event.settings.isAcceptingReviews}
            style={{ flex: 1 }}
          />
          <TabButton
            title="Ask"
            icon="help-circle-outline"
            active={activeTab === 'question'}
            onPress={() => setActiveTab('question')}
            disabled={!event.settings.isAcceptingQueries}
            style={{ flex: 1 }}
          />
          <TabButton
            title="Q&A"
            icon="chatbubbles-outline"
            active={activeTab === 'qa'}
            onPress={() => setActiveTab('qa')}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Tab Content */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(800)}
          style={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {activeTab === 'review' && (
            <ReviewForm 
              eventSlug={slug} 
              isAccepting={event.settings.isAcceptingReviews}
            />
          )}
          
          {activeTab === 'question' && (
            <QueryForm 
              eventSlug={slug} 
              isAccepting={event.settings.isAcceptingQueries}
              requireEmail={event.settings.requireEmail}
            />
          )}
          
          {activeTab === 'qa' && (
            <PublicQASection eventSlug={slug} />
          )}
        </Animated.View>

        {/* AI Suggestions */}
        <AISuggestions 
          eventSlug={slug}
          activeTab={activeTab}
          onSuggestionSelect={(suggestion) => {
            // Handle suggestion selection
            console.log('Selected suggestion:', suggestion);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Tab Button Component
interface TabButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

function TabButton({ title, icon, active, onPress, disabled, style }: TabButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: active ? colors.primary : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={active ? '#FFFFFF' : colors.textSecondary}
        style={{ marginRight: 6 }}
      />
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: active ? '#FFFFFF' : colors.textSecondary,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

### **2. Review Form Component**

#### **Anonymous Review Form**
```typescript
// src/components/feedback/ReviewForm.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api';
import { OfflineQueue } from '@/services/offline';

const reviewSchema = z.object({
  content: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review too long'),
  rating: z.number().min(1, 'Please select a rating').max(5, 'Invalid rating'),
  senderEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  eventSlug: string;
  isAccepting: boolean;
}

export function ReviewForm({ eventSlug, isAccepting }: ReviewFormProps) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: '',
      rating: 5,
      senderEmail: '',
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const payload = {
        eventSlug,
        content: data.content,
        rating: data.rating,
        senderEmail: data.senderEmail || undefined,
      };

      try {
        const response = await apiClient.submitReview(payload);
        return response;
      } catch (error) {
        // If offline, add to queue
        await OfflineQueue.addToQueue({
          id: Date.now().toString(),
          type: 'SUBMIT_REVIEW',
          data: payload,
          timestamp: Date.now(),
        });
        throw new Error('Review saved offline. Will sync when connection is restored.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-event', eventSlug] });
      Alert.alert(
        'Review Submitted!',
        'Thank you for your anonymous feedback.',
        [{ text: 'OK' }]
      );
      reset();
    },
    onError: (error: any) => {
      Alert.alert(
        'Review Saved',
        error.message || 'Your review has been saved and will be submitted when you\'re back online.',
        [{ text: 'OK' }]
      );
      reset();
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      await submitReviewMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedContent = watch('content');
  const watchedRating = watch('rating');

  if (!isAccepting) {
    return (
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Ionicons name="eye-off-outline" size={48} color={colors.textSecondary} />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          marginTop: 16,
          marginBottom: 8,
        }}>
          Reviews Closed
        </Text>
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        }}>
          This event is not currently accepting reviews.
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#FFD700' + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Ionicons name="star" size={20} color="#FFD700" />
        </View>
        <View>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
          }}>
            Leave a Review
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Your feedback is completely anonymous
          </Text>
        </View>
      </View>

      <Controller
        control={control}
        name="rating"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}>
              How would you rate this event?
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <StarRating
                rating={value}
                onRatingChange={onChange}
                size="lg"
                interactive
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.primary,
                marginLeft: 16,
              }}>
                {value} star{value !== 1 ? 's' : ''}
              </Text>
            </View>
            {errors.rating && (
              <Text style={{
                fontSize: 12,
                color: colors.error,
                marginTop: 4,
              }}>
                {errors.rating.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Your Review"
            placeholder="Share your honest thoughts about this event..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.content?.message}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
            leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />}
          />
        )}
      />

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
        }}>
          {watchedContent.length}/500 characters
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={{
            fontSize: 12,
            color: colors.success,
            marginLeft: 4,
          }}>
            100% Anonymous
          </Text>
        </View>
      </View>

      <Controller
        control={control}
        name="senderEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email (Optional)"
            placeholder="your@email.com - for notifications only"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.senderEmail?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          />
        )}
      />

      <Button
        title="Submit Review"
        variant="primary"
        size="large"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        disabled={!watchedContent.trim() || watchedRating === 0}
      />
    </View>
  );
}
```

### **3. Star Rating Component**

#### **Interactive Star Rating**
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

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  color?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  size = 'md', 
  interactive = false,
  color = '#FFD700'
}: StarRatingProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 24;
      case 'lg':
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
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <StarButton
          key={starIndex}
          filled={starIndex < rating}
          size={starSize}
          color={color}
          interactive={interactive}
          onPress={() => handleStarPress(starIndex)}
        />
      ))}
    </View>
  );
}

interface StarButtonProps {
  filled: boolean;
  size: number;
  color: string;
  interactive: boolean;
  onPress: () => void;
}

function StarButton({ filled, size, color, interactive, onPress }: StarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (interactive) {
      scale.value = withSequence(
        withSpring(1.2, { duration: 100 }),
        withSpring(1, { duration: 100 })
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
            color={filled ? color : '#D1D5DB'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Ionicons
      name={filled ? 'star' : 'star-outline'}
      size={size}
      color={filled ? color : '#D1D5DB'}
    />
  );
}

// Star Display Component (non-interactive)
interface StarDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function StarDisplay({ rating, totalReviews, size = 'md', showText = true }: StarDisplayProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <StarRating rating={rating} size={size} interactive={false} />
      {showText && (
        <View style={{ marginLeft: 8 }}>
          <Text style={{
            fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
            fontWeight: '600',
            color: colors.text,
          }}>
            {rating.toFixed(1)}
          </Text>
          {totalReviews !== undefined && (
            <Text style={{
              fontSize: size === 'sm' ? 10 : size === 'lg' ? 12 : 11,
              color: colors.textSecondary,
            }}>
              ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
```

### **4. Offline Queue Service**

#### **Offline Submission Management**
```typescript
// src/services/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { apiClient } from './api';

export interface OfflineAction {
  id: string;
  type: 'SUBMIT_REVIEW' | 'SUBMIT_QUERY' | 'CREATE_EVENT';
  data: any;
  timestamp: number;
  retryCount?: number;
}

export class OfflineQueue {
  private static QUEUE_KEY = 'offline_queue';
  private static MAX_RETRIES = 3;
  private static isProcessing = false;

  static async addToQueue(action: OfflineAction): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push({ ...action, retryCount: 0 });
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      
      // Try to process immediately if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  static async getQueue(): Promise<OfflineAction[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  static async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const queue = await this.getQueue();
      const processedIds: string[] = [];
      const failedActions: OfflineAction[] = [];

      for (const action of queue) {
        try {
          await this.executeAction(action);
          processedIds.push(action.id);
        } catch (error) {
          console.error(`Failed to process offline action ${action.id}:`, error);
          
          const retryCount = (action.retryCount || 0) + 1;
          if (retryCount < this.MAX_RETRIES) {
            failedActions.push({ ...action, retryCount });
          } else {
            console.error(`Max retries exceeded for action ${action.id}`);
          }
        }
      }

      // Update queue with failed actions only
      const remainingQueue = queue.filter(action => 
        !processedIds.includes(action.id)
      ).concat(failedActions);

      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(remainingQueue));
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private static async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'SUBMIT_REVIEW':
        await apiClient.submitReview(action.data);
        break;
      case 'SUBMIT_QUERY':
        await apiClient.submitQuery(action.data);
        break;
      case 'CREATE_EVENT':
        await apiClient.createEvent(action.data);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  }

  static async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  // Initialize network listener
  static initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isProcessing) {
        this.processQueue();
      }
    });
  }
}
```

### **5. Deep Linking Configuration**

#### **Deep Link Setup**
```typescript
// src/navigation/LinkingConfiguration.ts
import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const LinkingConfiguration: LinkingOptions<any> = {
  prefixes: [prefix, 'https://hiddenreviews.yashcore.app', 'hiddenviews://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          SignIn: 'sign-in',
          SignUp: 'sign-up',
          VerifyEmail: 'verify/:email',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Events: 'events',
          Analytics: 'analytics',
          Profile: 'profile',
        },
      },
      PublicEvent: 'e/:slug',
      EventDetails: 'event/:slug',
      CreateEvent: 'create-event',
      Settings: 'settings',
    },
  },
};

// Update App.tsx to include linking
export function App() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      {/* Your navigation structure */}
    </NavigationContainer>
  );
}
```

## 📋 Phase 4 Checklist

### **Anonymous Feedback System**
- [ ] Public event page accessible via deep links
- [ ] Anonymous review submission with star ratings
- [ ] Anonymous question submission system
- [ ] Offline feedback submission with sync
- [ ] Theme switching for anonymous users
- [ ] Input validation and error handling

### **UI Components**
- [ ] Interactive star rating component
- [ ] Review form with character count
- [ ] Question form with categories
- [ ] Public Q&A display section
- [ ] AI suggestions component
- [ ] Theme toggle for anonymous users

### **Data Management**
- [ ] Offline queue for submissions
- [ ] Network state monitoring
- [ ] Automatic sync when online
- [ ] Error handling and retry logic
- [ ] Local storage for anonymous preferences

### **User Experience**
- [ ] Smooth animations and transitions
- [ ] Loading states and feedback
- [ ] Accessibility support
- [ ] Responsive design for all screen sizes
- [ ] Intuitive navigation between tabs

### **Integration Features**
- [ ] Deep linking configuration
- [ ] Share functionality
- [ ] AI-powered suggestions
- [ ] Real-time data updates
- [ ] Cross-platform compatibility

## 🎯 Success Metrics

### **Functional Metrics**
- [ ] 100% success rate for anonymous submissions
- [ ] < 2 second response time for form submissions
- [ ] Offline submissions sync with 95% success rate
- [ ] Deep links work on both iOS and Android
- [ ] Theme preferences persist correctly

### **User Experience Metrics**
- [ ] Anonymous feedback completion rate > 70%
- [ ] Average time on public event page > 2 minutes
- [ ] Star rating interaction rate > 80%
- [ ] AI suggestion usage rate > 30%
- [ ] User satisfaction with anonymity > 4.5/5

## 🚀 Next Steps

Upon completion of Phase 4, you will have:
- Complete anonymous feedback system
- Public event pages with deep linking
- Offline submission capabilities
- Interactive rating and review system
- AI-powered user assistance

**Ready for Phase 5**: Analytics dashboard and AI insights.

This phase implements the core anonymous feedback functionality that differentiates HiddenViews from other feedback platforms. Focus on user privacy and seamless experience.