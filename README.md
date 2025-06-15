# 🧑‍🍳 MemeChef: The AI-Powered Absurd Recipe Generator

Welcome to MemeChef, where chaos meets cuisine and sanity goes to die! This web application uses Gemini 2.5 Pro to create hilariously absurd recipes from your ingredient photos, complete with an animated AI chef narrator.

## ✨ Features

### 📸 Ingredient Recognition (Multimodal Input)
- Upload images of random ingredients
- Gemini AI analyzes and identifies ingredients (even makes humorous guesses for unclear images)
- Supports drag & drop and file selection

### 🍳 Absurd Recipe Generation
- Creates nonsensical recipes with real cooking terms mixed with absurd instructions
- Includes fake historical backstories
- Formatted with recipe title, backstory, ingredients, and instructions

### 🧑‍🍳 AI Chef Narration
- Animated emoji-based chef character
- Text-to-speech narration of recipes (supports browser TTS, ElevenLabs, Google Cloud TTS)
- Chaotic personality mixing TikTok energy with Shakespearean drama

### 🎲 Chaos Button (Recipe Mutation)
- Click to add even more chaos to your recipe
- Replaces ingredients with impossible items
- Adds mystical cooking steps
- Tracks chaos level with visual indicators

### 📲 Meme Sharing Feature
- Generates funny captions for social media
- Creates shareable recipe cards as images
- Direct sharing to Twitter, Facebook, Instagram, TikTok
- Download recipe images

### 🏆 Achievements + Ratings
- Historical figure ratings (Napoleon, Shakespeare, etc.)
- Unlockable achievements system
- Progress tracking and stats
- Meme badges like "Culinary Clown", "Sauce Sorcerer", "Master of Disaster"

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Gemini 2.5 Pro (multimodal image analysis + text generation)
- **TTS**: Browser Web Speech API, ElevenLabs, Google Cloud TTS
- **Image Generation**: html2canvas
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React useState + localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini API key (required)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memechef
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and add your API keys:
   ```bash
   # Required
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional (for premium features)
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_google_tts_api_key_here
   ```

4. **Get API Keys**

   **Gemini API (Required):**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

   **ElevenLabs API (Optional - Premium TTS):**
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Get your API key from the profile section
   - Add it to your `.env.local` file

   **Google Cloud TTS (Optional):**
   - Set up a Google Cloud project
   - Enable Text-to-Speech API
   - Create an API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

1. **Upload an Ingredient Photo**: Drag and drop or click to upload an image of your ingredients
2. **Watch the Magic**: Gemini AI analyzes your image and generates an absurd recipe
3. **Listen to Chef Chaos**: Click the speaker button to hear your recipe narrated
4. **Add More Chaos**: Click the chaos button to make your recipe even more ridiculous
5. **Share Your Creation**: Generate meme captions and share on social media
6. **Unlock Achievements**: Keep creating recipes to unlock badges and progress

## 🏗 Project Structure

```
memechef/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── IngredientUpload.tsx  # Image upload component
│   │   ├── RecipeDisplay.tsx     # Recipe display component
│   │   ├── AiChef.tsx           # Animated chef component
│   │   ├── ChaosButton.tsx      # Chaos mutation button
│   │   ├── ShareRecipe.tsx      # Social sharing component
│   │   └── Achievements.tsx     # Achievement system
│   └── services/
│       ├── geminiService.ts     # Gemini AI integration
│       ├── ttsService.ts        # Text-to-speech service
│       ├── animationService.ts  # Animation service (placeholder)
│       └── mediaStorageService.ts # Media storage (placeholder)
├── public/                  # Static assets
├── .env.local              # Environment variables
└── package.json
```

## 🎨 Features in Detail

### Ingredient Recognition
- Uses Gemini's multimodal capabilities to analyze uploaded images
- Handles unclear images with humorous AI responses
- Returns ingredient lists with confidence levels

### Recipe Generation
- Prompts Gemini to create absurd recipes in a specific comedic style
- Includes fake historical backstories
- Mixes real cooking terms with impossible instructions

### AI Chef Personality
- Animated emoji-based chef with different expressions
- Multiple TTS providers for different voice qualities
- Dramatic script generation with emphasis and pauses

### Chaos System
- Progressive chaos levels with visual feedback
- Recipe mutation that adds increasingly absurd elements
- Achievement tracking based on chaos usage

### Social Sharing
- HTML-to-canvas recipe card generation
- Platform-specific sharing integrations
- Meme caption generation for viral potential

## 🔧 Customization

### Adding New TTS Providers
Edit `src/services/ttsService.ts` to add new text-to-speech providers.

### Modifying AI Prompts
Update `src/services/geminiService.ts` to change how recipes are generated.

### Adding Achievements
Modify the achievements array in `src/components/Achievements.tsx`.

### Styling Changes
Update Tailwind classes throughout the components for different visual styles.

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module '@google/generative-ai'"**
- Run `npm install @google/generative-ai`

**TTS not working**
- Check browser permissions for microphone/audio
- Ensure you're using HTTPS in production
- Try different TTS providers in the service

**Images not uploading**
- Check file size limits
- Ensure file is a valid image format
- Check browser console for errors

**API errors**
- Verify your Gemini API key is correct
- Check API quota limits
- Ensure environment variables are properly set

## 📱 Browser Compatibility

- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14.1+
- Edge 88+

Note: TTS features work best in Chromium-based browsers.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

- Built for the Bolt.new Hackathon 2025
- Powered by Google's Gemini 2.5 Pro
- Inspired by the chaos of experimental cooking
- Made with ❤️ and a questionable amount of AI-generated absurdity

---

**Disclaimer**: The recipes generated by MemeChef are purely for entertainment purposes. Please do not actually attempt to cook with "tears of joy" or "essence of confusion". The AI chef is not responsible for any culinary disasters that may occur! 🔥👨‍🍳
