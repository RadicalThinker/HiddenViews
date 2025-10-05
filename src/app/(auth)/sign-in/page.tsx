'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
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
  const { update } = useSession();
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
          toast({
            title: 'Email Not Verified',
            description: 'Please verify your email to continue. Redirecting...',
            variant: 'default',
          });
          // Redirect to verification page
          setTimeout(() => {
            router.push(`/verify/${encodeURIComponent(username)}`);
          }, 1500);
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
    <div className="flex justify-center items-center min-h-screen bg-bg-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-customPrimary-100 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Welcome Back to HiddenViews
          </h1>
          <p className="mb-4 text-text-200/80">Sign in to manage your event reviews</p>
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
          <p className="text-sm">
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
