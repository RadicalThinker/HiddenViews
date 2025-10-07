'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Star,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  Copy,
  Settings,
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  RefreshCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReviewCard } from '@/components/ReviewCard';
import { QueryCard } from '@/components/QueryCard';
import { FilterBar, FilterOptions } from '@/components/FilterBar';
import { Pagination } from '@/components/pagination';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { formatDistanceToNow, isValid } from 'date-fns';

interface EventData {
  _id: string;
  title: string;
  description?: string;
  eventType: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  stats: {
    averageRating: number;
    totalReviews: number;
    totalQueries: number;
    resolvedQueries: number;
  };
  settings: {
    isAcceptingReviews: boolean;
    isAcceptingQueries: boolean;
    requireEmail: boolean;
    customMessage?: string;
  };
}

interface Review {
  _id: string;
  content: string;
  rating: number;
  createdAt: Date;
  isHelpful?: boolean;
}

interface Query {
  _id: string;
  content: string;
  category?: string;
  createdAt: Date;
  reply?: {
    content: string;
    createdAt: Date;
  };
  isResolved: boolean;
}

export default function EventManagement() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug;

  const [event, setEvent] = useState<EventData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    starRating: null,
    queryCategory: null,
    sortBy: 'newest',
    showResolved: true,
  });
  
  const itemsPerPage = 5;

  // Fetch event data and reviews/queries
  const fetchEventData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/events/${slug}/reviews-queries`);
      if (response.data.success) {
        // Ensure dates are properly parsed
        const eventData = {
          ...response.data.event,
          createdAt: response.data.event.createdAt ? new Date(response.data.event.createdAt) : new Date()
        };
        setEvent(eventData);
        setReviews(response.data.reviews || []);
        setQueries(response.data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch event data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [slug, toast]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Update event settings
  const updateEventSettings = async (field: string, value: boolean) => {
    if (!event) return;

    setIsUpdating(true);
    try {
      const response = await axios.patch(`/api/events/${slug}`, {
        settings: {
          ...event.settings,
          [field]: value,
        },
      });

      if (response.data.success) {
        setEvent({
          ...event,
          settings: {
            ...event.settings,
            [field]: value,
          },
        });
        toast({
          title: 'Settings Updated',
          description: 'Event settings have been updated successfully.',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Copy event link
  const copyEventLink = () => {
    const link = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Event link has been copied to clipboard',
    });
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    try {
      const response = await axios.delete(`/api/delete-review/${reviewId}`);
      if (response.data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        toast({
          title: 'Review Deleted',
          description: 'Review has been deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  // Reply to query
  const replyToQuery = async (queryId: string, replyContent: string) => {
    try {
      const response = await axios.post(`/api/reply-query/${queryId}`, {
        content: replyContent,
      });
      if (response.data.success) {
        // Refresh the data to get updated query with reply
        fetchEventData();
        toast({
          title: 'Reply Sent',
          description: 'Your reply has been sent successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    }
  };

  // Delete query
  const deleteQuery = async (queryId: string) => {
    try {
      const response = await axios.delete(`/api/delete-query/${queryId}`);
      if (response.data.success) {
        setQueries(queries.filter(query => query._id !== queryId));
        toast({
          title: 'Query Deleted',
          description: 'Query has been deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete query',
        variant: 'destructive',
      });
    }
  };

  // Mark query as resolved
  const markQueryResolved = async (queryId: string) => {
    try {
      const response = await axios.post(`/api/toggle-query-resolved/${queryId}`);
      if (response.data.success) {
        // Refresh the data to get updated query status
        fetchEventData();
        toast({
          title: 'Query Updated',
          description: 'Query status has been updated',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update query status',
        variant: 'destructive',
      });
    }
  };

  // Delete event
  const deleteEvent = async () => {
    if (!event) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/events/${slug}`);
      if (response.data.success) {
        toast({
          title: 'Event Deleted',
          description: 'Your event has been deleted successfully',
        });
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to delete event',
        variant: 'destructive',
      });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Helper function to safely format dates
  const formatSafeDate = (dateValue: any) => {
    if (!dateValue || dateValue === null || dateValue === undefined) {
      return 'Unknown date';
    }

    // Handle both string and Date object inputs
    let date: Date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (typeof dateValue === 'object' && dateValue.$date) {
      // Handle MongoDB ObjectId date format
      date = new Date(dateValue.$date);
    } else {
      date = new Date(dateValue);
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }

    return formatDistanceToNow(date, { addSuffix: true });
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

  // Filter data based on current filters
  const filteredReviews = reviews.filter(review => {
    if (filters.search && !review.content.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.starRating && review.rating !== filters.starRating) {
      return false;
    }
    return true;
  });

  const filteredQueries = queries.filter(query => {
    if (filters.search && !query.content.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.queryCategory && query.category !== filters.queryCategory) {
      return false;
    }
    if (!filters.showResolved && query.isResolved) {
      return false;
    }
    return true;
  });

  // Combine filtered data for pagination
  const allFilteredItems = [
    ...(filters.category === 'all' || filters.category === 'review' ? filteredReviews.map(item => ({ ...item, type: 'review' })) : []),
    ...(filters.category === 'all' || filters.category === 'query' ? filteredQueries.map(item => ({ ...item, type: 'query' })) : [])
  ];

  // Apply sorting
  const sortedItems = [...allFilteredItems].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        // Sort by rating (reviews first, then by rating descending)
        if (a.type === 'review' && b.type === 'query') return -1;
        if (a.type === 'query' && b.type === 'review') return 1;
        if (a.type === 'review' && b.type === 'review') {
          return (b as any).rating - (a as any).rating;
        }
        return 0;
      case 'resolved':
        // Sort by resolved status (queries first, resolved first)
        if (a.type === 'query' && b.type === 'review') return -1;
        if (a.type === 'review' && b.type === 'query') return 1;
        if (a.type === 'query' && b.type === 'query') {
          const aResolved = (a as any).isResolved ? 1 : 0;
          const bResolved = (b as any).isResolved ? 1 : 0;
          return bResolved - aResolved;
        }
        return 0;
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Loading event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-400" />
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Event Not Found
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className='dark:hover:text-zinc-950'>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-secondary-600 dark:text-secondary-400 mt-2">
              {event.description}
            </p>
          )}
          <p className="text-sm text-secondary-500 mt-2">
            Created {formatSafeDate(event.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/e/${slug}`}>
            <Button variant="outline" className="dark:bg-bg-200 dark:hover:bg-bg-300">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
          </Link>
          <Button variant="outline" onClick={copyEventLink} className='dark:bg-bg-200 dark:hover:bg-bg-300'>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
            className="hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className='dark:bg-gradient-to-r dark:from-bg-200 dark:to-bg-300'>
          <CardContent className="p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 ">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {event.stats.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gradient-to-r dark:from-bg-200 dark:to-bg-300 '>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {event.stats.totalReviews}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gradient-to-r dark:from-bg-200 dark:to-bg-300 '>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Total Queries
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {event.stats.totalQueries}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent-600" />
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gradient-to-r dark:from-bg-200 dark:to-bg-300 '>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Resolved Queries
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {event.stats.resolvedQueries}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Settings */}
      <Card className="mb-8 dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Event Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Accept Reviews</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Allow participants to leave star ratings and feedback
                </p>
              </div>
              <Switch
                checked={event.settings.isAcceptingReviews}
                onCheckedChange={(checked) => updateEventSettings('isAcceptingReviews', checked)}
                disabled={isUpdating}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Accept Questions</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Allow participants to ask questions that you can answer publicly
                </p>
              </div>
              <Switch
                checked={event.settings.isAcceptingQueries}
                onCheckedChange={(checked) => updateEventSettings('isAcceptingQueries', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Email for Notifications</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Force participants to provide email when asking questions
                </p>
              </div>
              <Switch
                checked={event.settings.requireEmail}
                onCheckedChange={(checked) => updateEventSettings('requireEmail', checked)}
                disabled={isUpdating}
              />
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        reviewCount={reviews.length}
        queryCount={queries.length}
      />

      {/* Content Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary">
              All ({sortedItems.length})
            </Badge>
            <Badge variant="secondary">
              Reviews ({filteredReviews.length})
            </Badge>
            <Badge variant="secondary">
              Queries ({filteredQueries.length})
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEventData}
            disabled={isLoading}
            className='dark:bg-bg-200 dark:hover:bg-bg-300'
          >
            <RefreshCcw className="w-4 h-4 mr-2 " />
            Refresh
          </Button>
        </div>

        {/* Paginated Reviews and Queries */}
        {paginatedItems.map((item) => {
          if (item.type === 'review') {
            const review = item as Review & { type: string };
            return (
              <ReviewCard
                key={review._id}
                review={review}
                onDelete={deleteReview}
              />
            );
          } else {
            const query = item as Query & { type: string };
            return (
              <QueryCard
                key={query._id}
                query={query}
                onDelete={deleteQuery}
                onReply={replyToQuery}
                onMarkResolved={markQueryResolved}
              />
            );
          }
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPreviousNext={true}
              maxVisiblePages={5}
            />
          </div>
        )}

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center items-center mb-4">
              <Users className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filters.search || filters.starRating || filters.queryCategory
                ? 'No results found'
                : 'No feedback yet'}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {filters.search || filters.starRating || filters.queryCategory
                ? 'Try adjusting your filters to see more results.'
                : 'Share your event link to start receiving feedback!'}
            </p>
            <Button onClick={copyEventLink} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Event Link
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-bg-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This will permanently delete the event &quot;{event.title}&quot; and all associated reviews and queries.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="dark:bg-bg-300 dark:hover:bg-bg-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEvent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
