'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Reply, Clock, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Pagination } from '@/components/pagination'

interface PublicQuery {
  _id: string
  content: string
  category?: string
  createdAt: Date
  reply: {
    content: string
    createdAt: Date
  }
  isResolved: boolean
}

interface PublicQASectionProps {
  eventSlug: string
}

export function PublicQASection({ eventSlug }: PublicQASectionProps) {
  const [queries, setQueries] = useState<PublicQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const fetchPublicQueries = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/public-queries/${eventSlug}`)
      const data = await response.json()

      if (data.success) {
        setQueries(data.queries)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error('Error fetching public queries:', error)
      setError('Failed to load Q&A')
    } finally {
      setIsLoading(false)
    }
  }, [eventSlug])

  useEffect(() => {
    fetchPublicQueries()
  }, [fetchPublicQueries])

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'Feedback':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'General':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
        <span className="ml-2 text-secondary-600">Loading Q&A...</span>
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-8">{error}</p>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(queries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQueries = queries.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <>
      {queries.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
          <p className="text-secondary-600 dark:text-secondary-400">
            No answered questions yet. Be the first to ask!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedQueries.map((query) => (
            <div
              key={query._id}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md border-l-4 ${
                query.isResolved 
                  ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10' 
                  : 'border-l-accent-500'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent-600" />
                  {query.category && (
                    <Badge variant="secondary" className={getCategoryColor(query.category)}>
                      {query.category}
                    </Badge>
                  )}
                  {query.isResolved && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-4">
                <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {query.content}
                </p>
              </div>

              {/* Reply Section */}
              <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-2 border-l-primary-500">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Reply
                  </span>
                </div>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed mb-2">
                  {query.reply.content}
                </p>
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(query.reply.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPreviousNext={true}
              maxVisiblePages={3}
            />
          </div>
        </>
      )}
    </>
  )
}
