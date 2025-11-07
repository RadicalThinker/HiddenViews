"use client";
import { Satisfy } from 'next/font/google'
import React, { useState, Suspense, useMemo, useCallback, useEffect, useRef } from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import dynamic from 'next/dynamic';
import { FiGithub, FiShield, FiEyeOff, FiMessageCircle, FiZap, FiUsers, FiStar, FiCheck,FiTarget  } from 'react-icons/fi';
import Lenis from '@studio-freight/lenis';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isIntersecting] as const;
};

// Dynamic imports for heavy components
const DotGrid = dynamic(() => import('@/components/DotGrid'), {
  ssr: false,
  loading: () => null
});
const Carousel = dynamic(() => import('@/components/Carousel'), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-gray-900/20 rounded-lg animate-pulse" />
});
const NavbarDemo = dynamic(() => import('@/components/NavbarDemo').then(mod => ({ default: mod.NavbarDemo })), {
  ssr: false,
  loading: () => null
});


// Configure Satisfy font
const satisfy = Satisfy({
  subsets: ['latin'],
  weight: '400', // Satisfy only comes in 400 weight
})

// Contact Form Component
const ContactForm = React.memo(function ContactForm({ theme }: { theme: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Message sent successfully! We\'ll get back to you soon.'
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100 border-gray-300'} border rounded-2xl p-8`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-[#5227FF] transition-colors`}
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-[#5227FF] transition-colors`}
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Message
          </label>
          <textarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:border-[#5227FF] transition-colors resize-none`}
            placeholder="Tell us about your question or feedback..."
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        {submitStatus.type && (
          <div className={`p-3 rounded-lg text-sm ${
            submitStatus.type === 'success' 
              ? theme === 'dark' ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-green-100 border-green-400 text-green-700'
              : theme === 'dark' ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
          } border`}>
            {submitStatus.message}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-customPrimary-300 hover:bg-customPrimary-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
});

// Memoize static data to prevent recreating arrays on each render
const FLIP_WORDS = ["Anonymous", "Honest", "Hidden"];

const FEATURES_DATA = [
  {
    icon: FiEyeOff,
    title: "Complete Anonymity",
    description: "Your identity remains completely hidden. No tracking, no logs, just pure anonymous feedback."
  },
  {
    icon: FiShield,
    title: "Privacy First",
    description: "All The Events created by the user are protected and kept private so no one can access them without permission."
  },
  {
    icon: FiMessageCircle,
    title: "Honest Feedback", 
    description: "Get genuine, unfiltered opinions that help you grow and improve without bias."
  },
  {
    icon: FiTarget,
    title: "AI Report",
    description: "Advanced AI analyzes feedback to provide you with insightful reports and actionable recommendations."
  },
  {
    icon: FiUsers,
    title: "Feedback Control",
    description: "You decide when can people view and respond to your feedback, giving you full control over your interactions."
  },
  {
    icon: FiStar,
    title: "Easy to Use",
    description: "Simple, intuitive interface that anyone can use without technical knowledge."
  }
];

// Enhanced Feature Card component with premium animations
const FeatureCard = React.memo(({ icon: Icon, title, description, index, theme }: { 
  icon: React.ComponentType<any>, 
  title: string, 
  description: string,
  index: number,
  theme: string
}) => {
  const intersection = useIntersectionObserver();
  const ref = intersection[0] as React.RefObject<HTMLDivElement>;
  const isIntersecting = intersection[1];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      ref={ref}
      className={`group relative ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-bg-200/40 to-bg-200/60 border-bg-300/50 hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10'
          : 'bg-gradient-to-br from-gray-100 to-white border-gray-300 hover:border-gray-400 hover:shadow-2xl hover:shadow-gray-300/30'
      } border rounded-2xl p-8 
        transition-all duration-700 ease-out cursor-pointer overflow-hidden
        ${isIntersecting ? 'animate-in slide-in-from-bottom-8 fade-in' : 'opacity-0 translate-y-8'}`}
      style={{
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-bg-300/30 to-transparent'
          : 'bg-gradient-to-br from-gray-200/50 to-transparent'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Animated border */}
      <div className={`absolute inset-0 rounded-2xl ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-bg-300/20 to-bg-200/20'
          : 'bg-gradient-to-r from-gray-300/30 to-gray-200/20'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
      <div className={`absolute inset-[1px] rounded-2xl ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/40 to-gray-900/60'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90'
      }`} />
      
      <div className="relative z-10">
        <div className={`transform transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <Icon className={`w-12 h-12 mb-4 transition-all duration-500 ${
            isHovered 
              ? 'text-[#4118FF] drop-shadow-lg' 
              : theme === 'dark' ? 'text-zinc-600' : 'text-gray-600'
          }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 transition-all duration-300 ${
          isHovered 
            ? theme === 'dark' ? 'text-white' : 'text-gray-900'
            : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {title}
        </h3>
        <p className={`transition-all duration-300 ${
          isHovered 
            ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
        </p>
      </div>
      
      {/* Shine effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
          theme === 'dark' ? 'via-white/5' : 'via-gray-400/10'
        } to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000`} />
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// Premium Pricing Card Component
const PricingCard = React.memo(({ theme }: { theme: string }) => {
  const [ref, isIntersecting] = useIntersectionObserver();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    "Unlimited Event Creations",
    "Advanced and deep review analytics", 
    "Unlimited AI Report generations",
    "No Ads"
  ];

  return (
    <div 
      ref={ref}
      className={`group relative max-w-md mx-auto transform transition-all duration-700 ease-out
        ${isIntersecting ? 'animate-in slide-in-from-bottom-8 fade-in scale-in-95' : 'opacity-0 translate-y-8 scale-95'}`}
      style={{
        animationDelay: '200ms',
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-bg-100 to-bg-300/10' 
          : 'bg-gradient-to-br from-blue-100 to-gray-200/50'
      } rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100`} />
      
      <div className={`relative ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-bg-100/60 to-bg-200/80 border-zinc-400/50'
          : 'bg-gradient-to-br from-white/80 to-gray-100/90 border-gray-300'
      } border rounded-3xl p-8 lg:p-12 backdrop-blur-sm`}>
        {/* Animated border gradient */}
        <div className={`absolute inset-0 rounded-3xl ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-bg-300/20 to-bg-200/20'
            : 'bg-gradient-to-r from-blue-200/30 to-gray-300/30'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
        <div className={`absolute inset-[1px] rounded-3xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900/40 to-gray-900/60'
            : 'bg-gradient-to-br from-white/95 to-gray-50/95'
        }`} />
        
        {/* Floating badge */}
        <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${isHovered ? 'scale-110 -translate-y-1' : ''}`}>
          <div className={`${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600/60 to-zinc-600/60'
              : 'bg-gradient-to-r from-blue-600 to-blue-500'
          } text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-[#5227FF]/30`}>
            <span className="relative z-10">Free For Now ✨</span>
          </div>
        </div>
        
        <div className="relative z-10 text-center pt-8">
          {/* Title with animation */}
          <h3 className={`text-3xl font-bold mb-4 transition-all duration-500 ${
            isHovered 
              ? theme === 'dark' ? 'text-white scale-105' : 'text-gray-900 scale-105'
              : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Premium
          </h3>
          
          {/* Price with striking animation */}
          <div className={`mb-6 transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className={`text-2xl line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} font-semibold`}>₹9</span>
              <div className={`text-5xl font-bold ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
              }`}>
                ₹0
              </div>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-lg`}>/month</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'} font-medium mt-2`}>For professionals and teams</p>
          </div>
          
          {/* Features list with stagger animation */}
          <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <li 
                key={index}
                className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} transition-all duration-500`}
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                  transform: isIntersecting ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: isIntersecting ? 1 : 0
                }}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-zinc-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                } flex items-center justify-center mr-4 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
                <span className={`transition-all duration-300 ${
                  isHovered 
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                    : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          
          {/* CTA Button with premium styling */}
          <Link href="/sign-up" className="block">
            <Button className={`w-full relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-zinc-400 hover:from-zinc-600 hover:to-zinc-300'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            } text-white font-semibold py-4 rounded-2xl transition-all duration-500 transform ${
              isHovered 
                ? theme === 'dark' ? 'scale-105 shadow-2xl shadow-zinc-500/30' : 'scale-105 shadow-2xl shadow-blue-500/30'
                : theme === 'dark' ? 'shadow-lg shadow-zinc-500/20' : 'shadow-lg shadow-blue-500/20'
            }`}>
              <span className="relative z-10">Start Premium Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-zinc-500/30 rounded-full transition-all duration-1000 ${isHovered ? 'animate-pulse' : ''}`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 12}%`,
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

PricingCard.displayName = 'PricingCard';

export default function Home() {
  const words = useMemo(() => FLIP_WORDS, []);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Detect and follow system theme
  useEffect(() => {
    const updateTheme = (isDark: boolean) => {
      setTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    };

    // Set initial theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateTheme(prefersDark);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      updateTheme(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-[#080808]' : 'bg-gray-50'}`}>
      <NavbarDemo >
        <Suspense fallback={null}>
        <div className="absolute z-0 inset-0 h-[123vh] hidden md:block overflow-hidden">
          <DotGrid
            dotSize={8}
            gap={16}
            baseColor={theme === 'dark' ? '#080808' : '#f9fafb'}
            activeColor="#5227FF"
            proximity={56}
            shockRadius={42}
            shockStrength={6}
            resistance={360}
            returnDuration={1.5}
          />
        </div>
      </Suspense>
      <div className="overflow-hidden">

      {/* Main content */}
      <main className={`flex-grow min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 xl:px-24 py-12 pt-24 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} relative z-1 max-w-full overflow-hidden`}>
        <section className="text-center mb-8 md:mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Give  <FlipWords words={words} />Feedbacks
          </h1>
          <p className={`mt-3 md:mt-4 text-lg md:text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            <span className={`${satisfy.className} text-2xl`}>
              HiddenViews {" "}
            </span>
           -  Give Reviews while keeping your identity hidden.
          </p>
        </section>

        {/* Simple action buttons (moved above carousel) */}
        <div className="mb-6 flex gap-4 justify-center flex-wrap">
          <Link href="/sign-up">
            <InteractiveHoverButton>Try it Now</InteractiveHoverButton>
          </Link>
          
          {/* PWA Install Button */}
          <button
            id="install-button"
            className={`hidden px-6 py-3 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 border-zinc-600'
                : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border-gray-700'
            } text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border`}
          >
            📱 Install App
          </button>
          
          <a
            href="https://github.com/radicalthinker"
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700 hover:text-gray-900'} hover:underline`}
          >
            <FiGithub className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Carousel for Messages */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <Carousel
            autoplay={true}
            autoplayDelay={3000}
            pauseOnHover={true}
            loop={true}
            round={false}
            itemHeight={160}
            responsive={true}
          />
        </div>
      </main>

      {/* Features Section - Lazy loaded */}
      <Suspense fallback={<div className={`py-20 px-4 md:px-12 lg:px-24 relative z-10 animate-pulse ${theme === 'dark' ? 'bg-gray-900/20' : 'bg-gray-200/50'} rounded-lg`} />}>
        <section id="features" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 relative z-10 max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent'
              } mb-6 leading-tight`}>
                Why Choose {" "}
                <span className={`${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 bg-clip-text text-transparent'
                } italic`}>
                  HiddenViews?
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} max-w-3xl mx-auto leading-relaxed`}>
                Get honest feedback without the fear of judgment or retaliation.
              </p>
              <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 ${
                theme === 'dark' ? 'bg-gradient-to-r from-zinc-600 to-zinc-400' : 'bg-gradient-to-r from-gray-600 to-gray-400'
              } rounded-full`} />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {FEATURES_DATA.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                theme={theme}
              />
            ))}
          </div>
        </div>
        </section>
      </Suspense>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 relative z-10 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent'
              } mb-6 leading-tight`}>
                Simple {" "}
                <span className={`${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-gray-700 via-gray-500 to-gray-400 bg-clip-text text-transparent'
                }`}>
                  Pricing
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto leading-relaxed`}>
                Start free, upgrade when you need more features.
              </p>
              <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 ${
                theme === 'dark' ? 'bg-gradient-to-r from-zinc-600 to-zinc-400' : 'bg-gradient-to-r from-gray-600 to-gray-400'
              } rounded-full`} />
            </div>
          </div>
          
          <div className="flex justify-center">
            
            
            
            {/* Premium Pro Plan */}
            <PricingCard theme={theme} />
          </div>
        </div>
      </section>
      
    </div>
</NavbarDemo>
    {/* Contact Section - Outside DotGrid for better performance */}
    <div className={theme === 'dark' ? 'bg-[#080808]' : 'bg-white'}>
      <section id="contact" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent'
              } mb-6 leading-tight`}>
                Get in {" "}
                <span className={`${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-gray-700 via-gray-500 to-gray-400 bg-clip-text text-transparent'
                }`}>
                  Touch
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto leading-relaxed`}>
                Have questions? We&apos;d love to hear from you.
              </p>
              <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 ${
                theme === 'dark' ? 'bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300' : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400'
              } rounded-full`} />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className={`w-6 h-6 ${theme === 'dark' ? 'text-zinc-600 hover:text-rose-400' : 'text-gray-600 hover:text-rose-600'} mr-4 mt-1`} />
                  <div>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Email</p>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>voicesecret9@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiGithub className={`w-6 h-6 ${theme === 'dark' ? 'text-zinc-600 hover:text-customPrimary-300' : 'text-gray-600 hover:text-[#5227FF]'} mr-4 mt-1`} />
                  <div>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>GitHub</p>
                    <a href="https://github.com/radicalthinker" className={`${theme === 'dark' ? 'text-gray-400 hover:text-[#5227FF]' : 'text-gray-600 hover:text-[#5227FF]'} transition-colors`}>
                      @radicalthinker
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Why Choose HiddenViews?</h4>
                <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• 100% Anonymous feedback</li>
                  <li>• Multiple Event Creation</li>
                  <li>• AI Review Analysis</li>
                  <li>• User Friendly interface</li>
                </ul>
              </div>
            </div>
            
            {/* Contact Form */}
            <ContactForm theme={theme} />
          </div>
        </div>
      </section>

      </div>

      {/* Footer */}
      <footer className={`text-center p-4 md:p-6 ${theme === 'dark' ? 'bg-[#080808] text-white' : 'bg-gray-100 text-gray-900'}`}>
        <p className="text-sm">
          © 2025 HiddenViews. Give Reviews while keeping your identity hidden.
        </p>
      </footer>
    </div>
  );
}
