import React from 'react';
import { Play, Settings, Home, Pause } from 'lucide-react';
import { audioSynth } from '../services/audioSynth';

interface PauseModalProps {
  onResume: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenSettings,
  onQuit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cyber-panel w-full max-w-md p-6 md:p-8 border border-cyan-400 relative flex flex-col text-center">
        <div className="mb-6">
          <div className="flex justify-center text-cyan-400 mb-2">
            <Pause size={32} />
          </div>
          <h2 className="text-3xl font-black font-orbitron text-cyan-400 neon-glow-cyan">
            MISSION PAUSED
          </h2>
          <p className="text-xs font-rajdhani text-gray-400 mt-1 uppercase">
            SIMULATION SUSPENDED
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              audioSynth.playButtonClick();
              onResume();
            }}
            className="neon-btn-cyan py-3.5 font-orbitron font-black text-base tracking-wider flex items-center justify-center gap-2"
          >
            <Play size={18} className="fill-current" /> RESUME MISSION (P)
          </button>

          <button
            onClick={() => {
              audioSynth.playButtonClick();
              onOpenSettings();
            }}
            className="neon-btn-pink py-3 font-orbitron font-bold text-sm tracking-wider flex items-center justify-center gap-2"
          >
            <Settings size={16} /> CONFIGURATION
          </button>

          <button
            onClick={() => {
              audioSynth.playButtonClick();
              onQuit();
            }}
            className="cyber-glass py-3 font-orbitron font-bold text-sm text-gray-400 border border-gray-800 hover:border-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} /> QUIT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
