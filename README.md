# HiddenViews 👁️

**Get honest feedback and answer questions anonymously. Build trust through transparency.**

HiddenViews is a modern, full-stack web application that allows users to receive anonymous reviews and queries from their audience. Built with Next.js 14, TypeScript, and powered by AI analytics.

## ✨ Features

### 🌟 Core Features
- **Anonymous Reviews**: Receive honest feedback with 1-5 star ratings
- **Query System**: Answer questions from your audience with threaded replies
- **AI Analytics Dashboard**: Get insights from your reviews using Google Gemini AI
- **Dark/Light Theme**: System-aware theme switching with manual override
- **Advanced Filtering**: Filter by category, rating, date, and resolution status
- **Real-time Updates**: Live dashboard with instant feedback

### 🎯 Advanced Features
- **Star Rating System**: Interactive 5-star rating with visual feedback
- **Query Categories**: Organize questions by Technical, General, Feedback, or Other
- **Reply Threading**: Respond to queries with public replies
- **AI Suggestions**: Get AI-powered message suggestions for users
- **Profile Statistics**: Track average ratings, total reviews, and query resolution rates
- **Responsive Design**: Mobile-first design that works on all devices

### 🔒 Privacy & Security
- **Anonymous Feedback**: No user identification required for reviews/queries
- **Secure Authentication**: NextAuth.js with JWT tokens
- **Input Validation**: Zod schema validation on all forms
- **Rate Limiting Ready**: Built-in structure for spam prevention

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **NextAuth.js** - Authentication solution
- **Google Gemini AI** - AI-powered analytics and suggestions
- **Resend** - Email service for verification

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Date-fns** - Date manipulation library

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- Google Gemini API key
- Resend API key (for emails)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd hiddenviews
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hiddenviews
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/hiddenviews

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes
│   │   └── dashboard/     # User dashboard
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API endpoints
│   │   ├── auth/          # NextAuth configuration
│   │   ├── send-review/   # Review submission
│   │   ├── send-query/    # Query submission
│   │   ├── ai-analytics/  # AI insights
│   │   └── ...
│   ├── u/[username]/      # Public profile pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── StarRating.tsx    # Star rating component
│   ├── ReviewCard.tsx    # Review display
│   ├── QueryCard.tsx     # Query display with replies
│   ├── FilterBar.tsx     # Advanced filtering
│   └── ...
├── context/              # React contexts
│   ├── AuthProvider.tsx  # Authentication context
│   └── ThemeProvider.tsx # Theme management
├── lib/                  # Utilities
├── model/                # Database models
├── schemas/              # Zod validation schemas
└── types/                # TypeScript definitions
```

## 🎨 Key Components

### Dashboard Features
- **Stats Overview**: Average rating, total reviews/queries, resolution rate
- **AI Analytics**: Sentiment analysis, key themes, improvement suggestions
- **Advanced Filtering**: Search, category filters, star ratings, date sorting
- **Settings Management**: Toggle review/query acceptance, theme preferences

### Public Profile (/u/[username])
- **Dual Interface**: Switch between leaving reviews and asking questions
- **Interactive Rating**: Click-to-rate star system
- **AI Suggestions**: Get AI-generated message ideas
- **Category Selection**: Organize queries by type

### Review System
- **1-5 Star Ratings**: Visual star selection with hover effects
- **Rich Text Reviews**: Up to 500 characters with real-time validation
- **Anonymous Submission**: No login required for reviewers
- **Helpful Marking**: Future feature for community validation

### Query System
- **Categorized Questions**: Technical, General, Feedback, Other
- **Public Replies**: Profile owners can respond publicly
- **Resolution Tracking**: Mark queries as resolved
- **Threading Support**: Organized conversation flow

## 🤖 AI Features

### Analytics Dashboard
- **Sentiment Analysis**: Overall mood and sentiment trends
- **Key Themes**: Extract common topics and keywords
- **Improvement Suggestions**: AI-generated recommendations
- **Rating Distribution**: Visual breakdown of star ratings
- **Monthly Trends**: Track progress over time

### Message Suggestions
- **Context-Aware**: Suggestions based on profile and category
- **Multiple Options**: Various message styles and tones
- **Easy Integration**: One-click to use suggestions

## 🔧 Configuration

### Theme System
The app supports three theme modes:
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes for low-light usage
- **System**: Automatically matches device preference

### Database Schema
```typescript
User {
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  isAcceptingReviews: boolean
  isAcceptingQueries: boolean
  theme: 'light' | 'dark' | 'system'
  reviews: Review[]
  queries: Query[]
  profileStats: {
    averageRating: number
    totalReviews: number
    totalQueries: number
    resolvedQueries: number
  }
}

Review {
  content: string
  rating: number (1-5)
  createdAt: Date
  isHelpful?: boolean
}

Query {
  content: string
  category: 'Technical' | 'General' | 'Feedback' | 'Other'
  createdAt: Date
  reply?: {
    content: string
    createdAt: Date
  }
  isResolved: boolean
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables for Production
Make sure to set all environment variables in your production environment:
- `MONGODB_URI` - Your production MongoDB connection string
- `NEXTAUTH_SECRET` - A secure random string
- `NEXTAUTH_URL` - Your production domain
- `GEMINI_API_KEY` - Google Gemini API key
- `RESEND_API_KEY` - Resend API key for emails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment platform
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Google** - For the Gemini AI API

## 📞 Support

If you have any questions or need help:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
