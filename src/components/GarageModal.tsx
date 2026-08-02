import React, { useState } from 'react';
import { X, Check, Lock, Shield, Zap, Gauge, Flame, Car } from 'lucide-react';
import { CarSkin } from '../types';
import { DEFAULT_CARS, StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynth';

interface GarageModalProps {
  onClose: () => void;
  coins: number;
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
  onCoinsUpdated: (newCoins: number) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  onClose,
  coins,
  selectedCarId,
  onSelectCar,
  onCoinsUpdated,
}) => {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(StorageService.getUnlockedCarIds());
  const [activeCarId, setActiveCarId] = useState<string>(selectedCarId);

  const handleUnlock = (car: CarSkin) => {
    audioSynth.playButtonClick();
    if (coins >= car.cost) {
      if (StorageService.deductCoins(car.cost)) {
        StorageService.unlockCar(car.id);
        const updatedUnlocked = StorageService.getUnlockedCarIds();
        setUnlockedIds(updatedUnlocked);
        onCoinsUpdated(StorageService.getCoins());
        audioSynth.playPowerUpSound();
      }
    } else {
      audioSynth.playCrashSound();
    }
  };

  const handleSelect = (carId: string) => {
    audioSynth.playButtonClick();
    StorageService.setSelectedCarId(carId);
    setActiveCarId(carId);
    onSelectCar(carId);
  };

  const renderStatBar = (label: string, value: number, icon: React.ReactNode, colorClass: string) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-xs font-rajdhani font-bold text-gray-300">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span>{value} / 5</span>
      </div>
      <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-sm overflow-hidden p-0.5">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cyber-panel w-full max-w-4xl p-6 md:p-8 border border-cyan-400 relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            audioSynth.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-cyan-400 hover:text-white cyber-glass border border-cyan-400/50 hover:border-cyan-400 rounded transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-500/30">
          <div>
            <h2 className="text-2xl md:text-3xl font-black font-orbitron text-cyan-400 neon-glow-cyan flex items-center gap-3">
              <Car size={28} /> CYBER GARAGE
            </h2>
            <p className="text-xs font-rajdhani text-gray-400 mt-0.5">
              CUSTOMIZE & UNLOCK FUTURISTIC HOVER RACERS
            </p>
          </div>

          <div className="cyber-glass px-4 py-2 border border-yellow-500/50 flex items-center gap-2">
            <span className="text-base">🪙</span>
            <span className="font-orbitron font-bold text-yellow-400">{coins} CREDITS</span>
          </div>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 my-2">
          {DEFAULT_CARS.map((car) => {
            const isUnlocked = unlockedIds.includes(car.id);
            const isSelected = activeCarId === car.id;

            return (
              <div
                key={car.id}
                className={`cyber-glass p-5 border rounded transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 neon-box-cyan'
                    : isUnlocked
                    ? 'border-gray-700 hover:border-purple-400'
                    : 'border-gray-800 opacity-80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
                        {car.name}
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-black text-[10px] font-black rounded">
                            ACTIVE
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-rajdhani text-gray-400 mt-1">{car.description}</p>
                    </div>

                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/50 shadow-md"
                      style={{ backgroundColor: car.color }}
                      title="Vehicle Chassis Color"
                    />
                  </div>

                  {/* Vehicle Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {renderStatBar('TOP SPEED', car.topSpeed, <Gauge size={12} className="text-cyan-400" />, 'bg-cyan-400')}
                    {renderStatBar('HANDLING', car.handling, <Flame size={12} className="text-pink-400" />, 'bg-pink-400')}
                    {renderStatBar('NITRO CAP', car.nitroCap, <Zap size={12} className="text-purple-400" />, 'bg-purple-400')}
                    {renderStatBar('ARMOR HULL', car.armor, <Shield size={12} className="text-green-400" />, 'bg-green-400')}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-800/80 flex justify-between items-center">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleSelect(car.id)}
                      disabled={isSelected}
                      className={`w-full py-2 px-4 font-orbitron font-bold text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-400/50 cursor-default'
                          : 'neon-btn-cyan'
                      }`}
                    >
                      {isSelected ? <><Check size={14} /> SELECTED</> : 'SELECT VEHICLE'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(car)}
                      disabled={coins < car.cost}
                      className={`w-full py-2 px-4 font-orbitron font-bold text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                        coins >= car.cost
                          ? 'neon-btn-pink'
                          : 'bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Lock size={14} /> UNLOCK FOR {car.cost} COINS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
