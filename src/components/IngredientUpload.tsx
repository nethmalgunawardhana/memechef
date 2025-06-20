import { useState, useRef } from 'react';
import { Upload, Camera, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface IngredientUploadProps {
  onImageUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export default function IngredientUpload({ onImageUpload, isAnalyzing }: IngredientUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">      <div className="text-center mb-8">
        <div className="border-b-2 border-purple-500/30 pb-4 mb-4">
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
            <div className="relative">
              <Camera className="text-purple-400" size={40} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-70"></div>
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Upload Your Chaos Ingredients!
            </span>
            <Sparkles className="text-yellow-400" size={40} />
          </h2>
          <p className="text-xl text-white/80">Drop an image and earn <span className="text-yellow-400 font-bold">+50 XP</span> to begin your chaos culinary adventure!</p>
        </div>
        
        {/* Game-like instruction cards */}
        <div className="flex justify-center gap-4 text-xs">
          <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-300">
            STEP 1: Upload food image
          </div>
          <div className="px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30 text-orange-300">
            STEP 2: Let chef analyze
          </div>
          <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30 text-green-300">
            STEP 3: Create chaos recipe
          </div>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 backdrop-blur-sm ${
          dragActive 
            ? 'border-purple-400 bg-purple-500/20 scale-105' 
            : 'border-white/30 bg-white/5 hover:border-purple-400/60 hover:bg-white/10'
        } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isAnalyzing}
        />

        {previewUrl ? (
          <div className="space-y-6">
            <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden ring-4 ring-purple-400/50">
              <Image
                src={previewUrl}
                alt="Uploaded ingredients"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
            </div>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400/30 border-t-purple-400"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
                  </div>
                  <div className="text-left">
                    <div className="text-purple-300 font-bold text-lg">AI Chef Analyzing...</div>
                    <div className="text-white/60 text-sm">Preparing culinary chaos</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {['🔍', '🧠', '✨'].map((emoji, i) => (
                    <div
                      key={i}
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={onButtonClick}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-2">
                  <Upload size={20} />
                  <span>Upload Different Image</span>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative">
              <div className="text-8xl animate-bounce">📸</div>
              <div className="absolute -top-2 -right-2 text-3xl animate-spin">✨</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Drag and drop your ingredient photo here
                </h3>
                <p className="text-white/70 text-lg mb-6">
                  or click to browse your culinary chaos
                </p>
              </div>
                <button
                onClick={onButtonClick}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl text-white font-bold text-xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40"
                disabled={isAnalyzing}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                
                {/* Game-like button design */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-xl"></div>
                
                <div className="relative flex items-center space-x-3">
                  <Upload size={24} />
                  <span>Choose Image</span>
                  <div className="flex items-center gap-1">
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="text-yellow-300 text-xs font-bold">+50 XP</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Floating decoration elements */}
        <div className="absolute top-4 left-4 text-white/10 text-2xl animate-pulse">🍅</div>
        <div className="absolute top-8 right-8 text-white/10 text-xl animate-pulse" style={{ animationDelay: '1s' }}>🥕</div>
        <div className="absolute bottom-6 left-8 text-white/10 text-2xl animate-pulse" style={{ animationDelay: '2s' }}>🧄</div>
        <div className="absolute bottom-4 right-4 text-white/10 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌶️</div>
      </div>

      {/* Help text */}
      <div className="mt-6 text-center">
        <p className="text-white/50 text-sm">
          Supported formats: JPG, PNG, GIF • Max size: 10MB
        </p>
      </div>
    </div>
  );
}