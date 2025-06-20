'use client';

interface LevelUpNotificationProps {
  gameEffects: Array<{
    id: number;
    type: 'success' | 'bonus' | 'level-up';
    message: string;
  }>;
}

const LevelUpNotification = ({ gameEffects }: LevelUpNotificationProps) => {
  const levelUpEffects = gameEffects.filter(effect => effect.type === 'level-up');

  if (levelUpEffects.length === 0) return null;

  return (
    <>
      {levelUpEffects.map(effect => (
        <div key={effect.id} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-popup">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-sm uppercase tracking-wide">New Title Unlocked!</div>
              <div className="font-bold text-lg">{effect.message}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LevelUpNotification;
