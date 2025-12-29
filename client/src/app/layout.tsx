import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vibe Planner - AI-Powered Planning Assistant',
  description: 'Plan your day with AI. Vibe Planner helps busy professionals manage tasks, schedules, and habits through natural conversation.',
  keywords: ['planner', 'AI', 'productivity', 'task management', 'scheduling'],
  authors: [{ name: 'Vibe Planner' }],
  openGraph: {
    title: 'Vibe Planner',
    description: 'AI-Powered Planning Assistant',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
