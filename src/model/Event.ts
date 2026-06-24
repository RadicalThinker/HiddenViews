import mongoose, { Schema, Document } from 'mongoose';

export interface Review extends Document {
  content: string;
  rating: number; // 1-5 stars
  createdAt: Date;
  isHelpful?: boolean;
  senderEmail?: string; // Optional email for notifications
}

export interface Query extends Document {
  content: string;
  createdAt: Date;
  reply?: {
    content: string;
    createdAt: Date;
  };
  isResolved: boolean;
  category?: string; // Technical, General, Feedback, etc.
  senderEmail?: string; // Optional email for notifications
}

const ReviewSchema: Schema<Review> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isHelpful: {
    type: Boolean,
    default: false,
  },
  senderEmail: {
    type: String,
    trim: true,
  },
});

const QuerySchema: Schema<Query> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reply: {
    content: String,
    createdAt: Date,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['Technical', 'General', 'Feedback', 'Other'],
    default: 'General',
  },
  senderEmail: {
    type: String,
    trim: true,
  },
});

export interface Event extends Document {
  title: string;
  description?: string;
  eventType: 'Workshop' | 'Course' | 'Webinar' | 'Meeting' | 'Project' | 'Other';
  slug: string; // URL-friendly identifier
  createdBy: mongoose.Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: {
    isAcceptingReviews: boolean;
    isAcceptingQueries: boolean;
    requireEmail: boolean; // Force email for notifications
    customMessage?: string; // Custom message for the event page
  };
  reviews: Review[];
  queries: Query[];
  stats: {
    averageRating: number;
    totalReviews: number;
    totalQueries: number;
    resolvedQueries: number;
  };
}

const EventSchema: Schema<Event> = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  eventType: {
    type: String,
    enum: ['Workshop', 'Course', 'Webinar', 'Meeting', 'Project', 'Other'],
    required: true,
    default: 'Other',
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    isAcceptingReviews: {
      type: Boolean,
      default: true,
    },
    isAcceptingQueries: {
      type: Boolean,
      default: true,
    },
    requireEmail: {
      type: Boolean,
      default: false,
    },
    customMessage: {
      type: String,
      trim: true,
      maxlength: [200, 'Custom message cannot exceed 200 characters'],
    },
  },
  reviews: [ReviewSchema],
  queries: [QuerySchema],
  stats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalQueries: { type: Number, default: 0 },
    resolvedQueries: { type: Number, default: 0 },
  },
});

// Pre-save middleware to update stats and timestamps
EventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update stats
  this.stats.totalReviews = this.reviews.length;
  this.stats.totalQueries = this.queries.length;
  this.stats.resolvedQueries = this.queries.filter((q: any) => q.isResolved).length;
  
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    this.stats.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  } else {
    this.stats.averageRating = 0;
  }
  
  next();
});

const EventModel =
  (mongoose.models.Event as mongoose.Model<Event>) ||
  mongoose.model<Event>('Event', EventSchema);

export default EventModel;
