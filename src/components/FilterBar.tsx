'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/StarRating'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, Star } from 'lucide-react'

export interface FilterOptions {
  search: string
  category: 'all' | 'review' | 'query'
  starRating: number | null
  queryCategory: string | null
  sortBy: 'newest' | 'oldest' | 'rating' | 'resolved'
  showResolved: boolean
}

interface FilterBarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  reviewCount: number
  queryCount: number
}

export function FilterBar({ filters, onFiltersChange, reviewCount, queryCount }: FilterBarProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      starRating: null,
      queryCategory: null,
      sortBy: 'newest',
      showResolved: true,
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.category !== 'all' || 
    filters.starRating !== null || 
    filters.queryCategory !== null || 
    filters.sortBy !== 'newest' || 
    !filters.showResolved

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-zinc-950 rounded-lg border border-secondary-200 dark:border-secondary-700">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filters.category === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('category', 'all')}
          className="relative dark:bg-bg-100 dark:text-text-200 dark:hover:text-zinc-950"
        >
          All
          <Badge variant="secondary" className="ml-2 text-xs">
            {reviewCount + queryCount}
          </Badge>
        </Button>
        <Button
          variant={filters.category === 'review' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('category', 'review')}
          className="relative dark:bg-bg-100 dark:text-text-200 dark:hover:text-zinc-950"
        >
          Reviews
          <Badge variant="secondary" className="ml-2 text-xs">
            {reviewCount}
          </Badge>
        </Button>
        <Button
          variant={filters.category === 'query' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('category', 'query')}
          className="relative dark:bg-bg-100 dark:text-text-200 dark:hover:text-zinc-950"
        >
          Queries
          <Badge variant="secondary" className="ml-2 text-xs">
            {queryCount}
          </Badge>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 dark:bg-bg-100">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <Input
            placeholder="Search reviews and queries..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 dark:bg-bg-100"
          />
        </div>

        {/* Star Rating Filter (only for reviews) */}
        {filters.category !== 'query' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-500" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.starRating === rating ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => 
                    updateFilter('starRating', filters.starRating === rating ? null : rating)
                  }
                  className="p-1 h-8 w-8"
                >
                  <Star className={`w-4 h-4 ${
                    filters.starRating === rating 
                      ? 'fill-current' 
                      : 'text-secondary-400'
                  }`} />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Query Category Filter (only for queries) */}
        {filters.category !== 'review' && (
          <Select
            value={filters.queryCategory || 'all'}
            onValueChange={(value) => updateFilter('queryCategory', value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[140px] dark:bg-bg-100 dark:text-text-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-bg-100 dark:text-text-200">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Feedback">Feedback</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter('sortBy', value)}
            >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            {filters.category !== 'query' && <SelectItem value="rating">Rating</SelectItem>}
            {filters.category !== 'review' && <SelectItem value="resolved">Resolved</SelectItem>}
          </SelectContent>
        </Select>

        {/* Show Resolved Toggle (only for queries) */}
        {filters.category !== 'review' && (
          <Button
            variant={filters.showResolved ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('showResolved', !filters.showResolved)}
            className="relative dark:bg-bg-100 dark:text-text-200 dark:hover:text-zinc-950"
          >
            {filters.showResolved ? 'All' : 'Unresolved'}
          </Button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-zinc-950"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.starRating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.starRating} Star{filters.starRating !== 1 ? 's' : ''}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('starRating', null)}
              />
            </Badge>
          )}
          {filters.queryCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.queryCategory}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('queryCategory', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
