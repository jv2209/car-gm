import { PlayerCar, EnemyVehicle, PowerUpItem, ParticleEffect, WeatherType, GameSettings } from '../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private frameCount: number = 0;
  private stars: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
  private cityBuildings: Array<{ x: number; width: number; height: number; color: string; neonColor: string }> = [];
  private raindrops: Array<{ x: number; y: number; length: number; speed: number }> = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initBackgroundElements();
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initBackgroundElements();
  }

  private initBackgroundElements() {
    // Generate Stars
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * (this.width || 1000),
        y: Math.random() * ((this.height || 600) * 0.45),
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random(),
      });
    }

    // Generate City Buildings
    this.cityBuildings = [];
    const colors = ['#0f051d', '#140828', '#0b021a', '#18022b'];
    const neonColors = ['#00f2ff', '#ff00ff', '#bc13fe', '#39ff14', '#ffd700'];
    let currentX = 0;
    while (currentX < (this.width || 1000) + 200) {
      const bWidth = 40 + Math.random() * 60;
      const bHeight = 80 + Math.random() * 140;
      this.cityBuildings.push({
        x: currentX,
        width: bWidth,
        height: bHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        neonColor: neonColors[Math.floor(Math.random() * neonColors.length)],
      });
      currentX += bWidth + Math.random() * 15;
    }

    // Rain drops
    this.raindrops = [];
    for (let i = 0; i < 80; i++) {
      this.raindrops.push({
        x: Math.random() * (this.width || 1000),
        y: Math.random() * (this.height || 600),
        length: 10 + Math.random() * 20,
        speed: 12 + Math.random() * 10,
      });
    }
  }

  public render(
    player: PlayerCar,
    enemies: EnemyVehicle[],
    powerups: PowerUpItem[],
    particles: ParticleEffect[],
    speed: number,
    weather: WeatherType,
    cameraShake: number,
    settings: GameSettings,
    carColor: string = '#00f2ff'
  ) {
    this.frameCount++;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Camera Shake Matrix
    if (cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * cameraShake * 12;
      const shakeY = (Math.random() - 0.5) * cameraShake * 12;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Cyberpunk Sky Gradient
    const horizonY = h * 0.38;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGradient.addColorStop(0, '#02000a');
    skyGradient.addColorStop(0.5, '#12002b');
    skyGradient.addColorStop(1, '#2c004d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Stars
    ctx.fillStyle = '#ffffff';
    this.stars.forEach((star) => {
      star.y += star.speed + speed * 0.02;
      if (star.y > horizonY) {
        star.y = 0;
        star.x = Math.random() * w;
      }
      ctx.globalAlpha = 0.3 + Math.sin(this.frameCount * 0.05 + star.x) * 0.4;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1.0;

    // 3. Cyber Synth Sun on Horizon
    const sunRadius = Math.min(w, h) * 0.14;
    const sunX = w / 2;
    const sunY = horizonY - 10;
    const sunGradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGradient.addColorStop(0, '#ff0077');
    sunGradient.addColorStop(0.5, '#ff00ff');
    sunGradient.addColorStop(1, '#ffe600');

    ctx.save();
    ctx.fillStyle = sunGradient;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Horizontal scanlines across Sun
    ctx.fillStyle = '#12002b';
    for (let i = 0; i < 8; i++) {
      const lineY = sunY - sunRadius * 0.2 + i * 8;
      const lineHeight = 1.5 + i * 0.8;
      if (lineY < sunY + sunRadius) {
        ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, lineHeight);
      }
    }

    // 4. Megacity Skyline
    this.cityBuildings.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, horizonY - b.height, b.width, b.height);

      // Neon roof outline / windows
      ctx.strokeStyle = b.neonColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(b.x, horizonY - b.height, b.width, b.height);

      // Random glowing windows
      ctx.fillStyle = b.neonColor;
      for (let wy = horizonY - b.height + 10; wy < horizonY - 10; wy += 15) {
        if (Math.sin(b.x + wy) > 0.2) {
          ctx.fillRect(b.x + 6, wy, 4, 6);
          ctx.fillRect(b.x + b.width - 10, wy, 4, 6);
        }
      }
      ctx.globalAlpha = 1.0;
    });

    // 5. Road Horizon Fog/Haze
    const fogGradient = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 30);
    fogGradient.addColorStop(0, 'rgba(44, 0, 77, 0)');
    fogGradient.addColorStop(0.5, 'rgba(188, 19, 254, 0.4)');
    fogGradient.addColorStop(1, 'rgba(10, 10, 20, 0.95)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, horizonY - 40, w, 70);

    // 6. Road Surface (Pseudo-3D Trapezoid)
    const roadTopWidth = w * 0.18;
    const roadBottomWidth = w * 0.85;
    const roadTopX = w / 2 - roadTopWidth / 2;
    const roadBottomX = w / 2 - roadBottomWidth / 2;

    // Road Base
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.moveTo(roadTopX, horizonY);
    ctx.lineTo(roadTopX + roadTopWidth, horizonY);
    ctx.lineTo(roadBottomX + roadBottomWidth, h);
    ctx.lineTo(roadBottomX, h);
    ctx.closePath();
    ctx.fill();

    // Road Surface Grid Texture & Wet Reflections
    const roadGradient = ctx.createLinearGradient(0, horizonY, 0, h);
    roadGradient.addColorStop(0, 'rgba(0, 242, 255, 0.05)');
    roadGradient.addColorStop(0.5, 'rgba(188, 19, 254, 0.12)');
    roadGradient.addColorStop(1, 'rgba(0, 242, 255, 0.02)');
    ctx.fillStyle = roadGradient;
    ctx.fill();

    // 7. Perspective Edge Barriers (Glowing Neon Borders)
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f2ff';
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 5;

    // Left Outer Border
    ctx.beginPath();
    ctx.moveTo(roadTopX, horizonY);
    ctx.lineTo(roadBottomX, h);
    ctx.stroke();

    // Right Outer Border
    ctx.shadowColor = '#ff00ff';
    ctx.strokeStyle = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(roadTopX + roadTopWidth, horizonY);
    ctx.lineTo(roadBottomX + roadBottomWidth, h);
    ctx.stroke();
    ctx.restore();

    // 8. Dynamic Moving Lane Dividers (4 Lanes = 3 Divider Lines)
    const speedOffset = (this.frameCount * speed * 2) % 100;
    const totalDashes = 14;

    for (let laneIdx = 1; laneIdx <= 3; laneIdx++) {
      const topLaneX = roadTopX + (roadTopWidth / 4) * laneIdx;
      const bottomLaneX = roadBottomX + (roadBottomWidth / 4) * laneIdx;

      for (let d = 0; d < totalDashes; d++) {
        const p1 = Math.pow((d + speedOffset / 100) / totalDashes, 2);
        const p2 = Math.pow((d + 0.5 + speedOffset / 100) / totalDashes, 2);

        if (p1 >= 0 && p2 <= 1) {
          const y1 = horizonY + (h - horizonY) * p1;
          const y2 = horizonY + (h - horizonY) * p2;
          const x1 = topLaneX + (bottomLaneX - topLaneX) * p1;
          const x2 = topLaneX + (bottomLaneX - topLaneX) * p2;

          ctx.strokeStyle = 'rgba(0, 242, 255, ' + (0.15 + p2 * 0.6) + ')';
          ctx.lineWidth = 1 + p2 * 4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // 9. Speed Lines on Screen Edges (High speed effect)
    if (speed > 12) {
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const lineAngle = (Math.random() - 0.5) * 0.5;
        const lineY = Math.random() * h;
        const lineLen = 40 + speed * 6;
        const isLeft = Math.random() > 0.5;
        const startX = isLeft ? Math.random() * (w * 0.15) : w - Math.random() * (w * 0.15);

        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(startX + Math.cos(lineAngle) * lineLen, lineY + Math.sin(lineAngle) * lineLen);
        ctx.stroke();
      }
    }

    // 10. Draw Power-Ups
    powerups.forEach((pu) => {
      const pY = pu.y;
      if (pY >= horizonY && pY <= h) {
        const ratio = (pY - horizonY) / (h - horizonY);
        const scale = 0.3 + ratio * 1.1;

        ctx.save();
        ctx.translate(pu.x, pY);
        ctx.scale(scale, scale);

        // Glow aura
        ctx.shadowBlur = 20;
        let pColor = '#00f2ff';
        let pIcon = '⚡';

        if (pu.type === 'MAGNET') { pColor = '#bc13fe'; pIcon = '🧲'; }
        else if (pu.type === 'SHIELD') { pColor = '#39ff14'; pIcon = '🛡️'; }
        else if (pu.type === 'DOUBLE_SCORE') { pColor = '#ff00ff'; pIcon = '2x'; }
        else if (pu.type === 'REPAIR') { pColor = '#ff0055'; pIcon = '🔧'; }
        else if (pu.type === 'COIN') { pColor = '#ffd700'; pIcon = '🪙'; }

        ctx.shadowColor = pColor;
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, pu.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.fillStyle = pColor;
        ctx.font = 'bold 16px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pIcon, 0, 1);

        ctx.restore();
      }
    });

    // 11. Draw Traffic Vehicles
    enemies.forEach((enemy) => {
      const eY = enemy.y;
      if (eY >= horizonY - 20 && eY <= h + 50) {
        const ratio = Math.max(0, (eY - horizonY) / (h - horizonY));
        const scale = 0.3 + ratio * 1.1;

        ctx.save();
        ctx.translate(enemy.x, eY);
        ctx.scale(scale, scale);

        // Vehicle Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-enemy.width / 2, enemy.height / 2 - 5, enemy.width, 12);

        // Vehicle Body
        ctx.shadowBlur = 15;
        ctx.shadowColor = enemy.color;
        ctx.fillStyle = '#111122';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2.5;

        // Draw car chassis
        ctx.beginPath();
        ctx.roundRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height, [8]);
        ctx.fill();
        ctx.stroke();

        // Windshield
        ctx.fillStyle = enemy.type === 'POLICE' ? 'rgba(255, 0, 85, 0.5)' : 'rgba(0, 242, 255, 0.4)';
        ctx.fillRect(-enemy.width * 0.35, -enemy.height * 0.2, enemy.width * 0.7, enemy.height * 0.3);

        // Taillights
        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 12;
        ctx.fillRect(-enemy.width * 0.4, enemy.height / 2 - 6, 12, 6);
        ctx.fillRect(enemy.width * 0.4 - 12, enemy.height / 2 - 6, 12, 6);

        // Police strobe lights
        if (enemy.type === 'POLICE') {
          const isRed = Math.floor(this.frameCount / 6) % 2 === 0;
          ctx.fillStyle = isRed ? '#ff0055' : '#00f2ff';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 20;
          ctx.fillRect(-8, -enemy.height / 2 + 8, 16, 6);
        }

        ctx.restore();
      }
    });

    // 12. Draw Player Cyber Car
    const pY = player.y;
    ctx.save();
    ctx.translate(player.x, pY);

    // Suspension sway during steering tilt
    const swayTilt = (player.targetX - player.x) * 0.03;
    ctx.rotate(swayTilt);

    // Active Shield Aura
    if (player.shieldActive) {
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#39ff14';
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.height * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(57, 255, 20, 0.12)';
      ctx.fill();
      ctx.restore();
    }

    // Magnet Aura Effect
    if (player.magnetActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(188, 19, 254, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -this.frameCount * 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.height * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Nitro Engine Thrust Flame
    if (player.isNitro) {
      ctx.save();
      const flameLen = 30 + Math.random() * 25;
      const flameGradient = ctx.createLinearGradient(0, player.height / 2, 0, player.height / 2 + flameLen);
      flameGradient.addColorStop(0, '#ffffff');
      flameGradient.addColorStop(0.3, '#00f2ff');
      flameGradient.addColorStop(0.8, '#ff00ff');
      flameGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGradient;
      ctx.shadowColor = '#00f2ff';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.moveTo(-12, player.height / 2);
      ctx.lineTo(0, player.height / 2 + flameLen);
      ctx.lineTo(12, player.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Car Underglow Neon
    ctx.shadowBlur = 25;
    ctx.shadowColor = carColor;
    ctx.fillStyle = carColor;
    ctx.fillRect(-player.width / 2 + 4, -player.height / 2 + 4, player.width - 8, player.height - 8);

    // Car Chassis
    ctx.fillStyle = '#080814';
    ctx.strokeStyle = carColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, [10]);
    ctx.fill();
    ctx.stroke();

    // Windshield & Canopy
    ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
    ctx.shadowColor = '#00f2ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(-player.width * 0.32, -player.height * 0.25, player.width * 0.64, player.height * 0.35);

    // Front Headlights
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.fillRect(-player.width * 0.42, -player.height / 2 - 2, 10, 5);
    ctx.fillRect(player.width * 0.42 - 10, -player.height / 2 - 2, 10, 5);

    // Rear Taillights
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.fillRect(-player.width * 0.4, player.height / 2 - 4, 12, 5);
    ctx.fillRect(player.width * 0.4 - 12, player.height / 2 - 4, 12, 5);

    ctx.restore();

    // 13. Particles System
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = settings.graphicsQuality === 'HIGH' ? 12 : 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 14. Weather System (Rain effect)
    if (settings.weatherEnabled && (weather === 'RAIN' || weather === 'CYBER_STORM')) {
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.45)';
      ctx.lineWidth = 1.2;
      this.raindrops.forEach((drop) => {
        drop.y += drop.speed + speed * 0.2;
        drop.x -= 2;
        if (drop.y > h) {
          drop.y = 0;
          drop.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 4, drop.y + drop.length);
        ctx.stroke();
      });

      if (weather === 'CYBER_STORM' && Math.random() < 0.012) {
        // Lightning flash
        ctx.fillStyle = 'rgba(0, 242, 255, 0.2)';
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.restore();
  }

  // Draw Mini-Map Radar in HUD
  public renderMiniMap(
    ctx: CanvasRenderingContext2D,
    player: PlayerCar,
    enemies: EnemyVehicle[],
    powerups: PowerUpItem[]
  ) {
    const mw = 120;
    const mh = 120;
    ctx.save();
    ctx.clearRect(0, 0, mw, mh);

    // Mini Map Background
    ctx.fillStyle = 'rgba(5, 5, 18, 0.85)';
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, mw, mh, [8]);
    ctx.fill();
    ctx.stroke();

    // Grid radar lines
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mw / 2, 0); ctx.lineTo(mw / 2, mh);
    ctx.moveTo(0, mh / 2); ctx.lineTo(mw, mh / 2);
    ctx.stroke();

    // Radar scan wave
    const scanY = (this.frameCount * 2) % mh;
    ctx.fillStyle = 'rgba(0, 242, 255, 0.08)';
    ctx.fillRect(0, scanY, mw, 8);

    // Player Blip
    ctx.fillStyle = '#00f2ff';
    ctx.shadowColor = '#00f2ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(mw / 2, mh * 0.82, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Enemy Blips
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    enemies.forEach((enemy) => {
      const relY = ((enemy.y - (this.height * 0.75)) / this.height) * mh;
      const relX = ((enemy.x - (this.width / 2)) / (this.width * 0.5)) * mw + mw / 2;
      if (relX >= 5 && relX <= mw - 5 && relY >= 5 && relY <= mh - 5) {
        ctx.beginPath();
        ctx.arc(relX, relY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // PowerUp Blips
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    powerups.forEach((pu) => {
      const relY = ((pu.y - (this.height * 0.75)) / this.height) * mh;
      const relX = ((pu.x - (this.width / 2)) / (this.width * 0.5)) * mw + mw / 2;
      if (relX >= 5 && relX <= mw - 5 && relY >= 5 && relY <= mh - 5) {
        ctx.beginPath();
        ctx.arc(relX, relY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
