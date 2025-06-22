'use client';

import { ExternalLink } from 'lucide-react';

interface BoltBadgeProps {
  variant?: 'default' | 'minimal' | 'large';
  showText?: boolean;
  className?: string;
}

export default function BoltBadge({ 
  variant = 'default', 
  showText = true, 
  className = '' 
}: BoltBadgeProps) {
  const handleClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg ${className}`}
        title="Built with Bolt.new"
      >
        <span className="text-lg">⚡</span>
        {showText && <span>Built with Bolt</span>}
        <ExternalLink size={14} />
      </button>
    );
  }

  if (variant === 'large') {
    return (
      <button
        onClick={handleClick}
        className={`group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <div className="relative flex items-center space-x-3">
          <div className="text-2xl animate-pulse">⚡</div>
          <div className="text-left">
            <div className="text-lg font-black">Built with Bolt</div>
            <div className="text-sm opacity-90">AI-Powered Development</div>
          </div>
          <ExternalLink size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className={`group inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${className}`}
      title="This project was built with Bolt.new - AI-powered full-stack development"
    >
      <span className="text-xl group-hover:animate-pulse">⚡</span>
      {showText && (
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold leading-tight">Built with</span>
          <span className="text-lg font-black leading-tight -mt-1">Bolt</span>
        </div>
      )}
      <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}