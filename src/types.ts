export type GameScreen = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'GARAGE' | 'LEADERBOARD' | 'SETTINGS';

export type WeatherType = 'CLEAR' | 'RAIN' | 'FOG' | 'CYBER_STORM';
export type TimeOfDay = 'NEON_NIGHT' | 'CYBER_TWILIGHT' | 'SYNTH_DAWN';

export interface CarSkin {
  id: string;
  name: string;
  description: string;
  topSpeed: number; // 1 to 5
  handling: number; // 1 to 5
  nitroCap: number; // 1 to 5
  armor: number;    // 1 to 5
  color: string;
  secondaryColor: string;
  unlocked: boolean;
  cost: number;
}

export interface PlayerCar {
  x: number;
  y: number;
  targetX: number;
  lane: number; // 0, 1, 2, 3
  width: number;
  height: number;
  isNitro: boolean;
  shieldActive: boolean;
  doubleScoreActive: boolean;
  magnetActive: boolean;
  shieldDuration: number;
  doubleScoreDuration: number;
  magnetDuration: number;
  skinId: string;
}

export interface EnemyVehicle {
  id: number;
  x: number;
  y: number;
  lane: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  type: 'SPORTS' | 'TRUCK' | 'HOVER' | 'POLICE';
  isLaneChanging: boolean;
  targetLane?: number;
}

export type PowerUpType = 'NITRO' | 'MAGNET' | 'SHIELD' | 'DOUBLE_SCORE' | 'REPAIR' | 'COIN';

export interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  lane: number;
  type: PowerUpType;
  radius: number;
  pulsePhase: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number; // 1.0 to 0.0
  maxLife: number;
  alpha: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  distance: number;
  carName: string;
  date: string;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  crtFilter: boolean;
  weatherEnabled: boolean;
  showFps: boolean;
  touchControls: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}
