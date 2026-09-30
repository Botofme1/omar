import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdUnitConfig, AdRevenueStats, GlobalAdSettings } from '../types';
import { INITIAL_AD_UNITS, INITIAL_GLOBAL_ADS } from '../data/defaultAds';

interface AdContextType {
  adUnits: AdUnitConfig[];
  globalSettings: GlobalAdSettings;
  stats: AdRevenueStats;
  getAdByPlacement: (placement: AdUnitConfig['placement']) => AdUnitConfig | undefined;
  updateAdUnit: (id: string, updates: Partial<AdUnitConfig>) => void;
  updateGlobalSettings: (updates: Partial<GlobalAdSettings>) => void;
  toggleAdUnit: (id: string) => void;
  recordImpression: (id: string) => void;
  recordClick: (id: string) => void;
  resetAdStats: () => void;
  resetToDefaults: () => void;
  addNewAdUnit: (unit: Omit<AdUnitConfig, 'id' | 'impressions' | 'clicks'>) => void;
  deleteAdUnit: (id: string) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

const STORAGE_KEY = 'cinepulse_ad_units';
const GLOBAL_STORAGE_KEY = 'cinepulse_global_ad_settings';

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adUnits, setAdUnits] = useState<AdUnitConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AdUnitConfig[] = JSON.parse(saved);
        // Merge with initial units so new customCode / adFormat defaults take effect immediately
        return INITIAL_AD_UNITS.map((defUnit) => {
          const found = parsed.find((u) => u.id === defUnit.id);
          if (!found) return defUnit;
          return {
            ...defUnit,
            ...found,
            customCode: found.customCode || defUnit.customCode,
            adFormat: found.adFormat || defUnit.adFormat,
          };
        });
      }
    } catch {
      // Fallback
    }
    return INITIAL_AD_UNITS;
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalAdSettings>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_GLOBAL_ADS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adUnits));
    } catch (e) {
      console.warn('Failed to save ad units to localStorage', e);
    }
  }, [adUnits]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(globalSettings));
    } catch (e) {
      console.warn('Failed to save global ad settings to localStorage', e);
    }

    // Inject Google Search Console Verification Meta Tag if configured
    if (globalSettings.googleSiteVerification) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', globalSettings.googleSiteVerification.trim());
    }

    // Inject Google AdSense if publisher id configured
    if (globalSettings.adSensePublisherId) {
      const pubId = globalSettings.adSensePublisherId.trim();
      const existing = document.getElementById('adsense-script');
      if (!existing && pubId) {
        const script = document.createElement('script');
        script.id = 'adsense-script';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
        document.head.appendChild(script);
      }
    }

    // Inject global code if present (such as Adsterra, PopAds, Monetag)
    if (globalSettings.globalHeadCode) {
      const srcMatches = globalSettings.globalHeadCode.matchAll(/src=["'](.*?)["']/g);
      for (const match of srcMatches) {
        const srcUrl = match[1];
        if (srcUrl && !document.querySelector(`script[src="${srcUrl}"]`)) {
          const s = document.createElement('script');
          s.src = srcUrl;
          s.async = true;
          document.head.appendChild(s);
        }
      }
    }
  }, [globalSettings]);

  const stats: AdRevenueStats = React.useMemo(() => {
    let impressions = 0;
    let clicks = 0;
    let earnings = 0;

    adUnits.forEach((unit) => {
      impressions += unit.impressions || 0;
      clicks += unit.clicks || 0;
      // Revenue formula: (Impressions / 1000 * CPM) + (Clicks * CPC)
      const impEarnings = ((unit.impressions || 0) / 1000) * (unit.cpmRate || 0);
      const clickEarnings = (unit.clicks || 0) * (unit.cpcRate || 0);
      earnings += impEarnings + clickEarnings;
    });

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      totalImpressions: impressions,
      totalClicks: clicks,
      estimatedEarnings: Number(earnings.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
    };
  }, [adUnits]);

  const getAdByPlacement = (placement: AdUnitConfig['placement']) => {
    return adUnits.find((unit) => unit.placement === placement && unit.enabled);
  };

  const updateAdUnit = (id: string, updates: Partial<AdUnitConfig>) => {
    setAdUnits((prev) =>
      prev.map((unit) => (unit.id === id ? { ...unit, ...updates } : unit))
    );
  };

  const toggleAdUnit = (id: string) => {
    setAdUnits((prev) =>
      prev.map((unit) =>
        unit.id === id ? { ...unit, enabled: !unit.enabled } : unit
      )
    );
  };

  const recordImpression = (id: string) => {
    setAdUnits((prev) =>
      prev.map((unit) =>
        unit.id === id ? { ...unit, impressions: (unit.impressions || 0) + 1 } : unit
      )
    );
  };

  const recordClick = (id: string) => {
    setAdUnits((prev) =>
      prev.map((unit) =>
        unit.id === id ? { ...unit, clicks: (unit.clicks || 0) + 1 } : unit
      )
    );
  };

  const resetAdStats = () => {
    setAdUnits((prev) =>
      prev.map((unit) => ({ ...unit, impressions: 0, clicks: 0 }))
    );
  };

  const resetToDefaults = () => {
    setAdUnits(INITIAL_AD_UNITS);
  };

  const addNewAdUnit = (unitData: Omit<AdUnitConfig, 'id' | 'impressions' | 'clicks'>) => {
    const newUnit: AdUnitConfig = {
      ...unitData,
      id: `ad-custom-${Date.now()}`,
      impressions: 0,
      clicks: 0,
    };
    setAdUnits((prev) => [newUnit, ...prev]);
  };

  const deleteAdUnit = (id: string) => {
    setAdUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const updateGlobalSettings = (updates: Partial<GlobalAdSettings>) => {
    setGlobalSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdContext.Provider
      value={{
        adUnits,
        globalSettings,
        stats,
        getAdByPlacement,
        updateAdUnit,
        updateGlobalSettings,
        toggleAdUnit,
        recordImpression,
        recordClick,
        resetAdStats,
        resetToDefaults,
        addNewAdUnit,
        deleteAdUnit,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
