# 🔮 HiddenViews

**Get Honest, Anonymous Feedback & Interactive Q&A That Actually Matters**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Resend](https://img.shields.io/badge/Resend-Email_API-black?logo=resend)](https://resend.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v4-purple)](https://next-auth.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **Live Production Application:** [https://hiddenreviews.yashcore.app/](https://hiddenreviews.yashcore.app/)

---

## 🌟 Overview

**HiddenViews** is an AI-powered feedback and interactive Q&A platform engineered for modern educators, workshop organizers, team leads, and event managers. It eliminates the fear of judgment by providing attendees with a truly anonymous, friction-free way to share candid reviews and ask critical questions — while giving organizers deep, synthesized AI insights to take immediate action.

### 💡 The Problem
- **Feedback Hesitation:** Participants rarely express authentic thoughts when their names or emails are tied to their feedback.
- **Lost Actionability:** Manually sifting through unstructured responses to extract common themes or sentiment shifts is slow and error-prone.
- **Disjointed Q&A:** Questions asked during meetings and events are often lost in chat feeds without dedicated follow-up or visibility.

### 🎯 The Solution
- **Complete Privacy for Attendees:** No account creation, no cookies for tracking, and zero IP logging.
- **Gemini-Powered Analytics:** Automated sentiment scoring, key theme extraction, strength/weakness detection, and actionable suggestions.
- **Organized Public Q&A:** A dedicated query submission workflow where organizers can answer questions publicly and optionally notify askers via email.

---

## ✨ Key Features

### 🔒 Privacy-First Participant Experience (`/e/[slug]`)
- **Zero Registration Needed:** Attendees simply open the event link or scan a QR code.
- **Star Ratings & Reviews:** 1 to 5 star rating system with detailed feedback input.
- **AI Feedback Suggestions:** Attendees struggling with phrasing can click AI-generated suggestion chips generated on-the-fly with **Google Gemini 2.0 Flash Lite**.
- **Anonymous Queries:** Attendees can submit categorized queries (`Technical`, `General`, `Feedback`, `Other`) with optional email notification upon organizer reply.
- **Public Answered Q&A Feed:** Attendees can view organizer responses directly on the event page.

### 📊 Organizer Suite & Event Management (`/dashboard`)
- **Multi-Event Lifecycle:** Create and manage workshops, courses, webinars, team meetings, and custom projects.
- **Granular Event Controls:**
  - Toggle accepting new reviews on/off.
  - Toggle accepting queries on/off.
  - Require or make email optional for query response notifications.
  - Custom welcome greeting and event descriptions.
- **Query Resolution:** Directly draft replies, notify the sender via email (if email was provided), and toggle query resolution status.
- **Direct Link Sharing:** One-click copy for public event URLs and easy distribution.

### 🤖 AI Analytics Engine
- **Model:** Powered by **Google Gemini 2.0 Flash** via `@google/generative-ai`.
- **Sentiment Scoring:** Accurately gauges emotional tone across negative (-1.0) to positive (+1.0) spectrum.
- **Thematic Clustering:** Detects recurring discussion points and recurring pain points.
- **Executive Summary:** Generates concise 2–3 sentence digests of overall event reception.
- **Action Items & Growth:** Recommends concrete, high-priority improvements based on real attendee input.
- **Trend Detection:** Evaluates whether satisfaction is improving, stable, or declining over time.

### 🎨 Modern, High-Performance UI/UX
- **Dark & Light Mode:** Flawless theme transitions powered by `next-themes`.
- **Micro-Interactions & Animation:** Built with Tailwind CSS, Framer Motion, GSAP, and Radix UI primitives.
- **Interactive Canvas Elements:** DotGrid background and Embla carousel showcase on the landing page.
- **PWA Ready:** Configured for mobile installation as a progressive web app.

### 🛡️ Security & Account Management
- **Secure Authentication:** NextAuth.js credential provider with bcrypt-hashed passwords and secure JWT sessions.
- **Email Verification:** 6-digit OTP code verification sent upon registration via **Resend**.
- **Password Recovery:** Secure token-based password reset workflow with time-limited links.
- **Custom Production Logger:** In-memory and environment-aware logging (`src/lib/logger.ts`) that suppresses debug clutter in production.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14.0.4](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.3](https://tailwindcss.com/), [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate), [Radix UI](https://www.radix-ui.com/) |
| **Motion & Design** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/), [Lucide Icons](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 8](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (JWT strategy, CredentialsProvider, custom cookies) |
| **AI Services** | [Google Generative AI](https://ai.google.dev/) (`gemini-2.0-flash` & `gemini-2.0-flash-lite`) |
| **Email Service** | [Resend 2.0](https://resend.com/) + [@react-email](https://react.email/) components |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Repository Structure

```
HiddenViews/
├── emails/                         # React Email templates
│   ├── VerificationEmail.tsx       # 6-digit OTP verification template
│   ├── ResetPasswordEmail.tsx      # Password reset link template
│   └── QueryReplyEmail.tsx         # Organizer reply notification template
├── public/                         # Static assets, icons, and PWA manifest
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── (app)/                  # Authenticated application shell
│   │   │   ├── dashboard/          # Organizer dashboard & event listings
│   │   │   │   ├── create-event/   # Event creation wizard
│   │   │   │   ├── events/[slug]/  # Per-event reviews, queries & analytics
│   │   │   │   └── profile/        # Organizer statistics & profile
│   │   │   └── settings/           # Account settings & credentials
│   │   ├── (auth)/                 # Authentication routes
│   │   │   ├── sign-in/            # User login
│   │   │   ├── sign-up/            # Account registration
│   │   │   ├── verify/[username]/  # OTP verification screen
│   │   │   ├── forgot-password/    # Password reset request
│   │   │   └── reset-password/     # Token verification & password update
│   │   ├── api/                    # Next.js Route Handlers
│   │   │   ├── ai-analytics/       # Gemini-powered review analysis
│   │   │   ├── auth/[...nextauth]/ # NextAuth endpoints & options
│   │   │   ├── contact/            # Landing page contact form handler
│   │   │   ├── events/             # CRUD endpoints for events
│   │   │   ├── send-review/        # Anonymous review submission
│   │   │   ├── send-query/         # Anonymous query submission
│   │   │   ├── reply-query/        # Organizer query response handler
│   │   │   ├── suggest-messages/   # Gemini prompt suggestions
│   │   │   └── ...                 # Auth, verification & setting APIs
│   │   ├── e/[slug]/               # Public attendee feedback & Q&A page
│   │   ├── globals.css             # Base styles & theme variables
│   │   ├── layout.tsx              # Root HTML layout with providers
│   │   └── page.tsx                # High-conversion landing page
│   ├── components/                 # Shared React UI components
│   │   ├── ui/                     # Primitives (button, card, dialog, toast, etc.)
│   │   ├── AIAnalyticsDashboard.tsx# AI sentiment & theme visualization
│   │   ├── MessageCard.tsx         # Feedback item component
│   │   ├── Navbar.tsx              # Dynamic navigation bar
│   │   ├── PublicQASection.tsx     # Resolved Q&A accordion list
│   │   └── StarRating.tsx          # Interactive rating stars
│   ├── context/                    # React Context (Auth & Theme providers)
│   ├── helpers/                    # Helper functions (email senders)
│   ├── lib/                        # Core utilities
│   │   ├── auth.ts                 # Server session resolution helper
│   │   ├── cors.ts                 # CORS headers configuration
│   │   ├── dbConnect.ts            # Mongoose singleton connection
│   │   ├── logger.ts               # Production-ready logging module
│   │   ├── resend.ts               # Resend client proxy
│   │   └── utils.ts                # Class name mergers and formatters
│   ├── model/                      # Mongoose models (User, Event)
│   ├── schemas/                    # Zod validation schemas
│   └── types/                      # TypeScript definitions & API responses
├── next.config.js                  # Next.js build optimizations & security headers
├── tailwind.config.ts              # Tailwind CSS configuration & design tokens
└── tsconfig.json                   # TypeScript configuration
```

---

## 📡 API Reference

### 🌐 Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events/[slug]` | Fetch public metadata and settings for an event |
| `POST` | `/api/send-review` | Submit an anonymous review (`eventSlug`, `content`, `rating`) |
| `POST` | `/api/send-query` | Submit an anonymous question (`eventSlug`, `content`, `category`, `senderEmail?`) |
| `GET` | `/api/public-queries/[slug]` | Fetch all resolved public questions and organizer replies |
| `POST` | `/api/suggest-messages` | Generate feedback suggestions using Gemini 2.0 Flash Lite |
| `POST` | `/api/contact` | Submit message from landing page contact form |
| `GET` | `/api/check-username-unique` | Real-time username availability check during registration |
| `POST` | `/api/sign-up` | Create a new organizer account and trigger verification email |
| `POST` | `/api/verify-code` | Validate 6-digit OTP code |
| `POST` | `/api/resend-verification` | Request a new verification OTP |
| `POST` | `/api/forgot-password` | Send password reset token email |
| `POST` | `/api/reset-password` | Update password using valid reset token |

### 🔐 Protected Endpoints (Organizer Session Required)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events` | List all events created by the authenticated organizer |
| `POST` | `/api/events` | Create a new event |
| `PATCH` | `/api/events/[slug]` | Update event settings or toggle active state |
| `GET` | `/api/ai-analytics` | Generate Gemini AI analytics across organizer reviews |
| `POST` | `/api/reply-query/[queryId]`| Post an organizer reply to an attendee query and send email alert |
| `POST` | `/api/toggle-query-resolved/[queryId]` | Mark query as resolved or unresolved |
| `DELETE`| `/api/delete-query/[queryId]` | Delete a query |
| `DELETE`| `/api/delete-review/[reviewId]` | Delete a review |
| `POST` | `/api/update-username` | Update organizer username |
| `POST` | `/api/update-password` | Change organizer password |
| `POST` | `/api/update-settings` | Update user preferences (theme, accepting messages) |
| `GET` | `/api/profile-summary` | Get aggregated stats (ratings, counts) for organizer profile |

---

## ⚡ Quick Start & Local Development

### Prerequisites
- **Node.js**: `v18.17.0` or later
- **npm** or **yarn** / **pnpm**
- **MongoDB Atlas** cluster or a local MongoDB instance
- **Resend API Key** ([resend.com](https://resend.com))
- **Google Gemini API Key** ([ai.google.dev](https://ai.google.dev/))

### 1. Clone the Repository
```bash
git clone https://github.com/RadicalThinker/HiddenViews.git
cd HiddenViews
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hiddenviews?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_32_character_string_here

# Email Delivery (Resend)
RESEND_API_KEY=re_your_resend_api_key_here

# AI Analytics & Suggestions (Google Gemini)
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here

# Node Environment
NODE_ENV=development
```

> **Tip:** You can generate a secure `NEXTAUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test the application locally.

---

## 🚀 Production Deployment

### Recommended Platform: Vercel

1. **Push your repository** to GitHub.
2. **Import the project** into [Vercel](https://vercel.com).
3. **Configure Environment Variables** in the Vercel project settings:
   - `NEXTAUTH_URL`: Your production domain (e.g. `https://hiddenreviews.yashcore.app`)
   - `NEXTAUTH_SECRET`: A high-entropy 32+ character secret
   - `MONGODB_URI`: Production MongoDB Atlas connection string
   - `RESEND_API_KEY`: Production Resend key
   - `GEMINI_API_KEY`: Google Gemini API key
   - `NODE_ENV`: `production`
4. **Deploy**: Vercel will automatically build and deploy the Next.js App Router application.

### Important Production Notes:
- **HTTPS Enforcement:** NextAuth requires `NEXTAUTH_URL` to start with `https://` in production.
- **Domain Cookies:** Production cookie configuration uses `secure: true` and `sameSite: 'lax'` for secure cross-subdomain compatibility.
- **Optimized Logging:** Production runs with `src/lib/logger.ts`, ensuring debug statements do not leak sensitive payloads in production logs.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

