import { GameSettings, LeaderboardEntry, CarSkin } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'neon_racer_settings_v2',
  LEADERBOARD: 'neon_racer_leaderboard_v2',
  TOTAL_COINS: 'neon_racer_coins_v2',
  UNLOCKED_CARS: 'neon_racer_cars_v2',
  SELECTED_CAR: 'neon_racer_selected_car_v2',
  HIGH_SCORE: 'neon_racer_highscore_v2'
};

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  graphicsQuality: 'HIGH',
  crtFilter: true,
  weatherEnabled: true,
  showFps: true,
  touchControls: false,
};

export const DEFAULT_CARS: CarSkin[] = [
  {
    id: 'cyber_apex',
    name: 'APEX GT-99',
    description: 'Balanced cyberpunk classic with high stability.',
    topSpeed: 3,
    handling: 4,
    nitroCap: 3,
    armor: 3,
    color: '#00f2ff',
    secondaryColor: '#bc13fe',
    unlocked: true,
    cost: 0,
  },
  {
    id: 'phantom_wraith',
    name: 'PHANTOM WRAITH',
    description: 'High top-speed interceptor built for straightaways.',
    topSpeed: 5,
    handling: 2,
    nitroCap: 4,
    armor: 2,
    color: '#ff00ff',
    secondaryColor: '#00f2ff',
    unlocked: false,
    cost: 1500,
  },
  {
    id: 'neon_spectre',
    name: 'NEON SPECTRE',
    description: 'Agile hover racer with ultra-responsive lane weaving.',
    topSpeed: 4,
    handling: 5,
    nitroCap: 3,
    armor: 2,
    color: '#39ff14',
    secondaryColor: '#ff00ff',
    unlocked: false,
    cost: 3000,
  },
  {
    id: 'cyber_dreadnought',
    name: 'CYBER TANK V8',
    description: 'Heavy armor frame that handles collisions with ease.',
    topSpeed: 3,
    handling: 3,
    nitroCap: 5,
    armor: 5,
    color: '#ffd700',
    secondaryColor: '#ff0055',
    unlocked: false,
    cost: 5000,
  }
];

export const PRESET_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'CYBER_VIPER', score: 98400, distance: 42.5, carName: 'PHANTOM WRAITH', date: '2099-08-01' },
  { id: '2', name: 'SYNTH_HAWK', score: 81200, distance: 35.1, carName: 'NEON SPECTRE', date: '2099-07-28' },
  { id: '3', name: 'ZERO_COOL', score: 65900, distance: 28.4, carName: 'APEX GT-99', date: '2099-07-20' },
  { id: '4', name: 'ACID_BURN', score: 52100, distance: 22.8, carName: 'CYBER TANK V8', date: '2099-07-15' },
  { id: '5', name: 'GHOST_RIDER', score: 39500, distance: 17.2, carName: 'APEX GT-99', date: '2099-07-10' },
];

export class StorageService {
  static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }

  static getHighScore(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return val ? parseInt(val, 10) : 98400;
    } catch {
      return 98400;
    }
  }

  static saveHighScore(score: number) {
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      }
    } catch (e) {
      console.warn(e);
    }
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(e);
    }
    return PRESET_LEADERBOARD;
  }

  static addLeaderboardScore(entry: Omit<LeaderboardEntry, 'id' | 'date'>) {
    const list = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(trimmed));
      if (trimmed[0].score > this.getHighScore()) {
        this.saveHighScore(trimmed[0].score);
      }
    } catch (e) {
      console.warn(e);
    }
    return trimmed;
  }

  static getCoins(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.TOTAL_COINS);
      return val ? parseInt(val, 10) : 500; // start with 500 starter coins
    } catch {
      return 500;
    }
  }

  static addCoins(amount: number): number {
    const total = this.getCoins() + amount;
    try {
      localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, total.toString());
    } catch (e) {
      console.warn(e);
    }
    return total;
  }

  static deductCoins(amount: number): boolean {
    const current = this.getCoins();
    if (current >= amount) {
      const total = current - amount;
      try {
        localStorage.setItem(STORAGE_KEYS.TOTAL_COINS, total.toString());
      } catch (e) {
        console.warn(e);
      }
      return true;
    }
    return false;
  }

  static getUnlockedCarIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_CARS);
      return data ? JSON.parse(data) : ['cyber_apex'];
    } catch {
      return ['cyber_apex'];
    }
  }

  static unlockCar(carId: string) {
    const unlocked = this.getUnlockedCarIds();
    if (!unlocked.includes(carId)) {
      unlocked.push(carId);
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_CARS, JSON.stringify(unlocked));
      } catch (e) {
        console.warn(e);
      }
    }
  }

  static getSelectedCarId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_CAR) || 'cyber_apex';
    } catch {
      return 'cyber_apex';
    }
  }

  static setSelectedCarId(carId: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CAR, carId);
    } catch (e) {
      console.warn(e);
    }
  }
}
