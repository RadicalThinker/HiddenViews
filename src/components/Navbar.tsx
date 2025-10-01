'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { StarDisplay } from './StarRating';
import { User } from 'next-auth';
import { Eye, LogOut, Settings, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Navbar() {
  const { data: session } = useSession();
  const user : User = session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-secondary-200 dark:border-secondary-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm dark:shadow-slate-900/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-primary-500 group-hover:bg-primary-600 transition-colors">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              HiddenViews
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center space-x-3">
                {/* User Stats (if available) */}
                {user.profileStats && (
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                    <StarDisplay 
                      rating={user.profileStats.averageRating || 0} 
                      totalReviews={user.profileStats.totalReviews || 0}
                      size="sm"
                      showCount={false}
                    />
                    <span>({user.profileStats.totalReviews || 0})</span>
                  </div>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium text-sm">
                        {(user.username || user.email)?.charAt(0).toUpperCase()}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">
                          {user.username || user.email}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/sign-in' })}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
