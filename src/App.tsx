import React from 'react';
import { MediaProvider, useMedia } from './context/MediaContext';
import { AdProvider } from './context/AdContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { MediaGrid } from './components/MediaGrid';
import { AdBanner } from './components/AdBanner';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AddMediaModal } from './components/AddMediaModal';
import { AdManagerModal } from './components/AdManagerModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { mediaList, activeTab, isAdManagerOpen, isAddModalOpen } = useMedia();

  // Featured highlights for the hero billboard
  const featuredItems = React.useMemo(() => {
    const featured = mediaList.filter((m) => m.isFeatured);
    return featured.length > 0 ? featured : mediaList.slice(0, 3);
  }, [mediaList]);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Sticky Translucent-to-Solid Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Top Header Leaderboard Ad */}
        <div className="mb-6">
          <AdBanner placement="header_leaderboard" />
        </div>

        {/* Dynamic Hero Billboard Carousel */}
        {featuredItems.length > 0 && (activeTab === 'all' || activeTab === 'trending') && (
          <HeroBillboard items={featuredItems} />
        )}

        {/* Main Titles Catalog with Rows, In-Feed Ads, and Advanced Filters */}
        <MediaGrid />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals & Overlays */}
      <VideoPlayerModal />
      <AIChatDrawer />
      {isAddModalOpen && <AddMediaModal />}
      {isAdManagerOpen && <AdManagerModal />}

      {/* Sticky Bottom Floating Banner Ad */}
      <AdBanner placement="sticky_bottom" />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AdProvider>
        <MediaProvider>
          <AppContent />
        </MediaProvider>
      </AdProvider>
    </ErrorBoundary>
  );
}
