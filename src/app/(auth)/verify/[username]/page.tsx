'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, Mail } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userEmail, setUserEmail] = useState<string>('');

  // Detect and follow system theme
  useEffect(() => {
    const updateTheme = (isDark: boolean) => {
      setTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateTheme(prefersDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      updateTheme(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fetch user email based on username
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`/api/get-user-email/${params.username}`);
        if (response.data.success) {
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    
    if (params.username) {
      fetchUserEmail();
    }
  }, [params.username]);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/verify-code', {
        username: params.username,
        code: data.code,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-bg-100' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 space-y-8 ${theme === 'dark' ? 'bg-customPrimary-100' : 'bg-white'} rounded-lg shadow-md`}>
        <div className="text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-blue-100' : 'bg-blue-50'} mb-4`}>
            <Mail className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-600' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight lg:text-4xl mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Account
          </h1>
          <p className={`mb-4 ${theme === 'dark' ? 'text-text-200/80' : 'text-gray-600'}`}>
            Please check your email for a verification code sent to{' '}
            <span className="font-semibold">
              {userEmail || decodeURIComponent(params.username)}
            </span>
          </p>

        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input
                    {...field}
                    placeholder="Enter 6-digit code"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-text-200/60' : 'text-gray-500'}`}>
            Didn&apos;t receive the code?{' '}
            <button
              onClick={async () => {
                try {
                  const response = await axios.post('/api/resend-verification', {
                    username: params.username,
                  });
                  toast({
                    title: 'Success',
                    description: response.data.message,
                  });
                } catch (error) {
                  const axiosError = error as AxiosError<ApiResponse>;
                  toast({
                    title: 'Error',
                    description: axiosError.response?.data.message ?? 'Failed to resend verification email',
                    variant: 'destructive',
                  });
                }
              }}
              className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}
              disabled={isSubmitting}
            >
              Resend verification email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}