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
const ContactForm = React.memo(function ContactForm() {
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
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5227FF] transition-colors"
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5227FF] transition-colors"
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5227FF] transition-colors resize-none"
            placeholder="Tell us about your question or feedback..."
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        {submitStatus.type && (
          <div className={`p-3 rounded-lg text-sm ${
            submitStatus.type === 'success' 
              ? 'bg-green-900/50 border border-green-700 text-green-300'
              : 'bg-red-900/50 border border-red-700 text-red-300'
          }`}>
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
const FeatureCard = React.memo(({ icon: Icon, title, description, index }: { 
  icon: React.ComponentType<any>, 
  title: string, 
  description: string,
  index: number
}) => {
  const intersection = useIntersectionObserver();
  const ref = intersection[0] as React.RefObject<HTMLDivElement>;
  const isIntersecting = intersection[1];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      ref={ref}
      className={`group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
        hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
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
      <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
      
      <div className="relative z-10">
        <div className={`transform transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <Icon className={`w-12 h-12 mb-4 transition-all duration-500 ${isHovered ? 'text-[#4118FF] drop-shadow-lg' : 'text-zinc-600'}`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 transition-all duration-300 ${isHovered ? 'text-white' : 'text-gray-100'}`}>
          {title}
        </h3>
        <p className={`transition-all duration-300 ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
          {description}
        </p>
      </div>
      
      {/* Shine effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// Premium Pricing Card Component
const PricingCard = React.memo(() => {
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
      <div className="absolute inset-0 bg-gradient-to-br from-bg-100 to-bg-300/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100" />
      
      <div className="relative bg-gradient-to-br from-bg-100/60 to-bg-200/80 border border-zinc-400/50 rounded-3xl p-8 lg:p-12 backdrop-blur-sm ">
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
        
        {/* Floating badge */}
        <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${isHovered ? 'scale-110 -translate-y-1' : ''}`}>
          <div className="bg-gradient-to-r from-blue-600/60 to-zinc-600/60 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-[#5227FF]/30">
            <span className="relative z-10">Free For Now ✨</span>
          </div>
        </div>
        
        <div className="relative z-10 text-center pt-8">
          {/* Title with animation */}
          <h3 className={`text-3xl font-bold mb-4 transition-all duration-500 ${isHovered ? 'text-white scale-105' : 'text-gray-100'}`}>
            Premium
          </h3>
          
          {/* Price with striking animation */}
          <div className={`mb-6 transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl line-through text-gray-500 font-semibold">₹9</span>
              <div className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ₹0
              </div>
            </div>
            <p className="text-gray-400 text-lg">/month</p>
            <p className="text-sm text-zinc-400 font-medium mt-2">For professionals and teams</p>
          </div>
          
          {/* Features list with stagger animation */}
          <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <li 
                key={index}
                className={`flex items-center text-gray-300 transition-all duration-500`}
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                  transform: isIntersecting ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: isIntersecting ? 1 : 0
                }}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-zinc-400 flex items-center justify-center mr-4 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
                <span className={`transition-all duration-300 ${isHovered ? 'text-white' : 'text-gray-300'}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          
          {/* CTA Button with premium styling */}
          <Link href="/sign-up" className="block">
            <Button className={`w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-zinc-400 hover:from-zinc-600 hover:v0ia-zinc-400 hover:to-zinc-300  text-white font-semibold py-4 rounded-2xl transition-all duration-500 transform ${isHovered ? 'scale-105 shadow-2xl shadow-zinc-500/30' : 'shadow-lg shadow-zinc-500/20'}`}>
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
    <div className="min-h-screen w-full  bg-[#080808]">
      <NavbarDemo >
        <Suspense fallback={null}>
        <div className="absolute z-0 inset-0 h-[123vh] hidden md:block overflow-hidden">
          <DotGrid
            dotSize={8}
            gap={16}
            baseColor="#080808"
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
      <main className="flex-grow min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 xl:px-24 py-12 pt-24 text-white relative z-1 max-w-full overflow-hidden">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Give  <FlipWords words={words} />Feedbacks
          </h1>
          <p className="mt-3 md:mt-4 text-lg md:text-xl max-w-3xl mx-auto">
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
            className="hidden px-6 py-3 bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-zinc-600"
          >
            📱 Install App
          </button>
          
          <a
            href="https://github.com/radicalthinker"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-200 hover:underline"
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
      <Suspense fallback={<div className="py-20 px-4 md:px-12 lg:px-24 relative z-10 animate-pulse bg-gray-900/20 rounded-lg" />}>
        <section id="features" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 relative z-10 max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
                Why Choose {" "}
                <span className="bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-400 bg-clip-text text-transparent italic">
                  HiddenViews?
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Get honest feedback without the fear of judgment or retaliation.
              </p>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '0ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiEyeOff className="w-12 h-12 mb-4 text-gray-500 group-hover:text-purple-400 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  Complete Anonymity
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  Your identity remains completely hidden. No tracking, no logs, just pure anonymous feedback.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '150ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiShield className="w-12 h-12 mb-4 text-gray-500 group-hover:text-blue-400 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  Privacy First
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  All The Events created by the user are protected and kept private so no one can access them without permission.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '300ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiMessageCircle className="w-12 h-12 mb-4 text-gray-500 group-hover:text-green-400 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  Honest Feedback
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  Get genuine, unfiltered opinions that help you grow and improve without bias.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '450ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiTarget className="w-12 h-12 mb-4 text-gray-500 group-hover:text-rose-600 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  AI Report
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  Advanced AI analyzes feedback to provide you with insightful reports and actionable recommendations.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '600ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiUsers className="w-12 h-12 mb-4 text-gray-500 group-hover:text-orange-400 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  Feedback Control
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  You decide when can people view and respond to your feedback, giving you full control over your interactions.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-bg-200/40 to-bg-200/60 border border-bg-300/50 rounded-2xl p-8 
              hover:border-bg-300/30 hover:shadow-2xl hover:shadow-bg-300/10 
              transition-all duration-700 ease-out cursor-pointer overflow-hidden
              animate-in slide-in-from-bottom-8 fade-in"
              style={{ animationDelay: '750ms', animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bg-300/20 to-bg-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-900/60" />
              
              <div className="relative z-10">
                <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FiStar className="w-12 h-12 mb-4 text-gray-500 group-hover:text-yellow-400 transition-all duration-500 group-hover:drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-white transition-all duration-300">
                  Easy to Use
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300">
                  Simple, intuitive interface that anyone can use without technical knowledge.
                </p>
              </div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </div>
          </div>
        </div>
        </section>
      </Suspense>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 relative z-10 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
                Simple {" "}
                <span className="bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Start free, upgrade when you need more features.
              </p>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full" />
            </div>
          </div>
          
          <div className="flex justify-center">
            
            
            
            {/* Premium Pro Plan */}
            <PricingCard />
          </div>
        </div>
      </section>
      
    </div>
</NavbarDemo>
    {/* Contact Section - Outside DotGrid for better performance */}
    <div className="bg-[#080808]">
      <section id="contact" className="py-20 px-4 md:px-8 lg:px-12 xl:px-24 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
                Get in {" "}
                <span className="bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Have questions? We&apos;d love to hear from you.
              </p>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300  rounded-full" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-zinc-600 hover:text-rose-400 mr-4 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400">voicesecret9@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiGithub className="w-6 h-6 text-zinc-600 hover:text-customPrimary-300 mr-4 mt-1" />
                  <div>
                    <p className="text-white font-medium">GitHub</p>
                    <a href="https://github.com/radicalthinker" className="text-gray-400 hover:text-[#5227FF] transition-colors">
                      @radicalthinker
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-medium text-white mb-4">Why Choose HiddenViews?</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>• 100% Anonymous feedback</li>
                  <li>• Multiple Event Creation</li>
                  <li>• AI Review Analysis</li>
                  <li>• User Friendly interface</li>
                </ul>
              </div>
            </div>
            
            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      </div>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-[#080808] text-white">
        <p className="text-sm">
          © 2025 HiddenViews. Give Reviews while keeping your identity hidden.
        </p>
      </footer>
    </div>
  );
}
