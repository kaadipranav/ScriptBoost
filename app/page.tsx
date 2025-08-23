import { Metadata } from 'next';
import { ScriptboostGenerator } from '@/components/scriptboost-generator';
import { LogoTitle } from '@/components/logo-title';
import ErrorBoundary from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'ScriptBoost - AI Video Script Generator',
  description: 'Generate viral-ready scripts for TikTok, Instagram Reels, and YouTube Shorts',
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <LogoTitle />
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-4">
            AI-Powered Short‑Form Video Script Generator
          </p>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Generate platform‑optimized, scroll‑stopping scripts with strong hooks, tight pacing, and clear CTAs —
            tailored for TikTok, Instagram Reels, and YouTube Shorts — in seconds.
          </p>
        </div>

        {/* Main Content Area */}
        <div id="generator" className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Create Viral Scripts?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Enter your topic, choose your audience, and let AI create engaging scripts optimized for each platform.
            </p>
            
            {/* ScriptBoost Tabbed Generator (Short-Form / Long-Form) */}
            <ErrorBoundary>
              <ScriptboostGenerator />
            </ErrorBoundary>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Instant Generation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get viral-ready scripts in seconds, not hours
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Platform Optimized
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tailored for TikTok, Instagram Reels, and YouTube Shorts
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              High Converting
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Strong hooks, engaging content, and clear CTAs
            </p>
          </div>
        </div>

        {/* Pricing Section (placeholder to avoid 404 while designing) */}
        <section id="pricing" className="mt-20 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Pricing</h2>
          <p className="text-center text-gray-600 dark:text-gray-300">Coming soon.</p>
        </section>

        {/* About Section (placeholder to avoid 404 while designing) */}
        <section id="about" className="mt-12 pb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">About</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ScriptBoost helps creators generate platform-optimized short-form video scripts powered by AI.
          </p>
        </section>
      </div>
    </main>
  );
}
