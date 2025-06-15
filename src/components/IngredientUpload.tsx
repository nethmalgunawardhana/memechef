import { useState, useRef } from 'react';
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
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">🍳 Upload Your Chaos Ingredients!</h2>
        <p className="text-gray-600">Drop an image of your random ingredients and let the AI Chef work its magic!</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400'
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
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={previewUrl}
                alt="Uploaded ingredients"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="text-purple-600 font-medium">AI Chef is analyzing your chaos...</span>
              </div>
            ) : (
              <button
                onClick={onButtonClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Different Image
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your ingredient photo here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse your files
              </p>
              <button
                onClick={onButtonClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                disabled={isAnalyzing}
              >
                Choose Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
