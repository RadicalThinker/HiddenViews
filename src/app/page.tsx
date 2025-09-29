"use client";
import { Satisfy } from 'next/font/google'
import React, { useState, Suspense, useMemo, useCallback, useEffect } from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import dynamic from 'next/dynamic';
import { FiGithub, FiShield, FiEyeOff, FiMessageCircle, FiZap, FiUsers, FiStar } from 'react-icons/fi';
import Lenis from '@studio-freight/lenis';

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
          className="w-full bg-[#5227FF] hover:bg-[#4118CC] disabled:opacity-50 disabled:cursor-not-allowed"
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
    description: "End-to-end encryption ensures your messages are secure and private from start to finish."
  },
  {
    icon: FiMessageCircle,
    title: "Honest Feedback", 
    description: "Get genuine, unfiltered opinions that help you grow and improve without bias."
  },
  {
    icon: FiZap,
    title: "Instant Delivery",
    description: "Messages are delivered instantly with real-time notifications and updates."
  },
  {
    icon: FiUsers,
    title: "Team Collaboration",
    description: "Share your profile with teams, colleagues, or friends to gather collective feedback."
  },
  {
    icon: FiStar,
    title: "Easy to Use",
    description: "Simple, intuitive interface that anyone can use without technical knowledge."
  }
];

// Memoized Feature Card component
const FeatureCard = React.memo(({ icon: Icon, title, description }: { 
  icon: React.ComponentType<any>, 
  title: string, 
  description: string 
}) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:bg-gray-900/70 transition-colors">
    <Icon className="w-12 h-12 text-[#5227FF] mb-4" />
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

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
    <>
      <div className="bg-[#080808] min-h-screen">
      <NavbarDemo >
      <Suspense fallback={null}>
        <div className="absolute z-0 inset-0 h-[123vh] w-full">
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

      {/* Main content */}
      <main className="flex-grow min-h-screen flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 py-12  text-white relative z-1">
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
        <div className="mb-6 flex gap-4 justify-center">
  
          <Link href="/sign-up">
            <InteractiveHoverButton>Try it Now</InteractiveHoverButton>
          </Link>
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
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <section id="features" className="py-20 px-4 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose HiddenViews?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Get honest feedback without the fear of judgment or retaliation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES_DATA.slice(0, 6).map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
        </section>
      </Suspense>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-300">
              Start free, upgrade when you need more features.
            </p>
          </div>
          
          <div className="flex justify-center">
            
            
            
            {/* Pro Plan */}
            <div className="bg-gray-900/40 border border-[#5227FF] rounded-2xl p-16 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gray-900/70 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Free For Now
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-4">
                  <span className="line-through text-gray-500  mr-2">₹9</span>₹0<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">For professionals and teams</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <FiStar className="w-5 h-5 text-[#5227FF] mr-3" />
                  Unlimited Event Creations
                </li>
                <li className="flex items-center text-gray-300">
                  <FiStar className="w-5 h-5 text-[#5227FF] mr-3" />
                  Advanced and deep review analytics
                </li>
                <li className="flex items-center text-gray-300">
                  <FiStar className="w-5 h-5 text-[#5227FF] mr-3" />
                  Unlimited Ai Report generations
                </li>
                <li className="flex items-center text-gray-300">
                  <FiStar className="w-5 h-5 text-[#5227FF] mr-3" />
                  No Ads
                </li>
              </ul>
              
              <Link href="/sign-up" className="block">
                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                  Start Pro Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </NavbarDemo>
    </div>

    {/* Contact Section - Outside DotGrid for better performance */}
    <div className="bg-[#080808]">
      <section id="contact" className="py-20 px-4 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-300">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-[#5227FF] mr-4 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400">voicesecret9@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiGithub className="w-6 h-6 text-[#5227FF] mr-4 mt-1" />
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
                  <li>• No data tracking or logging</li>
                  <li>• Secure and private messaging</li>
                  <li>• Easy to use interface</li>
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
    </>
  );
}
