'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { forgotPasswordSchema } from '@/schemas/passwordResetSchema';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/forgot-password', data);
      
      toast({
        title: 'Email Sent',
        description: response.data.message,
        variant: 'default',
      });
      
      setIsEmailSent(true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-bg-100 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-customPrimary-100 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-4">
              Check Your Email
            </h1>
            <p className="mb-6 text-text-200/80">
              We&apos;ve sent password reset instructions to your email address. 
              Please check your inbox and follow the link to reset your password.
            </p>
            <p className="text-sm text-text-200/60 mb-6">
              If you don&apos;t see the email, check your spam folder or wait a few minutes and try again.
            </p>
            <Link href="/sign-in">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-customPrimary-100 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">
            Forgot Password?
          </h1>
          <p className="mb-4 text-text-200/80">
            No worries! Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="Enter your email address" 
                    disabled={isSubmitting} 
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button className='w-full' type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center">
          <p className="text-sm">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}