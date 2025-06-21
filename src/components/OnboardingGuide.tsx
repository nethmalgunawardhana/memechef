'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Upload, Volume2, Zap, Share2 } from 'lucide-react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const onboardingSteps: Step[] = [
  {
    id: 1,
    title: "Welcome to MemeChef! 🧑‍🍳",
    description: "Transform your random ingredients into hilarious recipes! Let's show you how this culinary chaos works.",
    icon: <Sparkles className="text-yellow-400" size={32} />,
    position: 'center'
  },
  {
    id: 2,
    title: "Step 1: Upload Your Ingredients",
    description: "Take a photo of any ingredients you have - even the weird stuff in the back of your fridge! Our AI will identify them.",
    icon: <Upload className="text-blue-400" size={32} />,
    target: '[data-tutorial="ingredient-upload"]',
    position: 'bottom',
    highlight: true
  },
  {
    id: 3,
    title: "Step 2: Meet Your AI Chef",
    description: "Chef Chaos will create a hilarious recipe and narrate it with maximum drama! Click the chef or play button to hear the magic.",
    icon: <Volume2 className="text-purple-400" size={32} />,
    target: '[data-tutorial="ai-chef"]',
    position: 'top',
    highlight: true
  },
  {
    id: 4,
    title: "Step 3: Embrace the Chaos",
    description: "Not chaotic enough? Hit the Chaos Button to make your recipe even more ridiculous! Each click adds more madness.",
    icon: <Zap className="text-red-400" size={32} />,
    target: '[data-tutorial="chaos-button"]',
    position: 'top',
    highlight: true
  },
  {
    id: 5,
    title: "Step 4: Share the Madness",
    description: "Share your crazy creations on social media! Every recipe comes with a perfect meme caption ready to post.",
    icon: <Share2 className="text-green-400" size={32} />,
    target: '[data-tutorial="share-recipe"]',
    position: 'top',
    highlight: true
  },
  {
    id: 6,
    title: "Level Up Your Cooking Game! 🏆",
    description: "Earn XP, unlock achievements, and climb the chef rankings! The more chaos you create, the higher you level up. Ready to become a Culinary Legend?",
    icon: <Sparkles className="text-yellow-400" size={32} />,
    position: 'center'
  }
];

export default function OnboardingGuide({ isOpen, onClose, onSkip }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with highlighting */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {/* Highlight target element */}
        {currentStepData.target && currentStepData.highlight && (
          <div className="absolute inset-0 pointer-events-none">
            <style jsx>{`
              ${currentStepData.target} {
                position: relative !important;
                z-index: 51 !important;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(147, 51, 234, 0.5) !important;
                border-radius: 12px !important;
              }
            `}</style>
          </div>
        )}

        {/* Tutorial Card */}
        <div className={`absolute z-52 transition-all duration-500 transform ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        } ${
          currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
          currentStepData.position === 'top' ? 'top-4 left-1/2 -translate-x-1/2' :
          currentStepData.position === 'bottom' ? 'bottom-4 left-1/2 -translate-x-1/2' :
          currentStepData.position === 'left' ? 'left-4 top-1/2 -translate-y-1/2' :
          'right-4 top-1/2 -translate-y-1/2'
        }`}>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-md mx-4 border border-purple-500/30 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {currentStepData.icon}
                <div>
                  <div className="text-sm text-purple-300 font-medium">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                )}
                
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                <span>
                  {currentStep === onboardingSteps.length - 1 ? "Let's Cook!" : "Next"}
                </span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Fun Fact */}
            {currentStep === 0 && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-purple-300 text-sm">
                  💡 <strong>Fun Fact:</strong> MemeChef has generated over 10,000 ridiculous recipes and counting!
                </p>
              </div>
            )}

            {currentStep === onboardingSteps.length - 1 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-300 text-sm">
                  🎉 <strong>Pro Tip:</strong> The weirder your ingredients, the funnier your recipes become!
                </p>
              </div>
            )}
          </div>

          {/* Pointer Arrow for positioned tooltips */}
          {currentStepData.position !== 'center' && (
            <div className={`absolute w-4 h-4 bg-slate-800 transform rotate-45 ${
              currentStepData.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'left' ? '-right-2 top-1/2 -translate-y-1/2' :
              '-left-2 top-1/2 -translate-y-1/2'
            }`} />
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-52">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-gray-400 text-sm">
            Press <kbd className="bg-white/10 px-2 py-1 rounded text-xs">ESC</kbd> to close or{' '}
            <kbd className="bg-white/10 px-2 py-1 rounded text-xs">→</kbd> for next
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for keyboard navigation
export function useOnboardingKeyboard(
  isOpen: boolean, 
  onNext: () => void, 
  onPrevious: () => void, 
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNext, onPrevious, onClose]);
}
