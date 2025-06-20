'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, Trophy, Star, Zap, Flame, Shield, Crown, Sparkles, Award, Volume2, Volume1, VolumeX, Music } from 'lucide-react';
import IngredientUpload from "@/components/IngredientUpload";
import RecipeDisplay from "@/components/RecipeDisplay";
import AiChef from "@/components/AiChef";
import ChaosButton from "@/components/ChaosButton";
import ShareRecipe from "@/components/ShareRecipe";
import Achievements from "@/components/Achievements";
import FixedStatsHeader from "@/components/FixedStatsHeader";
import LoadingScreen from '@/components/LoadingScreen';
import { 
  analyzeIngredients, 
  generateAbsurdRecipe, 
  generateChefNarration,
  mutateChaosRecipe,
  generateMemeCaption,
  getRatingFromHistoricalFigure,
  Recipe 
} from "@/services/geminiService";
import { ttsService } from "@/services/ttsService";

// Background Animation Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 opacity-20"></div>
      
      {/* Floating Food Icons */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`absolute text-white/10 text-4xl animate-pulse`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        >
          {['🍳', '🔥', '✨', '🌟', '💫', '🎭', '🎪', '🌪️'][Math.floor(Math.random() * 8)]}
        </div>
      ))}
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Floating Game Item Effect
const FloatingGameItem = ({ emoji, points, x, y }: { emoji: string, points?: number, x: number, y: number }) => (
  <div className="absolute animate-float-up pointer-events-none flex flex-col items-center"
       style={{left: `${x}px`, top: `${y}px`}}>
    <div className="text-3xl mb-1">{emoji}</div>
    {points && <div className="text-sm font-bold text-yellow-300">+{points}</div>}
  </div>
);

// Game Effect Component
const GameEffect = ({ type, message, onComplete }: { type: 'success' | 'bonus' | 'level-up', message: string, onComplete?: () => void }) => {
  const effectRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (effectRef.current) {
      const timer = setTimeout(() => {
        if (effectRef.current) {
          effectRef.current.classList.add('opacity-0');
        }
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);
  
  return (
    <div ref={effectRef} className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className={`p-6 rounded-xl text-center transform animate-bounce-in ${
        type === 'success' ? 'bg-green-500/80 text-white' :
        type === 'bonus' ? 'bg-yellow-500/80 text-white' :
        'bg-purple-500/80 text-white'
      }`}>
        <div className="text-3xl font-bold mb-2">
          {type === 'success' && <Trophy className="inline-block mr-2" />}
          {type === 'bonus' && <Star className="inline-block mr-2" />}
          {type === 'level-up' && <Crown className="inline-block mr-2" />}
          {message}
        </div>
      </div>
    </div>
  );
};

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  glow?: boolean;
  pulse?: boolean;
  shake?: boolean;
}

const GlassCard = ({ 
  children, 
  className = "", 
  hover = true, 
  rarity = 'common',
  glow = false,
  pulse = false,
  shake = false,
  ...props 
}: GlassCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  // Define rarity-based styling
  const rarityStyles = {
    common: "border-white/20 shadow-purple-500/20 hover:shadow-purple-500/30",
    rare: "border-blue-400/40 shadow-blue-500/20 hover:shadow-blue-500/40",
    epic: "border-purple-400/40 shadow-purple-500/30 hover:shadow-purple-500/50",
    legendary: "border-orange-400/40 shadow-orange-500/30 hover:shadow-orange-500/50 border-2"
  };
  
  // Define glow effects
  const glowEffect = glow ? `${
    rarity === 'legendary' ? 'shadow-2xl shadow-orange-500/50 ring-2 ring-orange-500/30' :
    rarity === 'epic' ? 'shadow-xl shadow-purple-500/50 ring-1 ring-purple-500/30' :
    rarity === 'rare' ? 'shadow-lg shadow-blue-500/40 ring-1 ring-blue-500/20' :
    'shadow-md shadow-white/30'
  }` : '';
  
  // Define animations
  const animations = `${
    pulse ? 'animate-pulse-slow' : ''
  } ${
    shake ? 'animate-wiggle' : ''
  }`;
  
  return (
    <div className={`
      relative overflow-hidden
      backdrop-blur-xl bg-white/10 
      border ${rarityStyles[rarity]}
      rounded-2xl shadow-2xl
      ${hover ? 'hover:bg-white/15 hover:scale-[1.02] hover:-translate-y-1' : ''}
      ${glowEffect}
      ${animations}
      transition-all duration-400 ease-out
      ${className}
    `} {...props}>
      {/* Rarity indicator */}
      {rarity !== 'common' && (
        <div className="absolute top-0 right-0 m-2">
          <div className={`w-3 h-3 rounded-full ${
            rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' :
            rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
            'bg-gradient-to-br from-blue-400 to-cyan-500'
          }`}></div>
        </div>
      )}
      
      {children}
      
      {/* Subtle decorative corner elements for game-like UI */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg pointer-events-none"></div>
    </div>
  );
};

// Game Levels and Player Titles
const PLAYER_LEVELS = [
  { level: 1, title: "Novice Chef", threshold: 0, icon: "🧑‍🍳" },
  { level: 2, title: "Apprentice Chef", threshold: 100, icon: "👨‍🍳" },
  { level: 3, title: "Sous Chef", threshold: 250, icon: "🔪" },
  { level: 4, title: "Head Chef", threshold: 500, icon: "👨‍🍳⭐" },
  { level: 5, title: "Executive Chef", threshold: 1000, icon: "🧑‍🍳🏆" },
  { level: 6, title: "Master Chef", threshold: 2000, icon: "👨‍🍳👑" },
  { level: 7, title: "Chaos Culinary Legend", threshold: 5000, icon: "🔥👨‍🍳✨" }
];

export default function Home() {
  // State management
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [narration, setNarration] = useState<string>('');
  const [memeCaption, setMemeCaption] = useState<string>('');
  const [historicalRating, setHistoricalRating] = useState<string>('');
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isChaosLoading, setIsChaosLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Stats for achievements
  const [recipeCount, setRecipeCount] = useState(0);
  const [chaosCount, setChaosCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  
  // Game mechanics
  const [playerXP, setPlayerXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [comboChain, setComboChain] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [floatingItems, setFloatingItems] = useState<Array<{id: number, emoji: string, points?: number, x: number, y: number}>>([]);
  const [gameEffects, setGameEffects] = useState<Array<{id: number, type: 'success' | 'bonus' | 'level-up', message: string}>>([]);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
    // Sound effects
  const soundEffects = {
    levelUp: useRef<HTMLAudioElement | null>(null),
    achievement: useRef<HTMLAudioElement | null>(null),
    combo: useRef<HTMLAudioElement | null>(null),
    chaosButton: useRef<HTMLAudioElement | null>(null),
    chefKiss: useRef<HTMLAudioElement | null>(null),
    success: useRef<HTMLAudioElement | null>(null),
    background: useRef<HTMLAudioElement | null>(null)
  };

  // Background music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => {
    // Try to get saved volume from localStorage, default to 0.3 (30%)
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('memechef-music-volume');
      return savedVolume ? parseFloat(savedVolume) : 0.3;
    }
    return 0.3;
  });
  
  // Save music settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memechef-music-volume', musicVolume.toString());
      localStorage.setItem('memechef-music-playing', isMusicPlaying ? 'true' : 'false');
    }
  }, [musicVolume, isMusicPlaying]);
  
  // Track if user has interacted with the page to bypass autoplay restrictions
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  // Tip notification for music feature
  const [showMusicTip, setShowMusicTip] = useState(true);
  // Audio loading status tracking
  const [audioLoadingStatus, setAudioLoadingStatus] = useState<Record<string, string>>({});
    useEffect(() => {
    // Initialize sound effects
    if (typeof window !== 'undefined') {
      console.log("Initializing sound effects and game audio...");
      
      // Check if browser supports Audio
      if (typeof Audio === 'undefined') {
        console.error("Audio API not supported in this browser");
        setAudioLoadingStatus(prev => ({...prev, global: "Audio API not supported"}));
        return;
      }
      
      // Detect browser for better compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isSpecialBrowserCase = isIOS || isSafari;
      
      console.log(`Browser detection: iOS: ${isIOS}, Safari: ${isSafari}`);
        // Create an audio context to better manage audio resources
      try {
        // Initialize with proper options for iOS Safari
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext({
          latencyHint: 'interactive',
          sampleRate: 44100 // Standard sample rate with good compatibility
        });
        console.log("AudioContext created successfully:", audioCtx.state);
        
        // Resume context if needed (some browsers require this)
        if (audioCtx.state === 'suspended') {
          const resumeAudioContext = () => {
            audioCtx.resume().then(() => {
              console.log("AudioContext resumed successfully");
              document.removeEventListener('click', resumeAudioContext);
              document.removeEventListener('touchstart', resumeAudioContext);
              document.removeEventListener('keydown', resumeAudioContext);
            }).catch((err: Error) => {
              console.error("Failed to resume AudioContext:", err);
            });
          };
          
          document.addEventListener('click', resumeAudioContext, { once: true });
          document.addEventListener('touchstart', resumeAudioContext, { once: true });
          document.addEventListener('keydown', resumeAudioContext, { once: true });
        }
      } catch (e) {
        console.error("Failed to create AudioContext:", e);
      }
      
      // Helper function to create and log audio initialization with better error handling
      const createAudio = (path: string, description: string) => {
        try {
          setAudioLoadingStatus(prev => ({...prev, [description]: "Initializing..."}));
          
          // Verify file exists first
          fetch(path)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
              }
              setAudioLoadingStatus(prev => ({...prev, [description]: "File verified"}));
              return response;
            })
            .catch(error => {
              console.error(`Error fetching ${description} file:`, error);
              setAudioLoadingStatus(prev => ({...prev, [description]: `File error: ${error.message}`}));
            });
          
          // Create the Audio object with proper error handling
          const audio = new Audio();
          
          // Set crossOrigin for better CORS handling (helps with some CDNs)
          audio.crossOrigin = "anonymous";
          
          // Add event listeners for better debugging
          audio.addEventListener('canplaythrough', () => {
            console.log(`${description} loaded and ready to play`);
            setAudioLoadingStatus(prev => ({...prev, [description]: "Ready"}));
          });
          
          audio.addEventListener('play', () => {
            console.log(`${description} started playing`);
          });
          
          audio.addEventListener('error', (e) => {
            const error = e.target as HTMLMediaElement;
            const errorMsg = error.error ? error.error.message : 'Unknown error';
            console.error(`${description} error:`, errorMsg);
            setAudioLoadingStatus(prev => ({...prev, [description]: `Error: ${errorMsg}`}));
            
            // Try alternate loading method for Safari
            if (isSpecialBrowserCase) {
              console.log(`Attempting alternate loading method for ${description} on iOS/Safari`);
              setTimeout(() => {
                audio.src = path + '?cachebust=' + new Date().getTime();
                audio.load();
              }, 100);
            }
          });
          
          // Force preload for faster playback
          audio.preload = 'auto';
          
          // Set src and load
          audio.src = path;
          audio.load();
          
          console.log(`${description} initialized`);
          return audio;
        } catch (error) {
          console.error(`Error initializing ${description}:`, error);
          setAudioLoadingStatus(prev => ({...prev, [description]: `Init error: ${error instanceof Error ? error.message : 'Unknown error'}`}));
          return null;
        }
      };
      
      // Initialize sound effects with proper error handling
      soundEffects.levelUp.current = createAudio('/sounds/level-up.mp3', 'Level up sound');
      soundEffects.achievement.current = createAudio('/sounds/achievement.mp3', 'Achievement sound');
      soundEffects.combo.current = createAudio('/sounds/combo.mp3', 'Combo sound');
      soundEffects.chaosButton.current = createAudio('/sounds/chaos-button.mp3', 'Chaos button sound');
      soundEffects.chefKiss.current = createAudio('/sounds/chef-kiss.mp3', 'Chef kiss sound');
      soundEffects.success.current = createAudio('/sounds/success.mp3', 'Success sound');
      
      // Set up background music with looping and proper logging
      try {
        console.log("Setting up background music...");
        setAudioLoadingStatus(prev => ({...prev, backgroundMusic: "Initializing..."}));
        
        const bgMusic = new Audio();
        bgMusic.crossOrigin = "anonymous";
        
        // Add event listeners for comprehensive debugging
        bgMusic.addEventListener('canplaythrough', () => {
          console.log("Background music loaded and ready to play");
          setAudioLoadingStatus(prev => ({...prev, backgroundMusic: "Ready"}));
          
          // Try auto-play if previous state was playing
          if (typeof window !== 'undefined') {
            const wasPlaying = localStorage.getItem('memechef-music-playing') === 'true';
            if (wasPlaying && userHasInteracted) {
              bgMusic.play().then(() => {
                setIsMusicPlaying(true);
                console.log("Auto-resumed background music based on saved preferences");
              }).catch(e => {
                console.warn("Couldn't auto-play music:", e);
              });
            }
          }
        });
        
        bgMusic.addEventListener('play', () => {
          console.log("Background music started playing");
          setIsMusicPlaying(true);
        });
        
        bgMusic.addEventListener('pause', () => {
          console.log("Background music paused");
          setIsMusicPlaying(false);
        });
        
        bgMusic.addEventListener('ended', () => {
          // This should not happen with loop=true, but just in case
          console.log("Background music ended, restarting");
          bgMusic.currentTime = 0;
          bgMusic.play().catch(e => console.warn("Couldn't restart music:", e));
        });
        
        bgMusic.addEventListener('error', (e) => {
          const error = e.target as HTMLMediaElement;
          const errorCode = error.error ? error.error.code : 'unknown';
          const errorMsg = error.error ? error.error.message : 'Unknown error';
          console.error(`Background music error (code ${errorCode}):`, errorMsg);
          setAudioLoadingStatus(prev => ({...prev, backgroundMusic: `Error ${errorCode}: ${errorMsg}`}));
          
          // Try alternate loading method for Safari/iOS
          if (isSpecialBrowserCase) {
            console.log("Attempting alternate loading method for background music on iOS/Safari");
            setTimeout(() => {
              bgMusic.src = '/sounds/background.mp3?cachebust=' + new Date().getTime();
              bgMusic.load();
            }, 200);
          }
        });
        
        // Configure background music
        bgMusic.loop = true;
        bgMusic.volume = musicVolume;
        bgMusic.preload = 'auto';
        
        // Set source and start loading
        bgMusic.src = '/sounds/background.mp3';
        bgMusic.load();
        
        soundEffects.background.current = bgMusic;
        console.log("Background music initialized with volume:", musicVolume);
      } catch (error) {
        console.error("Error initializing background music:", error);
        setAudioLoadingStatus(prev => ({...prev, backgroundMusic: `Init error: ${error instanceof Error ? error.message : 'Unknown error'}`}));
      }
    }
  }, []);
    // Handle background music playback
  const toggleBackgroundMusic = () => {
    if (soundEffects.background.current) {
      try {
        if (isMusicPlaying) {
          soundEffects.background.current.pause();
          console.log("Background music paused by user");
        } else {
          // Try to resume from last position if possible
          const playPromise = soundEffects.background.current.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log("Background music started successfully");
              // Mark that user has interacted with audio
              setUserHasInteracted(true);
            }).catch(error => {
              console.warn("Audio play failed:", error);
              // Provide user feedback about autoplay restrictions
              alert("Your browser blocked autoplay. Please try clicking the music button again.");
            });
          }
        }
      } catch (error) {
        console.error("Error toggling music:", error);
      }
    } else {
      console.warn("Background music element not initialized yet");
      
      // Try to recreate it if it's missing
      try {
        soundEffects.background.current = new Audio('/sounds/background.mp3');
        soundEffects.background.current.loop = true;
        soundEffects.background.current.volume = musicVolume;
        soundEffects.background.current.load();
        console.log("Recreated missing background music element");
        
        // Try to play after a short delay
        setTimeout(() => {
          if (soundEffects.background.current) {
            soundEffects.background.current.play().catch(e => {
              console.warn("Couldn't play recreated music element:", e);
            });
          }
        }, 100);
      } catch (e) {
        console.error("Failed to recreate background music:", e);
      }
    }
  };
    // Enhanced function to update all audio volumes at once
  const updateAllAudioVolumes = (newVolume: number) => {
    try {
      // Ensure volume is in valid range (0-1)
      const validVolume = Math.max(0, Math.min(1, newVolume));
      
      // Update background music
      if (soundEffects.background.current) {
        soundEffects.background.current.volume = validVolume;
      }
      
      // Update all sound effects (at 80% of music volume for balance)
      const effectVolume = validVolume * 0.8;
      Object.entries(soundEffects).forEach(([key, soundRef]) => {
        if (soundRef.current && key !== 'background') {
          soundRef.current.volume = effectVolume;
        }
      });
      
      // Save new volume to localStorage
      localStorage.setItem('memechef-music-volume', validVolume.toString());
      
      console.log(`Updated all audio volumes - Music: ${validVolume.toFixed(2)}, Effects: ${effectVolume.toFixed(2)}`);
      
      // Update audio status for debugging
      setAudioLoadingStatus(prev => ({
        ...prev, 
        volumeUpdate: `Set to ${Math.round(validVolume * 100)}%`
      }));
    } catch (error) {
      console.error("Error updating audio volumes:", error);
    }
  };
  
  // Update volume when volume state changes and ensure all audio elements are updated
  useEffect(() => {
    updateAllAudioVolumes(musicVolume);
    
    // Add event listeners to update volume when audio elements are created/recreated
    const handleAudioCreated = () => updateAllAudioVolumes(musicVolume);
    document.addEventListener('audioCreated', handleAudioCreated);
    
    return () => {
      document.removeEventListener('audioCreated', handleAudioCreated);
    };
  }, [musicVolume]);
  // Advanced auto-play background music system with iOS/Safari workarounds
  useEffect(() => {
    // Create silent audio data for unlocking - must be at least 0.5s for iOS/Safari
    const silentMP3Base64 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAA" + "A".repeat(8000) + "AAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExZWVlZWVlnZ2dnZ3V1dXV1dYODg4ODkZGRkZGRn5+fn5+frKysrKy6urq6urrIyMjIyNbW1tbW1uTk5OTk8vLy8vLy//////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAXgAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAA9RjpZxRwAImU+W8eshaFpAQgALAAYALATx/nYDYCMJ0HITQYYA7AH4c7MoGsnCMU5pnW+OQnBcDrQ9Xx7w37/D+PimYavV8elKUpT5fqx5VjV6vZ38eJR48eRKa9KUp7v396UgPHkQwMAAAAAA//8MAOp39CECAAhlIEEIIECBAgTT1oj///tEQYT0wgEIYxgDC09aIiE7u7u7uIiIz+LtoIQGE/+XAGYLjpTAIOGYYy0ZACgDgSNFxC7YYiINocwERjAEDhIy0mRoGwAE7lOTBsGhj1qrXNCU9GrgwSPr80jj0dIpT9DRUNHKJbRxiWSiifVHuD2b0EbjLkOUzSXztP3uE1JpHzV6NPq+f3P5T0/f/lNH7lWTavQ5Xz1yLVe653///qf93B7f/vMdaKJAAJAMAIwIMAHMpzDkoYwD8CR717zVb8/p54P3MikXGCEWhQOEAOAdP6v8b8oNL/EzdnROC8Zo+z+71O8VVAGIKFEglKbidkoLam0mAFiwo0ZoVExf/7kmQLgAEZDdIU5gAiNKGaKnMgAURkM0dXJAAIjIZo7OSAAR9MTlhDOiYrjxRxikMVodORfIoXRTGYrjxRxiWK0ShIFMefFFMVodORfIigAORfTMVx4o4xSGLUSMiOPFIYljtDoviAAORfVMVx4o4xSH8epRMVodOLoi+KQxWh05F8ihd45L4pjMVx4o4xL4pjtDoviAAOReqYrjxRxikOiRnRMVodOL4pDFUNf/QV1L6p2Mefx7jJSTEDQLeq7tVb7Jmtl3XP0TE9ZhtiW2hati8lethDDNVUAACZA5rWhLDXYQCaBZFYArA5nEYR1IIJCFYYm/GJUt7JyKQchdWAjWGDXA35A6JgUQfA/KcW9XBw5K0dSFN2WNxYbTg4Iyx1ioSR4pD/xNjru1z257rKFKIKNRf3WUtiLF/YnsjQ2tuS76x/JcKsEjYOleK7/E/zi/V4nqlc1zuhcqy8JrM8ia3ttbcsDELVWTodYHSkq1tLNsDELSr6k2BY4EWLBA5JwRJ7ksUegPUNfRzI8SHwMSHMkuXJ8rkuSHw7k+XyQ5EiRIkSHLk+SJEiRIcuT5XJDkSJEiQ5EiRIcuSHIkSJEhy5IdwIeRRRC5UssYTByVyWZHMFiFYPAuxgsHMCTCcbzCOcxPydEesiOZHIG5YnMqxO5E8jeaGxfKey3kZ8fdBNuS6ZIkSJEiL4qWHA/P/7kmQDgAEYDEhTmQAKI0FpAXMgAURkL/5iAAidA+QAAAQ4Lj5iEL4BMdthyF8fu7hy5Pkcz8cYPQ2nUTprZNyvpJEiRIl0J+LyQ5EiRIkOXJ8iRIkSJDkSJEiRIkORIkSHLkhyJEiRIkSJEhy5PkSJEiQ5ciRIkSJEhyJEiRIkSJEhy5IciRIehcqnyi/EQpzZVDkTyNTYcwciOQNy5OZVieSGRlyh6c8DazkJydEeiOZHMjkrdyXTJEiRI8sULLk+RzI5kcwbly8yORPI3mRx4oZnJspsuV02QyGQyGQyNrafvFpssMjmRzI5kci48onwuZHtHImROhcqf6iOZcqnm3w5rnMVcHqY5+941WdF8FXMd/8/6/8fxH4e7DGZwRLfx3Bymf5mx6H8p+f8r5T9v4PD/Cbi/1/D4P4WYPh/ENweKCP/HvRdf8avn/B4P4L7n9Phj0P8VrDG5f4L+XxL/h/g/KfjxT8X8v5J+X9+X//D4p8H5r8f5f4p/yjGP/86P/7kmQPj/ECDTMGPAAYAAA0gAAABFzRxxz2ETgAADSAAAAEg4sQw5nEMwz4XA8DuIdWO7JoTvLQdiFoCsR2UalCOyd86qjFvwKjftC/YexDHOCO0L9gVLfQSJeP/4LAPigGKNScNAvJNAcUqHDmc40Tp5stZxiHNm1XQKgyQqXD2GpdNAXKvHQtqEOYYVQCIRvKHNm1fIKKPUikHKM/QO5hbmoHdkgxW4aSHDydh0qzShWS6+WQyl08MgGK/pJDiRTTxcitfLLWcYhzZtV8altTNqDBPcwbjt/4v3isQ5hohzZtr8okhtAgTpGHMGlfcYhzI7QKuOYYHM4xD7jEOVM2q8okhtAhzZta/yiSG0DmP/4okU//LD2dVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";

    const handleUserInteraction = () => {
      // Mark that the user has interacted with the page
      setUserHasInteracted(true);
      
      // Try to enable audio after user interaction (bypassing autoplay restrictions)
      const enableAudio = async () => {
        try {
          // Only try to play music if it's not already playing and user preference is to play
          const shouldPlayMusic = localStorage.getItem('memechef-music-playing') !== 'false';
          
          // On iOS/Safari, we need to play a silent sound first before playing any other audio
          const silentSound = new Audio(silentMP3Base64);
          silentSound.volume = 0.01; // iOS requires some volume
          
          try {
            // Playing silent sound to unlock audio on iOS/Safari
            await silentSound.play();
            console.log("Silent sound played successfully to unlock audio");
            
            // Play all audio that needs autoplay
            if (soundEffects.background.current && !isMusicPlaying && shouldPlayMusic) {
              soundEffects.background.current.volume = musicVolume;
              
              try {
                await soundEffects.background.current.play();
                console.log("Background music started after user interaction");
                setIsMusicPlaying(true);
                
                // Ensure looping is enabled (it can be disabled on some browsers)
                soundEffects.background.current.loop = true;
                
                // Fix for iOS Safari where loop sometimes doesn't work
                soundEffects.background.current.addEventListener('ended', function restartOnEnd() {
                  console.log("Background music ended, enforcing loop");
                  if (soundEffects.background.current) {
                    soundEffects.background.current.currentTime = 0;
                    soundEffects.background.current.play().catch(e => 
                      console.warn("Failed to restart background music:", e)
                    );
                  }
                });
              } catch (musicError) {
                console.warn("Background music play failed after user interaction:", musicError);
                // Try once more with a timeout (helps on Safari)
                setTimeout(() => {
                  if (soundEffects.background.current && !isMusicPlaying) {
                    soundEffects.background.current.play().catch(e => {
                      console.warn("Retry to play background music failed:", e);
                    });
                  }
                }, 500);
              }
            }
          } catch (silentError) {
            console.warn("Silent sound failed to play:", silentError);
            
            // Try direct play as fallback
            if (soundEffects.background.current && !isMusicPlaying && shouldPlayMusic) {
              soundEffects.background.current.play().catch(e => {
                console.warn("Direct background music play failed:", e);
              });
            }
          }
        } catch (error) {
          console.error("Error during audio initialization:", error);
        }
      };
      
      // Execute audio enablement
      enableAudio();
    };
    
    // Add event listeners for various user interactions
    const interactionEvents = ['click', 'touchstart', 'keydown', 'touchend'];
    
    // Special handling for iOS Safari where 'click' might not unlock audio
    const iOSEvents = ['touchend'];
    
    // Add all event listeners
    [...interactionEvents, ...iOSEvents].forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
    
    // Show a friendly reminder if user hasn't tried playing music yet
    if (typeof window !== 'undefined' && !userHasInteracted) {
      const shouldPlayMusic = localStorage.getItem('memechef-music-playing') !== 'false';
      if (shouldPlayMusic) {
        console.log("Will attempt to auto-play background music on first interaction");
        // We could show a UI hint here if needed
      }
    }
    
    return () => {
      // Clean up event listeners
      [...interactionEvents, ...iOSEvents].forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      
      // Stop background music when component unmounts
      if (soundEffects.background.current) {
        soundEffects.background.current.pause();
        console.log("Background music paused on unmount");
      }
    };
  }, [userHasInteracted, isMusicPlaying, musicVolume]);
  // Loading screen animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsLoading(false);
            
            // Log summary of enhanced audio system upgrades
            console.log("%c🎵 MemeChef Game Audio System", "font-weight: bold; font-size: 14px; color: #4ade80;");
            console.log("%c Enhanced audio features:", "color: #a855f7; font-weight: bold;");
            console.log("✓ Background music with persistent volume settings");
            console.log("✓ iOS/Safari compatibility improvements");
            console.log("✓ Autoplay restrictions handling");
            console.log("✓ Advanced volume control slider");
            console.log("✓ Sound effect system with balancing");
            console.log("✓ Browser compatibility detection");
            console.log("✓ Enhanced audio loading diagnostics");
          }, 500); // brief pause
          return 100;
        }
        return prevProgress + Math.random() * 5;
      });
    }, 80); 

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Load stats from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('memechef-stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setRecipeCount(stats.recipeCount || 0);
        setChaosCount(stats.chaosCount || 0);
        setShareCount(stats.shareCount || 0);
        setPlayerXP(stats.playerXP || 0);
        setPlayerLevel(stats.playerLevel || 1);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stats = { recipeCount, chaosCount, shareCount, playerXP, playerLevel };
      localStorage.setItem('memechef-stats', JSON.stringify(stats));
    }
  }, [recipeCount, chaosCount, shareCount, playerXP, playerLevel]);

  // Check for level ups
  useEffect(() => {
    const currentLevel = PLAYER_LEVELS.find((level, index) => 
      playerXP >= level.threshold && 
      (index === PLAYER_LEVELS.length - 1 || playerXP < PLAYER_LEVELS[index + 1].threshold)
    );
    
    if (currentLevel && currentLevel.level > playerLevel) {
      setPlayerLevel(currentLevel.level);
      
      // Play level up sound
      if (soundEffects.levelUp.current) {
        soundEffects.levelUp.current.play().catch(console.error);
      }
        // Show level up effect with enhanced message
      setGameEffects(prev => [...prev, {
        id: Date.now(),
        type: 'level-up',
        message: `Level Up! ${currentLevel.title}`
      }]);
      
      // Add floating XP animation for level up
      addXP(250, '⭐', window.innerWidth / 2, window.innerHeight / 2);
    }
  }, [playerXP, playerLevel]);

  // Handle combo chain timeouts
  useEffect(() => {
    if (comboChain > 0) {
      if (comboTimer) {
        clearTimeout(comboTimer);
      }
      
      // Reset combo after 10 seconds of inactivity
      const timer = setTimeout(() => {
        setComboChain(0);
      }, 10000);
      
      setComboTimer(timer);
      
      return () => {
        if (comboTimer) clearTimeout(comboTimer);
      };
    }
  }, [comboChain, lastAction]);
  
  // Handle floating items disappearing
  useEffect(() => {
    if (floatingItems.length > 0) {
      const timer = setTimeout(() => {
        setFloatingItems([]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [floatingItems]);
  
  // Handle game effects disappearing
  useEffect(() => {
    if (gameEffects.length > 0) {
      const timer = setTimeout(() => {
        setGameEffects(prev => prev.slice(1));
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [gameEffects]);

  // Calculate player level information
  const getCurrentLevelInfo = () => {
    const currentLevel = PLAYER_LEVELS.find(l => l.level === playerLevel) || PLAYER_LEVELS[0];
    const nextLevel = PLAYER_LEVELS.find(l => l.level === playerLevel + 1);
    
    if (nextLevel) {
      const currentLevelXP = currentLevel.threshold;
      const nextLevelXP = nextLevel.threshold;
      const levelProgress = ((playerXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
      return {
        title: currentLevel.title,
        icon: currentLevel.icon,
        level: currentLevel.level,
        progress: levelProgress,
        nextTitle: nextLevel.title,
        xpNeeded: nextLevelXP - playerXP
      };
    }
    
    return {
      title: currentLevel.title,
      icon: currentLevel.icon,
      level: currentLevel.level,
      progress: 100,
      nextTitle: null,
      xpNeeded: 0
    };
  };

  // Add XP with visual effects
  const addXP = (amount: number, emoji = '✨', x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    setPlayerXP(prev => prev + amount);
    
    // Create floating item
    setFloatingItems(prev => [...prev, {
      id: Date.now(),
      emoji,
      points: amount,
      x,
      y
    }]);
  };

  // Load game stats from localStorage
  const loadGameStats = () => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('memechef-stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setRecipeCount(stats.recipeCount || 0);
        setChaosCount(stats.chaosCount || 0);
        setShareCount(stats.shareCount || 0);
        setPlayerXP(stats.playerXP || 0);
        setPlayerLevel(stats.playerLevel || 1);
      }
    }
  };

  // Save game stats to localStorage
  const saveGameStats = () => {
    if (typeof window !== 'undefined') {
      const stats = { recipeCount, chaosCount, shareCount, playerXP, playerLevel };
      localStorage.setItem('memechef-stats', JSON.stringify(stats));
    }
  };

  // Handle image upload and ingredient analysis - GAME CHALLENGE MODE
  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setIsGeneratingRecipe(true);
    setLastAction('upload');
    
    // Game effect: increment combo chain for consecutive actions
    setComboChain(prev => prev + 1);
    
    // Create sound effect animation later
    const playGameSound = (sound: string) => {
      // This would play a game sound if we implement audio
      console.log(`Playing ${sound} sound effect`);
    };
    
    try {
      // Game loading effect
      let analysisProgress = 0;
      const analysisInterval = setInterval(() => {
        analysisProgress += 5;
        if (analysisProgress >= 100) clearInterval(analysisInterval);
      }, 100);
      
      // Analyze ingredients from image
      const analysis = await analyzeIngredients(file);
      clearInterval(analysisInterval);
      
      // GAME MECHANICS: Scoring based on number of ingredients
      const ingredientScore = analysis.ingredients.length * 25;
      const comboBonus = comboChain > 1 ? comboChain * 10 : 0;
      const totalPointsEarned = ingredientScore + comboBonus;
      
      // Generate absurd recipe
      const newRecipe = await generateAbsurdRecipe(analysis.ingredients);
      setRecipe(newRecipe);
      
      // GAME LEVEL UP: Recipe count increases player level
      const oldRecipeCount = recipeCount;
      setRecipeCount(prev => prev + 1);
      
      // Update total score
      setPlayerXP(prev => prev + totalPointsEarned);
      
      // Generate chef narration
      const chefScript = await generateChefNarration(newRecipe);
      setNarration(chefScript);
      
      // Generate meme caption
      const caption = await generateMemeCaption(newRecipe);
      setMemeCaption(caption);
      
      // Get historical rating
      const rating = await getRatingFromHistoricalFigure(newRecipe);
      setHistoricalRating(rating);
      
      // GAME EFFECT: Show points earned notification
      // This would be displayed in a game UI element
      
      // GAME EFFECT: Play success sound
      playGameSound('recipeCreate');
      
      // GAME EFFECT: Check for level up
      if (oldRecipeCount + 1 === 5 || oldRecipeCount + 1 === 10 || oldRecipeCount + 1 === 20) {
        // This would trigger a level up animation
        setPlayerLevel(prev => prev + 1);
        playGameSound('levelUp');
      }
      
      // Add XP for recipe creation
      addXP(totalPointsEarned, '🍽️', window.innerWidth / 2, window.innerHeight / 2);
      
    } catch (error) {
      console.error('Error processing image:', error);
      // Reset combo chain on error
      setComboChain(0);
      
      // GAME EFFECT: Show error notification
      playGameSound('error');
      
      // Show fallback recipe
      const fallbackRecipe: Recipe = {
        title: "The Recipe of Technical Difficulties",
        backstory: "Born from the chaos of AI confusion in the year 2025.",
        ingredients: ["1 cup of patience", "2 tablespoons of hope", "A pinch of magic"],
        instructions: [
          "Mix ingredients while the AI figures itself out",
          "Wait patiently for technology to cooperate", 
          "Serve with understanding"
        ]
      };
      setRecipe(fallbackRecipe);
      setNarration("Well, this is awkward! Seems like my AI brain had a little hiccup. But hey, that's just more chaos for the recipe!");
      setMemeCaption("When the AI chef has an existential crisis mid-recipe 🤖💭");
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingRecipe(false);
    }
  };
  // Handle chaos button click - GAME POWER-UP MECHANIC
  const handleChaosClick = async () => {
    if (!recipe) return;
    
    setIsChaosLoading(true);
    setLastAction('chaos');
    
    // GAME MECHANICS: If the last action was also a chaos click, increase combo chain
    if (lastAction === 'chaos') {
      setComboChain(prev => prev + 1);
    } else {
      setComboChain(1); // Reset combo if switching actions
    }
    
    // GAME MECHANICS: Based on chaos count, award different points
    const newChaosCount = chaosCount + 1;
    setChaosCount(newChaosCount);
    
    // Create sound effect animation function
    const playGameSound = (sound: string) => {
      // This would play a game sound if we implement audio
      console.log(`Playing ${sound} sound effect`);
    };
    
    try {
      // GAME MECHANICS: Chaos points calculation
      let chaosPoints = 50;
      
      // More points for consecutive chaos clicks
      const comboMultiplier = Math.min(comboChain, 5); // Cap at 5x
      chaosPoints *= comboMultiplier;
      
      // Milestone bonuses
      if (newChaosCount === 5) chaosPoints += 250; // Achievement bonus
      if (newChaosCount === 10) chaosPoints += 500; // Achievement bonus
      if (newChaosCount === 25) chaosPoints += 1000; // Achievement bonus
      
      // Add points to total score
      setPlayerXP(prev => prev + chaosPoints);
      
      // GAME EFFECT: Level up chaos level at certain thresholds
      if (newChaosCount % 5 === 0) {
        setPlayerLevel(prev => prev + 1);
        playGameSound('chaosLevelUp');
      }
      
      // Mutate the recipe with more chaos - POWER-UP EFFECT
      const chaosRecipe = await mutateChaosRecipe(recipe);
      setRecipe(chaosRecipe);
      
      // Generate new narration for chaos recipe
      const chefScript = await generateChefNarration(chaosRecipe);
      setNarration(chefScript);
      
      // Generate new meme caption
      const caption = await generateMemeCaption(chaosRecipe);
      setMemeCaption(caption);
      
      // GAME EFFECTS: Visual feedback based on chaos level
      if (newChaosCount >= 10) {
        // This would trigger a special visual effect
        playGameSound('extremeChaos');
      } else {
        playGameSound('chaosClick');
      }
      
      // Add XP for chaos click
      addXP(chaosPoints, '🔥', window.innerWidth / 2, window.innerHeight / 2);
      
    } catch (error) {
      console.error('Error generating chaos:', error);
      playGameSound('error');
      setComboChain(0); // Reset combo on error
    } finally {
      setIsChaosLoading(false);
    }
  };
  // Handle chef narration
  const handleStartNarration = async () => {
    if (!narration || isNarrating) return;
    
    setIsNarrating(true);
    try {
      await ttsService.speak(narration);
      
      // Play chef's kiss sound after narration completes
      if (soundEffects.chefKiss.current) {
        setTimeout(() => {
          soundEffects.chefKiss.current?.play().catch(console.error);
        }, 500);
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    } finally {
      setIsNarrating(false);
    }
  };

  // Handle meme caption generation
  const handleGenerateCaption = async () => {
    if (!recipe) return;
    
    try {
      const caption = await generateMemeCaption(recipe);
      setMemeCaption(caption);
      // Increment share count when caption is generated (user intent to share)
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating caption:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Game HUD - Fixed Stats Header */}
      <FixedStatsHeader 
        recipeCount={recipeCount}
        chaosCount={chaosCount}
        shareCount={shareCount}
        achievementCount={0}
        totalAchievements={0}
      />      {/* Game Title Screen */}
      <div className="relative pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4 relative">
            {/* Decorative Game UI Elements */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse relative">
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl text-yellow-300 opacity-70">🏆 LEVEL {playerLevel} 🏆</span>
              🧑‍🍳 MemeChef
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light">
              The Ultimate Culinary Chaos Game
            </p>
            <div className="inline-block mx-auto mt-2 px-4 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-sm text-purple-300 font-medium">EARLY ACCESS v0.4.2</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-purple-200">
                Level: <span className="text-yellow-400 font-bold">{playerLevel}</span>
              </span>
              <span className="px-2">•</span>
              <span className="text-lg text-purple-200">
                XP: <span className="text-green-400 font-bold">{playerXP.toLocaleString()}</span>
              </span>
              <span className="px-2">•</span>
              <span className="text-lg text-purple-200">
                Title: <span className={`font-bold`}>{getCurrentLevelInfo().title}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Level Up Notification */}
      {gameEffects.filter(effect => effect.type === 'level-up').map(effect => (
        <div key={effect.id} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-popup">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-sm uppercase tracking-wide">New Title Unlocked!</div>
              <div className="font-bold text-lg">{effect.message}</div>
            </div>
          </div>
        </div>
      ))}      {/* Enhanced Background Music Control */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative group">          <button
            onClick={toggleBackgroundMusic}
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
              <Volume1 size={14} className={isMusicPlaying ? "text-green-300" : "text-white/70"} />              <input 
                type="range" 
                min="0" 
                max="100" 
                value={musicVolume * 100} 
                onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                className={`w-full ${isMusicPlaying ? '' : 'inactive'} cursor-pointer`}
                style={{
                  background: `linear-gradient(90deg, 
                    ${isMusicPlaying ? 'rgba(74, 222, 128, 0.7)' : 'rgba(255, 255, 255, 0.3)'} 
                    ${musicVolume * 100}%, 
                    rgba(255, 255, 255, 0.1) ${musicVolume * 100}%)`
                }}
                title={`Volume: ${Math.round(musicVolume * 100)}%`}
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
      
      {/* Combo Counter */}
      {comboChain > 1 && (
        <div className="fixed top-24 right-5 z-50 animate-popup">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-xs uppercase tracking-wide">Combo Chain</div>
            <div className="font-bold text-xl">{comboChain}x</div>
          </div>
        </div>
      )}      {/* Enhanced Music Feature Tip */}
      {showMusicTip && !isLoading && (
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
                  <div className="mt-2 text-xs bg-black/30 p-1.5 rounded border border-yellow-500/30">
                    <span className="text-yellow-300 font-semibold">Troubleshooting: </span>
                    <span className="text-white/80">Try clicking anywhere or refreshing if audio doesn't play.</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowMusicTip(false)}
              className="absolute top-1 right-1 text-white/50 hover:text-white/80 text-xs p-1"
              aria-label="Close music tip"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Game Stages */}
      <main className="max-w-6xl mx-auto px-4 space-y-12 pb-20">
        
        {/* Stage 1: Ingredient Selection */}
        <section>
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              STAGE 1
            </div>
            <h2 className="text-2xl font-bold mt-2">Select Your Ingredients</h2>
          </div>
          
          <GlassCard 
            className="p-8" 
            rarity={recipeCount >= 10 ? 'legendary' : recipeCount >= 5 ? 'epic' : recipeCount >= 3 ? 'rare' : 'common'}
            glow={recipeCount >= 5}
          >
            <IngredientUpload 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />
          </GlassCard>
        </section>        {/* Stage 2: Chef Character */}
        <section>
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              STAGE 2
            </div>
            <h2 className="text-2xl font-bold mt-2">Meet Your Culinary Guide</h2>
          </div>
          
          <GlassCard 
            className="p-8" 
            rarity={chaosCount >= 5 ? 'epic' : chaosCount >= 3 ? 'rare' : 'common'} 
            pulse={isNarrating}
          >
            <AiChef 
              narration={narration}
              isNarrating={isNarrating}
              onStartNarration={handleStartNarration}
            />
          </GlassCard>
        </section>

        {/* Stage 3: Recipe Creation */}
        {(recipe || isGeneratingRecipe) && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 3
              </div>
              <h2 className="text-2xl font-bold mt-2">Absurd Recipe Laboratory</h2>
              {recipe && !isGeneratingRecipe && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="px-2 py-1 bg-white/10 rounded text-xs">
                    Recipe Level: <span className="font-bold text-yellow-300">{Math.floor(recipeCount / 3) + 1}</span>
                  </div>
                  <div className="px-2 py-1 bg-white/10 rounded text-xs">
                    Points: <span className="font-bold text-green-300">+{recipeCount * 25}</span>
                  </div>
                  {comboChain > 1 && (
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs">
                      Combo: <span className="font-bold text-purple-300">x{comboChain}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isGeneratingRecipe ? (
              <GlassCard className="p-12 text-center" rarity="rare" glow>
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-purple-300 mb-2">Generating Chaos...</h2>
                <p className="text-white/70">The AI chef is concocting something ridiculous!</p>
                <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-slow" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
              </GlassCard>
            ) : (              <GlassCard 
                className="p-8" 
                rarity={recipe && recipe.ingredients && recipe.ingredients.length >= 8 ? 'legendary' : 
                       recipe && recipe.ingredients && recipe.ingredients.length >= 5 ? 'epic' : 'rare'} 
                glow={recipe && recipe.ingredients && recipe.ingredients.length >= 5 ? true : false}
              >
                <RecipeDisplay recipe={recipe} />
              </GlassCard>
            )}
          </section>
        )}

        {/* Stage 4: Chaos Power-ups */}
        {recipe && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 4
              </div>
              <h2 className="text-2xl font-bold mt-2">Unleash Chaos Power-ups</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="px-2 py-1 bg-white/10 rounded text-xs">
                  Chaos Level: <span className="font-bold text-orange-300">{Math.min(10, Math.floor(chaosCount / 3) + 1)}</span>
                </div>
                <div className="px-2 py-1 bg-white/10 rounded text-xs">
                  Points Per Click: <span className="font-bold text-green-300">+{50 * Math.min(comboChain || 1, 5)}</span>
                </div>
              </div>
            </div>
            
            <GlassCard 
              className="p-8" 
              rarity={chaosCount >= 25 ? 'legendary' : chaosCount >= 10 ? 'epic' : chaosCount >= 5 ? 'rare' : 'common'}
              glow={chaosCount >= 10}
              pulse={isChaosLoading}
              shake={chaosCount >= 20}
            >
              <ChaosButton 
                onChaosClick={handleChaosClick}
                isLoading={isChaosLoading}
                disabled={!recipe}
              />
            </GlassCard>
          </section>
        )}

        {/* Stage 5: Share & Rewards */}
        {recipe && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 5
              </div>
              <h2 className="text-2xl font-bold mt-2">Share Your Masterpiece & Earn Rewards</h2>
              {shareCount > 0 && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="px-2 py-1 bg-white/10 rounded text-xs">
                    Shares: <span className="font-bold text-blue-300">{shareCount}</span>
                  </div>
                  <div className="px-2 py-1 bg-white/10 rounded text-xs">
                    Bonus: <span className="font-bold text-green-300">+{shareCount * 100}</span>
                  </div>
                </div>
              )}
            </div>
            
            <GlassCard 
              className="p-8" 
              rarity={shareCount >= 5 ? 'legendary' : shareCount >= 3 ? 'epic' : shareCount >= 1 ? 'rare' : 'common'}
              glow={shareCount >= 3}
            >
              <ShareRecipe 
                recipe={recipe}
                memeCaption={memeCaption}
                onGenerateCaption={handleGenerateCaption}
              />
            </GlassCard>
          </section>
        )}

        {/* Achievements */}
        <section>
          <GlassCard className="p-8">
            <Achievements 
              recipeCount={recipeCount}
              chaosCount={chaosCount}
              shareCount={shareCount}
              historicalRating={historicalRating}
            />
          </GlassCard>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative">
        <GlassCard className="m-4 p-8 text-center" hover={false}>
          <div className="space-y-2">
            <p className="text-white/80 flex items-center justify-center space-x-2">
              <Heart className="text-red-400" size={18} />
              <span>Made with ❤️ and a questionable amount of chaos</span>
            </p>
            <p className="text-white/60 text-sm">
              Powered by Gemini AI • Built for the Bolt.new Hackathon 2025
            </p>
          </div>
        </GlassCard>
      </footer>
    </div>
  );
}