'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Bell, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  timezone: string;
  onboarding_completed: boolean;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFullName(data.full_name || '');
        setTimezone(data.timezone || 'UTC');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            full_name: fullName || null,
            timezone,
          }),
        }
      );

      if (response.ok) {
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2 text-heading">Settings</h1>
        <p className="text-body">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-brand-gradient flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Email"
                value={profile?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />

              <div>
                <label className="block text-small font-medium text-heading mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-slate-grey text-body bg-white focus:outline-none focus:ring-4 focus:ring-brand-cyan/12 focus:border-brand-blue"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium text-heading">Email Notifications</p>
                    <p className="text-tiny text-body">Receive updates about your tasks</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-slate-grey text-brand-blue focus:ring-brand-cyan"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium text-heading">Daily Summary</p>
                    <p className="text-tiny text-body">Get a daily overview of your schedule</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-grey text-brand-blue focus:ring-brand-cyan"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Manage your data and security settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium text-heading">Store Conversation History</p>
                    <p className="text-tiny text-body">Save chat history for context</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-slate-grey text-brand-blue focus:ring-brand-cyan"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="outlined" className="border-danger/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <CardTitle className="text-danger">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small font-medium text-heading">Delete Account</p>
                  <p className="text-tiny text-body">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
