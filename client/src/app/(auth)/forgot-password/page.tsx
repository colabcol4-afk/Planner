'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { Meteors } from '@/components/ui/Meteors';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        toast.error('Error', error.message);
        setError(error.message);
      } else {
        setIsSubmitted(true);
        toast.success('Email sent!', 'Check your inbox for the reset link');
      }
    } catch (err) {
      toast.error('Error', 'An unexpected error occurred');
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-4 relative overflow-hidden">
      {/* Meteors Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Meteors number={30} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-brand-gradient flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-heading text-xl">Vibe Planner</span>
        </Link>

        <Card variant="elevated" padding="lg">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-gradient/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-brand-blue" />
                </div>
                <h1 className="text-h3 text-heading mb-2">Forgot your password?</h1>
                <p className="text-body">
                  No worries! Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <h1 className="text-h3 text-heading mb-2">Check your email</h1>
              <p className="text-body mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-heading">{email}</span>
              </p>
              <p className="text-small text-body mb-6">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-brand-blue hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-small text-brand-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
