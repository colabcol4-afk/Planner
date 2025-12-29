'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';

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
    <div className="min-h-screen bg-offwhite">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-grey/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-brand-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
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
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-display text-heading mb-6">
              Plan your day with{' '}
              <span className="text-gradient">AI that gets you</span>
            </h1>
            <p className="text-h5 text-body mb-8 font-normal">
              Vibe Planner is your AI-powered planning assistant. Just chat naturally
              about your tasks, routines, and goals. Let the AI handle the scheduling.
            </p>

            <div className="flex items-center justify-center gap-4">
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
            </div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-brand-gradient opacity-10 blur-3xl rounded-full" />
            <div className="relative bg-white rounded-lg shadow-elevation-2 border border-slate-grey/10 overflow-hidden">
              <div className="bg-offwhite border-b border-slate-grey/10 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="p-6 space-y-4">
                {/* Sample chat messages */}
                <div className="flex justify-end">
                  <div className="bg-brand-gradient text-white px-4 py-2 rounded-lg rounded-br-sm max-w-md">
                    Add a meeting with Sarah tomorrow at 3pm about the project review
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-offwhite text-heading px-4 py-2 rounded-lg rounded-bl-sm max-w-md">
                    Done! I&apos;ve added &quot;Meeting with Sarah - Project Review&quot; to your schedule for tomorrow at 3:00 PM. Would you like me to send a calendar invite?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-brand-gradient text-white px-4 py-2 rounded-lg rounded-br-sm max-w-md">
                    What do I have scheduled for tomorrow?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-offwhite text-heading px-4 py-2 rounded-lg rounded-bl-sm max-w-md">
                    <p className="mb-2">Here&apos;s your schedule for tomorrow:</p>
                    <ul className="text-small space-y-1">
                      <li>9:00 AM - Morning standup</li>
                      <li>11:00 AM - Code review</li>
                      <li>3:00 PM - Meeting with Sarah</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
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
                className="p-6 rounded-md bg-offwhite"
              >
                <div className="w-12 h-12 rounded-md bg-brand-gradient flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-h4 text-heading mb-2">{feature.title}</h3>
                <p className="text-body">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
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
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
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
              <div className="aspect-square rounded-lg bg-brand-gradient opacity-20 absolute inset-4 blur-2xl" />
              <div className="relative bg-white rounded-lg shadow-elevation-2 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-sm bg-offwhite">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-small text-heading">Morning routine</span>
                    <span className="text-tiny text-body ml-auto">7:00 AM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-sm bg-offwhite">
                    <div className="w-2 h-2 rounded-full bg-brand-blue" />
                    <span className="text-small text-heading">Team standup</span>
                    <span className="text-tiny text-body ml-auto">9:00 AM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-sm bg-brand-cyan/10">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                    <span className="text-small text-heading font-medium">Deep work block</span>
                    <span className="text-tiny text-brand-blue ml-auto">Now</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-sm bg-offwhite">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-small text-heading">Lunch break</span>
                    <span className="text-tiny text-body ml-auto">12:30 PM</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg bg-brand-gradient p-12 text-center"
          >
            <div className="absolute inset-0 bg-black/10" />
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
      <footer className="py-8 px-4 border-t border-slate-grey/10">
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
