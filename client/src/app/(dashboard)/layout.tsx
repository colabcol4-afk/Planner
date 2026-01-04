'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';
import type { Database, UpdateTables } from '@/types/supabase';

interface NavItem {
  href: string;
  icon: typeof MessageSquare;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; avatar_url?: string; id?: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser({
        id: user.id,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
      });

      // Check if onboarding is completed
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single<{ onboarding_completed: boolean }>();

      if (!error && profile && !profile.onboarding_completed) {
        setShowOnboarding(true);
      }

      setIsLoading(false);
    };

    getUser();
  }, [router]);

  const handleStartOnboarding = async () => {
    setShowOnboarding(false);
    // The chat will handle onboarding through conversation
  };

  const handleSkipOnboarding = async () => {
    if (user?.id) {
      const supabase = getSupabaseClient();
      await supabase
        .from('profiles')
        // @ts-ignore - Known issue: @supabase/ssr@0.5.2 type inference bug
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-grey/10 flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-grey/10">
          <Link href="/chat" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-heading">Vibe Planner</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-sm text-small font-medium transition-colors',
                      isActive
                        ? 'bg-brand-gradient text-white'
                        : 'text-body hover:bg-offwhite hover:text-heading'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-grey/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={user?.avatar_url}
              fallback={user?.email}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-small font-medium text-heading truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-body"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-grey/10">
        <div className="flex items-center justify-between p-4">
          <Link href="/chat" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-heading">Vibe</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-sm hover:bg-offwhite"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-heading" />
            ) : (
              <Menu className="w-6 h-6 text-heading" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-grey/10 p-4"
          >
            <nav>
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-sm text-small font-medium',
                          isActive
                            ? 'bg-brand-gradient text-white'
                            : 'text-body hover:bg-offwhite'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-grey/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-body"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:p-0 pt-16 md:pt-0">
        {children}
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <Card variant="elevated" padding="lg">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-brand-gradient flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-h2 text-heading mb-2">
                    Welcome to Vibe Planner!
                  </h2>
                  <p className="text-body mb-6">
                    I&apos;m your AI planning assistant. Let me get to know you better so I can help you plan your days more effectively.
                  </p>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleStartOnboarding}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Let&apos;s Get Started
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={handleSkipOnboarding}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
