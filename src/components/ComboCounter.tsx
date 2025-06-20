'use client';

interface ComboCounterProps {
  comboChain: number;
}

const ComboCounter = ({ comboChain }: ComboCounterProps) => {
  if (comboChain <= 1) return null;

  return (
    <div className="fixed top-24 right-5 z-50 animate-popup">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="text-xs uppercase tracking-wide">Combo Chain</div>
        <div className="font-bold text-xl">{comboChain}x</div>
      </div>
    </div>
  );
};

export default ComboCounter;
