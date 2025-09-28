'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Reply, Check, Trash2, Send } from 'lucide-react'
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

interface QueryCardProps {
  query: {
    _id: string
    content: string
    createdAt: Date
    reply?: {
      content: string
      createdAt: Date
    }
    isResolved: boolean
    category?: string
  }
  onDelete: (queryId: string) => void
  onReply: (queryId: string, replyContent: string) => void
  onMarkResolved: (queryId: string) => void
}

export function QueryCard({ query, onDelete, onReply, onMarkResolved }: QueryCardProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyContent.trim()) return
    
    setIsSubmitting(true)
    try {
      await onReply(query._id, replyContent)
      setReplyContent('')
      setIsReplying(false)
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md border-l-4 ${
      query.isResolved 
        ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10' 
        : 'border-l-accent-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-600" />
            {query.category && (
              <Badge variant="secondary" className={getCategoryColor(query.category)}>
                {query.category}
              </Badge>
            )}
            {query.isResolved && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <Check className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!query.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkResolved(query._id)}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
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
                  <AlertDialogTitle>Delete Query</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this query? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(query._id)}
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
          {query.content}
        </p>
        
        {query.reply && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-2 border-l-primary-500">
            <div className="flex items-center gap-2 mb-2">
              <Reply className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Your Reply</span>
            </div>
            <p className="text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed">
              {query.reply.content}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
              {formatDistanceToNow(new Date(query.reply.createdAt), { addSuffix: true })}
            </p>
          </div>
        )}

        {!query.reply && !isReplying && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReplying(true)}
            className="mt-2 dark:hover:text-zinc-950"
          >
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
        )}

        {isReplying && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReplying(false)
                  setReplyContent('')
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-3">
          {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
