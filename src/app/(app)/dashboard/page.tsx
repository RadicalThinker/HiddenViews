'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { 
  Loader2, 
  Plus, 
  Calendar, 
  Eye, 
  MessageSquare, 
  Star,
  TrendingUp,
  ExternalLink,
  Settings,
  Copy,
  Share2,
  RefreshCw
} from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
// import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { formatDistanceToNow, isValid } from 'date-fns';
import { EventsHoverEffect } from '@/components/EventsHoverEffect';
import { WobbleCard } from '@/components/ui/wobble-card';
import { Pagination } from '@/components/pagination';
// import SessionRefresher from '@/components/SessionRefresher';

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

interface UserStats {
  totalEvents: number;
  totalReviews: number;
  totalQueries: number;
  averageRating: number;
}

function EventsDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalEvents: 0,
    totalReviews: 0,
    totalQueries: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const eventsPerPage = 6; // 2 rows of 3 cards

  const { toast } = useToast();
  const { data: session, status, update } = useSession();

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!session?.user?._id) return; // Don't fetch if no user session
    
    setIsLoading(true);
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(`/api/events?t=${timestamp}`);
      if (response.data.success) {
        setEvents(response.data.events);
        
        // Calculate user stats from events
        const stats = response.data.events.reduce((acc: UserStats, event: EventData) => ({
          totalEvents: acc.totalEvents + 1,
          totalReviews: acc.totalReviews + event.stats.totalReviews,
          totalQueries: acc.totalQueries + event.stats.totalQueries,
          averageRating: acc.averageRating + event.stats.averageRating,
        }), { totalEvents: 0, totalReviews: 0, totalQueries: 0, averageRating: 0 });
        
        // Calculate average rating across all events
        if (stats.totalEvents > 0) {
          stats.averageRating = stats.averageRating / stats.totalEvents;
        }
        
        setUserStats(stats);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching events:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, session?.user?._id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Clear data when user session changes
  useEffect(() => {
    if (session?.user?._id) {
      // Clear previous user's data
      setEvents([]);
      setUserStats({
        totalEvents: 0,
        totalReviews: 0,
        totalQueries: 0,
        averageRating: 0,
      });
      setCurrentPage(1);
      // Fetch new user's data
      fetchEvents();
    }
  }, [session?.user?._id, fetchEvents]);

  const copyEventLink = (slug: string) => {
    const link = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Event link has been copied to clipboard',
    });
  };

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh session',
        variant: 'destructive',
      });
    }
  };

  const testSessionAPI = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      toast({
        title: 'Session Data',
        description: data ? 'Session active' : 'No session',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch session',
        variant: 'destructive',
      });
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

  if (!session && status !== 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <div className="mt-4 text-sm text-gray-600">
            Status: {status} | Session: {session ? 'exists' : 'none'}
          </div>
          <Button
            onClick={testSessionAPI}
            className="mt-4"
            variant="outline"
          >
            Test Session API
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <SessionRefresher /> */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            My Events
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs md:text-sm">
            Manage your events and collect anonymous feedback
          </p>
        </div>
        <Link href="/dashboard/create-event">
          <Button className="flex items-center gap-2">
            <Plus className="w-3 h-3  lg:w-4 lg:h-4" />
            Create Event
          </Button>
        </Link>
        {/* <Button
          variant="outline"
          onClick={refreshSession}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Session
        </Button>
        <Button
          variant="outline"
          onClick={testSessionAPI}
          className="flex items-center gap-2"
        >
          Test API
        </Button> */}
      </div>

      {/* Stats Overview with Wobble Effect */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        <WobbleCard containerClassName=" bg-gray-200 dark:bg-black h-24 md:h-36 border-black border-solid">
          <div className="flex items-center justify-between h-full ">
            <div>
              <p className="text-sm md:text-md font-medium dark:text-blue-100 mb-2">
                Total Events
              </p>
              <p className="text-2xl md:text-3xl font-bold dark:text-white">
                {userStats.totalEvents}
              </p>
            </div>
            <Calendar className=" w-6 h-6  md:w-10 md:h-10 dark:text-blue-200 opacity-80" />
          </div>
        </WobbleCard>

        <WobbleCard containerClassName="bg-gray-200 dark:bg-black h-24 md:h-36 border-black border-solid">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm md:text-md font-medium dark:text-blue-100 mb-2">
                Total Reviews
              </p>
              <p className="text-2xl md:text-3xl font-bold dark:text-white">
                {userStats.totalReviews}
              </p>
            </div>
            <Star className="w-6 h-6  md:w-10 md:h-10 dark:text-blue-200 opacity-80" />
          </div>
        </WobbleCard>

        <WobbleCard containerClassName="bg-gray-200 dark:bg-black h-24 md:h-36 border-black border-solid">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm md:text-md font-medium dark:text-blue-100 mb-2">
                Total Queries
              </p>
              <p className="text-2xl md:text-3xl font-bold dark:text-white">
                {userStats.totalQueries}
              </p>
            </div>
            <MessageSquare className="w-6 h-6  md:w-10 md:h-10 dark:text-blue-200 opacity-80" />
          </div>
        </WobbleCard>

        <WobbleCard containerClassName="bg-gray-200 dark:bg-black h-24 md:h-36 border-black border-solid">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm md:text-md font-medium dark:text-blue-100 mb-2">
                Average Rating
              </p>
              <p className="text-2xl md:text-3xl font-bold dark:text-white">
                {userStats.averageRating.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6  md:w-10 md:h-10 dark:text-blue-200 opacity-80" />
          </div>
        </WobbleCard>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <Card className='dark:bg-bg-200'>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-400" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Create your first event to start collecting anonymous feedback
            </p>
            <Link href="/dashboard/create-event">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <EventsHoverEffect 
            events={events.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)} 
            className="mt-4" 
          />
          
          {/* Pagination */}
          {Math.ceil(events.length / eventsPerPage) > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(events.length / eventsPerPage)}
                onPageChange={setCurrentPage}
                showPreviousNext={true}
                maxVisiblePages={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardWrapper() {
  const { data: session } = useSession();
  
  return <EventsDashboard key={session?.user?._id || 'no-user'} />;
}
