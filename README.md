# 🔮 HiddenViews

**Get Honest, Anonymous Feedback That Actually Matters**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)](https://tailwindcss.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple)](https://ai.google.dev/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](https://hiddenreviews.yashcore.app/)

> 🚀 **Live Demo:** [hiddenreviews.yashcore.app](https://hiddenreviews.yashcore.app/)

---

## 🌟 What is HiddenViews?

HiddenViews is a **modern, AI-powered feedback platform** that enables completely anonymous reviews and Q&A sessions. Whether you're running workshops, courses, meetings, or projects, get the honest feedback you need to grow and improve.

### ✨ The Problem We Solve

- **Fear of Judgment**: People hesitate to give honest feedback
- **Bias & Politics**: Identity affects how feedback is received
- **Lost Insights**: Valuable feedback never gets shared
- **Poor Engagement**: Traditional feedback forms are boring

### 🎯 Our Solution

**Complete anonymity + AI insights = Better decisions**

---

## 🚀 Key Features

### 🔒 **Privacy & Anonymity**
- **Zero Identity Tracking**: No logs, no traces, complete anonymity
- **Secure by Design**: Privacy-first architecture
- **GDPR Compliant**: Respects user data rights

### 🎨 **Modern User Experience**
- **Beautiful Dark/Light UI**: Seamless theme switching
- **Mobile-First Design**: Works perfectly on all devices
- **PWA Support**: Install as a native app
- **Real-time Updates**: Live feedback without refreshing

### 🤖 **AI-Powered Analytics**
- **Smart Insights**: Google Gemini AI analyzes feedback patterns
- **Sentiment Analysis**: Understand the overall mood
- **Key Themes Detection**: Identify common topics
- **Actionable Recommendations**: Get specific improvement suggestions

### 📊 **Comprehensive Dashboard**
- **Event Management**: Create and manage multiple events
- **Real-time Statistics**: Track ratings, reviews, and queries
- **Advanced Filtering**: Search and sort feedback efficiently
- **Export Capabilities**: Download reports for analysis

### 🔗 **Easy Integration**
- **Simple Links**: Share event links anywhere
- **Custom Messages**: Personalize feedback requests
- **Email Notifications**: Get notified of new feedback
- **API Access**: Integrate with existing systems

---

## 🛠️ Tech Stack

### **Frontend**
```bash
🔹 Next.js 14 (App Router)
🔹 TypeScript
🔹 Tailwind CSS
🔹 Framer Motion
🔹 React Hook Form + Zod
🔹 Radix UI Components
🔹 PWA Support
```

### **Backend**
```bash
🔹 Next.js API Routes
🔹 NextAuth.js (Authentication)
🔹 MongoDB + Mongoose
🔹 Resend (Email Service)
🔹 Google Gemini AI
🔹 bcryptjs (Security)
```

### **DevOps & Deployment**
```bash
🔹 Vercel (Hosting)
🔹 MongoDB Atlas (Database)
🔹 Custom Domain Setup
🔹 Environment Management
🔹 Production Optimizations
```

---

## 🎯 Use Cases

### 📚 **Education**
- Course feedback and ratings
- Workshop evaluations
- Student Q&A sessions
- Training assessments

### 💼 **Business**
- Team meeting feedback
- Project retrospectives
- Client satisfaction surveys
- Employee engagement

### 🎪 **Events**
- Conference speaker ratings
- Webinar feedback
- Community event reviews
- Performance evaluations

### 👥 **Personal**
- Presentation feedback
- Skill improvement tracking
- Peer reviews
- Social gatherings

---

## 📱 Screenshots

### 🏠 **Landing Page**
![Landing Page](https://via.placeholder.com/800x400/080808/ffffff?text=Beautiful+Dark+Landing+Page)
*Modern, animated landing page with smooth scrolling and interactive elements*

### 📊 **Dashboard**
![Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Event+Management+Dashboard)
*Comprehensive dashboard for managing events and viewing analytics*

### 🤖 **AI Analytics**
![AI Analytics](https://via.placeholder.com/800x400/2a2a2a/ffffff?text=AI+Powered+Insights)
*Smart analytics with sentiment analysis and improvement suggestions*

### 📝 **Public Feedback Page**
![Feedback Form](https://via.placeholder.com/800x400/3a3a3a/ffffff?text=Anonymous+Feedback+Form)
*Clean, user-friendly anonymous feedback interface*

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ 
MongoDB Account
Resend Account (for emails)
Google AI Studio Account (for AI features)
```

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hiddenviews.git
cd hiddenviews
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hiddenviews

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Service
RESEND_API_KEY=re_your_resend_api_key

# AI Features
GEMINI_API_KEY=your_google_gemini_api_key

# Environment
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** to see your app!

---

## 📖 User Guide

### 🎯 **For Event Organizers**

1. **Sign Up**: Create your account with email verification
2. **Create Event**: Set up your workshop, course, or meeting
3. **Configure Settings**: Choose what feedback to collect
4. **Share Link**: Send the unique event link to participants
5. **Monitor Dashboard**: Watch real-time feedback come in
6. **Analyze Results**: Use AI insights to improve

### 👥 **For Participants**

1. **Click Link**: No sign-up required
2. **Choose Feedback Type**: Reviews (ratings) or Questions
3. **Stay Anonymous**: Your identity is never tracked
4. **Submit Feedback**: Help improve future events
5. **Check Answers**: Return to see responses to questions

---

## 🔧 Configuration

### **Event Types**
- Workshop
- Course  
- Webinar
- Meeting
- Project
- Other

### **Feedback Settings**
- ✅ Accept Reviews (star ratings + comments)
- ✅ Accept Queries (questions with optional email notification)
- ✅ Require Email (for query responses)
- ✅ Custom Welcome Message

### **AI Analytics Features**
- Overall sentiment analysis
- Key themes identification
- Improvement suggestions
- Rating distribution
- Monthly trend analysis
- Strengths and weaknesses

---

## 🔒 Security & Privacy

### **Privacy Guarantees**
- ❌ **No IP Tracking**: We don't log visitor IPs
- ❌ **No Cookies for Feedback**: Anonymous users need no tracking
- ❌ **No Personal Data**: Feedback is truly anonymous
- ✅ **Secure Authentication**: bcrypt + JWT tokens
- ✅ **HTTPS Everywhere**: All traffic encrypted
- ✅ **Database Security**: MongoDB Atlas security

### **Data Protection**
- Email verification for account security
- Password hashing with bcrypt
- Secure session management
- Environment variable protection
- Input validation and sanitization

---

## 🌍 Production Deployment

### **Vercel (Recommended)**

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add all required env vars
3. **Deploy**: Automatic deployment on every push
4. **Custom Domain**: Configure your domain

### **Environment Variables**

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-key
MONGODB_URI=your-production-mongodb-uri
RESEND_API_KEY=your-production-resend-key
GEMINI_API_KEY=your-production-gemini-key
NODE_ENV=production
```

### **Post-Deployment Checklist**

- [ ] Test user registration and email verification
- [ ] Verify event creation and sharing
- [ ] Test anonymous feedback submission
- [ ] Confirm AI analytics generation
- [ ] Check email notifications
- [ ] Test PWA installation
- [ ] Validate mobile responsiveness
- [ ] Monitor error logs

---

## 🤖 AI Features Deep Dive

### **Powered by Google Gemini 2.0**

Our AI integration provides:

```typescript
interface AIAnalytics {
  overallSentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number // -1 to 1
  keyThemes: string[]
  improvementSuggestions: string[]
  summary: string
  monthlyTrend: 'improving' | 'stable' | 'declining'
  strongPoints: string[]
  weakPoints: string[]
  ratingDistribution: Record<string, number>
}
```

### **Smart Features**
- **Feedback Suggestions**: AI generates realistic feedback examples
- **Sentiment Analysis**: Understand emotional tone of feedback
- **Theme Detection**: Identify what people talk about most
- **Improvement Tracking**: Monitor progress over time
- **Personalized Reports**: Custom insights for each event

---

## 📊 API Documentation

### **Public Endpoints**

```typescript
// Get event details
GET /api/events/[slug]

// Submit anonymous review
POST /api/send-review
{
  "eventSlug": "string",
  "content": "string",
  "rating": number
}

// Submit anonymous query
POST /api/send-query
{
  "eventSlug": "string",
  "content": "string",
  "category": "string",
  "senderEmail?: "string"
}

// Get public Q&A
GET /api/public-queries/[slug]
```

### **Protected Endpoints**

```typescript
// Create event
POST /api/events

// Get user events
GET /api/events

// Get event analytics
GET /api/ai-analytics

// Update event settings
PATCH /api/events/[slug]
```

---

## 🧪 Testing

### **Development Testing**

```bash
# Run development server
npm run dev

# Test email functionality
POST /api/test-email
{
  "to": "your-email@example.com",
  "type": "verification"
}

# Check authentication
GET /api/debug-auth
```

### **Production Testing**

1. **User Registration Flow**
2. **Email Verification Process**
3. **Event Creation and Management**
4. **Anonymous Feedback Submission**
5. **AI Analytics Generation**
6. **Email Notifications**
7. **PWA Installation**

---

## 🎨 Customization

### **Theming**

```css
/* Custom colors in tailwind.config.ts */
colors: {
  customPrimary: {
    100: '#f0f0f0',
    200: '#d1d1d1', 
    300: '#5227FF'
  },
  bg: {
    100: '#080808',
    200: '#1a1a1a',
    300: '#2a2a2a'
  }
}
```

### **Email Templates**

Custom React Email templates in `/emails/`:
- Verification emails
- Query reply notifications
- Contact form responses

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes
6. Run tests: `npm run build`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### **Code Standards**

- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Prettier for formatting
- ✅ Beginner-friendly comments
- ✅ Responsive design
- ✅ Accessibility compliance

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for seamless deployment
- **Google AI** for powerful language models
- **Resend** for reliable email delivery
- **MongoDB** for flexible data storage
- **Open Source Community** for incredible tools

---

## 💫 What's Next?

### **Upcoming Features**

- 📱 **Mobile App**: Native iOS and Android apps
- 🔗 **Integrations**: Slack, Discord, Teams
- 📊 **Advanced Analytics**: Custom dashboards
- 🌍 **Multi-language**: International support
- 🎯 **Templates**: Pre-built feedback forms
- 🔔 **Real-time**: Live feedback notifications

---

## 📞 Support & Contact

### **Get Help**
- 📧 **Email**: voicesecret9@gmail.com
- 🐙 **GitHub**: [@radicalthinker](https://github.com/radicalthinker)
- 🌐 **Website**: [hiddenreviews.yashcore.app](https://hiddenreviews.yashcore.app/)

### **Report Issues**
Found a bug? Have a feature request? Open an issue on GitHub!

---

<div align="center">

### 🌟 **Star this repo if you found it helpful!** 🌟

**Built with ❤️ for better feedback experiences**

[⭐ Star on GitHub](https://github.com/yourusername/hiddenviews) | [🚀 Live Demo](https://hiddenreviews.yashcore.app/) | [📖 Documentation](https://github.com/yourusername/hiddenviews/wiki)

---

*"The best feedback is honest feedback. The best honest feedback is anonymous feedback."*

</div>