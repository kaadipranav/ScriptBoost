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
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <LogoTitle />
          <p className="text-2xl text-neutral-700 dark:text-neutral-200 mb-6 font-medium">
            Professional AI Video Script Generator
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed">
            Create platform-optimized, high-converting scripts with powerful hooks, engaging content, and clear CTAs.
            Designed for TikTok, Instagram Reels, and YouTube Shorts.
          </p>
        </div>

        {/* Main Content Area */}
        <div id="generator" className="bg-card/70 dark:bg-card border border-border rounded-2xl shadow-lg p-10 mb-20 backdrop-blur-sm supports-[backdrop-filter]:bg-card/60">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Generate Your Next Viral Script
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-10 text-lg">
              Professional AI-powered script generation for content creators and marketers.
            </p>
            
            {/* ScriptBoost Tabbed Generator (Short-Form / Long-Form) */}
            <ErrorBoundary>
              <ScriptboostGenerator />
            </ErrorBoundary>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary/20 transition-colors">
            <div className="bg-brand-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Instant Generation
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Professional scripts generated in seconds with AI-powered optimization
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary/20 transition-colors">
            <div className="bg-brand-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Platform Optimized
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Tailored content for TikTok, Instagram Reels, and YouTube Shorts
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary/20 transition-colors">
            <div className="bg-brand-warning/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              High Converting
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Proven hooks, engaging narratives, and compelling calls-to-action
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs
          </p>
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-brand-primary font-semibold text-sm uppercase tracking-wide mb-2">Coming Soon</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Professional Plans</h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              Flexible pricing options for creators, teams, and enterprises
            </p>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 text-center border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-3xl font-bold text-foreground mb-6">Built for Creators</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            ScriptBoost is the professional AI script generator trusted by content creators, marketers, and social media managers. 
            Generate platform-optimized scripts that drive engagement and conversions.
          </p>
        </section>
      </div>
    </main>
  );
}
