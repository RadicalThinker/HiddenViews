'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StarDisplay } from '@/components/StarRating'
import { Trash2, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ReviewCardProps {
  review: {
    _id: string
    content: string
    rating: number
    createdAt: Date
    isHelpful?: boolean
  }
  onDelete: (reviewId: string) => void
  onMarkHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onDelete, onMarkHelpful }: ReviewCardProps) {
  return (
    <Card className="w-full dark:bg-customPrimary-100 transition-all duration-200 hover:shadow-md border-l-4 border-l-primary-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <StarDisplay rating={review.rating} showCount={false} size="sm" />
          <div className="flex items-center gap-2">
            {onMarkHelpful && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(review._id)}
                className={`text-xs ${
                  review.isHelpful 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-secondary-500'
                }`}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Helpful
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this review? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(review._id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-secondary-700 dark:text-secondary-300 mb-3 leading-relaxed">
          {review.content}
        </p>
        <p className="text-xs text-secondary-500 dark:text-secondary-400">
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
