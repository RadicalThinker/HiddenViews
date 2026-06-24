# Phase 3: Dashboard & Event Management

## 🎯 Phase Overview

**Duration**: 2-3 weeks  
**Priority**: Core Application Feature  
**Goal**: Implement the main dashboard, event creation, event management, and user profile screens with full CRUD functionality.

## 📋 Phase Objectives

### **Primary Deliverables**
1. Dashboard screen with statistics and recent events
2. Event creation form with validation
3. Event list screen with search and filtering
4. Event details and management screen
5. User profile screen with settings
6. Event sharing functionality
7. Pull-to-refresh and infinite scroll

### **Success Criteria**
- [ ] Users can view dashboard with real-time statistics
- [ ] Users can create new events with all required fields
- [ ] Users can view, edit, and delete their events
- [ ] Event sharing works across platforms
- [ ] Profile management is fully functional
- [ ] All screens support pull-to-refresh
- [ ] Performance is optimized with proper caching

## 🛠️ Technical Implementation

### **1. Dashboard Screen**

#### **Dashboard Implementation**
```typescript
// src/screens/dashboard/DashboardScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { Event, User } from '@/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EventCard } from '@/components/events/EventCard';
import { CreateEventFAB } from '@/components/dashboard/CreateEventFAB';

const { width } = Dimensions.get('window');

export function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.getEvents();
      return response.data?.events || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await apiClient.getProfile();
      return response.data?.profileStats || {
        totalEvents: 0,
        totalReviews: 0,
        totalQueries: 0,
        averageRating: 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const recentEvents = events?.slice(0, 3) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 4,
              }}>
                Welcome back!
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
              }}>
                @{user?.username}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FFFFFF',
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          style={{
            paddingHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            Your Statistics
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <StatsCard
              title="Events"
              value={userStats?.totalEvents || 0}
              icon="calendar"
              color={colors.primary}
              style={{ width: (width - 52) / 2 }}
            />
            <StatsCard
              title="Reviews"
              value={userStats?.totalReviews || 0}
              icon="star"
              color="#FFD700"
              style={{ width: (width - 52) / 2 }}
            />
            <StatsCard
              title="Questions"
              value={userStats?.totalQueries || 0}
              icon="help-circle"
              color="#10B981"
              style={{ width: (width - 52) / 2 }}
            />
            <StatsCard
              title="Avg Rating"
              value={userStats?.averageRating?.toFixed(1) || '0.0'}
              icon="trending-up"
              color="#8B5CF6"
              style={{ width: (width - 52) / 2 }}
            />
          </View>
        </Animated.View>

        {/* Recent Events */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(800)}
          style={{
            paddingHorizontal: 20,
            marginBottom: 100, // Space for FAB
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}>
              Recent Events
            </Text>
            {events && events.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text style={{
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: '600',
                }}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={{
              height: 200,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: colors.textSecondary }}>Loading events...</Text>
            </View>
          ) : recentEvents.length > 0 ? (
            <View style={{ gap: 12 }}>
              {recentEvents.map((event: Event, index: number) => (
                <Animated.View
                  key={event._id}
                  entering={FadeInDown.delay(400 + index * 100).duration(600)}
                >
                  <EventCard
                    event={event}
                    onPress={() => navigation.navigate('EventDetails', { slug: event.slug })}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: 'dashed',
            }}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
                marginBottom: 8,
              }}>
                No events yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}>
                Create your first event to start collecting anonymous feedback
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <CreateEventFAB onPress={() => navigation.navigate('CreateEvent')} />
    </SafeAreaView>
  );
}
```

### **2. Stats Card Component**

#### **Stats Card Implementation**
```typescript
// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: ViewStyle;
}

export function StatsCard({ title, value, icon, color, style }: StatsCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
        animatedStyle,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color + '20',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>

      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
      }}>
        {value}
      </Text>

      <Text style={{
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
      }}>
        {title}
      </Text>
    </Animated.View>
  );
}
```

### **3. Event Card Component**

#### **Event Card Implementation**
```typescript
// src/components/events/EventCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { useTheme } from '@/contexts/ThemeContext';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  showActions?: boolean;
}

export function EventCard({ event, onPress, showActions = true }: EventCardProps) {
  const { colors } = useTheme();

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
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <View style={{
              backgroundColor: getEventTypeColor(event.eventType) + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginRight: 8,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: getEventTypeColor(event.eventType),
              }}>
                {event.eventType}
              </Text>
            </View>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: event.isActive ? '#10B981' : colors.textSecondary,
            }} />
          </View>

          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            {event.title}
          </Text>

          {event.description && (
            <Text style={{
              fontSize: 14,
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
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={{
              fontSize: 14,
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
              fontSize: 14,
              color: colors.textSecondary,
              marginLeft: 4,
            }}>
              {event.stats.totalReviews}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="help-circle" size={16} color={colors.textSecondary} />
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginLeft: 4,
            }}>
              {event.stats.totalQueries}
            </Text>
          </View>
        </View>

        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
        }}>
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

### **4. Create Event Screen**

#### **Create Event Implementation**
```typescript
// src/screens/events/CreateEventScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api';
import { EVENT_TYPES } from '@/constants';

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  eventType: z.enum(EVENT_TYPES),
  customMessage: z.string().max(200, 'Custom message too long').optional(),
  isAcceptingReviews: z.boolean().default(true),
  isAcceptingQueries: z.boolean().default(true),
  requireEmail: z.boolean().default(false),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export function CreateEventScreen({ navigation }: any) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: 'Other',
      customMessage: '',
      isAcceptingReviews: true,
      isAcceptingQueries: true,
      requireEmail: false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const response = await apiClient.createEvent(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert(
        'Event Created!',
        'Your event has been created successfully.',
        [
          {
            text: 'View Event',
            onPress: () => navigation.replace('EventDetails', { slug: data.event.slug }),
          },
          {
            text: 'Create Another',
            style: 'cancel',
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.message || 'Failed to create event. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    setIsLoading(true);
    try {
      await createEventMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const watchedValues = watch();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
          }}>
            Create Event
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: 20 }}>
            {/* Basic Information */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}>
                Basic Information
              </Text>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Event Title *"
                    placeholder="Enter event title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                    leftIcon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="eventType"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Event Type *"
                    value={value}
                    onValueChange={onChange}
                    options={EVENT_TYPES.map(type => ({ label: type, value: type }))}
                    placeholder="Select event type"
                    error={errors.eventType?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Description"
                    placeholder="Describe your event (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                    multiline
                    numberOfLines={3}
                    style={{ height: 80 }}
                    leftIcon={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />}
                  />
                )}
              />
            </View>

            {/* Settings */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}>
                Event Settings
              </Text>

              <Controller
                control={control}
                name="customMessage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Welcome Message"
                    placeholder="Custom message for participants (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.customMessage?.message}
                    multiline
                    numberOfLines={2}
                    style={{ height: 60 }}
                    leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />}
                  />
                )}
              />

              {/* Toggle Settings */}
              <View style={{ gap: 16 }}>
                <Controller
                  control={control}
                  name="isAcceptingReviews"
                  render={({ field: { onChange, value } }) => (
                    <ToggleOption
                      title="Accept Reviews"
                      description="Allow participants to leave star ratings and comments"
                      value={value}
                      onValueChange={onChange}
                      icon="star-outline"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="isAcceptingQueries"
                  render={({ field: { onChange, value } }) => (
                    <ToggleOption
                      title="Accept Questions"
                      description="Allow participants to ask questions"
                      value={value}
                      onValueChange={onChange}
                      icon="help-circle-outline"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="requireEmail"
                  render={({ field: { onChange, value } }) => (
                    <ToggleOption
                      title="Require Email"
                      description="Require email for notifications (reduces anonymity)"
                      value={value}
                      onValueChange={onChange}
                      icon="mail-outline"
                    />
                  )}
                />
              </View>
            </View>

            {/* Preview */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 12,
              }}>
                Preview
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 4,
              }}>
                {watchedValues.title || 'Event Title'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.primary,
                marginBottom: 8,
              }}>
                {watchedValues.eventType}
              </Text>
              {watchedValues.description && (
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}>
                  {watchedValues.description}
                </Text>
              )}
            </View>

            <Button
              title="Create Event"
              variant="primary"
              size="large"
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Toggle Option Component
interface ToggleOptionProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
}

function ToggleOption({ title, description, value, onValueChange, icon }: ToggleOptionProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: value ? colors.primary + '20' : colors.border + '50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={value ? colors.primary : colors.textSecondary} 
        />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 18,
        }}>
          {description}
        </Text>
      </View>

      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: value ? colors.primary : colors.border,
        backgroundColor: value ? colors.primary : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {value && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}
```

### **5. Floating Action Button**

#### **Create Event FAB**
```typescript
// src/components/dashboard/CreateEventFAB.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface CreateEventFABProps {
  onPress: () => void;
}

export function CreateEventFAB({ onPress }: CreateEventFABProps) {
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
      withSpring(-5),
      withSpring(5),
      withSpring(0)
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}
```

## 📋 Phase 3 Checklist

### **Dashboard Features**
- [ ] Dashboard screen with user statistics
- [ ] Real-time data updates with React Query
- [ ] Pull-to-refresh functionality
- [ ] Recent events display
- [ ] User profile quick access
- [ ] Animated statistics cards

### **Event Management**
- [ ] Create event form with validation
- [ ] Event type selection
- [ ] Event settings configuration
- [ ] Event preview functionality
- [ ] Event list screen with search/filter
- [ ] Event details and editing

### **UI Components**
- [ ] Stats card component with animations
- [ ] Event card component with sharing
- [ ] Floating Action Button (FAB)
- [ ] Toggle option components
- [ ] Select dropdown component

### **User Experience**
- [ ] Smooth animations throughout
- [ ] Loading states and error handling
- [ ] Keyboard handling for forms
- [ ] Pull-to-refresh on all lists
- [ ] Share functionality for events

### **Data Management**
- [ ] React Query for caching and sync
- [ ] Optimistic updates for better UX
- [ ] Error handling and retry logic
- [ ] Background data refresh
- [ ] Offline support preparation

## 🎯 Success Metrics

### **Performance Metrics**
- [ ] Dashboard loads in < 2 seconds
- [ ] Smooth 60fps animations
- [ ] Form validation responds instantly
- [ ] Event creation completes in < 3 seconds
- [ ] Pull-to-refresh updates in < 1 second

### **User Experience Metrics**
- [ ] Event creation success rate > 95%
- [ ] Dashboard engagement time > 30 seconds
- [ ] Event sharing usage > 20%
- [ ] Form completion rate > 85%
- [ ] User satisfaction score > 4.2/5

## 🚀 Next Steps

Upon completion of Phase 3, you will have:
- Fully functional dashboard with real-time statistics
- Complete event creation and management system
- Professional UI with smooth animations
- Efficient data management with caching
- Event sharing capabilities

**Ready for Phase 4**: Anonymous feedback system and public event pages.

This phase establishes the core event management functionality that users will interact with daily. Focus on performance and user experience to ensure smooth operation.