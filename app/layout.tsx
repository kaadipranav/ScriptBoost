import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScriptBoost - AI Video Script Generator',
  description:
    'Generate viral TikTok, Instagram Reels, and YouTube scripts with AI. Optimized for each platform with trending hooks and CTAs.',
  keywords: [
    'AI script generator',
    'video script generator',
    'TikTok scripts',
    'Instagram Reels scripts',
    'YouTube Shorts scripts',
    'short-form video',
    'content ideas',
    'viral hooks',
    'call to action',
    'AI content tools',
    'script writing AI'
  ],
  authors: [{ name: 'ScriptBoost Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ScriptBoost - AI Video Script Generator',
    description:
      'Generate viral TikTok, Instagram Reels, and YouTube scripts with AI. Optimized for each platform with trending hooks and CTAs.',
    type: 'website',
    siteName: 'ScriptBoost',
    locale: 'en_US',
    images: [
      {
        url: '/gradient-bg.svg',
        width: 1200,
        height: 630,
        alt: 'ScriptBoost - AI Video Script Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptBoost - AI Video Script Generator',
    description:
      'Generate viral TikTok, Instagram Reels, and YouTube scripts with AI. Optimized for each platform with trending hooks and CTAs.',
    images: ['/gradient-bg.svg'],
  },
  themeColor: '#0B1020',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} animated-gradient-bg`}>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="scriptboost-theme"
        >
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

