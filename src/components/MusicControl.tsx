'use client';

import { Music, VolumeX, Volume1, Volume2 } from 'lucide-react';

interface MusicControlProps {
  isMusicPlaying: boolean;
  musicVolume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  audioLoadingStatus?: Record<string, string>;
}

const MusicControl = ({ 
  isMusicPlaying, 
  musicVolume, 
  onToggle, 
  onVolumeChange,
  audioLoadingStatus = {}
}: MusicControlProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative group">
        <button
          onClick={onToggle}
          className={`relative w-14 h-14 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 
            ${isMusicPlaying 
              ? 'bg-gradient-to-br from-green-500/40 to-blue-500/40 border-2 border-green-400/50 shadow-lg shadow-green-500/20 animate-music-pulse' 
              : 'bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105'}`}
          title={isMusicPlaying ? "Pause Game Music" : "Play Game Music"}
          aria-label="Toggle background music"
        >
          <div className={`transition-transform duration-300 ${isMusicPlaying ? 'scale-110 animate-wave' : ''}`}>
            {isMusicPlaying ? (
              <>
                <Music className="text-green-300" size={22} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                
                {/* Enhanced sound wave animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full rounded-full border-2 border-green-400/30 animate-ping-slow absolute"></div>
                  <div className="w-[90%] h-[90%] rounded-full border border-green-400/20 animate-ping-slow absolute" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-[80%] h-[80%] rounded-full border border-green-400/10 animate-ping-slow absolute" style={{ animationDelay: '1s' }}></div>
                </div>
              </>
            ) : (
              <>
                <VolumeX className="text-white/70" size={22} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity pointer-events-none">
                  <Music className="text-white/50" size={16} />
                </div>
              </>
            )}
          </div>

          {/* Button glow effect when playing */}
          {isMusicPlaying && (
            <div className="absolute inset-0 rounded-full bg-green-500/5 blur-md -z-10"></div>
          )}
        </button>
        
        {/* Always-visible volume slider with improved UI */}
        <div className={`absolute -left-[13rem] top-1/2 -translate-y-1/2 w-48 h-10 px-3 
            rounded-full flex items-center transition-all duration-300
            backdrop-blur-md border shadow-lg
            ${isMusicPlaying 
              ? 'opacity-100 border-green-400/30 bg-black/40 shadow-green-500/20' 
              : 'opacity-0 group-hover:opacity-90 border-white/10 bg-black/30'}
            group-hover:opacity-100`}
        >
          <div className="flex items-center w-full gap-2">
            <Volume1 size={14} className={isMusicPlaying ? "text-green-300" : "text-white/70"} />            <input 
              type="range" 
              min="0" 
              max="100" 
              value={musicVolume * 100} 
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              className={`w-full ${isMusicPlaying ? 'volume-slider-active' : 'volume-slider-inactive'} cursor-pointer`}
              style={{
                background: `linear-gradient(90deg, 
                  ${isMusicPlaying ? 'rgba(74, 222, 128, 0.7)' : 'rgba(255, 255, 255, 0.3)'} 
                  ${musicVolume * 100}%, 
                  rgba(255, 255, 255, 0.1) ${musicVolume * 100}%)`
              }}
              title={`Volume: ${Math.round(musicVolume * 100)}%`}
              disabled={!isMusicPlaying}
            />
            <Volume2 size={14} className={isMusicPlaying ? "text-green-300" : "text-white/70"} />
          </div>
        </div>
        
        {/* Status indicator */}
        {audioLoadingStatus.backgroundMusic && audioLoadingStatus.backgroundMusic !== "Ready" && (
          <div className="absolute -bottom-8 right-0 text-xs text-yellow-300 bg-black/50 px-2 py-1 rounded whitespace-nowrap">
            Audio loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicControl;
