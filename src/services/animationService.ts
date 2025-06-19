// Animation service for AI Chef (D-ID API integration or alternative solutions)
// This service handles animated chef avatars and lip-sync animation

export interface AnimationConfig {
  provider: 'did' | 'rive' | 'css' | 'lottie';
  chefStyle?: 'cartoon' | 'realistic' | 'emoji';
}

export interface ChefAnimation {
  idle: string;
  speaking: string;
  excited: string;
  thinking: string;
}

export interface RiveController {
  play: (animation: string) => void;
  stop: () => void;
  setStateInput: (input: string, value: boolean | number | string) => void;
}

export interface LottieController {
  play: () => void;
  stop: () => void;
  setDirection: (direction: number) => void;
  setSpeed: (speed: number) => void;
}

export interface AnimationResult {
  animationName?: string;
  animationFrame?: number;
  videoUrl?: string;
}

export interface CloudinaryOptions {
  transformation?: Record<string, unknown>;
}

export class AnimationService {
  private config: AnimationConfig;

  constructor(config: AnimationConfig = { provider: 'css', chefStyle: 'emoji' }) {
    this.config = config;
  }

  // D-ID API integration for realistic talking avatars
  async createDIDAnimation(audioUrl: string, imageUrl: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_DID_API_KEY;
    if (!apiKey) {
      throw new Error('D-ID API key not configured');
    }

    try {
      // Create a talk
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'audio',
            audio_url: audioUrl,
          },
          source_url: imageUrl,
          config: {
            fluent: true,
            pad_audio: 0,
            driver_expressions: {
              expressions: [
                { start_frame: 0, expression: 'happy', intensity: 0.8 },
                { start_frame: 30, expression: 'excited', intensity: 1.0 }
              ]
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Poll for completion
      const videoUrl = await this.pollForCompletion(data.id);
      return videoUrl;
    } catch (error) {
      console.error('D-ID animation error:', error);
      throw error;
    }
  }

  // Poll D-ID API for video completion
  private async pollForCompletion(talkId: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_DID_API_KEY;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${apiKey}`,
        },
      });

      const data = await response.json();
      
      if (data.status === 'done') {
        return data.result_url;
      } else if (data.status === 'error') {
        throw new Error(`D-ID generation failed: ${data.error?.description || 'Unknown error'}`);
      }      // Wait 10 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('D-ID generation timeout');
  }

  // Rive animation integration (for interactive vector animations)
  async loadRiveChef(): Promise<RiveController> {
    try {
      // This would integrate with Rive runtime
      // For now, return a placeholder
      console.log('Rive animation would be loaded here');
      return {
        play: (animation: string) => console.log(`Playing ${animation} animation`),
        stop: () => console.log('Stopping animation'),
        setStateInput: (input: string, value: boolean | number | string) => console.log(`Setting ${input} to ${value}`)
      };
    } catch (error) {
      console.error('Rive animation error:', error);
      throw error;
    }
  }

  // CSS-based emoji animations (fallback)
  getEmojiAnimations(): ChefAnimation {    return {
      idle: '🧑‍🍳',
      speaking: '😤🧑‍🍳',
      excited: '🤩🧑‍🍳',
      thinking: '🤔🧑‍🍳'
    };
  }

  // Lottie animation integration
  async loadLottieChef(): Promise<LottieController> {
    try {
      // This would integrate with Lottie player
      console.log('Lottie animation would be loaded here');
      return {
        play: () => console.log('Playing Lottie animation'),
        stop: () => console.log('Stopping Lottie animation'),
        setDirection: (direction: number) => console.log(`Setting direction to ${direction}`),
        setSpeed: (speed: number) => console.log(`Setting speed to ${speed}`)
      };    } catch (error) {
      console.error('Lottie animation error:', error);
      throw error;
    }
  }

  // Get animation based on current provider
  async getChefAnimation(state: 'idle' | 'speaking' | 'excited' | 'thinking'): Promise<string | AnimationResult> {
    switch (this.config.provider) {
      case 'did':
        // Would return D-ID video URL
        return 'placeholder-did-video-url';
      
      case 'rive':
        // Would return Rive animation controller
        return { animationName: `chef_${state}` };
      
      case 'lottie':
        // Would return Lottie animation controller
        return { animationFrame: this.getStateFrame(state) };
      
      case 'css':
      default:
        // Return emoji for CSS animations
        const animations = this.getEmojiAnimations();
        return animations[state];
    }
  }

  // Helper to map states to animation frames
  private getStateFrame(state: string): number {
    const frameMap = {
      idle: 0,
      speaking: 30,
      excited: 60,
      thinking: 90
    };
    return frameMap[state as keyof typeof frameMap] || 0;
  }
  // Update animation configuration
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Create animated GIF from frames (for social sharing)
  async createAnimatedGIF(frames: string[]): Promise<Blob> {
    // This would use a library like gif.js to create animated GIFs
    // For now, return a placeholder
    console.log(`Animated GIF creation would happen here with ${frames.length} frames`);
    return new Blob(['placeholder gif data'], { type: 'image/gif' });
  }

  // Preload animations for better performance
  async preloadAnimations(): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'rive':
          // Preload Rive files
          break;
        case 'lottie':
          // Preload Lottie files
          break;
        case 'did':
          // Preload D-ID images
          break;
        default:
          // No preloading needed for CSS/emoji animations
          break;
      }
    } catch (error) {
      console.error('Animation preload error:', error);
    }
  }
}

// Export singleton instance
export const animationService = new AnimationService();
