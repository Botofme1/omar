import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  Sliders,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Code2,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useAds } from '../context/AdContext';
import { AdUnitConfig } from '../types';

export const AdManagerModal: React.FC = () => {
  const {
    adUnits,
    globalSettings,
    stats,
    toggleAdUnit,
    updateAdUnit,
    updateGlobalSettings,
    recordClick,
    recordImpression,
    resetAdStats,
    resetToDefaults,
  } = useAds();

  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'code' | 'guide'>('code');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(adUnits[0]?.id || '');
  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [headScriptInput, setHeadScriptInput] = useState<string>(globalSettings.globalHeadCode || '');
  const [adSenseInput, setAdSenseInput] = useState<string>(globalSettings.adSensePublisherId || '');
  const [googleVerifyInput, setGoogleVerifyInput] = useState<string>(globalSettings.googleSiteVerification || '');

  const selectedUnit = adUnits.find((u) => u.id === selectedUnitId) || adUnits[0];

  const handleSaveGlobalScripts = () => {
    updateGlobalSettings({
      globalHeadCode: headScriptInput,
      adSensePublisherId: adSenseInput,
      googleSiteVerification: googleVerifyInput,
    });
    setTestNotification('تم حفظ أكواد الإعلانات وإعدادات Google وتفعيلها في الموقع! ✅');
    setTimeout(() => setTestNotification(null), 4000);
  };

  const handleSimulateClick = (unitId: string) => {
    recordClick(unitId);
    setTestNotification('Recorded 1 test click! Revenue updated.');
    setTimeout(() => setTestNotification(null), 3000);
  };

  const handleSimulateImpression = (unitId: string) => {
    recordImpression(unitId);
    setTestNotification('Recorded 1 test impression!');
    setTimeout(() => setTestNotification(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-manager-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-4xl bg-[#0b0f1a] rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080c16]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ad-manager-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                Monetization & Ad Studio
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure your ad placements, banner campaigns, in-stream video ads, and view earnings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('ad-manager-close-btn');
                if (el) el.click();
              }}
              id="ad-manager-close-btn"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/5 bg-[#090d18] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Earnings & Revenue
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'units'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ad Placements ({adUnits.filter((u) => u.enabled).length}/{adUnits.length} Active)
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AdSense & Networks Script
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monetization Guide
          </button>
        </div>

        {/* Notification toast */}
        {testNotification && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 text-xs px-6 py-2 flex items-center justify-between">
            <span>{testNotification}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW & REVENUE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-[#0f1524] border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                      Estimated Earnings
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ${stats.estimatedEarnings.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    CPM impressions + CPC clicks
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1524] border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                      Total Impressions
                    </span>
                    <Eye className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {stats.totalImpressions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Page & player ad views
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1524] border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                      Total Ad Clicks
                    </span>
                    <MousePointerClick className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {stats.totalClicks.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Outbound sponsor clicks
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1524] border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                      Overall CTR
                    </span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {stats.ctr.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    High engagement benchmark
                  </div>
                </div>
              </div>

              {/* Per-Placement Breakdown */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d121f]">
                <div className="px-4 py-3 bg-[#090d18] border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Ad Unit Performance Breakdown
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetAdStats}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
                    >
                      Reset Counters
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {adUnits.map((unit) => {
                    const unitEarnings =
                      ((unit.impressions / 1000) * unit.cpmRate) +
                      (unit.clicks * unit.cpcRate);
                    const unitCtr =
                      unit.impressions > 0 ? (unit.clicks / unit.impressions) * 100 : 0;

                    return (
                      <div
                        key={unit.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={unit.enabled}
                            onChange={() => toggleAdUnit(unit.id)}
                            className="w-4 h-4 accent-emerald-500 rounded"
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{unit.name}</span>
                              {!unit.enabled && (
                                <span className="text-[10px] text-slate-500 uppercase font-mono">
                                  (Paused)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Sponsor: {unit.sponsorName} · CPM: ${unit.cpmRate.toFixed(2)} · CPC: ${unit.cpcRate.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="font-mono text-slate-200">
                              {unit.impressions.toLocaleString()} views
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {unit.clicks} clicks ({unitCtr.toFixed(1)}% CTR)
                            </div>
                          </div>

                          <div className="min-w-16">
                            <span className="font-mono font-bold text-emerald-400">
                              ${unitEarnings.toFixed(2)}
                            </span>
                          </div>

                          {/* Quick test click */}
                          <button
                            onClick={() => handleSimulateClick(unit.id)}
                            title="Simulate 1 Click to test earnings calculation"
                            className="px-2.5 py-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 rounded transition-colors"
                          >
                            + Test Click
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT AD PLACEMENTS */}
          {activeTab === 'units' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unit List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Select Placement to Edit
                </label>
                {adUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      selectedUnit.id === unit.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-[#101524] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{unit.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>{unit.placement}</span>
                      <span className={unit.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                        {unit.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Unit Editor Form */}
              <div className="md:col-span-2 bg-[#0e1424] p-5 rounded-xl border border-white/10 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="font-bold text-white text-sm">
                    Configure: {selectedUnit.name}
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-slate-400">Enabled</span>
                    <input
                      type="checkbox"
                      checked={selectedUnit.enabled}
                      onChange={(e) =>
                        updateAdUnit(selectedUnit.id, { enabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>

                {/* Ad Format Selector */}
                <div className="p-3 rounded-lg bg-[#090d18] border border-white/5">
                  <label className="block text-slate-300 font-semibold mb-2">نوع الإعلان (Ad Type)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateAdUnit(selectedUnit.id, { adFormat: 'banner' })}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        (selectedUnit.adFormat || 'banner') === 'banner'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      بانر مخصص (Image Banner)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdUnit(selectedUnit.id, { adFormat: 'code' })}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedUnit.adFormat === 'code'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      كود شبكة إعلانات (HTML / JS Script)
                    </button>
                  </div>
                </div>

                {selectedUnit.adFormat === 'code' ? (
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-semibold">
                      ألصق كود الإعلان من شبكتك (HTML / &lt;script&gt; / &lt;ins&gt; Code)
                    </label>
                    <textarea
                      rows={4}
                      value={selectedUnit.customCode || ''}
                      placeholder='<script src="https://..."></script> or <ins class="adsbygoogle" ...></ins>'
                      onChange={(e) =>
                        updateAdUnit(selectedUnit.id, { customCode: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#090d18] border border-emerald-500/30 font-mono text-[11px] rounded text-emerald-300 resize-none focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      سيتم تشغيل هذا الكود البرمجي وعرض الإعلان مباشرة في مكان {selectedUnit.name}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Ad Campaign Title</label>
                        <input
                          type="text"
                          value={selectedUnit.title}
                          onChange={(e) =>
                            updateAdUnit(selectedUnit.id, { title: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1">Sponsor Brand Name</label>
                        <input
                          type="text"
                          value={selectedUnit.sponsorName}
                          onChange={(e) =>
                            updateAdUnit(selectedUnit.id, { sponsorName: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Ad Copy / Pitch</label>
                      <textarea
                        rows={2}
                        value={selectedUnit.adText}
                        onChange={(e) =>
                          updateAdUnit(selectedUnit.id, { adText: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Banner Image URL</label>
                        <input
                          type="url"
                          value={selectedUnit.bannerImageUrl}
                          onChange={(e) =>
                            updateAdUnit(selectedUnit.id, { bannerImageUrl: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1">Destination Target URL</label>
                        <input
                          type="url"
                          value={selectedUnit.clickUrl}
                          onChange={(e) =>
                            updateAdUnit(selectedUnit.id, { clickUrl: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedUnit.placement === 'preroll_video' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                    <div>
                      <label className="block text-slate-300 mb-1">Pre-Roll Video Stream URL</label>
                      <input
                        type="url"
                        value={selectedUnit.videoUrl || ''}
                        onChange={(e) =>
                          updateAdUnit(selectedUnit.id, { videoUrl: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Skip Countdown Delay (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={selectedUnit.skipDelaySeconds || 5}
                        onChange={(e) =>
                          updateAdUnit(selectedUnit.id, {
                            skipDelaySeconds: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={selectedUnit.ctaText}
                      onChange={(e) =>
                        updateAdUnit(selectedUnit.id, { ctaText: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">CPM Rate ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedUnit.cpmRate}
                      onChange={(e) =>
                        updateAdUnit(selectedUnit.id, { cpmRate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">CPC Rate ($)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={selectedUnit.cpcRate}
                      onChange={(e) =>
                        updateAdUnit(selectedUnit.id, { cpcRate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADSENSE & THIRD-PARTY AD SCRIPTS */}
          {activeTab === 'code' && (
            <div className="space-y-4 text-xs">
              {/* Active Script Notice */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>كود الإعلانات الخاص بك مفعل ويعمل الآن في الموقع بالكامل!</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  تم دمج كود شبكة الإعلانات (CPM Profitable Rate) في صفحة الموقع الرئيسية ويعمل في كافة الصفحات تلقائياً:
                </p>
                <div className="mt-2 p-2.5 rounded bg-black/60 font-mono text-[11px] text-emerald-300 border border-emerald-500/20 break-all select-all">
                  &lt;script src="https://pl31577882.profitableratecpmnetwork.com/e2/56/22/e256227fe54aeaf1abd219636b758c7c.js"&gt;&lt;/script&gt;
                </div>
              </div>

              {/* Global Head Scripts Editor */}
              <div className="p-5 rounded-xl bg-[#0f1524] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>إضافة أو تعديل أكواد الشبكات العامة (Global Head Scripts)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Injection
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  يمكنك لصق أي سكربت إضافي (Adsterra, PropellerAds, PopAds, Monetag, أو سكربت Popunder):
                </p>
                <textarea
                  rows={3}
                  value={headScriptInput}
                  onChange={(e) => setHeadScriptInput(e.target.value)}
                  placeholder='<script src="https://..."></script>'
                  className="w-full px-3 py-2 bg-[#090d18] border border-white/10 rounded-lg text-emerald-300 font-mono text-[11px] resize-none focus:outline-none focus:border-emerald-500"
                />

                <div className="pt-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Google AdSense Publisher ID (إذا كان لديك حساب أدسنس معتمد):
                  </label>
                  <input
                    type="text"
                    value={adSenseInput}
                    placeholder="مثال: ca-pub-1234567890123456"
                    onChange={(e) => setAdSenseInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    رمز إثبات ملكية موقعك في Google Search Console (HTML Tag Content):
                  </label>
                  <input
                    type="text"
                    value={googleVerifyInput}
                    placeholder="مثال: abc123xyz_google-site-verification-token"
                    onChange={(e) => setGoogleVerifyInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#090d18] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    انسخ القيمة من Google Search Console والصقها هنا لإثبات ملكية موقعك وأرشفته فوراً على محرك بحث Google.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveGlobalScripts}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ وتفعيل الأكواد فوراً</span>
                  </button>
                </div>
              </div>

              {/* Supported Networks Info */}
              <div className="p-4 rounded-xl bg-[#0f1524] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs">أفضل الشبكات الإعلانية لمواقع الأفلام والمسلسلات:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300 text-[11px]">
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <div className="font-semibold text-emerald-400">1. Adsterra / CPM Network</div>
                    <p className="text-slate-400 text-[10px] mt-0.5">قبول فوري بدون مراجعة، تدعم Popunder و Social Bar وبانرات بأسعار CPM ممتازة.</p>
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <div className="font-semibold text-emerald-400">2. PropellerAds / Monetag</div>
                    <p className="text-slate-400 text-[10px] mt-0.5">إعلانات Push Notifications و In-Page Push تدفع أرباحاً عالية للزيارات العربية والعالمية.</p>
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <div className="font-semibold text-emerald-400">3. PopAds</div>
                    <p className="text-slate-400 text-[10px] mt-0.5">رائدة إعلانات الـ Popunder لمواقع المشاهدة المباشرة مع دفع يومي سريع.</p>
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <div className="font-semibold text-emerald-400">4. Google AdSense</div>
                    <p className="text-slate-400 text-[10px] mt-0.5">ممتازة إذا كان لديك دومين خاص ومحتوى إضافي، فقط ضع كود الـ Publisher ID أعلاه.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO MAKE MONEY GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-xl bg-[#0f1524] border border-emerald-500/20">
                <h4 className="font-bold text-emerald-400 text-sm mb-2">
                  How to Maximize Money with this Website
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-white">1. Direct Brand Sponsorships</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Partner with streaming VPN services (NordVPN, ExpressVPN), gaming hardware companies, and headphone brands. Put their banner images and tracking links in your header and native cards.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">2. High-CPM Video Pre-Rolls</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Video ads before episodes have the highest CPM rates in the digital advertising industry ($8 to $25 per 1,000 views). Your site has an active pre-roll player with custom skip timing.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">3. Affiliate Links</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Set destination links on ads to your affiliate referral URLs. Whenever a viewer signs up, you get paid a 30%–50% recurring commission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-[#080c16]">
          <button
            onClick={resetToDefaults}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset All Ads to Default Presets
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('ad-manager-close-btn');
              if (el) el.click();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
