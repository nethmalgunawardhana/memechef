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

  // ElevenLabs API (premium, high quality)
  async speakWithElevenLabs(text: string): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      // Using a dramatic male voice ID (you'd need to get this from ElevenLabs)
      const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Example voice ID - replace with actual
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.8, // More dramatic
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      // Fallback to browser TTS
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

    switch (this.config.provider) {
      case 'elevenlabs':
        return this.speakWithElevenLabs(dramaticText);
      case 'google':
        return this.speakWithGoogle(dramaticText);
      case 'browser':
      default:
        return this.speakWithBrowser(dramaticText);
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
}

// Export singleton instance
export const ttsService = new TTSService();
