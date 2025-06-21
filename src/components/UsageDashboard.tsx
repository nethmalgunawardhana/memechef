'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { usageTracker } from '@/services/usageTracker';
import { cacheService } from '@/services/cacheService';

interface UsageDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsageDashboard({ isOpen, onClose }: UsageDashboardProps) {
  const [usage, setUsage] = useState(usageTracker.getUsage());
  const [cacheStats, setCacheStats] = useState(cacheService.getCacheStats());
  const [showOptimizations, setShowOptimizations] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsage(usageTracker.getUsage());
      setCacheStats(cacheService.getCacheStats());
    }
  }, [isOpen]);

  const optimizationSuggestions = usageTracker.getOptimizationSuggestions();
  const shouldWarn = usageTracker.shouldWarnUser();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="text-purple-400" size={32} />
            <h2 className="text-2xl font-bold text-white">API Usage Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Warning Banner */}
        {shouldWarn && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-orange-400" size={24} />
              <div>
                <h3 className="text-orange-300 font-bold">High Usage Alert</h3>
                <p className="text-orange-200 text-sm">
                  You are approaching your daily API limits. Consider using cached content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="text-purple-400" size={20} />
              <span className="text-purple-300 font-medium">Gemini API</span>
            </div>
            <div className="text-2xl font-bold text-white">{usage.geminiCalls}</div>
            <div className="text-sm text-gray-400">calls today</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-green-400 text-xl">🔊</span>
              <span className="text-green-300 font-medium">ElevenLabs TTS</span>
            </div>
            <div className="text-2xl font-bold text-white">{usage.elevenLabsCalls}</div>
            <div className="text-sm text-gray-400">calls today</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingDown className="text-yellow-400" size={20} />
              <span className="text-yellow-300 font-medium">Cache Saves</span>
            </div>
            <div className="text-2xl font-bold text-white">{usage.cacheSaved}</div>
            <div className="text-sm text-gray-400">API calls avoided</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-pink-400 text-xl">💾</span>
              <span className="text-pink-300 font-medium">Cache Items</span>
            </div>
            <div className="text-2xl font-bold text-white">{cacheStats.totalEntries}</div>
            <div className="text-sm text-gray-400">cached responses</div>
          </div>
        </div>

        {/* Optimization Suggestions */}
        {optimizationSuggestions.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowOptimizations(!showOptimizations)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mb-3"
            >
              <span>💡</span>
              <span className="font-medium">Optimization Suggestions</span>
              <span className="text-sm">({optimizationSuggestions.length})</span>
            </button>
            
            {showOptimizations && (
              <div className="space-y-2">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
                  >
                    <p className="text-blue-200 text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cost Estimates */}
        <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3">Estimated Daily Costs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Gemini API ({usage.geminiCalls} calls):</span>
              <span className="text-green-400">~${(usage.geminiCalls * 0.02).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ElevenLabs TTS ({usage.elevenLabsCalls} calls):</span>
              <span className="text-blue-400">~${(usage.elevenLabsCalls * 0.15).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total Estimated:</span>
                <span className="text-yellow-400">
                  ~${((usage.geminiCalls * 0.02) + (usage.elevenLabsCalls * 0.15)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Saved by caching:</span>
              <span className="text-green-400">
                ~${(usage.cacheSaved * 0.08).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              cacheService.clearExpired();
              setCacheStats(cacheService.getCacheStats());
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Clear Expired Cache
          </button>
          
          <button
            onClick={() => {
              usageTracker.resetStats();
              setUsage(usageTracker.getUsage());
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Reset Daily Stats
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Stats reset automatically every 24 hours
        </div>
      </div>
    </div>
  );
}
