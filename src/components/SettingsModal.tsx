import React, { useState } from 'react';
import { X, Volume2, Monitor, Sliders, RefreshCw, Check } from 'lucide-react';
import { GameSettings } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynth';

interface SettingsModalProps {
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [current, setCurrent] = useState<GameSettings>(settings);

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    audioSynth.playButtonClick();
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    StorageService.saveSettings(updated);
    onUpdateSettings(updated);

    if (key === 'masterVolume' || key === 'musicVolume' || key === 'sfxVolume') {
      audioSynth.updateVolumes(
        updated.masterVolume,
        updated.musicVolume,
        updated.sfxVolume
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cyber-panel w-full max-w-2xl p-6 md:p-8 border border-purple-500 relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            audioSynth.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-purple-400 hover:text-white cyber-glass border border-purple-400/50 hover:border-purple-400 rounded transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="mb-6 pb-4 border-b border-purple-500/30">
          <h2 className="text-2xl md:text-3xl font-black font-orbitron text-purple-400 neon-glow-purple flex items-center gap-3">
            <Sliders size={28} /> SYSTEM CONFIGURATION
          </h2>
          <p className="text-xs font-rajdhani text-gray-400 mt-0.5">
            AUDIO SYNTHESIZER & GRAPHICS OPTIMIZATION
          </p>
        </div>

        {/* Settings Options */}
        <div className="flex flex-col gap-6 overflow-y-auto max-h-[70vh] pr-2">
          {/* Audio Section */}
          <div className="cyber-glass p-4 border border-purple-500/30 rounded">
            <h3 className="text-sm font-bold font-orbitron text-purple-300 mb-4 flex items-center gap-2">
              <Volume2 size={16} /> AUDIO SYNTHESIZER VOLUMES
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs font-rajdhani font-semibold text-gray-300 mb-1">
                  <span>MASTER VOLUME</span>
                  <span>{Math.round(current.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={current.masterVolume}
                  onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-gray-900 h-2 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-rajdhani font-semibold text-gray-300 mb-1">
                  <span>SYNTHWAVE MUSIC</span>
                  <span>{Math.round(current.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={current.musicVolume}
                  onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-gray-900 h-2 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-rajdhani font-semibold text-gray-300 mb-1">
                  <span>SOUND EFFECTS (SFX)</span>
                  <span>{Math.round(current.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={current.sfxVolume}
                  onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                  className="w-full accent-pink-500 bg-gray-900 h-2 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Display & Visual FX Section */}
          <div className="cyber-glass p-4 border border-cyan-500/30 rounded">
            <h3 className="text-sm font-bold font-orbitron text-cyan-300 mb-4 flex items-center gap-2">
              <Monitor size={16} /> VISUAL & POST-PROCESSING
            </h3>

            <div className="flex flex-col gap-4">
              {/* CRT Scanline Filter Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold font-orbitron text-white">CRT SCANLINE OVERLAY</div>
                  <div className="text-xs font-rajdhani text-gray-400">Authentic retro arcade scanlines</div>
                </div>
                <button
                  onClick={() => handleChange('crtFilter', !current.crtFilter)}
                  className={`px-4 py-1.5 font-orbitron font-bold text-xs rounded transition-all ${
                    current.crtFilter ? 'neon-btn-cyan' : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {current.crtFilter ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Weather Effects Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold font-orbitron text-white">DYNAMIC WEATHER</div>
                  <div className="text-xs font-rajdhani text-gray-400">Raindrops, cyber storms & atmosphere</div>
                </div>
                <button
                  onClick={() => handleChange('weatherEnabled', !current.weatherEnabled)}
                  className={`px-4 py-1.5 font-orbitron font-bold text-xs rounded transition-all ${
                    current.weatherEnabled ? 'neon-btn-pink' : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {current.weatherEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Show FPS Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold font-orbitron text-white">FPS COUNTER</div>
                  <div className="text-xs font-rajdhani text-gray-400">Display real-time frame telemetry</div>
                </div>
                <button
                  onClick={() => handleChange('showFps', !current.showFps)}
                  className={`px-4 py-1.5 font-orbitron font-bold text-xs rounded transition-all ${
                    current.showFps ? 'bg-purple-900/60 border border-purple-400 text-purple-300' : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {current.showFps ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Graphics Quality Preset */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold font-orbitron text-white">GRAPHICS PRESET</div>
                  <div className="text-xs font-rajdhani text-gray-400">Particle density & shadow bloom</div>
                </div>
                <div className="flex gap-1">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChange('graphicsQuality', q)}
                      className={`px-3 py-1 font-orbitron font-bold text-[10px] rounded border transition-all ${
                        current.graphicsQuality === q
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                          : 'border-gray-800 bg-gray-900 text-gray-500'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
