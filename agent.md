# HiddenViews Mobile App Development Agent Instructions

## 📋 Overview

This document provides step-by-step instructions for creating the HiddenViews mobile application. Follow each checkpoint sequentially, referring to the specified documentation files for detailed implementation guidance.

## 📚 Reference Documentation

- **mobile.md** - Complete mobile app development guide with technical architecture
- **ui.md** - UI design system and component implementations
- **phase1.md** - Project setup and core infrastructure
- **phase2.md** - Authentication and user management
- **phase3.md** - Dashboard and event management
- **phase4.md** - Anonymous feedback system
- **phase5.md** - Analytics dashboard and AI insights
- **phase6.md** - Push notifications, offline sync, and final optimizations
- **Summary.md** - Complete project overview and web app architecture

## 🎯 Development Phases Overview

The mobile app development is divided into 6 phases, each with specific checkpoints and deliverables. Complete each phase before moving to the next.

---

# PHASE 1: PROJECT SETUP & CORE INFRASTRUCTURE

## Checkpoint 1.1: Initialize Expo Project

### Tasks:
1. **Create new Expo project**
   ```bash
   npx create-expo-app HiddenViewsMobile --template blank-typescript
   cd HiddenViewsMobile
   ```

2. **Install core dependencies** (refer to phase1.md section "Project Initialization")
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   npm install @tanstack/react-query axios
   npm install react-hook-form @hookform/resolvers zod
   npm install expo-secure-store expo-constants expo-status-bar
   npm install nativewind tailwindcss react-native-reanimated
   npm install @expo/vector-icons react-native-gesture-handler
   ```

3. **Configure app.json** using the configuration from phase1.md

### Validation:
- [ ] Project builds successfully with `npx expo start`
- [ ] TypeScript compilation works without errors
- [ ] All dependencies installed correctly

## Checkpoint 1.2: Setup Project Structure

### Tasks:
1. **Create directory structure** as specified in phase1.md "Create Directory Structure"
2. **Configure TypeScript** using tsconfig.json from phase1.md
3. **Create type definitions** from phase1.md "Create Type Definitions"

### Validation:
- [ ] All directories created with proper structure
- [ ] TypeScript paths configured correctly
- [ ] Import aliases working (@/components, @/screens, etc.)

## Checkpoint 1.3: Setup Constants and Configuration

### Tasks:
1. **Create constants files** using phase1.md "App Constants"
2. **Implement color system** from ui.md "Color System"
3. **Setup typography** from ui.md "Typography System"
4. **Add responsive utilities** from ui.md "Responsive Utilities"

### Validation:
- [ ] All constant files created and properly typed
- [ ] Color system matches web app design
- [ ] Typography system implemented correctly
- [ ] Responsive utilities working

## Checkpoint 1.4: Setup API Client

### Tasks:
1. **Implement API client** using phase1.md "API Service Configuration"
2. **Configure authentication interceptors**
3. **Add error handling and retry logic**
4. **Test API connectivity** with web app backend

### Validation:
- [ ] API client connects to backend successfully
- [ ] Authentication endpoints working
- [ ] Error handling implemented
- [ ] Request/response interceptors configured

## Checkpoint 1.5: Setup Core Contexts

### Tasks:
1. **Create Authentication Context** from phase1.md "Auth Context Implementation"
2. **Create Theme Context** from phase1.md "Theme Context Implementation"
3. **Setup secure storage** for tokens and preferences

### Validation:
- [ ] Authentication context working correctly
- [ ] Theme context switching themes properly
- [ ] Secure storage functioning
- [ ] Context providers properly configured

---

# PHASE 2: AUTHENTICATION & USER MANAGEMENT

## Checkpoint 2.1: Create Core UI Components

### Tasks:
1. **Implement Button component** from ui.md "Button Component"
2. **Implement Input component** from ui.md "Input Component"
3. **Implement Card component** from ui.md "Card Component"
4. **Test all component variants and animations**

### Validation:
- [ ] Button component renders all variants correctly
- [ ] Input component handles focus/blur states
- [ ] Card component displays with proper styling
- [ ] All animations working smoothly

## Checkpoint 2.2: Setup Navigation Structure

### Tasks:
1. **Create navigation configuration** from phase1.md "Navigation Configuration"
2. **Setup stack and tab navigators**
3. **Create Loading Screen** from phase2.md "Loading Screen Component"
4. **Configure navigation types**

### Validation:
- [ ] Navigation structure working correctly
- [ ] Screen transitions smooth
- [ ] Loading screen displays properly
- [ ] Navigation types properly configured

## Checkpoint 2.3: Create Authentication Screens

### Tasks:
1. **Implement Welcome Screen** from phase2.md "Welcome Screen"
2. **Implement Sign In Screen** from phase2.md "Sign In Screen"
3. **Implement Sign Up Screen** from phase2.md "Sign Up Screen"
4. **Add form validation with React Hook Form + Zod**

### Validation:
- [ ] Welcome screen displays with proper animations
- [ ] Sign in form validates correctly
- [ ] Sign up form shows password strength
- [ ] All forms handle errors gracefully

## Checkpoint 2.4: Implement Email Verification

### Tasks:
1. **Create Email Verification Screen** from phase2.md "Email Verification Implementation"
2. **Implement OTP input with auto-focus**
3. **Add resend functionality with timer**

### Validation:
- [ ] OTP input working correctly
- [ ] Auto-focus between input fields
- [ ] Resend timer functioning
- [ ] Email verification flow complete

## Checkpoint 2.5: Setup Biometric Authentication

### Tasks:
1. **Implement Biometric Service** from phase2.md "Biometric Service Implementation"
2. **Add Face ID/Touch ID/Fingerprint support**
3. **Handle biometric availability checks**

### Validation:
- [ ] Biometric availability detected correctly
- [ ] Authentication prompts working
- [ ] Secure token storage with biometrics
- [ ] Fallback to password working

---

# PHASE 3: DASHBOARD & EVENT MANAGEMENT

## Checkpoint 3.1: Create Dashboard Components

### Tasks:
1. **Implement Stats Card** from ui.md "Stats Card Component"
2. **Implement Event Card** from ui.md "Event Card Component"
3. **Implement Floating Action Button** from ui.md "Floating Action Button (FAB)"

### Validation:
- [ ] Stats cards display metrics correctly
- [ ] Event cards show all event information
- [ ] FAB animations working smoothly
- [ ] Sharing functionality operational

## Checkpoint 3.2: Create Dashboard Screen

### Tasks:
1. **Implement Dashboard Screen** from phase3.md "Dashboard Implementation"
2. **Add pull-to-refresh functionality**
3. **Display user statistics and recent events**
4. **Implement React Query for data fetching**

### Validation:
- [ ] Dashboard loads user data correctly
- [ ] Pull-to-refresh working
- [ ] Statistics display accurately
- [ ] Recent events showing properly

## Checkpoint 3.3: Create Event Management

### Tasks:
1. **Implement Create Event Screen** from phase3.md "Create Event Implementation"
2. **Add comprehensive form with validation**
3. **Implement event preview functionality**
4. **Create Event List Screen with search and filtering**

### Validation:
- [ ] Event creation form working correctly
- [ ] Form validation preventing invalid submissions
- [ ] Event preview displaying properly
- [ ] Event list showing all user events

---

# PHASE 4: ANONYMOUS FEEDBACK SYSTEM

## Checkpoint 4.1: Create Public Event Screen

### Tasks:
1. **Implement Public Event Screen** from phase4.md "Public Event Page Implementation"
2. **Add theme toggle for anonymous users**
3. **Display event information and statistics**
4. **Implement tab navigation (Review/Question/Q&A)**

### Validation:
- [ ] Public event page loads correctly
- [ ] Theme toggle working for anonymous users
- [ ] Event information displaying properly
- [ ] Tab navigation functioning

## Checkpoint 4.2: Implement Feedback Forms

### Tasks:
1. **Create Review Form** from phase4.md "Anonymous Review Form"
2. **Implement star rating component** from ui.md "Star Rating Component"
3. **Create Query Form with category selection**
4. **Add character count and validation**

### Validation:
- [ ] Review form submits correctly
- [ ] Star rating interactive and functional
- [ ] Query form handles categories properly
- [ ] Character limits enforced

## Checkpoint 4.3: Setup Offline Functionality

### Tasks:
1. **Implement Offline Queue** from phase4.md "Offline Submission Management"
2. **Add network state monitoring**
3. **Implement automatic sync when online**
4. **Handle retry logic with exponential backoff**

### Validation:
- [ ] Offline submissions queued correctly
- [ ] Network state changes detected
- [ ] Automatic sync working when online
- [ ] Failed submissions retried appropriately

## Checkpoint 4.4: Setup Deep Linking

### Tasks:
1. **Configure Deep Linking** from phase4.md "Deep Link Setup"
2. **Update app.json with URL schemes**
3. **Configure navigation linking**
4. **Test deep links to public events**

### Validation:
- [ ] Deep links opening app correctly
- [ ] Navigation to correct screens
- [ ] URL parameters parsed properly
- [ ] Fallback handling for invalid links

---

# PHASE 5: ANALYTICS DASHBOARD & AI INSIGHTS

## Checkpoint 5.1: Create Analytics Components

### Tasks:
1. **Implement Metric Card** from phase5.md "Analytics Metric Card"
2. **Implement Sentiment Card** from phase5.md "AI Sentiment Card Component"
3. **Add progress animations and change indicators**

### Validation:
- [ ] Metric cards displaying data correctly
- [ ] Progress animations working smoothly
- [ ] Sentiment analysis showing properly
- [ ] AI recommendations displaying clearly

## Checkpoint 5.2: Create Analytics Dashboard

### Tasks:
1. **Implement Analytics Screen** from phase5.md "Main Analytics Dashboard"
2. **Add time range and event filtering**
3. **Implement chart components**
4. **Add export functionality**

### Validation:
- [ ] Analytics dashboard loading data
- [ ] Filters working correctly
- [ ] Charts rendering properly
- [ ] Export functionality operational

## Checkpoint 5.3: Implement Export Functionality

### Tasks:
1. **Implement Export Service** from phase5.md "Analytics Export Functionality"
2. **Add PDF and CSV export capabilities**
3. **Implement sharing functionality**

### Validation:
- [ ] PDF export generating correctly
- [ ] CSV export formatting properly
- [ ] Sharing functionality working
- [ ] Export files accessible to users

---

# PHASE 6: PUSH NOTIFICATIONS & FINAL OPTIMIZATIONS

## Checkpoint 6.1: Setup Push Notifications

### Tasks:
1. **Implement Notification Service** from phase6.md "Notification Service Setup"
2. **Configure push token registration**
3. **Create Notification Settings Screen**
4. **Setup notification channels (Android)**

### Validation:
- [ ] Push notifications working on device
- [ ] Notification permissions requested properly
- [ ] Settings screen functional
- [ ] Notification preferences persisting

## Checkpoint 6.2: Complete Offline Sync

### Tasks:
1. **Enhance Offline Sync** from phase6.md "Complete Offline Sync System"
2. **Add comprehensive action queue management**
3. **Implement conflict resolution**
4. **Add sync status indicators**

### Validation:
- [ ] All offline actions syncing correctly
- [ ] Conflict resolution working
- [ ] Sync status visible to users
- [ ] Queue management efficient

## Checkpoint 6.3: Performance Optimizations

### Tasks:
1. **Implement Performance Monitoring** from phase6.md "Performance Monitoring Service"
2. **Add Loading States** from ui.md "Loading States & Skeletons"
3. **Optimize app performance and memory usage**

### Validation:
- [ ] Performance metrics being tracked
- [ ] Loading states showing appropriately
- [ ] Skeleton screens displaying correctly
- [ ] App performance optimized

## Checkpoint 6.4: App Store Preparation

### Tasks:
1. **Configure App Store Assets** from phase6.md "App Configuration and Assets"
2. **Setup Build Configuration** from phase6.md "EAS Build Configuration"
3. **Add app icons and splash screens**

### Validation:
- [ ] App icons displaying correctly
- [ ] Splash screen working
- [ ] Build configuration complete
- [ ] Production settings configured

## Checkpoint 6.5: Final Testing & Deployment

### Tasks:
1. **Comprehensive Testing** - Test all features on iOS and Android
2. **Production Deployment** - Build and submit to app stores

### Validation:
- [ ] All features working correctly
- [ ] No critical bugs or crashes
- [ ] Performance meets requirements
- [ ] App store submissions successful

---

# 🎯 FINAL VALIDATION CHECKLIST

## Core Functionality
- [ ] User registration and authentication working
- [ ] Event creation and management functional
- [ ] Anonymous feedback submission operational
- [ ] Analytics dashboard displaying correctly
- [ ] Push notifications working
- [ ] Offline sync functioning properly

## User Experience
- [ ] App follows design system from ui.md
- [ ] Animations smooth and responsive
- [ ] Loading states implemented throughout
- [ ] Error handling graceful
- [ ] Theme switching working correctly

## Technical Requirements
- [ ] TypeScript compilation without errors
- [ ] All dependencies properly configured
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] App store ready

---

# 📚 Quick Reference Guide

## When to Refer to Each Document:

- **mobile.md**: Technical architecture, API integration, navigation setup
- **ui.md**: Component implementations, styling, animations, theme system
- **phase1.md**: Project setup, TypeScript configuration, basic structure
- **phase2.md**: Authentication screens, forms, biometric setup
- **phase3.md**: Dashboard, event management, data visualization
- **phase4.md**: Anonymous feedback, offline functionality, deep linking
- **phase5.md**: Analytics, AI insights, charts, export functionality
- **phase6.md**: Push notifications, final optimizations, app store prep
- **Summary.md**: Web app architecture reference, API endpoints, data models

## Development Tips:
1. Complete each checkpoint before moving to the next
2. Test functionality after each major component implementation
3. Refer to ui.md for consistent styling and animations
4. Use Summary.md to understand web app architecture
5. Follow the exact file structure specified in phase1.md
6. Implement error handling and loading states for all async operations
7. Test on both iOS and Android devices regularly-
--

# 🌐 IMPORTANT: Backend Integration Notes

## No Separate Backend Required

**CRITICAL UNDERSTANDING**: The mobile app uses the **exact same Next.js backend** as the web application. You do NOT need to create a separate backend.

### **Backend Architecture**
```
┌─────────────────────────────────────┐
│     Existing Next.js Backend        │
│   https://hiddenreviews.yashcore.app│
│                                     │
│  ┌─────────────────────────────────┐│
│  │    All API Endpoints Ready      ││
│  │  /api/auth, /api/events, etc.   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Web App   │ │ Mobile App  │ │ Future Apps │
│ (Existing)  │ │   (New)     │ │ (Optional)  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### **What This Means for Development**

#### **✅ What You GET Automatically**
- All authentication endpoints (`/api/auth/*`)
- All event management endpoints (`/api/events/*`)
- All anonymous feedback endpoints (`/api/send-review`, `/api/send-query`)
- All analytics endpoints (`/api/ai-analytics`)
- Database integration (MongoDB)
- Email services (Resend)
- AI integration (Google Gemini)
- File upload handling
- Security and validation

#### **✅ What You DON'T Need to Build**
- ❌ No new API endpoints
- ❌ No new database setup
- ❌ No new authentication system
- ❌ No new email configuration
- ❌ No new AI integration
- ❌ No new deployment for backend

### **API Configuration in Mobile App**
```typescript
// The mobile app simply connects to existing backend
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api'  // Your local web app
    : 'https://hiddenreviews.yashcore.app/api',  // Your production web app
  TIMEOUT: 10000,
};
```

### **Development Workflow**
1. **Start your existing web app**: `npm run dev` (in web app directory)
2. **Start mobile app**: `npx expo start` (in mobile app directory)
3. **Mobile app connects to web app's API**: Same data, same features
4. **Test both platforms simultaneously**: Changes reflect immediately

### **Production Deployment**
1. **Web app**: Already deployed at `https://hiddenreviews.yashcore.app`
2. **Mobile app**: Connects to same production API
3. **Same users, same data**: Perfect synchronization

### **CORS Already Configured**
Your existing `next.config.js` already includes CORS headers that allow mobile app connections. No changes needed.

### **Key Validation Points**
When testing API connectivity in Checkpoint 1.4:
- [ ] Mobile app successfully connects to `http://localhost:3000/api` during development
- [ ] Authentication endpoints return proper responses
- [ ] Event endpoints return user's existing events
- [ ] Anonymous feedback endpoints accept submissions
- [ ] Same data appears in both web and mobile apps

**Remember**: You're building a mobile frontend that talks to your existing, fully-functional backend. Focus on the mobile UI and user experience - the backend is already complete and ready to use.