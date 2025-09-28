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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="flex justify-center items-center min-h-screen bg-bg-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-customPrimary-100 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4 text-text-200/80">
            We've sent a verification code to your email address for{' '}
            <span className="font-semibold">{decodeURIComponent(params.username)}</span>
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
          <p className="text-sm text-text-200/60">
            Didn't receive the code?{' '}
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
              className="text-blue-600 hover:text-blue-800 underline"
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