import React from 'react';
import { X, Trophy, Medal, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynth';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const leaderboard = StorageService.getLeaderboard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cyber-panel w-full max-w-3xl p-6 md:p-8 border border-yellow-500 relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            audioSynth.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-yellow-400 hover:text-white cyber-glass border border-yellow-400/50 hover:border-yellow-400 rounded transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="mb-6 pb-4 border-b border-yellow-500/30">
          <h2 className="text-2xl md:text-3xl font-black font-orbitron text-yellow-400 neon-glow-yellow flex items-center gap-3">
            <Trophy size={28} /> GLOBAL CYBER LEADERBOARD
          </h2>
          <p className="text-xs font-rajdhani text-gray-400 mt-0.5">
            HALL OF FAME — TOP HIGHWAY LEGENDS 2099
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-2 max-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-yellow-500/30 text-[11px] font-orbitron text-yellow-400/80">
                <th className="py-3 px-3">RANK</th>
                <th className="py-3 px-3">DRIVER</th>
                <th className="py-3 px-3 text-right">SCORE</th>
                <th className="py-3 px-3 text-right">DISTANCE</th>
                <th className="py-3 px-3 text-right hidden sm:table-cell">VEHICLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 font-orbitron text-sm">
              {leaderboard.map((entry, idx) => {
                let rankBadge = `${idx + 1}`;
                let rankColor = 'text-gray-400';

                if (idx === 0) {
                  rankBadge = '🥇 1ST';
                  rankColor = 'text-yellow-400 neon-glow-yellow font-black';
                } else if (idx === 1) {
                  rankBadge = '🥈 2ND';
                  rankColor = 'text-cyan-300 font-bold';
                } else if (idx === 2) {
                  rankBadge = '🥉 3RD';
                  rankColor = 'text-pink-400 font-bold';
                }

                return (
                  <tr
                    key={entry.id || idx}
                    className="hover:bg-yellow-950/20 transition-colors"
                  >
                    <td className={`py-3 px-3 ${rankColor}`}>{rankBadge}</td>
                    <td className="py-3 px-3 font-bold text-white tracking-wider flex items-center gap-2">
                      {entry.name}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-cyan-400">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-pink-300 font-semibold">
                      {entry.distance.toFixed(1)} km
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-rajdhani text-gray-400 hidden sm:table-cell">
                      {entry.carName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
