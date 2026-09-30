import React from 'react';
import { Film, DollarSign, Shield, Info } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsAddModalOpen, setIsAdManagerOpen } = useMedia();

  return (
    <footer className="w-full border-t border-white/5 bg-[#06080e] pt-12 pb-24 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <span className="text-lg font-bold tracking-tight text-white font-display">
              CinePulse
            </span>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Next-generation streaming platform for high-definition movies and episodic television series with integrated monetization engine.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">
              Catalog
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('movies');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Feature Movies
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('series');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  TV Series & Seasons
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('trending');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Trending Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('watchlist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  My Saved Watchlist
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Indexing */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">
              Network & Discover
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Add Movie or Series</span>
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors block"
                >
                  Sitemap XML (خريطة الموقع)
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors block"
                >
                  Robots TXT (Googlebot Indexing)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">
              Notice
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              CinePulse provides catalog indexing and media player interfaces. All trademarks and media streams are properties of their respective creators. Advertisements are managed by the site administrator.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} CinePulse Streaming Network. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">DMCA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
