// Text-to-Speech service for AI Chef narration
// Uses Eleven Labs TTS exclusively

import { cacheService } from './cacheService';

export interface TTSConfig {
  provider: 'elevenlabs';
  voiceId?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
}

export class TTSService {
  private config: TTSConfig;
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;  constructor(config: TTSConfig = { provider: 'elevenlabs' }) {
    // Set default values for ElevenLabs configuration
    this.config = {
      voiceId: '9BWtsMINqrJLrRacOk9x', 
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      ...config
    };
    
    console.log('TTS Service initialized with config:', this.config);
  }  // ElevenLabs API (premium, high quality) - via server-side API
  async speakWithElevenLabs(text: string): Promise<void> {
    try {
      // Check cache first
      const cachedAudioUrl = cacheService.getCachedTTSAudio(text);
      if (cachedAudioUrl) {
        console.log('Using cached TTS audio');
        await this.playAudioUrl(cachedAudioUrl);
        return;
      }

      // Prepare request body with proper defaults
      const requestBody = {
        text: text,
        provider: 'elevenlabs' as const,
        voiceId: this.config.voiceId || '9BWtsMINqrJLrRacOk9x',
        stability: this.config.stability ?? 0.5,
        similarity_boost: this.config.similarity_boost ?? 0.75,
        style: this.config.style ?? 0.0
      };

      console.log('TTS Request Body:', requestBody);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ElevenLabs API error:', errorData);
        throw new Error(`TTS API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      // Check if response is audio or JSON error
      const contentType = response.headers.get('content-type');
        if (contentType?.includes('audio')) {
        // Success: got audio data
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Cache the audio URL for future use
        cacheService.cacheTTSAudio(text, audioUrl);
        
        return this.playAudioUrl(audioUrl);
      } else {
        // Got JSON response, check for errors
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Unexpected response format from TTS API');
      }

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }
  // Play audio from URL
  private async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any current audio
      this.stop();
      
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      
      this.isPlaying = true;
      audio.play().catch(reject);
    });
  }

  // Main speak method using only ElevenLabs
  async speak(text: string): Promise<void> {
    // Add some dramatic pauses and emphasis for the chef character
    const dramaticText = this.addDramaticFlair(text);    try {
      return await this.speakWithElevenLabs(dramaticText);
    } catch (error) {
      console.error('TTS error with ElevenLabs:', error);
      
      // Show user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          throw new Error('🔑 ElevenLabs API key not set up! Please add your API key to .env.local file. Get one free at https://elevenlabs.io/app/speech-synthesis');
        } else if (error.message.includes('quota exceeded')) {
          throw new Error('📊 ElevenLabs monthly quota exceeded. Upgrade your plan or wait for reset.');
        } else if (error.message.includes('Invalid')) {
          throw new Error('🚫 Invalid ElevenLabs API key. Please check your key is correct.');
        }
      }
      
      throw error;
    }
  }

  // Add dramatic pauses and emphasis
  private addDramaticFlair(text: string): string {
    return text
      // Add pauses for dramatic effect
      .replace(/!/g, '!... ')
      .replace(/\./g, '... ')
      .replace(/,/g, ', ')
      // Emphasize key cooking words
      .replace(/BEHOLD/gi, 'BEHOLD!')
      .replace(/chaos/gi, 'CHAOS!')
      .replace(/recipe/gi, 'recipe')
      .replace(/cook/gi, 'cook')
      .replace(/chef/gi, 'chef');
  }
  // Stop current speech
  stop(): void {
    this.isPlaying = false;
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Check if currently playing
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Update configuration
  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Test TTS configuration
  async testConfiguration(): Promise<{ success: boolean; provider: string; error?: string }> {
    try {
      // Test with a short phrase
      await this.speak("Test");
      return { success: true, provider: this.config.provider };
    } catch (error) {
      return {        success: false, 
        provider: this.config.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance with ElevenLabs as default
export const ttsService = new TTSService({
  provider: 'elevenlabs',
  voiceId: '9BWtsMINqrJLrRacOk9x', 
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0
});
