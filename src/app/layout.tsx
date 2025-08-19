import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Interviewer - Mock Interview Platform',
  description: 'Practice interviews with AI-powered feedback and analysis',
  keywords: ['interview', 'AI', 'mock interview', 'practice', 'feedback'],
  authors: [{ name: 'AI Interviewer Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AI Interviewer - Mock Interview Platform',
    description: 'Practice interviews with AI-powered feedback and analysis',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Interviewer - Mock Interview Platform',
    description: 'Practice interviews with AI-powered feedback and analysis',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎤</text></svg>" />
      </head>
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
