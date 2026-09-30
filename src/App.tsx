import React from 'react';
import { MediaProvider, useMedia } from './context/MediaContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { MediaGrid } from './components/MediaGrid';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AddMediaModal } from './components/AddMediaModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { mediaList, activeTab, isAddModalOpen } = useMedia();

  // Featured highlights for the hero billboard - ensuring Terrifier 3 (TMDB ID: 1034541) is top featured
  const featuredItems = React.useMemo(() => {
    const terrifier = mediaList.find((m) => m.tmdbId === 1034541 || m.id.includes('1034541'));
    const others = mediaList.filter((m) => m.isFeatured && m.tmdbId !== 1034541 && !m.id.includes('1034541'));
    if (terrifier) {
      return [terrifier, ...others];
    }
    return others.length > 0 ? others : mediaList.slice(0, 3);
  }, [mediaList]);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Sticky Translucent-to-Solid Navbar */}
      <Navbar />

      {/* Main Streaming Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Dynamic Hero Billboard Carousel */}
        {featuredItems.length > 0 && (activeTab === 'all' || activeTab === 'trending') && (
          <HeroBillboard items={featuredItems} />
        )}

        {/* Main Titles Catalog with Rows, Real TMDB & Anime Data, and Advanced Filters */}
        <MediaGrid />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals & Overlays */}
      <VideoPlayerModal />
      <AIChatDrawer />
      {isAddModalOpen && <AddMediaModal />}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <MediaProvider>
        <AppContent />
      </MediaProvider>
    </ErrorBoundary>
  );
}
