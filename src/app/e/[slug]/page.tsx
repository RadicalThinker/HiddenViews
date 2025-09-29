'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { 
  Loader2, 
  Star, 
  MessageSquare, 
  Send, 
  Eye, 
  Sparkles,
  Calendar,
  CheckCircle,
  Sun,
  Moon,
  Monitor,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating, StarDisplay } from '@/components/StarRating';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { reviewSchema } from '@/schemas/reviewSchema';
import { querySchema } from '@/schemas/querySchema';
import { PublicQASection } from '@/components/PublicQASection';
import { formatDistanceToNow } from 'date-fns';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "Great event, learned a lot!||When is the next session?||The pace was perfect.||Could you share the resources?||Excellent presentation skills.||I have a question about the topic.||The examples were very helpful.||Could use more interactive elements.||Thank you for the insights.||Looking forward to more events.";

interface EventData {
  title: string;
  description?: string;
  eventType: string;
  createdBy: {
    username: string;
  };
  createdAt: Date;
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

export default function EventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [activeTab, setActiveTab] = useState<'review' | 'query' | 'answered'>('review');
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });

  // Review form
  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: '',
      rating: 5,
    },
  });

  // Query form
  const queryForm = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      content: '',
      category: 'General',
    },
  });

  const reviewContent = reviewForm.watch('content');
  const queryContent = queryForm.watch('content');

  // Fetch event data
  const fetchEventData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/events/${slug}`);
      if (response.data.success) {
        setEventData(response.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Error',
        description: 'Event not found or unavailable',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingEvent(false);
    }
  }, [slug]);

  const initializeTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('anonymous-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setTheme('system');
      applyTheme('system');
    }
  }, []);

  useEffect(() => {
    fetchEventData();
    initializeTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [slug, theme, fetchEventData, initializeTheme]);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem('anonymous-theme', nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Course':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Webinar':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Meeting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Project':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Submit review
  const onSubmitReview = async (data: z.infer<typeof reviewSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-review', {
        ...data,
        eventSlug: slug,
      });

      toast({
        title: 'Review Sent!',
        description: 'Your anonymous review has been submitted successfully.',
      });
      reviewForm.reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to send review',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit query
  const onSubmitQuery = async (data: z.infer<typeof querySchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-query', {
        ...data,
        eventSlug: slug,
      });

      toast({
        title: 'Query Sent!',
        description: 'Your question has been submitted successfully.',
      });
      queryForm.reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to send query',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete('');
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleMessageClick = (message: string) => {
    if (activeTab === 'review') {
      reviewForm.setValue('content', message);
    } else if (activeTab === 'query') {
      queryForm.setValue('content', message);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline">{getThemeLabel()}</span>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Loading event...</span>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline">{getThemeLabel()}</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-400" />
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Event Not Found
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or is no longer available.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl ">
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="flex items-center gap-2 dark:hover:text-zinc-950"
        >
          {getThemeIcon()}
          <span className="hidden sm:inline">{getThemeLabel()}</span>
        </Button>
      </div>

      {/* Event Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-primary-700 dark:text-primary-300" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge className={getEventTypeColor(eventData.eventType)}>
            {eventData.eventType}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {eventData.title}
        </h1>
        
        {eventData.description && (
          <p className="text-secondary-600 dark:text-secondary-400 mb-4 max-w-2xl mx-auto">
            {eventData.description}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 text-sm text-secondary-500 mb-6">
          <User className="w-4 h-4" />
          <span>by @{eventData.createdBy.username}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(eventData.createdAt), { addSuffix: true })}</span>
        </div>

        {eventData.settings.customMessage && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-primary-700 dark:text-primary-300">
              {eventData.settings.customMessage}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="text-center">
            <StarDisplay 
              rating={eventData.stats.averageRating} 
              totalReviews={eventData.stats.totalReviews}
              size="sm"
            />
          </div>
          <div className="text-center">
            <div className="text-sm text-secondary-500">Queries Answered</div>
            <div className="font-semibold">
              {eventData.stats.resolvedQueries}/{eventData.stats.totalQueries}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1">
          <Button
            variant={activeTab === 'review' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('review')}
            disabled={!eventData.settings.isAcceptingReviews}
            className="flex items-center gap-2 dark:hover:text-zinc-950"
          >
            <Star className="w-4 h-4" />
            Leave Review
          </Button>
          <Button
            variant={activeTab === 'query' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('query')}
            disabled={!eventData.settings.isAcceptingQueries}
            className="flex items-center gap-2 dark:hover:text-zinc-950"
          >
            <MessageSquare className="w-4 h-4" />
            Ask Question
          </Button>
          <Button
            variant={activeTab === 'answered' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('answered')}
            className="flex items-center gap-2 dark:hover:text-zinc-950"
          >
            <CheckCircle className="w-4 h-4" />
            Answered Q&A
          </Button>
        </div>
      </div>

      {/* Review Form */}
      {activeTab === 'review' && (
        <Card className="mb-8 dark:bg-customPrimary-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Leave an Anonymous Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventData.settings.isAcceptingReviews ? (
              <Form {...reviewForm}>
                <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-6">
                  <FormField
                    control={reviewForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={field.value}
                              onRatingChange={field.onChange}
                              interactive
                              size="lg"
                            />
                            <span className="text-sm text-secondary-600">
                              {field.value} star{field.value !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reviewForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your honest feedback about this event..."
                            className="min-h-[120px] resize-none  dark:placeholder:text-text-200/60 dark:text-white"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-secondary-500">
                          <span>{field.value.length}/500 characters</span>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !reviewContent}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Review...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Review
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
                <p className="text-secondary-600 dark:text-secondary-400">
                  This event is not currently accepting reviews.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Query Form */}
      {activeTab === 'query' && (
        <Card className="mb-8 dark:bg-customPrimary-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent-600" />
              Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventData.settings.isAcceptingQueries ? (
              <Form {...queryForm}>
                <form onSubmit={queryForm.handleSubmit(onSubmitQuery)} className="space-y-6">
                  {/* <FormField
                    control={queryForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Feedback">Feedback</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={queryForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What would you like to ask about this event?"
                            className="min-h-[120px] resize-none dark:text-white dark:placeholder:text-text-200/60"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-secondary-500">
                          <span>{field.value.length}/300 characters</span>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={queryForm.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com - Get notified when answered"
                            className="dark:text-white dark:placeholder:text-text-200/60"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-secondary-500">
                          Optional: Get an email notification when your question is answered
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !queryContent}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Question...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Question
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
                <p className="text-secondary-600 dark:text-secondary-400">
                  This event is not currently accepting questions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Answered Queries Tab */}
      {activeTab === 'answered' && (
        <Card className="mb-8 dark:bg-customPrimary-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Answered Questions
            </CardTitle>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Browse questions from the community and responses about this event
            </p>
          </CardHeader>
          <CardContent>
            <PublicQASection eventSlug={slug} />
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="mb-8 dark:bg-customPrimary-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <Button
              onClick={fetchSuggestedMessages}
              disabled={isSuggestLoading}
              variant="outline"
              className='dark:hover:text-zinc-950'
            >
              {isSuggestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 dark:hover:text-zinc-950" />
                  Get AI Suggestions
                </>
              )}
            </Button>
            <p className="text-sm text-secondary-500 mt-2">
              Click on any suggestion to use it as a starting point
            </p>
          </div>

          {error ? (
            <p className="text-red-500 text-center">{error.message}</p>
          ) : (
            <div className="grid gap-2">
              {parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="text-left h-auto p-3 justify-start whitespace-normal dark:bg-customPrimary-200 dark:hover:text-zinc-950"
                  onClick={() => handleMessageClick(message)}
                >
                  <span className="text-sm">{message}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="mt-8 dark:bg-customPrimary-100">
        <CardContent className="text-center py-8">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2">Want to create your own events?</h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Create your HiddenViews account to organize events and collect anonymous feedback.
          </p>
          <Link href="/sign-up">
            <Button>
              Create Your Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
