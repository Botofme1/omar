import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Play, Bot, User as UserIcon, RefreshCw } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { sendAIChatMessage } from '../services/api';
import { ChatMessage } from '../types';

const MOOD_SUGGESTIONS = [
  '🍿 Mind-bending Sci-Fi with twists',
  '⚔️ High-stakes fantasy kingdom war',
  '🌃 Dark cyberpunk detective mystery',
  '💥 Fast-paced heist & action thriller',
  'ما هو أفضل فيلم سهرة اليوم؟',
];

export const AIChatDrawer: React.FC = () => {
  const { isAIChatOpen, setIsAIChatOpen, mediaList, playMedia } = useMedia();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your CinePulse AI Concierge. Tell me your mood, favorite genres, or ask me for a recommendation in English or Arabic (العربية)!',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAIChatOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const catalogSummary = mediaList.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        genres: m.genres,
        rating: m.rating,
        synopsis: m.synopsis,
      }));

      const historyFormatted = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyText = await sendAIChatMessage(query, catalogSummary, historyFormatted);

      // Detect which titles from catalog were recommended in the response
      const matchedTitles = mediaList
        .filter((m) => replyText.toLowerCase().includes(m.title.toLowerCase()))
        .map((m) => m.id);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
        recommendedTitles: matchedTitles,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'I had a brief glitch connecting to the cinematic neural net, but I strongly recommend "Interstellar Voyage" or "Chronicles of Elysium"!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full bg-[#0a0e18] border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-[#070b13] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                <span>CinePulse AI Concierge</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by Gemini AI · Mood-based discovery
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-none'
                      : 'bg-[#101626] border border-white/10 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Recommended Titles Quick Action Cards */}
                  {msg.recommendedTitles && msg.recommendedTitles.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
                        Suggested For You:
                      </span>
                      {msg.recommendedTitles.map((id) => {
                        const item = mediaList.find((m) => m.id === id);
                        if (!item) return null;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-white/5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={item.posterUrl}
                                alt={item.title}
                                className="w-8 h-11 object-cover rounded shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  ★ {item.rating.toFixed(1)} · {item.releaseYear}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                playMedia(item);
                                setIsAIChatOpen(false);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded flex items-center gap-1 shrink-0"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Watch</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="italic">CinePulse AI is analyzing the library...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Mood Chips */}
        <div className="px-4 py-2 bg-[#080c14] border-t border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none">
          {MOOD_SUGGESTIONS.map((mood) => (
            <button
              key={mood}
              onClick={() => handleSend(mood)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-white/5 transition-colors"
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-[#070b13]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about movies, mood or recommendations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-[#101626] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:hover:bg-rose-600 transition-colors shadow-md shadow-rose-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
