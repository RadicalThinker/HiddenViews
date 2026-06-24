# Phase 5: Analytics Dashboard & AI Insights

## 🎯 Phase Overview

**Duration**: 2-3 weeks  
**Priority**: Advanced Feature  
**Goal**: Implement comprehensive analytics dashboard with AI-powered insights, data visualization, sentiment analysis, and actionable recommendations for event organizers.

## 📋 Phase Objectives

### **Primary Deliverables**
1. Analytics dashboard with interactive charts
2. AI-powered sentiment analysis
3. Feedback trend analysis and reporting
4. Event performance metrics
5. Exportable reports (PDF/CSV)
6. Real-time analytics updates
7. Comparative analytics across events

### **Success Criteria**
- [ ] Analytics dashboard displays comprehensive event metrics
- [ ] AI insights provide actionable recommendations
- [ ] Charts and visualizations are interactive and responsive
- [ ] Export functionality works for all report types
- [ ] Real-time updates reflect latest feedback
- [ ] Performance metrics load within 2 seconds
- [ ] Mobile-optimized analytics experience

## 🛠️ Technical Implementation

### **1. Analytics Dashboard Screen**

#### **Main Analytics Dashboard**
```typescript
// src/screens/analytics/AnalyticsScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MetricCard } from '@/components/analytics/MetricCard';
import { SentimentCard } from '@/components/analytics/SentimentCard';
import { TrendChart } from '@/components/analytics/TrendChart';
import { ExportService } from '@/services/export';

const { width } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '90d' | 'all';
type MetricType = 'reviews' | 'queries' | 'ratings' | 'engagement';

export function AnalyticsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['analytics', selectedTimeRange, selectedEvent],
    queryFn: async () => {
      const response = await apiClient.getAnalytics(
        selectedEvent === 'all' ? undefined : selectedEvent
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user events for filter
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.getEvents();
      return response.data?.events || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      Alert.alert(
        'Export Analytics',
        `Export analytics data as ${format.toUpperCase()}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              await ExportService.exportAnalytics(analyticsData, format);
              Alert.alert('Success', `Analytics exported as ${format.toUpperCase()}`);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export analytics');
    }
  };

  const eventOptions = useMemo(() => [
    { label: 'All Events', value: 'all' },
    ...(events?.map((event: any) => ({
      label: event.title,
      value: event._id,
    })) || []),
  ], [events]);

  const timeRangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'All time', value: 'all' },
  ];

  if (isLoading && !analyticsData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: colors.textSecondary }}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            Analytics
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleExport('csv')}
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
              <Ionicons name="download-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleExport('pdf')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
        }}>
          <View style={{ flex: 1 }}>
            <Select
              value={selectedEvent}
              onValueChange={setSelectedEvent}
              options={eventOptions}
              placeholder="Select Event"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
              options={timeRangeOptions}
              placeholder="Time Range"
            />
          </View>
        </View>
      </View>

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
        {/* Overview Metrics */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={{ paddingHorizontal: 20, paddingTop: 20 }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            Overview
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}>
            <MetricCard
              title="Total Reviews"
              value={analyticsData?.totalReviews || 0}
              change={analyticsData?.reviewsChange || 0}
              icon="star"
              color="#FFD700"
              style={{ width: (width - 52) / 2 }}
            />
            <MetricCard
              title="Total Questions"
              value={analyticsData?.totalQueries || 0}
              change={analyticsData?.queriesChange || 0}
              icon="help-circle"
              color="#10B981"
              style={{ width: (width - 52) / 2 }}
            />
            <MetricCard
              title="Avg Rating"
              value={analyticsData?.averageRating?.toFixed(1) || '0.0'}
              change={analyticsData?.ratingChange || 0}
              icon="trending-up"
              color="#8B5CF6"
              style={{ width: (width - 52) / 2 }}
            />
            <MetricCard
              title="Response Rate"
              value={`${analyticsData?.responseRate || 0}%`}
              change={analyticsData?.responseRateChange || 0}
              icon="checkmark-circle"
              color="#3B82F6"
              style={{ width: (width - 52) / 2 }}
            />
          </View>
        </Animated.View>

        {/* AI Sentiment Analysis */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            AI Insights
          </Text>
          
          <SentimentCard
            sentiment={analyticsData?.aiInsights?.overallSentiment || 'neutral'}
            score={analyticsData?.aiInsights?.sentimentScore || 0}
            summary={analyticsData?.aiInsights?.summary || 'No insights available'}
            keyThemes={analyticsData?.aiInsights?.keyThemes || []}
            suggestions={analyticsData?.aiInsights?.improvementSuggestions || []}
          />
        </Animated.View>

        {/* Trend Charts */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(800)}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            Trends
          </Text>
          
          <TrendChart
            data={analyticsData?.trends || []}
            timeRange={selectedTimeRange}
          />
        </Animated.View>

        {/* Rating Distribution */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(800)}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            Rating Distribution
          </Text>
          
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {analyticsData?.ratingDistribution && (
              <BarChart
                data={{
                  labels: ['1★', '2★', '3★', '4★', '5★'],
                  datasets: [{
                    data: Object.values(analyticsData.ratingDistribution),
                  }],
                }}
                width={width - 72}
                height={200}
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16),
                  labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16),
                  style: { borderRadius: 16 },
                }}
                style={{ borderRadius: 16 }}
              />
            )}
          </View>
        </Animated.View>

        {/* Event Performance Comparison */}
        {selectedEvent === 'all' && events && events.length > 1 && (
          <Animated.View 
            entering={FadeInDown.delay(500).duration(800)}
            style={{ paddingHorizontal: 20, marginBottom: 40 }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16,
            }}>
              Event Performance
            </Text>
            
            <View style={{ gap: 12 }}>
              {events.slice(0, 5).map((event: any, index: number) => (
                <EventPerformanceCard
                  key={event._id}
                  event={event}
                  rank={index + 1}
                  onPress={() => setSelectedEvent(event._id)}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### **2. Metric Card Component**

#### **Analytics Metric Card**
```typescript
// src/components/analytics/MetricCard.tsx
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  useAnimatedProps,
  interpolate,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { useTheme } from '@/contexts/ThemeContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: ViewStyle;
}

export function MetricCard({ title, value, change, icon, color, style }: MetricCardProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(Math.abs(change) / 100, { duration: 1000 });
  }, [change]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }));

  const getChangeColor = () => {
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.textSecondary;
  };

  const getChangeIcon = () => {
    if (change > 0) return 'trending-up';
    if (change < 0) return 'trending-down';
    return 'remove';
  };

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
        animatedStyle,
      ]}
    >
      {/* Header */}
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

        {change !== 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getChangeColor() + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Ionicons 
              name={getChangeIcon()} 
              size={12} 
              color={getChangeColor()}
              style={{ marginRight: 4 }}
            />
            <Text style={{
              fontSize: 12,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
      }}>
        {value}
      </Text>

      {/* Title */}
      <Text style={{
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
      }}>
        {title}
      </Text>

      {/* Progress Indicator */}
      {change !== 0 && (
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
              useAnimatedStyle(() => ({
                width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
              })),
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}
```

### **3. Sentiment Analysis Card**

#### **AI Sentiment Card Component**
```typescript
// src/components/analytics/SentimentCard.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';

interface SentimentCardProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  summary: string;
  keyThemes: string[];
  suggestions: string[];
}

export function SentimentCard({ 
  sentiment, 
  score, 
  summary, 
  keyThemes, 
  suggestions 
}: SentimentCardProps) {
  const { colors } = useTheme();

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return 'happy-outline';
      case 'negative':
        return 'sad-outline';
      default:
        return 'remove-circle-outline';
    }
  };

  const getSentimentText = () => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: getSentimentColor() + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Ionicons name="sparkles" size={24} color={getSentimentColor()} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            AI Sentiment Analysis
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={getSentimentIcon()} 
              size={16} 
              color={getSentimentColor()}
              style={{ marginRight: 6 }}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: getSentimentColor(),
            }}>
              {getSentimentText()} ({(score * 100).toFixed(0)}%)
            </Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={{
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: getSentimentColor(),
      }}>
        <Text style={{
          fontSize: 16,
          color: colors.text,
          lineHeight: 24,
        }}>
          {summary}
        </Text>
      </View>

      {/* Key Themes */}
      {keyThemes.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Key Themes
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {keyThemes.map((theme, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100).duration(600)}
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.primary,
                }}>
                  {theme}
                </Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            AI Recommendations
          </Text>
          <View style={{ gap: 8 }}>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100).duration(600)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  marginTop: 2,
                }}>
                  <Ionicons name="bulb" size={12} color={colors.success} />
                </View>
                <Text style={{
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 20,
                  flex: 1,
                }}>
                  {suggestion}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
```

### **4. Trend Chart Component**

#### **Interactive Trend Chart**
```typescript
// src/components/analytics/TrendChart.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface TrendChartProps {
  data: any[];
  timeRange: string;
}

type ChartType = 'reviews' | 'queries' | 'ratings';

export function TrendChart({ data, timeRange }: TrendChartProps) {
  const { colors } = useTheme();
  const [selectedChart, setSelectedChart] = useState<ChartType>('reviews');

  const getChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    const labels = data.map(item => item.date);
    let dataset;

    switch (selectedChart) {
      case 'reviews':
        dataset = data.map(item => item.reviews || 0);
        break;
      case 'queries':
        dataset = data.map(item => item.queries || 0);
        break;
      case 'ratings':
        dataset = data.map(item => item.averageRating || 0);
        break;
      default:
        dataset = data.map(item => item.reviews || 0);
    }

    return {
      labels,
      datasets: [{ data: dataset }],
    };
  };

  const chartTypes = [
    { key: 'reviews', label: 'Reviews', icon: 'star', color: '#FFD700' },
    { key: 'queries', label: 'Questions', icon: 'help-circle', color: '#10B981' },
    { key: 'ratings', label: 'Ratings', icon: 'trending-up', color: '#8B5CF6' },
  ];

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {/* Chart Type Selector */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
      }}>
        {chartTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            onPress={() => setSelectedChart(type.key as ChartType)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: selectedChart === type.key ? colors.primary : 'transparent',
            }}
          >
            <Ionicons 
              name={type.icon as any} 
              size={16} 
              color={selectedChart === type.key ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedChart === type.key ? '#FFFFFF' : colors.textSecondary,
            }}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <LineChart
        data={getChartData()}
        width={width - 72}
        height={220}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: selectedChart === 'ratings' ? 1 : 0,
          color: (opacity = 1) => {
            const selectedType = chartTypes.find(t => t.key === selectedChart);
            return selectedType?.color + Math.round(opacity * 255).toString(16) || colors.primary;
          },
          labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16),
          style: { borderRadius: 16 },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: colors.surface,
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
      />

      {/* Chart Info */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
        }}>
          {timeRange === '7d' ? 'Last 7 days' : 
           timeRange === '30d' ? 'Last 30 days' : 
           timeRange === '90d' ? 'Last 90 days' : 'All time'}
        </Text>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: chartTypes.find(t => t.key === selectedChart)?.color || colors.primary,
            marginRight: 6,
          }} />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
          }}>
            {chartTypes.find(t => t.key === selectedChart)?.label}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

### **5. Export Service**

#### **Analytics Export Functionality**
```typescript
// src/services/export.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export class ExportService {
  static async exportAnalytics(data: any, format: 'pdf' | 'csv'): Promise<void> {
    if (format === 'pdf') {
      await this.exportToPDF(data);
    } else {
      await this.exportToCSV(data);
    }
  }

  private static async exportToPDF(data: any): Promise<void> {
    const html = this.generatePDFHTML(data);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `analytics-${Date.now()}.pdf`;
    const newUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    await Sharing.shareAsync(newUri);
  }

  private static async exportToCSV(data: any): Promise<void> {
    const csvContent = this.generateCSVContent(data);
    
    const fileName = `analytics-${Date.now()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    await Sharing.shareAsync(fileUri);
  }

  private static generatePDFHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>HiddenViews Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #5227FF; }
            .metric-label { font-size: 14px; color: #666; }
            .section { margin: 20px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .insight { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; }
            .theme { display: inline-block; background: #5227FF20; padding: 5px 10px; border-radius: 15px; margin: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HiddenViews Analytics Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Overview Metrics</div>
            <div class="metric">
              <div class="metric-value">${data?.totalReviews || 0}</div>
              <div class="metric-label">Total Reviews</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data?.totalQueries || 0}</div>
              <div class="metric-label">Total Questions</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data?.averageRating?.toFixed(1) || '0.0'}</div>
              <div class="metric-label">Average Rating</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">AI Insights</div>
            <div class="insight">
              <strong>Overall Sentiment:</strong> ${data?.aiInsights?.overallSentiment || 'N/A'}
            </div>
            <div class="insight">
              <strong>Summary:</strong> ${data?.aiInsights?.summary || 'No insights available'}
            </div>
            <div class="insight">
              <strong>Key Themes:</strong><br>
              ${data?.aiInsights?.keyThemes?.map((theme: string) => `<span class="theme">${theme}</span>`).join('') || 'None'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Recommendations</div>
            ${data?.aiInsights?.improvementSuggestions?.map((suggestion: string, index: number) => 
              `<div class="insight">${index + 1}. ${suggestion}</div>`
            ).join('') || '<div class="insight">No recommendations available</div>'}
          </div>
        </body>
      </html>
    `;
  }

  private static generateCSVContent(data: any): string {
    const headers = ['Metric', 'Value', 'Change'];
    const rows = [
      ['Total Reviews', data?.totalReviews || 0, data?.reviewsChange || 0],
      ['Total Questions', data?.totalQueries || 0, data?.queriesChange || 0],
      ['Average Rating', data?.averageRating?.toFixed(1) || '0.0', data?.ratingChange || 0],
      ['Response Rate', `${data?.responseRate || 0}%`, data?.responseRateChange || 0],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      'AI Insights',
      `Overall Sentiment,${data?.aiInsights?.overallSentiment || 'N/A'}`,
      `Sentiment Score,${data?.aiInsights?.sentimentScore || 0}`,
      '',
      'Key Themes',
      ...(data?.aiInsights?.keyThemes?.map((theme: string) => `"${theme}"`) || []),
      '',
      'Recommendations',
      ...(data?.aiInsights?.improvementSuggestions?.map((suggestion: string) => `"${suggestion}"`) || []),
    ].join('\n');

    return csvContent;
  }
}
```

## 📋 Phase 5 Checklist

### **Analytics Dashboard**
- [ ] Main analytics screen with comprehensive metrics
- [ ] Interactive charts and visualizations
- [ ] Time range and event filtering
- [ ] Real-time data updates with pull-to-refresh
- [ ] Mobile-optimized chart layouts
- [ ] Performance metrics and KPIs

### **AI Insights**
- [ ] Sentiment analysis with visual indicators
- [ ] Key themes extraction and display
- [ ] AI-powered improvement suggestions
- [ ] Trend analysis and predictions
- [ ] Comparative analytics across events
- [ ] Actionable recommendations

### **Data Visualization**
- [ ] Interactive line charts for trends
- [ ] Bar charts for rating distribution
- [ ] Pie charts for category breakdowns
- [ ] Metric cards with change indicators
- [ ] Progress indicators and animations
- [ ] Responsive chart configurations

### **Export Functionality**
- [ ] PDF report generation with styling
- [ ] CSV data export for analysis
- [ ] Shareable report links
- [ ] Custom report templates
- [ ] Automated report scheduling
- [ ] Email report delivery

### **User Experience**
- [ ] Smooth animations and transitions
- [ ] Loading states and error handling
- [ ] Intuitive navigation and filtering
- [ ] Accessibility support for charts
- [ ] Offline analytics caching
- [ ] Performance optimization

## 🎯 Success Metrics

### **Performance Metrics**
- [ ] Analytics dashboard loads in < 2 seconds
- [ ] Charts render smoothly at 60fps
- [ ] Export functionality completes in < 5 seconds
- [ ] Real-time updates with < 1 second delay
- [ ] Memory usage stays under 150MB

### **User Engagement Metrics**
- [ ] Analytics page visit rate > 60% of users
- [ ] Average time on analytics page > 3 minutes
- [ ] Export feature usage > 25% of users
- [ ] AI insights interaction rate > 40%
- [ ] User satisfaction with insights > 4.3/5

## 🚀 Next Steps

Upon completion of Phase 5, you will have:
- Comprehensive analytics dashboard with AI insights
- Interactive data visualizations and charts
- Export functionality for reports and data
- Real-time analytics with performance metrics
- AI-powered recommendations and trends

**Ready for Phase 6**: Push notifications, offline sync, and final optimizations.

This phase provides valuable insights that help users understand their feedback data and make informed decisions about their events and content.