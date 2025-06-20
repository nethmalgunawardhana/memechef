'use client';

import { Music } from 'lucide-react';

interface MusicTipProps {
  showMusicTip: boolean;
  onClose: () => void;
  audioLoadingStatus?: Record<string, string>;
}

const MusicTip = ({ showMusicTip, onClose, audioLoadingStatus = {} }: MusicTipProps) => {
  if (!showMusicTip) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-blue-500/70 to-purple-500/70 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg max-w-xs border border-white/10">
        <div className="flex items-start gap-3">
          <div className="mt-1 relative">
            <Music className="text-blue-200" size={20} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="font-semibold mb-1">Game Music Enabled!</div>
            <p className="text-xs text-white/90">
              Use the <span className="text-green-300">music button</span> in the corner to toggle the soundtrack and adjust volume for the full game experience.
            </p>
            
            {/* Audio troubleshooting tips */}
            {audioLoadingStatus.backgroundMusic && audioLoadingStatus.backgroundMusic !== "Ready" && (
              <div className="mt-2 text-xs text-yellow-200">
                <div>Audio Status: {audioLoadingStatus.backgroundMusic}</div>
                <div className="mt-1">
                  <span className="text-white/80">Try clicking anywhere or refreshing if audio doesn&apos;t play.</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="absolute top-1 right-1 text-white/50 hover:text-white/80 text-xs p-1"
          aria-label="Close music tip"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MusicTip;
