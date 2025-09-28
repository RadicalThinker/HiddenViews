'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';

const createEventSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters.' })
    .max(100, { message: 'Title must not exceed 100 characters.' }),
  description: z
    .string()
    .max(500, { message: 'Description must not exceed 500 characters.' })
    .optional(),
  eventType: z.enum(['Workshop', 'Course', 'Webinar', 'Meeting', 'Project', 'Other']),
  customMessage: z
    .string()
    .max(200, { message: 'Custom message must not exceed 200 characters.' })
    .optional(),
  isAcceptingReviews: z.boolean().default(true),
  isAcceptingQueries: z.boolean().default(true),
  requireEmail: z.boolean().default(false),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateEventFormData>({
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

  const onSubmit = async (data: CreateEventFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/events', data);

      if (response.data.success) {
        toast({
          title: 'Event Created!',
          description: 'Your event has been created successfully.',
        });

        // Redirect to the events dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeDescription = (type: string) => {
    switch (type) {
      case 'Workshop':
        return 'Interactive learning sessions with hands-on activities';
      case 'Course':
        return 'Structured educational content over multiple sessions';
      case 'Webinar':
        return 'Online presentations or seminars';
      case 'Meeting':
        return 'Team meetings, standups, or discussions';
      case 'Project':
        return 'Project reviews, demos, or presentations';
      default:
        return 'General events or custom activities';
    }
  };

  return (
    <div className="container  px-4 py-8 mb-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className='mb-8'>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>
      <div className="flex items-center gap-4 ">

        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Create New Event
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">
            Set up a new event to collect anonymous feedback and questions
          </p>
        </div>
      </div>

      <Card className='dark:bg-customPrimary-100'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., React Fundamentals Workshop"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Course">Course</SelectItem>
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getEventTypeDescription(field.value)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your event is about, what attendees will learn, or any other relevant details..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help participants understand your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Thank you for attending! Your feedback helps me improve future sessions."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional welcome message shown on your event page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Settings</h3>

                <FormField
                  control={form.control}
                  name="isAcceptingReviews"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Reviews</FormLabel>
                        <FormDescription>
                          Allow participants to leave star ratings and feedback
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAcceptingQueries"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Questions</FormLabel>
                        <FormDescription>
                          Allow participants to ask questions that you can answer publicly
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />


              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
