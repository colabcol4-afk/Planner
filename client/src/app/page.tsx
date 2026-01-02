'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { GridPattern } from '@/components/ui/GridPattern';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/chat');
      }
    };
    checkAuth();
  }, [router]);

  const features = [
    {
      icon: MessageSquare,
      title: 'Natural Conversation',
      description: 'Just tell Vibe what you need to do. It understands context and creates tasks naturally.',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Plans adapt to your energy levels and routines. Work smarter, not harder.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get personalized suggestions based on your habits and productivity patterns.',
    },
  ];

  const benefits = [
    'Create tasks with natural language',
    'Track habits and routines effortlessly',
    'Get AI-powered daily plans',
    'Sync across all devices',
  ];

  return (
    <div className="min-h-screen bg-offwhite relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="mesh" />
      <GridPattern className="opacity-40" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-grey/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-md bg-brand-gradient flex items-center justify-center"
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-semibold text-heading text-lg">Vibe Planner</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <FloatingOrbs count={3} className="opacity-60" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              className="text-display text-heading mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Plan your day with{' '}
              <span className="text-gradient bg-clip-text">
                AI that gets you
              </span>
            </motion.h1>
            <motion.p
              className="text-h5 text-body mb-8 font-normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Vibe Planner is your AI-powered planning assistant. Just chat naturally
              about your tasks, routines, and goals. Let the AI handle the scheduling.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Planning Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Log In
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 relative"
            whileHover={{ y: -8 }}
          >
            <motion.div
              className="absolute inset-0 bg-brand-gradient opacity-20 blur-3xl rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg shadow-elevation-2 border border-white/50 overflow-hidden">
              <div className="bg-offwhite/50 backdrop-blur-sm border-b border-slate-grey/10 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="p-6 space-y-4">
                {/* Sample chat messages */}
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="bg-brand-gradient text-white px-4 py-2 rounded-lg rounded-br-sm max-w-md shadow-brand">
                    Add a meeting with Sarah tomorrow at 3pm about the project review
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="bg-white/80 backdrop-blur-sm text-heading px-4 py-2 rounded-lg rounded-bl-sm max-w-md border border-slate-grey/10">
                    Done! I&apos;ve added &quot;Meeting with Sarah - Project Review&quot; to your schedule for tomorrow at 3:00 PM. Would you like me to send a calendar invite?
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="bg-brand-gradient text-white px-4 py-2 rounded-lg rounded-br-sm max-w-md shadow-brand">
                    What do I have scheduled for tomorrow?
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="bg-white/80 backdrop-blur-sm text-heading px-4 py-2 rounded-lg rounded-bl-sm max-w-md border border-slate-grey/10">
                    <p className="mb-2">Here&apos;s your schedule for tomorrow:</p>
                    <ul className="text-small space-y-1">
                      <li>9:00 AM - Morning standup</li>
                      <li>11:00 AM - Code review</li>
                      <li>3:00 PM - Meeting with Sarah</li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm relative">
        <GridPattern className="opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-h2 text-heading mb-4">
              Planning made effortless
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              No more complex productivity apps. Just have a conversation and let
              Vibe handle the rest.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-md bg-white/80 backdrop-blur-sm border border-white/50 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
              >
                <motion.div
                  className="w-12 h-12 rounded-md bg-brand-gradient flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-h4 text-heading mb-2">{feature.title}</h3>
                <p className="text-body">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-h2 text-heading mb-6">
                Everything you need to stay productive
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    </motion.div>
                    <span className="text-body">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/signup">
                  <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                className="aspect-square rounded-lg bg-brand-gradient opacity-20 absolute inset-4 blur-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg shadow-elevation-2 p-6 border border-white/50">
                <div className="space-y-4">
                  {[
                    { label: 'Morning routine', time: '7:00 AM', color: 'success' },
                    { label: 'Team standup', time: '9:00 AM', color: 'brand-blue' },
                    { label: 'Deep work block', time: 'Now', color: 'brand-cyan', active: true },
                    { label: 'Lunch break', time: '12:30 PM', color: 'warning' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className={`flex items-center gap-3 p-3 rounded-sm ${
                        item.active ? 'bg-brand-cyan/10' : 'bg-white/60'
                      } backdrop-blur-sm`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <motion.div
                        className={`w-2 h-2 rounded-full bg-${item.color}`}
                        animate={item.active ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className={`text-small ${item.active ? 'font-medium' : ''} text-heading`}>
                        {item.label}
                      </span>
                      <span className={`text-tiny ml-auto ${item.active ? 'text-brand-blue' : 'text-body'}`}>
                        {item.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg bg-brand-gradient p-12 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/10"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative">
              <h2 className="text-h2 text-white mb-4">
                Ready to transform your productivity?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of professionals who plan their days with AI.
                Start for free, no credit card required.
              </p>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-brand-blue hover:bg-offwhite"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-grey/10 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-small text-body">Vibe Planner</span>
          </div>
          <p className="text-small text-body">
            &copy; {new Date().getFullYear()} Vibe Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
