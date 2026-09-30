import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, X, Sparkles, Volume2 } from 'lucide-react';
import { useAds } from '../context/AdContext';
import { AdUnitConfig } from '../types';

interface AdBannerProps {
  placement: AdUnitConfig['placement'];
  className?: string;
}

export const AdCodeRenderer: React.FC<{
  htmlCode: string;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}> = ({ htmlCode, className = '', defaultWidth = 300, defaultHeight = 250 }) => {
  // If the script contains document.write, atOptions, or invoke.js (like Adsterra / highrevenueformat)
  // Rendering in an iframe srcDoc ensures synchronous execution without being blocked by SPA async rules:
  const isAdsterraOrDocWrite =
    htmlCode.includes('atOptions') ||
    htmlCode.includes('invoke.js') ||
    htmlCode.includes('highrevenueformat') ||
    htmlCode.includes('document.write');

  if (isAdsterraOrDocWrite) {
    const srcDocContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>`;

    return (
      <div className={`flex justify-center items-center overflow-hidden my-1 ${className}`}>
        <iframe
          title="Sponsored Advertisement"
          srcDoc={srcDocContent}
          width={defaultWidth}
          height={defaultHeight}
          className="border-0 overflow-hidden"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        />
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const temp = document.createElement('div');
    temp.innerHTML = htmlCode;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const originalScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');
        Array.from(originalScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.text = originalScript.text;
        container.appendChild(newScript);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });

    if (htmlCode.includes('adsbygoogle')) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // silent
      }
    }
  }, [htmlCode]);

  return <div ref={containerRef} className={`ad-network-container overflow-hidden ${className}`} />;
};

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const { getAdByPlacement, recordImpression, recordClick } = useAds();
  const [dismissed, setDismissed] = useState(false);

  const ad = getAdByPlacement(placement);

  useEffect(() => {
    if (ad && !dismissed) {
      recordImpression(ad.id);
    }
  }, [ad?.id, dismissed]);

  if (!ad || dismissed) return null;

  // Custom Ad Code renderer (Google AdSense, Adsterra, PropellerAds banner snippet)
  if (ad.adFormat === 'code' && ad.customCode) {
    return (
      <div className={`w-full flex justify-center py-2 ${className}`}>
        <div className="relative max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1d] p-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-1 px-1 text-[10px] text-slate-500 font-mono">
            <span>Advertisement</span>
            <button
              onClick={() => setDismissed(true)}
              className="hover:text-slate-300"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <AdCodeRenderer htmlCode={ad.customCode} />
        </div>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    recordClick(ad.id);
    // Open advertiser url
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  // Sticky bottom banner layout
  if (placement === 'sticky_bottom') {
    return (
      <aside 
        aria-label="Sponsored advertisement"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#0c101a]/95 backdrop-blur-md border-t border-rose-500/20 shadow-2xl px-4 py-2.5 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/20 whitespace-nowrap">
              Sponsored
            </span>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                {ad.title}
              </h4>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                {ad.adText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              title="Close ad"
              aria-label="Close advertisement"
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Header or Below Player Leaderboard layout
  return (
    <div className={`w-full ${className}`}>
      <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#0d1322] via-[#11192e] to-[#0d1322] p-3 sm:p-4 transition-all hover:border-rose-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Ad image / thumbnail if available */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
            {ad.bannerImageUrl && (
              <img
                src={ad.bannerImageUrl}
                alt={ad.title}
                referrerPolicy="no-referrer"
                className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border border-white/10 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Ad · {ad.sponsorName}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                {ad.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                {ad.adText}
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleClick}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
