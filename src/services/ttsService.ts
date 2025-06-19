// Text-to-Speech service for AI Chef narration
// Supports multiple TTS providers: Browser Web Speech API, ElevenLabs, Google Cloud TTS

export interface TTSConfig {
  provider: 'browser' | 'elevenlabs' | 'google';
  voice?: string;
  speed?: number;
  pitch?: number;
}

export class TTSService {
  private config: TTSConfig;
  private isPlaying: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(config: TTSConfig = { provider: 'browser' }) {
    this.config = config;
  }

  // Browser Web Speech API (free, built-in)
  async speakWithBrowser(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Configure voice settings for dramatic chef personality
      utterance.rate = this.config.speed || 1.1; // Slightly faster for excitement
      utterance.pitch = this.config.pitch || 1.2; // Higher pitch for enthusiasm
      utterance.volume = 1;

      // Try to find a more dramatic voice
      const voices = speechSynthesis.getVoices();
      const preferredVoices = [
        'Google UK English Male', // Dramatic British
        'Microsoft David - English (United States)', // Deep voice
        'Google US English', // Clear American
        'Microsoft Zira - English (United States)' // Female alternative
      ];

      for (const preferredVoice of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferredVoice));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }

      // If no preferred voice found, use the first available English voice
      if (!utterance.voice) {
        const englishVoice = voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('male')
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onstart = () => {
        this.isPlaying = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }
  // ElevenLabs API (premium, high quality) - via server-side API
  async speakWithElevenLabs(text: string): Promise<void> {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          provider: 'elevenlabs'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ElevenLabs API error:', errorData);
        
        // If the error suggests using fallback, use browser TTS
        if (errorData.fallback) {
          console.log('Falling back to browser TTS');
          return this.speakWithBrowser(text);
        }
        
        throw new Error(`TTS API error: ${response.status}`);
      }

      // Check if response is audio or JSON error
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('audio')) {
        // Success: got audio data
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        return this.playAudioUrl(audioUrl);
      } else {
        // Got JSON response, check for errors
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Fallback case
        return this.speakWithBrowser(text);
      }

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      // Fallback to browser TTS
      console.log('Falling back to browser TTS due to error');
      return this.speakWithBrowser(text);
    }
  }

  // Google Cloud Text-to-Speech (premium, high quality)
  async speakWithGoogle(text: string): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error('Google TTS API key not configured');
    }

    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Casual-K', // Casual male voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.1,
            pitch: 2.0, // Higher pitch for excitement
            volumeGainDb: 2.0
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Google TTS API error: ${response.status}`);
      }

      const data = await response.json();
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('Google TTS error:', error);
      // Fallback to browser TTS
      return this.speakWithBrowser(text);
    }
  }

  // Play audio from URL
  private async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      
      this.isPlaying = true;
      audio.play().catch(reject);
    });
  }
  // Main speak method that chooses provider
  async speak(text: string): Promise<void> {
    // Add some dramatic pauses and emphasis for the chef character
    const dramaticText = this.addDramaticFlair(text);

    try {
      switch (this.config.provider) {
        case 'elevenlabs':
          return await this.speakWithElevenLabs(dramaticText);
        case 'google':
          return await this.speakWithGoogle(dramaticText);
        case 'browser':
        default:
          return await this.speakWithBrowser(dramaticText);
      }
    } catch (error) {
      console.error(`TTS error with ${this.config.provider}:`, error);
      // Ultimate fallback to browser TTS
      if (this.config.provider !== 'browser') {
        console.log('Falling back to browser TTS');
        return this.speakWithBrowser(dramaticText);
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
    
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  // Check if currently speaking
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
      return { 
        success: false, 
        provider: this.config.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get available voices for browser TTS
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return speechSynthesis.getVoices();
  }
}

// Export singleton instance with ElevenLabs as default
export const ttsService = new TTSService({ provider: 'elevenlabs' });
