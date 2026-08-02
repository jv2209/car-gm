import React from 'react';
import { Play, Trophy, Settings, Car, Volume2, VolumeX, Shield, Disc } from 'lucide-react';
import { GameScreen, CarSkin } from '../types';
import { audioSynth } from '../services/audioSynth';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  selectedCar: CarSkin;
  coins: number;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenGarage,
  onOpenLeaderboard,
  onOpenSettings,
  selectedCar,
  coins,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  const handleHover = () => {
    audioSynth.playButtonClick();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between items-center p-6 md:p-12 overflow-hidden bg-gradient-to-b from-[#050012] via-[#09001f] to-[#020008]">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-xs font-rajdhani font-bold tracking-widest text-cyan-400">
            SYSTEM STATUS: OPTIMAL | SERVER_2099
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="cyber-glass px-3 py-1.5 border border-yellow-500/40 rounded flex items-center gap-2">
            <span className="text-sm">🪙</span>
            <span className="font-orbitron font-bold text-yellow-400 text-sm">{coins}</span>
          </div>

          <button
            onClick={() => {
              handleHover();
              onToggleMute();
            }}
            className="p-2 cyber-glass border border-cyan-400/40 hover:border-cyan-400 text-cyan-400 rounded transition-colors"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Center Title & Buttons */}
      <div className="flex flex-col items-center text-center z-10 max-w-xl my-auto">
        {/* Game Title */}
        <div className="mb-8">
          <p className="text-xs font-rajdhani tracking-[0.4em] text-pink-500 font-bold mb-2 uppercase">
            HIGH-SPEED CYBERPUNK ARCADE
          </p>
          <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tight leading-none text-white drop-shadow-[0_0_25px_rgba(0,242,255,0.8)]">
            NEON<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 neon-glow-pink animate-pulse">
              RACER
            </span><br />
            <span className="text-3xl md:text-5xl text-purple-400 tracking-[0.2em]">2099</span>
          </h1>
        </div>

        {/* Selected Vehicle Badge */}
        <div className="cyber-panel px-5 py-2 border border-cyan-400/40 mb-8 flex items-center gap-3">
          <Car size={18} className="text-cyan-400" />
          <div className="text-left">
            <div className="text-[10px] text-cyan-400/80 font-rajdhani font-semibold">SELECTED VEHICLE</div>
            <div className="text-xs font-bold font-orbitron text-white">{selectedCar.name}</div>
          </div>
        </div>

        {/* Menu Navigation Buttons */}
        <div className="flex flex-col gap-3 w-64 md:w-80">
          <button
            onClick={() => {
              handleHover();
              onStartGame();
            }}
            onMouseEnter={handleHover}
            className="neon-btn-cyan py-3.5 px-6 font-orbitron font-black text-lg tracking-wider flex items-center justify-between group"
          >
            <span className="flex items-center gap-2">
              <Play size={20} className="fill-current" /> START MISSION
            </span>
            <span className="text-xs font-rajdhani group-hover:translate-x-1 transition-transform">▶</span>
          </button>

          <button
            onClick={() => {
              handleHover();
              onOpenGarage();
            }}
            onMouseEnter={handleHover}
            className="neon-btn-pink py-3 px-6 font-orbitron font-bold text-base tracking-wider flex items-center justify-between group"
          >
            <span className="flex items-center gap-2">
              <Car size={18} /> GARAGE & CARS
            </span>
            <span className="text-xs font-rajdhani text-pink-400">CUSTOMIZE</span>
          </button>

          <button
            onClick={() => {
              handleHover();
              onOpenLeaderboard();
            }}
            onMouseEnter={handleHover}
            className="cyber-glass py-3 px-6 font-orbitron font-bold text-base text-purple-300 border border-purple-500/40 hover:border-purple-400 hover:text-white hover:bg-purple-500/20 transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Trophy size={18} /> LEADERBOARD
            </span>
            <span className="text-xs font-orbitron text-purple-400">{highScore} PTS</span>
          </button>

          <button
            onClick={() => {
              handleHover();
              onOpenSettings();
            }}
            onMouseEnter={handleHover}
            className="cyber-glass py-2.5 px-6 font-orbitron font-bold text-sm text-gray-300 border border-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Settings size={16} /> SETTINGS
            </span>
            <span className="text-xs font-rajdhani text-gray-400">AUDIO / GRAPHICS</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl flex justify-between items-center text-[10px] font-rajdhani text-cyan-400/60 z-10">
        <div>CONTROLS: [A/D or ARROWS] STEER | [SPACE] NITRO | [P] PAUSE</div>
        <div>NEON ENGINE v2.0.99</div>
      </div>
    </div>
  );
};
