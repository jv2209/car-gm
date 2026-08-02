import React, { useState } from 'react';
import { RotateCcw, Home, Trophy, AlertTriangle, Send, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynth';

interface GameOverModalProps {
  score: number;
  distance: number;
  coinsEarned: number;
  carName: string;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  coinsEarned,
  carName,
  isNewHighScore,
  onRestart,
  onMainMenu,
}) => {
  const [driverName, setDriverName] = useState('CYBER_GHOST');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playButtonClick();
    if (!driverName.trim()) return;

    StorageService.addLeaderboardScore({
      name: driverName.trim().toUpperCase(),
      score,
      distance,
      carName,
    });
    setIsSubmitted(true);
    audioSynth.playPowerUpSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="cyber-panel w-full max-w-lg p-6 md:p-8 border border-pink-500 relative flex flex-col text-center">
        {/* Animated Title */}
        <div className="mb-6">
          <div className="flex justify-center text-pink-500 mb-2 animate-bounce">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-orbitron text-pink-500 neon-glow-pink tracking-wider animate-glitch">
            CRITICAL FAILURE
          </h2>
          <p className="text-xs font-rajdhani text-gray-400 mt-1 uppercase tracking-widest">
            HULL COLLISION & VEHICLE TERMINATION
          </p>
        </div>

        {/* New High Score Alert */}
        {isNewHighScore && (
          <div className="mb-6 py-2 px-4 bg-yellow-950/80 border border-yellow-400 rounded text-yellow-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 animate-pulse">
            <Sparkles size={16} /> NEW GLOBAL RECORD BROKEN!
          </div>
        )}

        {/* Results Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="cyber-glass p-3 border border-cyan-500/30">
            <div className="text-[10px] text-cyan-400 font-rajdhani font-bold">FINAL SCORE</div>
            <div className="text-lg md:text-xl font-bold font-orbitron text-white">{score.toLocaleString()}</div>
          </div>

          <div className="cyber-glass p-3 border border-pink-500/30">
            <div className="text-[10px] text-pink-400 font-rajdhani font-bold">DISTANCE</div>
            <div className="text-lg md:text-xl font-bold font-orbitron text-white">{distance.toFixed(1)} km</div>
          </div>

          <div className="cyber-glass p-3 border border-yellow-500/30">
            <div className="text-[10px] text-yellow-400 font-rajdhani font-bold">COINS RECOVERED</div>
            <div className="text-lg md:text-xl font-bold font-orbitron text-yellow-300">+{coinsEarned}</div>
          </div>
        </div>

        {/* Leaderboard Handle Input */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmitScore} className="mb-6 cyber-glass p-4 border border-cyan-500/40 rounded">
            <label className="block text-xs font-rajdhani font-bold text-cyan-400 mb-2">
              ENTER DRIVER HANDLE FOR LEADERBOARD:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-black/80 border border-cyan-400/60 px-3 py-2 text-white font-orbitron text-sm focus:outline-none focus:border-cyan-400 uppercase rounded"
                placeholder="DRIVER_NAME"
              />
              <button
                type="submit"
                className="neon-btn-cyan px-4 font-orbitron font-bold text-xs flex items-center gap-1 rounded shrink-0"
              >
                <Send size={14} /> SUBMIT
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 py-2 bg-green-950/60 border border-green-500 text-green-300 font-orbitron text-xs rounded">
            ✓ SCORE TRANSMITTED TO LEADERBOARD
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              audioSynth.playButtonClick();
              onRestart();
            }}
            className="neon-btn-cyan py-3.5 font-orbitron font-black text-base tracking-wider flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> REBOOT SYSTEM
          </button>

          <button
            onClick={() => {
              audioSynth.playButtonClick();
              onMainMenu();
            }}
            className="cyber-glass py-3 font-orbitron font-bold text-sm text-gray-300 border border-gray-700 hover:border-pink-400 hover:text-pink-400 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} /> RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
