// Sound Manager Service - Centralized audio control for the entire application

export interface SoundConfig {
  isMuted: boolean;
  volume: number;
}

export interface SoundEffect {
  id: string;
  audio: HTMLAudioElement | null;
  baseVolume: number; // Base volume for this particular sound
}

export class SoundManager {
  private static instance: SoundManager;
  private config: SoundConfig = { isMuted: false, volume: 0.3 };
  private soundEffects: Map<string, SoundEffect> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }  // Initialize all sounds for the application
  public initializeSounds(): void {
    if (typeof window === 'undefined') return;

    // Initialize background music
    this.backgroundMusic = new Audio('/sounds/background.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.getEffectiveVolume();

    // Initialize all sound effects
    const soundFiles = [
      { id: 'achievement', file: '/sounds/achievement.mp3', baseVolume: 0.7 },
      { id: 'background', file: '/sounds/background.mp3', baseVolume: 0.3 },
      { id: 'chaosButton', file: '/sounds/chaos-button.mp3', baseVolume: 0.8 },
      { id: 'chefKiss', file: '/sounds/chef-kiss.mp3', baseVolume: 0.6 },
      { id: 'combo', file: '/sounds/combo.mp3', baseVolume: 0.7 },
      { id: 'levelUp', file: '/sounds/level-up.mp3', baseVolume: 0.8 },
      { id: 'success', file: '/sounds/success.mp3', baseVolume: 0.6 }
    ];

    soundFiles.forEach(({ id, file, baseVolume }) => {
      if (id !== 'background') { // Background music is handled separately
        const audio = new Audio(file);
        audio.volume = this.getEffectiveVolume(baseVolume);
        this.soundEffects.set(id, { id, audio, baseVolume });
      }
    });
  }  // Update global music settings
  public updateConfig(isMuted: boolean, volume: number): void {
    this.config = { isMuted, volume };
    this.updateAllVolumes();
  }

  // Get effective volume considering mute state
  private getEffectiveVolume(baseVolume?: number): number {
    if (this.config.isMuted) return 0;
    return this.config.volume * (baseVolume || 1);
  }

  // Update all audio volumes
  private updateAllVolumes(): void {
    // Update background music
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.getEffectiveVolume(0.3);
    }

    // Update all sound effects
    this.soundEffects.forEach((soundEffect) => {
      if (soundEffect.audio) {
        soundEffect.audio.volume = this.getEffectiveVolume(soundEffect.baseVolume);
      }
    });
  }  // Play a sound effect
  public playSound(soundId: string): void {
    if (this.config.isMuted) return;

    const soundEffect = this.soundEffects.get(soundId);
    if (soundEffect && soundEffect.audio) {
      soundEffect.audio.currentTime = 0;
      soundEffect.audio.play().catch((error) => {
        console.error(`[SoundManager] Error playing sound ${soundId}:`, error);
      });
    }
  }

  // Control background music
  public toggleBackgroundMusic(): boolean {
    if (!this.backgroundMusic) return false;

    try {
      if (this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(console.error);
        return true;
      } else {
        this.backgroundMusic.pause();
        return false;
      }
    } catch (error) {
      console.error('Error toggling background music:', error);
      return false;
    }
  }

  public isBackgroundMusicPlaying(): boolean {
    return this.backgroundMusic ? !this.backgroundMusic.paused : false;
  }

  // Stop all sounds
  public stopAllSounds(): void {
    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }

    // Stop all sound effects
    this.soundEffects.forEach((soundEffect) => {
      if (soundEffect.audio) {
        soundEffect.audio.pause();
        soundEffect.audio.currentTime = 0;
      }
    });
  }

  // Get current config
  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  // Preload all sounds for better performance
  public preloadSounds(): Promise<void[]> {
    const promises: Promise<void>[] = [];

    // Preload background music
    if (this.backgroundMusic) {
      promises.push(
        new Promise((resolve) => {
          if (this.backgroundMusic!.readyState >= 2) {
            resolve();
          } else {
            this.backgroundMusic!.addEventListener('canplaythrough', () => resolve(), { once: true });
          }
        })
      );
    }

    // Preload sound effects
    this.soundEffects.forEach((soundEffect) => {
      if (soundEffect.audio) {
        promises.push(
          new Promise((resolve) => {
            if (soundEffect.audio!.readyState >= 2) {
              resolve();
            } else {
              soundEffect.audio!.addEventListener('canplaythrough', () => resolve(), { once: true });
            }
          })
        );
      }
    });

    return Promise.all(promises);
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();
