import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Pause } from 'lucide-react';

interface MobileControlsProps {
  onSteerLeftStart: () => void;
  onSteerLeftEnd: () => void;
  onSteerRightStart: () => void;
  onSteerRightEnd: () => void;
  onNitroStart: () => void;
  onNitroEnd: () => void;
  onPause: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onSteerLeftStart,
  onSteerLeftEnd,
  onSteerRightStart,
  onSteerRightEnd,
  onNitroStart,
  onNitroEnd,
  onPause,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-6 px-6 pointer-events-auto z-20 flex justify-between items-center select-none touch-none sm:hidden">
      {/* Steering Buttons */}
      <div className="flex gap-4">
        <button
          onTouchStart={onSteerLeftStart}
          onTouchEnd={onSteerLeftEnd}
          onMouseDown={onSteerLeftStart}
          onMouseUp={onSteerLeftEnd}
          className="w-16 h-16 cyber-glass border border-cyan-400 rounded-full flex items-center justify-center text-cyan-400 active:bg-cyan-400 active:text-black transition-colors"
        >
          <ArrowLeft size={28} />
        </button>

        <button
          onTouchStart={onSteerRightStart}
          onTouchEnd={onSteerRightEnd}
          onMouseDown={onSteerRightStart}
          onMouseUp={onSteerRightEnd}
          className="w-16 h-16 cyber-glass border border-cyan-400 rounded-full flex items-center justify-center text-cyan-400 active:bg-cyan-400 active:text-black transition-colors"
        >
          <ArrowRight size={28} />
        </button>
      </div>

      {/* Nitro Boost Button */}
      <button
        onTouchStart={onNitroStart}
        onTouchEnd={onNitroEnd}
        onMouseDown={onNitroStart}
        onMouseUp={onNitroEnd}
        className="w-20 h-20 neon-btn-pink rounded-full flex flex-col items-center justify-center active:scale-95 transition-transform"
      >
        <Zap size={28} className="fill-current" />
        <span className="text-[10px] font-black font-orbitron mt-0.5">NITRO</span>
      </button>
    </div>
  );
};
