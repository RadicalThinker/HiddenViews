'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/context/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative dark:hover:text-zinc-950">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 dark:hover:text-zinc-950" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:hover:text-zinc-950" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='dark:bg-customPrimary-100'>
        <DropdownMenuItem onClick={() => setTheme('light')} className='hover:dark:bg-customPrimary-200 cursor-pointer dark:hover:text-zinc-950'>
          <Sun className="mr-2 h-4 w-4 dark:hover:text-zinc-950" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className='hover:dark:bg-customPrimary-200 cursor-pointer dark:hover:text-zinc-950'>
          <Moon className="mr-2 h-4 w-4 dark:hover:text-zinc-950" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className='hover:dark:bg-customPrimary-200 cursor-pointer dark:hover:text-zinc-950'>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
