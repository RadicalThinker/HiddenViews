'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { StarDisplay } from './StarRating';
import { User } from 'next-auth';
import { 
  Eye, 
  LogOut, 
  Settings, 
  BarChart3, 
  Calendar,
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function Sidebar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: Calendar,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden dark:bg-bg-200 dark:hover:bg-bg-300"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 min-h-screen bg-white dark:bg-bg-200 border-r border-secondary-200 dark:border-bg-300 transition-all duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-secondary-200 dark:border-bg-300">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <Link href="/" className="flex items-center space-x-2 group mr-3">
                    <div className="p-2 rounded-lg bg-primary-500 group-hover:bg-primary-600 transition-colors">
                      <Eye className="w-5 h-5 text-black dark:text-white" />
                    </div>
                    <span className="text-lg font-bold ">
                      HiddenViews
                    </span>
                  </Link>
                  
                  <div className="flex items-center space-x-3">
                    <ThemeToggle />
                    {/* Collapse Button - Hidden on mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex p-1 h-8 w-8 dark:hover:text-zinc-950"
                      onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                      <ChevronLeft className="w-4 h-4 dark:hover:text-zinc-950" />
                    </Button>
                  </div>
                </div>
              )}
              
              {isCollapsed && (
                <div className="flex flex-col items-center space-y-3 w-full">
                  <Link href="/" className="flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors">
                      <Eye className="w-5 h-5 text-black dark:text-white" />
                    </div>
                  </Link>
                  
                  <ThemeToggle />
                  
                  {/* Collapse Button - Hidden on mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex p-1 h-8 w-8"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {session && navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-slate-100 dark:hover:bg-bg-300 hover:text-secondary-900 transition-colors",
                  isCollapsed && "justify-center"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-secondary-200 dark:border-bg-300 space-y-3">
            {/* User Section */}
            {session ? (
              <div className="space-y-3">
                {/* User Stats (if available and not collapsed) */}
                {/* {user.profileStats && !isCollapsed && (
                  <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                    <StarDisplay 
                      rating={user.profileStats.averageRating || 0} 
                      totalReviews={user.profileStats.totalReviews || 0}
                      size="sm"
                      showCount={false}
                    />
                    <span>({user.profileStats.totalReviews || 0})</span>
                  </div>
                )} */}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start p-2 h-auto dark:hover:bg-customPrimary-200",
                        isCollapsed && "justify-center dark:hover:bg-customPrimary-200"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium text-sm dark:hover:bg-customPrimary-200 ">
                          {(user.username || user.email)?.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                          <div className="flex flex-col items-start">
                            <p className="font-medium text-sm">
                              {user.username || user.email}
                            </p>
                            <p className="text-xs text-secondary-500 truncate max-w-[120px]">
                              {user.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 dark:bg-customPrimary-100 " align="end">
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
                      <Link href="/dashboard" className="flex items-center cursor-pointer dark:hover:bg-customPrimary-200">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer dark:hover:bg-customPrimary-200">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-red-300 dark:hover:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className={cn("space-y-2", isCollapsed && "flex flex-col items-center")}>
                <Link href="/sign-in" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full">
                    {isCollapsed ? "In" : "Sign In"}
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full">
                  <Button size="sm" className="w-full">
                    {isCollapsed ? "Up" : "Get Started"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
