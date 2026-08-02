import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { PlayerCar, EnemyVehicle, PowerUpItem, WeatherType, GameSettings } from '../types';
import { CanvasRenderer } from './CanvasRenderer';

interface HUDProps {
  score: number;
  highScore: number;
  distance: number;
  speed: number;
  nitro: number;
  lives: number;
  maxLives: number;
  coins: number;
  multiplier: number;
  weather: WeatherType;
  fps: number;
  player: PlayerCar;
  enemies: EnemyVehicle[];
  powerups: PowerUpItem[];
  achievementText: string | null;
  settings: GameSettings;
  renderer: CanvasRenderer | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  distance,
  speed,
  nitro,
  lives,
  maxLives,
  coins,
  multiplier,
  weather,
  fps,
  player,
  enemies,
  powerups,
  achievementText,
  settings,
  renderer,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (miniMapRef.current && renderer) {
      const ctx = miniMapRef.current.getContext('2d');
      if (ctx) {
        renderer.renderMiniMap(ctx, player, enemies, powerups);
      }
    }
  }, [player, enemies, powerups, renderer]);

  // Format score string to 6 digits
  const formattedScore = score.toString().padStart(6, '0');
  const formattedHighScore = highScore.toString().padStart(6, '0');
  const speedKmh = Math.floor(speed * 12);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between z-10 select-none overflow-hidden">
      {/* --- TOP HUD BAR --- */}
      <div className="flex justify-between items-start gap-4">
        {/* Left Stat Panel */}
        <div className="flex gap-3">
          <div className="cyber-glass px-4 py-2 border-l-4 border-cyan-400">
            <div className="text-[10px] text-cyan-400 font-rajdhani font-semibold tracking-widest">CURRENT SCORE</div>
            <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white neon-glow-cyan">
              {formattedScore}
            </div>
          </div>

          <div className="cyber-glass px-4 py-2 border-l-4 border-purple-500 hidden sm:block">
            <div className="text-[10px] text-purple-400 font-rajdhani font-semibold tracking-widest">TOP RECORD</div>
            <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-purple-200">
              {formattedHighScore}
            </div>
          </div>

          <div className="cyber-glass px-4 py-2 border-l-4 border-pink-500">
            <div className="text-[10px] text-pink-400 font-rajdhani font-semibold tracking-widest">DISTANCE</div>
            <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-pink-200">
              {distance.toFixed(1)} <span className="text-xs font-rajdhani text-pink-400">KM</span>
            </div>
          </div>
        </div>

        {/* Center Active Multiplier & Status */}
        <div className="flex flex-col items-center">
          {multiplier > 1 && (
            <div className="cyber-glass px-3 py-1 border border-pink-500 rounded-full animate-bounce">
              <span className="text-sm font-black font-orbitron text-pink-400 neon-glow-pink">
                {multiplier}x COMBO DENSITY
              </span>
            </div>
          )}

          {/* Active Buff Badges */}
          <div className="flex gap-2 mt-2">
            {player.shieldActive && (
              <div className="px-2 py-0.5 bg-green-950/80 border border-green-400 text-green-400 text-xs font-bold font-orbitron flex items-center gap-1 rounded">
                <Shield size={12} /> SHIELD
              </div>
            )}
            {player.doubleScoreActive && (
              <div className="px-2 py-0.5 bg-pink-950/80 border border-pink-400 text-pink-400 text-xs font-bold font-orbitron flex items-center gap-1 rounded">
                <Sparkles size={12} /> 2x SCORE
              </div>
            )}
            {player.magnetActive && (
              <div className="px-2 py-0.5 bg-purple-950/80 border border-purple-400 text-purple-400 text-xs font-bold font-orbitron flex items-center gap-1 rounded">
                <Zap size={12} /> MAGNET
              </div>
            )}
          </div>
        </div>

        {/* Right HUD Widgets & Pause */}
        <div className="flex items-center gap-3">
          {/* Mini-Map Canvas */}
          <div className="hidden lg:block relative w-[120px] h-[120px] rounded-lg overflow-hidden cyber-glass border border-cyan-500/40">
            <canvas ref={miniMapRef} width={120} height={120} />
            <div className="absolute top-1 left-2 text-[8px] font-rajdhani text-cyan-400 tracking-wider">RADAR 2099</div>
          </div>

          {/* System Control Quick Buttons */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={onPause}
              className="p-2.5 cyber-glass border border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-white rounded transition-colors"
              title="Pause Mission (P)"
            >
              <Pause size={18} />
            </button>
            <button
              onClick={onToggleMute}
              className="p-2.5 cyber-glass border border-pink-400/50 hover:border-pink-400 text-pink-400 hover:text-white rounded transition-colors"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- ACHIEVEMENT TOAST POPUP --- */}
      {achievementText && (
        <div className="self-center cyber-panel px-6 py-2 border border-cyan-400 neon-box-cyan animate-pulse flex items-center gap-2">
          <Cpu className="text-cyan-400 animate-spin" size={18} />
          <span className="text-sm md:text-base font-bold font-orbitron text-cyan-200 neon-glow-cyan">
            {achievementText}
          </span>
        </div>
      )}

      {/* --- BOTTOM HUD BAR --- */}
      <div className="flex justify-between items-end gap-4">
        {/* Left: Nitro Gauge & Health Armor */}
        <div className="flex flex-col gap-3">
          {/* Health Hearts */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-rajdhani font-bold text-cyan-400 tracking-widest">HULL ARMOR</span>
            <div className="flex gap-1.5">
              {Array.from({ length: maxLives }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 border-2 transform rotate-45 transition-all duration-300 ${
                    idx < lives
                      ? 'border-pink-500 bg-pink-500/80 shadow-[0_0_12px_#ff00ff]'
                      : 'border-gray-700 bg-gray-900/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Nitro Gauge Bar */}
          <div className="cyber-glass p-2 border-l-4 border-cyan-400 min-w-[200px] md:min-w-[260px]">
            <div className="flex justify-between items-center text-xs font-rajdhani font-bold text-cyan-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-cyan-400" /> NITRO THRUST
              </span>
              <span>{Math.floor(nitro)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-950 border border-cyan-500/30 rounded-sm overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 shadow-[0_0_10px_#00f2ff] transition-all duration-100"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Coins Counter */}
        <div className="cyber-glass px-4 py-2 border-b-2 border-yellow-400 flex items-center gap-2">
          <span className="text-lg text-yellow-400">🪙</span>
          <span className="text-lg font-bold font-orbitron text-yellow-300">{coins}</span>
        </div>

        {/* Right: Digital Speedometer */}
        <div className="cyber-glass px-6 py-3 border-r-4 border-cyan-400 flex flex-col items-end">
          <div className="text-[10px] text-cyan-400 font-rajdhani font-semibold tracking-widest">VELOCITY</div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black font-orbitron text-cyan-400 neon-glow-cyan tracking-tight">
              {speedKmh}
            </span>
            <span className="text-xs font-rajdhani font-bold text-cyan-300">KM/H</span>
          </div>
        </div>
      </div>

      {/* FPS Counter & Weather Info in corner */}
      {settings.showFps && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400/60 flex gap-3 bg-black/60 px-3 py-0.5 rounded-full border border-cyan-900/40">
          <span>FPS: {fps}</span>
          <span>ENV: {weather}</span>
        </div>
      )}
    </div>
  );
};
