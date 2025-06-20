'use client';

interface FloatingGameItemProps {
  emoji: string;
  points?: number;
  x: number;
  y: number;
}

const FloatingGameItem = ({ emoji, points, x, y }: FloatingGameItemProps) => (
  <div className="absolute animate-float-up pointer-events-none flex flex-col items-center"
       style={{left: `${x}px`, top: `${y}px`}}>
    <div className="text-3xl mb-1">{emoji}</div>
    {points && <div className="text-sm font-bold text-yellow-300">+{points}</div>}
  </div>
);

export default FloatingGameItem;
