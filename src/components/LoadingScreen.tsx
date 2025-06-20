import React from 'react';

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 transition-opacity duration-1000">
      <div className="w-1/2 max-w-md bg-gray-800 rounded-full h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-white text-lg font-mono">Loading... {progress.toFixed(0)}%</p>
    </div>
  );
};

export default LoadingScreen;
