import React, { useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useAds } from '../context/AdContext';
import { AdUnitConfig } from '../types';
import { AdCodeRenderer } from './AdBanner';

interface NativeAdCardProps {
  ad: AdUnitConfig;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ ad }) => {
  const { recordImpression, recordClick } = useAds();

  useEffect(() => {
    recordImpression(ad.id);
  }, [ad.id]);

  if (ad.adFormat === 'code' && ad.customCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#131b2c] to-[#0c101c] p-2 shadow-lg">
        <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[10px] text-emerald-400 font-mono">
          <span className="bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">Sponsored Ad</span>
          <span className="text-slate-500">300x250</span>
        </div>
        <div className="flex-1 flex items-center justify-center w-full min-h-[250px] overflow-hidden">
          <AdCodeRenderer htmlCode={ad.customCode} defaultWidth={300} defaultHeight={250} />
        </div>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordClick(ad.id);
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer flex flex-col h-full rounded-xl overflow-hidden border border-amber-500/20 bg-gradient-to-b from-[#131b2c] to-[#0c101c] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40 shadow-lg"
    >
      {/* Poster Aspect Ratio Image */}
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-900 border border-white/5 mb-3">
        <img
          src={ad.bannerImageUrl}
          alt={ad.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Sponsored tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm">
            Sponsored
          </span>
        </div>

        {/* Sponsor brand at bottom of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <span className="text-xs text-slate-300 font-medium line-clamp-1">
            {ad.sponsorName}
          </span>
        </div>
      </div>

      {/* Content details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
            {ad.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
            {ad.adText}
          </p>
        </div>

        {/* Clean CTA button */}
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
