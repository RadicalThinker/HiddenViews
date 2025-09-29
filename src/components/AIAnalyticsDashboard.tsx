'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarDisplay } from '@/components/StarRating'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Lightbulb,
  Target,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'

interface AnalyticsData {
  overallSentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  keyThemes: string[]
  improvementSuggestions: string[]
  summary: string
  monthlyTrend: 'improving' | 'stable' | 'declining'
  strongPoints: string[]
  weakPoints: string[]
  ratingDistribution: Record<string, number>
  totalReviews: number
  averageRating: number
  lastUpdated: string
}

export function AIAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get('/api/ai-analytics')
      if (response.data.success) {
        setAnalytics(response.data.analytics)
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalytics()
  }

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-600" />
            AI Review Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
            <span className="ml-2 text-secondary-600">Analyzing your reviews...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-600" />
            AI Review Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-600">Unable to load analytics. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              AI Review Analytics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Sentiment */}
            <div className="text-center">
              <Badge className={getSentimentColor(analytics.overallSentiment)}>
                {analytics.overallSentiment.toUpperCase()}
              </Badge>
              <p className="text-sm text-secondary-600 mt-1">Overall Sentiment</p>
            </div>

            {/* Average Rating */}
            <div className="text-center">
              <StarDisplay 
                rating={analytics.averageRating} 
                totalReviews={analytics.totalReviews}
                showCount={false}
              />
              <p className="text-sm text-secondary-600 mt-1">Average Rating</p>
            </div>

            {/* Monthly Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon(analytics.monthlyTrend)}
                <span className="text-sm font-medium capitalize">{analytics.monthlyTrend}</span>
              </div>
              <p className="text-sm text-secondary-600 mt-1">Trend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
            {analytics.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="w-5 h-5" />
              Strong Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.strongPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.weakPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Key Themes & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Key Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.keyThemes.map((theme, index) => (
                <Badge key={index} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = analytics.ratingDistribution[rating] || 0
              const percentage = analytics.totalReviews > 0 
                ? (count / analytics.totalReviews) * 100 
                : 0
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-secondary-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-secondary-500 text-center">
        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
      </p>
    </div>
  )
}
