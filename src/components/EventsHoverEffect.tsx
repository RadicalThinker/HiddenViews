import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Settings,
  ExternalLink,
  BarChart3,
  Users
} from "lucide-react";
import Link from "next/link";
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
}

export const EventsHoverEffect = ({
  events,
  className,
}: {
  events: EventData[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatSafeDate = (dateValue: any) => {
    if (!dateValue) return 'Unknown date';
    
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Invalid date';
    
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

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6",
        className
      )}
    >
      {events.map((event, idx) => (
        <div
          key={event._id}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-bg-300/60 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
};

const EventCard = ({ event }: { event: EventData }) => {
  const formatSafeDate = (dateValue: any) => {
    if (!dateValue) return 'Unknown date';
    
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Invalid date';
    
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

  return (
    <div className="rounded-2xl h-full w-full overflow-hidden bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-600 relative z-20 shadow-sm hover:shadow-sm transition-all duration-200">
      <div className="relative z-50 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getEventTypeColor(event.eventType)}>
                {event.eventType}
              </Badge>
              {!event.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 line-clamp-2 mb-2">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                {event.description}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-500 ">
              Created {formatSafeDate(event.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">Rating</p>
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {event.stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">Reviews</p>
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {event.stats.totalReviews}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-600" />
            <div>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">Queries</p>
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {event.stats.totalQueries}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">Resolved</p>
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {event.stats.resolvedQueries}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${event.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full dark:bg-bg-100 dark:hover:bg-bg-300">
              <Settings className="w-3 h-3 mr-1" />
              Manage
            </Button>
          </Link>
          <Link href={`/e/${event.slug}`}>
            <Button variant="outline" size="sm" className="dark:bg-bg-100 dark:hover:bg-bg-300">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
