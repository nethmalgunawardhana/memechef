'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  glow?: boolean;
  pulse?: boolean;
  shake?: boolean;
}

const GlassCard = ({ 
  children, 
  className = "", 
  hover = true, 
  rarity = 'common',
  glow = false,
  pulse = false,
  shake = false,
  ...props 
}: GlassCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  // Define rarity-based styling
  const rarityStyles = {
    common: "border-white/20 shadow-purple-500/20 hover:shadow-purple-500/30",
    rare: "border-blue-400/40 shadow-blue-500/20 hover:shadow-blue-500/40",
    epic: "border-purple-400/40 shadow-purple-500/30 hover:shadow-purple-500/50",
    legendary: "border-orange-400/40 shadow-orange-500/30 hover:shadow-orange-500/50 border-2"
  };
  
  // Define glow effects
  const glowEffect = glow ? `${
    rarity === 'legendary' ? 'shadow-2xl shadow-orange-500/50 ring-2 ring-orange-500/30' :
    rarity === 'epic' ? 'shadow-xl shadow-purple-500/50 ring-1 ring-purple-500/30' :
    rarity === 'rare' ? 'shadow-lg shadow-blue-500/40 ring-1 ring-blue-500/20' :
    'shadow-md shadow-white/30'
  }` : '';
  
  // Define animations
  const animations = `${
    pulse ? 'animate-pulse-slow' : ''
  } ${
    shake ? 'animate-wiggle' : ''
  }`;
  
  return (
    <div className={`
      relative overflow-hidden
      backdrop-blur-xl bg-white/10 
      border ${rarityStyles[rarity]}
      rounded-2xl shadow-2xl
      ${hover ? 'hover:bg-white/15 hover:scale-[1.02] hover:-translate-y-1' : ''}
      ${glowEffect}
      ${animations}
      transition-all duration-400 ease-out
      ${className}
    `} {...props}>
      {/* Rarity indicator */}
      {rarity !== 'common' && (
        <div className="absolute top-0 right-0 m-2">
          <div className={`w-3 h-3 rounded-full ${
            rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' :
            rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
            'bg-gradient-to-br from-blue-400 to-cyan-500'
          }`}></div>
        </div>
      )}
      
      {children}
      
      {/* Subtle decorative corner elements for game-like UI */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg pointer-events-none"></div>
    </div>
  );
};

export default GlassCard;
