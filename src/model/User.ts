import mongoose, { Schema, Document } from 'mongoose';

export interface Review extends Document {
  content: string;
  rating: number; // 1-5 stars
  createdAt: Date;
  isHelpful?: boolean; // For future upvoting feature
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

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

export interface User extends Document {
  username: string;
  password: string;
  email: string;
  isVerified: boolean;
  verifyCode: string;
  verifyCodeExpiry: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  isAcceptingMessages: boolean;
  theme: 'light' | 'dark' | 'system';
  events: mongoose.Types.ObjectId[]; // References to Event documents
  messages: Message[];
  profileStats: {
    totalEvents: number;
    totalReviews: number;
    totalQueries: number;
    averageRating: number;
  };
}



const UserSchema: Schema<User> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify code expiry is required'],
  },
  resetPasswordToken: {
    type: String,
    trim: true,
  },
  resetPasswordExpiry: {
    type: Date,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  messages: [{
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  profileStats: {
    totalEvents: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalQueries: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
});




const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;
