'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { signInSchema } from '@/schemas/signInSchema';
import { useSession } from 'next-auth/react';

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { update } = useSession();

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

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const { toast } = useToast();
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        // Check if error is for unverified user
        if (result.error.startsWith('UNVERIFIED:')) {
          const username = result.error.split(':')[1];
          
          // Automatically send verification email
          try {
            const emailResponse = await axios.post('/api/send-verification-on-signin', {
              identifier: data.identifier
            });
            
            toast({
              title: 'Email Not Verified',
              description: 'We\'ve sent a verification code to your email. Please check your inbox and verify your account.',
              variant: 'default',
            });
          } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            toast({
              title: 'Email Not Verified',
              description: 'Please verify your email to continue. Click "Resend Email" on the verification page if needed.',
              variant: 'default',
            });
          }
          
          // Redirect to verification page
          setTimeout(() => {
            router.push(`/verify/${encodeURIComponent(username)}`);
          }, 2000);
          return;
        }
        if (result.error === 'CredentialsSignin') {
          toast({
            title: 'Login Failed',
            description: 'Incorrect username or password',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else if (result?.ok) {
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        });

        // Use NextAuth callback URL or redirect to dashboard
        if (result.url) {
          window.location.href = result.url;
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Sign-in error:', error);
      }
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-bg-100' : 'bg-gray-50'} p-4`}>
      <div className={`w-full max-w-md p-8 space-y-8 ${theme === 'dark' ? 'bg-customPrimary-100' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="text-center">
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back to HiddenViews
          </h1>
          <p className={`mb-4 ${theme === 'dark' ? 'text-text-200/80' : 'text-gray-600'}`}>Sign in to manage your event reviews</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email/Username</FormLabel>
                  <Input {...field} placeholder="Enter your email or username" disabled={isLoading} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Password</FormLabel>
                  <Input type="password" {...field} placeholder="Enter your password" disabled={isLoading} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                Forgot password?
              </Link>
            </div>
            <Button className='w-full' type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Not a member yet?{' '}
            <Link href="/sign-up" className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
