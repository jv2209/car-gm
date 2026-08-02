/**
 * NEON RACER 2099 - Cyberpunk Highway Racing Engine
 * Built with React 19, TypeScript, Canvas 2D, and Web Audio API Synthesizer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameScreen,
  PlayerCar,
  EnemyVehicle,
  PowerUpItem,
  ParticleEffect,
  WeatherType,
  GameSettings,
  CarSkin,
} from './types';
import { StorageService, DEFAULT_SETTINGS, DEFAULT_CARS } from './services/storage';
import { audioSynth } from './services/audioSynth';
import { CanvasRenderer } from './components/CanvasRenderer';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { SettingsModal } from './components/SettingsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { MobileControls } from './components/MobileControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // --- Game Screens State ---
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [selectedCarId, setSelectedCarId] = useState<string>(StorageService.getSelectedCarId());
  const [coins, setCoins] = useState<number>(StorageService.getCoins());
  const [highScore, setHighScore] = useState<number>(StorageService.getHighScore());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // --- Gameplay Telemetry State ---
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(100);
  const [lives, setLives] = useState<number>(3);
  const [maxLives] = useState<number>(3);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [weather, setWeather] = useState<WeatherType>('CLEAR');
  const [fps, setFps] = useState<number>(60);
  const [achievementText, setAchievementText] = useState<string | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // --- Animation Refs & Entities ---
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const cameraShakeRef = useRef<number>(0);

  // Active Selected Car Stats
  const selectedCar = DEFAULT_CARS.find((c) => c.id === selectedCarId) || DEFAULT_CARS[0];

  // Game Engine Mutable State Refs (Avoids React state re-render thrashing inside rAF)
  const playerRef = useRef<PlayerCar>({
    x: 0,
    y: 0,
    targetX: 0,
    lane: 1,
    width: 48,
    height: 86,
    isNitro: false,
    shieldActive: false,
    doubleScoreActive: false,
    magnetActive: false,
    shieldDuration: 0,
    doubleScoreDuration: 0,
    magnetDuration: 0,
    skinId: selectedCarId,
  });

  const enemiesRef = useRef<EnemyVehicle[]>([]);
  const powerupsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const keysRef = useRef<{ [code: string]: boolean }>({});
  const nextEntityIdRef = useRef<number>(1);
  const runStatsRef = useRef({ score: 0, distance: 0, speed: 0, nitro: 100, lives: 3, coinsEarned: 0 });

  // Load Initial Storage
  useEffect(() => {
    setSettings(StorageService.getSettings());
    setCoins(StorageService.getCoins());
    setHighScore(StorageService.getHighScore());
    setSelectedCarId(StorageService.getSelectedCarId());
  }, []);

  // Show Toast Achievement
  const triggerAchievement = useCallback((text: string) => {
    setAchievementText(text);
    setTimeout(() => setAchievementText(null), 3000);
  }, []);

  // --- Initialize Canvas ---
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        rendererRef.current = new CanvasRenderer(ctx);
        const handleResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          rendererRef.current?.resize(canvas.width, canvas.height);
          playerRef.current.y = canvas.height * 0.78;
          playerRef.current.targetX = canvas.width / 2;
          playerRef.current.x = canvas.width / 2;
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        setScreen((curr) => {
          if (curr === 'PLAYING') {
            audioSynth.stopMusic();
            return 'PAUSED';
          }
          if (curr === 'PAUSED') {
            audioSynth.startMusic();
            return 'PLAYING';
          }
          return curr;
        });
      }

      if (e.code === 'Space' && screen === 'PLAYING') {
        playerRef.current.isNitro = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'Space') {
        playerRef.current.isNitro = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Spawn Enemy Vehicle
  const spawnEnemy = useCallback(() => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const lanes = [w / 2 - 140, w / 2 - 45, w / 2 + 45, w / 2 + 140];
    const laneIdx = Math.floor(Math.random() * 4);
    const types: EnemyVehicle['type'][] = ['SPORTS', 'TRUCK', 'HOVER', 'POLICE'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ['#00f2ff', '#ff00ff', '#bc13fe', '#39ff14', '#ffd700'];

    enemiesRef.current.push({
      id: nextEntityIdRef.current++,
      x: lanes[laneIdx],
      y: -100,
      lane: laneIdx,
      width: type === 'TRUCK' ? 56 : 46,
      height: type === 'TRUCK' ? 96 : 82,
      speed: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: type,
      isLaneChanging: false,
    });
  }, []);

  // Spawn Power-Up
  const spawnPowerUp = useCallback(() => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const lanes = [w / 2 - 140, w / 2 - 45, w / 2 + 45, w / 2 + 140];
    const laneIdx = Math.floor(Math.random() * 4);
    const types: PowerUpItem['type'][] = ['NITRO', 'MAGNET', 'SHIELD', 'DOUBLE_SCORE', 'REPAIR', 'COIN'];
    const type = types[Math.floor(Math.random() * types.length)];

    powerupsRef.current.push({
      id: nextEntityIdRef.current++,
      x: lanes[laneIdx],
      y: -60,
      lane: laneIdx,
      type: type,
      radius: 18,
      pulsePhase: 0,
    });
  }, []);

  // Create Explosion Particles
  const createExplosion = useCallback((x: number, y: number, color: string, count = 25) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 5,
        color,
        life: 1.0,
        maxLife: 1.0,
        alpha: 1.0,
      });
    }
  }, []);

  // Handle Collision Damage
  const handleCollision = useCallback((enemyIndex: number) => {
    const enemy = enemiesRef.current[enemyIndex];
    createExplosion(enemy.x, enemy.y, enemy.color, 30);
    enemiesRef.current.splice(enemyIndex, 1);

    if (playerRef.current.shieldActive) {
      playerRef.current.shieldActive = false;
      audioSynth.playPowerUpSound();
      triggerAchievement('SHIELD ABSORBED COLLISION!');
      return;
    }

    cameraShakeRef.current = 1.0;
    audioSynth.playCrashSound();
    runStatsRef.current.lives -= 1;
    setLives(runStatsRef.current.lives);

    if (runStatsRef.current.lives <= 0) {
      audioSynth.stopMusic();
      const finalScore = Math.floor(runStatsRef.current.score);
      const isNewBest = finalScore > StorageService.getHighScore();
      if (isNewBest) {
        StorageService.saveHighScore(finalScore);
        setHighScore(finalScore);
        setIsNewHighScore(true);
      }
      StorageService.addCoins(runStatsRef.current.coinsEarned);
      setCoins(StorageService.getCoins());
      setScreen('GAMEOVER');
    }
  }, [createExplosion, triggerAchievement]);

  // Main Game Loop
  const gameLoop = useCallback((now: number) => {
    frameCountRef.current++;

    // Calculate FPS
    if (now - fpsTimerRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      fpsTimerRef.current = now;
    }

    if (screen === 'PLAYING') {
      const player = playerRef.current;
      const run = runStatsRef.current;
      const baseTopSpeed = 8 + selectedCar.topSpeed * 2.5;

      // Handle Nitro Acceleration
      if (player.isNitro && run.nitro > 0) {
        run.speed = Math.min(run.speed + 0.4, baseTopSpeed * 1.6);
        run.nitro = Math.max(0, run.nitro - 0.6);
        audioSynth.playNitroSound();
        if (canvasRef.current) {
          particlesRef.current.push({
            x: player.x + (Math.random() - 0.5) * 20,
            y: player.y + 40,
            vx: (Math.random() - 0.5) * 3,
            vy: 8 + Math.random() * 6,
            size: 3 + Math.random() * 4,
            color: '#00f2ff',
            life: 1.0,
            maxLife: 1.0,
            alpha: 1.0,
          });
        }
      } else {
        run.speed = Math.max(5, run.speed - 0.15);
        if (run.nitro < 100) run.nitro = Math.min(100, run.nitro + 0.15);
      }

      // Handle Steering Controls
      const steerSpeed = 10 + selectedCar.handling * 2.5;
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        player.targetX -= steerSpeed;
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        player.targetX += steerSpeed;
      }

      // Clamp Player inside Road Boundaries
      if (canvasRef.current) {
        const w = canvasRef.current.width;
        const leftLimit = w / 2 - 180;
        const rightLimit = w / 2 + 180;
        player.targetX = Math.max(leftLimit, Math.min(rightLimit, player.targetX));
      }

      // Smooth Lerp Steering
      player.x += (player.targetX - player.x) * 0.18;

      // Distance & Score progression
      run.distance += (run.speed * 0.002);
      const comboMult = player.doubleScoreActive ? 2 : 1;
      run.score += (run.speed * 0.2 * comboMult);
      setMultiplier(comboMult);

      // Random Spawning logic
      if (frameCountRef.current % Math.max(30, Math.floor(110 / (run.speed / 5))) === 0) {
        spawnEnemy();
      }
      if (frameCountRef.current % 320 === 0) {
        spawnPowerUp();
      }

      // Weather Cycle shift
      if (frameCountRef.current % 1200 === 0 && settings.weatherEnabled) {
        const weathers: WeatherType[] = ['CLEAR', 'RAIN', 'CYBER_STORM', 'FOG'];
        setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
      }

      // Magnet Attract Powerups
      if (player.magnetActive) {
        powerupsRef.current.forEach((pu) => {
          const dx = player.x - pu.x;
          const dy = player.y - pu.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            pu.x += (dx / dist) * 12;
            pu.y += (dy / dist) * 12;
          }
        });
      }

      // Update Enemies
      enemiesRef.current.forEach((enemy, idx) => {
        enemy.y += enemy.speed + run.speed * 0.4;

        // AABB Collision Detection
        if (
          Math.abs(enemy.x - player.x) < (enemy.width / 2 + player.width / 2 - 8) &&
          Math.abs(enemy.y - player.y) < (enemy.height / 2 + player.height / 2 - 8)
        ) {
          handleCollision(idx);
        }

        if (canvasRef.current && enemy.y > canvasRef.current.height + 100) {
          enemiesRef.current.splice(idx, 1);
        }
      });

      // Update Power-ups Collect
      powerupsRef.current.forEach((pu, idx) => {
        pu.y += run.speed * 0.5;

        if (
          Math.abs(pu.x - player.x) < (pu.radius + player.width / 2) &&
          Math.abs(pu.y - player.y) < (pu.radius + player.height / 2)
        ) {
          powerupsRef.current.splice(idx, 1);
          audioSynth.playCoinSound();

          if (pu.type === 'NITRO') {
            run.nitro = Math.min(100, run.nitro + 40);
            triggerAchievement('NITRO CELL RECHARGED!');
          } else if (pu.type === 'SHIELD') {
            player.shieldActive = true;
            triggerAchievement('ENERGY SHIELD ONLINE!');
          } else if (pu.type === 'DOUBLE_SCORE') {
            player.doubleScoreActive = true;
            setTimeout(() => { player.doubleScoreActive = false; }, 8000);
            triggerAchievement('2X COMBO MULTIPLIER!');
          } else if (pu.type === 'MAGNET') {
            player.magnetActive = true;
            setTimeout(() => { player.magnetActive = false; }, 8000);
            triggerAchievement('MAGNETIC FIELD ACTIVE!');
          } else if (pu.type === 'REPAIR') {
            run.lives = Math.min(maxLives, run.lives + 1);
            setLives(run.lives);
            triggerAchievement('HULL ARMOR REPAIRED!');
          } else if (pu.type === 'COIN') {
            run.coinsEarned += 25;
            triggerAchievement('+25 NEON CREDITS!');
          }
        }

        if (canvasRef.current && pu.y > canvasRef.current.height + 60) {
          powerupsRef.current.splice(idx, 1);
        }
      });

      // Update Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
          particlesRef.current.splice(idx, 1);
        }
      });

      // Decay Camera Shake
      if (cameraShakeRef.current > 0) {
        cameraShakeRef.current = Math.max(0, cameraShakeRef.current - 0.05);
      }

      // Update Engine Synthesizer Pitch
      audioSynth.updateEngine(run.speed / baseTopSpeed, true);

      // Push telemetry to React HUD state periodically
      setScore(Math.floor(run.score));
      setDistance(run.distance);
      setSpeed(run.speed);
      setNitro(run.nitro);
    } else {
      audioSynth.updateEngine(0, false);
    }

    // Render Canvas Frame
    if (rendererRef.current && canvasRef.current) {
      rendererRef.current.render(
        playerRef.current,
        enemiesRef.current,
        powerupsRef.current,
        particlesRef.current,
        runStatsRef.current.speed,
        weather,
        cameraShakeRef.current,
        settings,
        selectedCar.color
      );
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [screen, selectedCar, weather, settings, spawnEnemy, spawnPowerUp, handleCollision, triggerAchievement, maxLives]);

  // Start / Stop rAF loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  // Start New Game Mission
  const handleStartGame = () => {
    runStatsRef.current = { score: 0, distance: 0, speed: 6, nitro: 100, lives: 3, coinsEarned: 0 };
    playerRef.current = {
      x: canvasRef.current ? canvasRef.current.width / 2 : 0,
      y: canvasRef.current ? canvasRef.current.height * 0.78 : 0,
      targetX: canvasRef.current ? canvasRef.current.width / 2 : 0,
      lane: 1,
      width: 48,
      height: 86,
      isNitro: false,
      shieldActive: false,
      doubleScoreActive: false,
      magnetActive: false,
      shieldDuration: 0,
      doubleScoreDuration: 0,
      magnetDuration: 0,
      skinId: selectedCarId,
    };
    enemiesRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    setIsNewHighScore(false);
    setLives(3);
    setScore(0);
    setDistance(0);
    setScreen('PLAYING');
    audioSynth.startMusic();
  };

  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-orbitron">
      {/* --- Main Game Canvas --- */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* --- CRT Scanlines Effect Overlay --- */}
      {settings.crtFilter && <div className="crt-overlay fixed inset-0 pointer-events-none z-30" />}

      {/* --- Vignette Overlay --- */}
      <div className="cyber-vignette fixed inset-0 pointer-events-none z-20" />

      {/* --- HUD Overlay (When Playing or Paused) --- */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <HUD
          score={score}
          highScore={highScore}
          distance={distance}
          speed={speed}
          nitro={nitro}
          lives={lives}
          maxLives={maxLives}
          coins={coins}
          multiplier={multiplier}
          weather={weather}
          fps={fps}
          player={playerRef.current}
          enemies={enemiesRef.current}
          powerups={powerupsRef.current}
          achievementText={achievementText}
          settings={settings}
          renderer={rendererRef.current}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => {
            audioSynth.stopMusic();
            setScreen('PAUSED');
          }}
        />
      )}

      {/* --- Mobile On-Screen Controls --- */}
      {screen === 'PLAYING' && (
        <MobileControls
          onSteerLeftStart={() => { keysRef.current['ArrowLeft'] = true; }}
          onSteerLeftEnd={() => { keysRef.current['ArrowLeft'] = false; }}
          onSteerRightStart={() => { keysRef.current['ArrowRight'] = true; }}
          onSteerRightEnd={() => { keysRef.current['ArrowRight'] = false; }}
          onNitroStart={() => { playerRef.current.isNitro = true; }}
          onNitroEnd={() => { playerRef.current.isNitro = false; }}
          onPause={() => { setScreen('PAUSED'); }}
        />
      )}

      {/* --- Main Menu Screen --- */}
      {screen === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenGarage={() => setScreen('GARAGE')}
          onOpenLeaderboard={() => setScreen('LEADERBOARD')}
          onOpenSettings={() => setScreen('SETTINGS')}
          selectedCar={selectedCar}
          coins={coins}
          highScore={highScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* --- Garage Car Customization Modal --- */}
      {screen === 'GARAGE' && (
        <GarageModal
          onClose={() => setScreen('MENU')}
          coins={coins}
          selectedCarId={selectedCarId}
          onSelectCar={(carId) => setSelectedCarId(carId)}
          onCoinsUpdated={(newCoins) => setCoins(newCoins)}
        />
      )}

      {/* --- System Configuration Modal --- */}
      {screen === 'SETTINGS' && (
        <SettingsModal
          onClose={() => setScreen('MENU')}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
        />
      )}

      {/* --- Leaderboard Modal --- */}
      {screen === 'LEADERBOARD' && (
        <LeaderboardModal onClose={() => setScreen('MENU')} />
      )}

      {/* --- Pause Modal --- */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            audioSynth.startMusic();
            setScreen('PLAYING');
          }}
          onOpenSettings={() => setScreen('SETTINGS')}
          onQuit={() => {
            audioSynth.stopMusic();
            setScreen('MENU');
          }}
        />
      )}

      {/* --- Game Over Screen Modal --- */}
      {screen === 'GAMEOVER' && (
        <GameOverModal
          score={score}
          distance={distance}
          coinsEarned={runStatsRef.current.coinsEarned}
          carName={selectedCar.name}
          isNewHighScore={isNewHighScore}
          onRestart={handleStartGame}
          onMainMenu={() => setScreen('MENU')}
        />
      )}
    </div>
  );
}
