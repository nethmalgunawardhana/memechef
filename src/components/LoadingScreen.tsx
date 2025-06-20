import React, { useState, useEffect } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

// Extend Window interface to include webkitAudioContext
interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  const [audioStatus, setAudioStatus] = useState<string>("Not initialized");
  const [audioDebugInfo, setAudioDebugInfo] = useState<string>("");
  
  // Attempt to preload audio to check if it exists
  useEffect(() => {
    if (progress > 80) {
      const audio = new Audio('/sounds/background.mp3');
      audio.volume = 0;
      
      setAudioStatus("Loading audio file...");
      
      // Add event listeners to debug audio issues
      audio.addEventListener('canplaythrough', () => {
        setAudioStatus("Audio file loaded successfully");
        setAudioDebugInfo("Audio is ready to play");
      });
      
      audio.addEventListener('error', (e) => {
        const errorMsg = `Error: ${e.type}`;
        setAudioStatus("Audio file error");
        setAudioDebugInfo(errorMsg);
        console.error("Audio loading error:", e);
      });
      
      try {
        // Just load but don't play yet
        audio.load();
        
        // Check if file exists with a fetch call
        fetch('/sounds/background.mp3')
          .then(response => {
            if (response.ok) {
              setAudioDebugInfo(prev => prev + " | File exists");
            } else {
              setAudioDebugInfo(prev => prev + ` | HTTP error: ${response.status}`);
            }
          })
          .catch(error => {
            setAudioDebugInfo(prev => prev + ` | Fetch error: ${error.message}`);
          });
      } catch (error) {
        setAudioStatus("Audio initialization error");
        setAudioDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      return () => {
        audio.removeEventListener('canplaythrough', () => {});
        audio.removeEventListener('error', () => {});
      };
    }
  }, [progress]);
  // Random loading messages to display
  const loadingMessages = [
    "Preparing culinary chaos...",
    "Warming up the absurdity oven...",
    "Chopping logic circuits...",
    "Stirring AI imagination...",
    "Adding a pinch of insanity...",
    "Preheating meme generator...",
    "Gathering chaotic ingredients...",
    "Sharpening virtual knives...",
    "Polishing chef's hat...",
    "Loading game soundtrack..."
  ];
  
  // Get a random message based on progress
  const getMessage = () => {
    const index = Math.min(
      Math.floor(progress / 10),
      loadingMessages.length - 1
    );
    return loadingMessages[index];
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-black to-pink-900/95 flex flex-col items-center justify-center z-50 transition-opacity duration-1000">
      {/* Game Logo */}
      <div className="mb-12 transform animate-bounce-slow">
        <div className="text-7xl mb-2">🧑‍🍳</div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          MemeChef
        </h1>
        <p className="text-white/70 text-sm">The Culinary Chaos Game</p>
      </div>
      
      <div className="w-3/4 max-w-md mb-4 relative">
        <div className="absolute -top-8 left-0 right-0 text-center text-white/80 text-sm font-mono">
          {getMessage()}
        </div>
        
        <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-3 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 opacity-50 animate-pulse-fast"></div>
          </div>
        </div>
        
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between items-center text-xs text-white/60">
          <span>0%</span>
          <span className="font-bold text-sm text-white">{progress.toFixed(0)}%</span>
          <span>100%</span>
        </div>
      </div>      {/* Enhanced audio notice with status */}
      <div className="mt-16 flex flex-col items-center text-white/70 text-sm gap-2">
        <div className="flex items-center gap-2">
          {audioStatus === "Audio file loaded successfully" ? (
            <Volume2 size={16} className="text-green-400 animate-pulse" />
          ) : (
            <VolumeX size={16} className="text-yellow-400" />
          )}
          <span>Get ready for an immersive experience with sound</span>
          <Music className={`ml-1 ${audioStatus === "Audio file loaded successfully" ? "text-green-400" : "text-yellow-400"}`} size={14} />
        </div>
          {/* Enhanced audio debug info with browser detection */}
        {progress < 100 && (
          <div className="mt-2 px-4 py-1 bg-black/30 rounded-md text-xs max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300">Audio Status: </span>
              <span className={audioStatus.includes("error") ? "text-red-400" : "text-green-400"}>
                {audioStatus}
              </span>
            </div>
            
            {audioDebugInfo && (
              <div className="text-blue-300 mt-1 font-mono text-xs border-t border-blue-500/30 pt-1">
                {audioDebugInfo}
              </div>
            )}
            
            {/* Browser compatibility info */}
            <div className="mt-2 border-t border-white/20 pt-1 text-[10px] text-white/60">
              <div className="flex justify-between">
                <span>Browser: </span>
                <span className="font-mono">
                  {typeof navigator !== 'undefined' ? 
                    navigator.userAgent.match(/chrome|chromium|crios/i) ? "Chrome ✓" :
                    navigator.userAgent.match(/firefox|fxios/i) ? "Firefox ✓" :
                    navigator.userAgent.match(/safari/i) && !navigator.userAgent.match(/chrome|chromium|crios/i) ? "Safari ⚠️" :
                    navigator.userAgent.match(/iphone|ipad|ipod/i) ? "iOS ⚠️" :
                    navigator.userAgent.match(/edge|edgios|edga|edg/i) ? "Edge ✓" :
                    navigator.userAgent.match(/opera|opr\//i) ? "Opera ✓" :
                    "Unknown" : "Unknown"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Audio API: </span>
                <span className={`font-mono ${typeof Audio !== 'undefined' ? "text-green-400" : "text-red-400"}`}>
                  {typeof Audio !== 'undefined' ? "Available ✓" : "Not Available ✗"}
                </span>
              </div>              <div className="flex justify-between">
                <span>AudioContext: </span>
                <span className={`font-mono ${typeof window !== 'undefined' && 
                  (window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext) ? "text-green-400" : "text-yellow-300"}`}>
                  {typeof window !== 'undefined' && 
                   (window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext) ? "Available ✓" : "Limited ⚠️"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
        {/* Enhanced game tips with better music instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-block backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-6 py-3 shadow-lg shadow-purple-900/20">
          <div className="flex items-center justify-center mb-2">
            <Music size={16} className="text-green-400 mr-2" />
            <p className="text-white text-sm font-medium">
              Game Music Controls
            </p>
          </div>
          
          <p className="text-white/80 text-sm">
            Click the <span className="bg-white/10 px-1.5 py-0.5 rounded text-green-300 font-mono">music icon</span> in the bottom-right corner to toggle game soundtrack.
          </p>
          
          <p className="text-xs text-yellow-300 mt-2 flex items-center justify-center">
            <Volume2 size={12} className="mr-1" />
            Hover over the music button to adjust volume
          </p>
          
          <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/60">
            Note: For best experience, allow browser audio permissions on first interaction
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
