import React, { useRef, useEffect, useState } from 'react';
import { EffectState, AudioSettings, RenderDuration, IntensityLevel, TextLayer } from '../types';
import { ambiance } from '../utils/audio';
import { Play, Pause, Download, AlertTriangle, Sparkles, Video, Volume2, ShieldAlert } from 'lucide-react';

interface CanvasRendererProps {
  effectState: EffectState;
  audioSettings: AudioSettings;
  backgroundImage: string | null;
  imageFit: 'cover' | 'contain';
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  cinemaMode: boolean;
  textLayers: TextLayer[];
}

interface SnowParticle {
  x: number;
  y: number;
  r: number;
  speed: number;
  swing: number;
  swingPhase: number;
  depthLayer: number; // 0 = far, 1 = mid, 2 = near
}

interface RainParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  depthLayer: number; // 0 = far, 1 = mid, 2 = near
}

interface MeteorParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  size: number;
}

interface DustMote {
  x: number;
  y: number;
  r: number;
  speed: number;
  angle: number;
  opacityMultiplier: number;
}

interface LightningSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  isMain: boolean;
}

// Coefficient helper based on Light, Medium, Heavy, Extreme presets
export const getScaleFactor = (level: IntensityLevel): number => {
  switch (level) {
    case 'light': return 0.5;
    case 'medium': return 1.0;
    case 'heavy': return 1.75;
    case 'extreme': return 2.8;
    default: return 1.0;
  }
};

// Map Blend Mode to Canvas composite operation
const getCanvasCompositeOperation = (mode: string): GlobalCompositeOperation => {
  switch (mode) {
    case 'screen': return 'screen';
    case 'lighten': return 'lighten';
    case 'overlay': return 'overlay';
    case 'soft-light': return 'soft-light';
    case 'normal':
    default:
      return 'source-over';
  }
};

export default function CanvasRenderer({
  effectState,
  audioSettings,
  backgroundImage,
  imageFit,
  playing,
  setPlaying,
  cinemaMode,
  textLayers,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Loaded image cache
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);

  // Local state for recording
  const [duration, setDuration] = useState<RenderDuration>(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(0);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  // Audio start modal overlay/trigger
  const [showAudioConsent, setShowAudioConsent] = useState(false);

  // References for rendering lists to avoid recreation stutter
  const snowParticles = useRef<SnowParticle[]>([]);
  const rainParticles = useRef<RainParticle[]>([]);
  const meteorShower = useRef<MeteorParticle[]>([]);
  const dustMotes = useRef<DustMote[]>([]);
  
  const spotlightSwing = useRef<{ phase: number; targetAngle: number }[]>([]);

  // Audio visualizer dummy buffer for math-motion
  const audioWavePhase = useRef<number>(0);

  // Trigger state for thunder lightning flash timer & recursive tree elements
  const lightningIntensity = useRef<number>(0);
  const lightningType = useRef<'burst' | 'strike' | 'none'>('none');
  const nextLightningTime = useRef<number>(Date.now() + 3000);
  const lightningPathSegments = useRef<LightningSegment[]>([]);

  // Extra references for custom music effects
  const musicParticlesList = useRef<{x: number; y: number; speed: number; angle: number; size: number; opacity: number}[]>([]);
  const vinylAnglePhase = useRef<number>(0);
  const musicPlayerTime = useRef<number>(0);

  // Load image whenever path changes
  useEffect(() => {
    if (!backgroundImage) {
      setLoadedImg(null);
      setImgError(null);
      return;
    }

    const img = new Image();
    img.src = backgroundImage;
    img.crossOrigin = 'anonymous'; // Support cross-origin video recording
    
    img.onload = () => {
      setLoadedImg(img);
      setImgError(null);
    };

    img.onerror = () => {
      setLoadedImg(img);
      setImgError('Không thể tải ảnh này. Vui lòng thử ảnh khác hoặc sử dụng hình nền mặc định.');
    };
  }, [backgroundImage]);

  // Handle Play/Pause change for audio context sync
  useEffect(() => {
    if (playing) {
      if (audioSettings.enabled) {
        ambiance.start(audioSettings).catch(err => {
          console.error('Autoplay block:', err);
          setShowAudioConsent(true);
        });
      }
    } else {
      ambiance.stop();
    }
  }, [playing, audioSettings.enabled]);

  // Keep synth volumes updated with slider movements instantly
  useEffect(() => {
    if (playing) {
      ambiance.updateVolumes(audioSettings);
    }
  }, [audioSettings, playing]);

  // Safe manual audio activation
  const handleEnableAudioNow = async () => {
    setShowAudioConsent(false);
    setPlaying(true);
    await ambiance.start({ ...audioSettings, enabled: true });
  };

  // 1) Initialize/Sync Snow systems dynamically matching intensity
  useEffect(() => {
    const s = effectState.snowDepth;
    const current = snowParticles.current;
    
    const intensityMult = getScaleFactor(effectState.intensityLevel);
    const targetCount = Math.round(s.intensity * 3.5 * intensityMult);

    if (current.length < targetCount) {
      for (let i = current.length; i < targetCount; i++) {
        const depthLayer = i % 3;
        current.push({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          r: (0.5 + Math.random() * 0.8),
          speed: (0.4 + Math.random() * 0.6) * 1.5,
          swing: 0.4 + Math.random() * 1.0,
          swingPhase: Math.random() * Math.PI * 2,
          depthLayer,
        });
      }
    } else if (current.length > targetCount) {
      snowParticles.current = current.slice(0, targetCount);
    }
  }, [effectState.snowDepth.intensity, effectState.intensityLevel]);

  // 2) Initialize/Sync Rain systems dynamically
  useEffect(() => {
    const r = effectState.rainSpace;
    const current = rainParticles.current;

    const intensityMult = getScaleFactor(effectState.intensityLevel);
    const targetCount = Math.round(r.intensity * 4.0 * intensityMult);

    if (current.length < targetCount) {
      for (let i = current.length; i < targetCount; i++) {
        const depthLayer = i % 3;
        current.push({
          x: Math.random() * 2200 - 150,
          y: Math.random() * 1080 - 200,
          length: (0.7 + Math.random() * 0.6),
          speed: (0.8 + Math.random() * 0.6) * 2.0,
          opacity: 0.2 + Math.random() * 0.5,
          depthLayer,
        });
      }
    } else if (current.length > targetCount) {
      rainParticles.current = current.slice(0, targetCount);
    }
  }, [effectState.rainSpace.intensity, effectState.intensityLevel]);

  // 3) Sync Twinkling Stage Fog / Dust Motes
  useEffect(() => {
    if (dustMotes.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        dustMotes.current.push({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          r: 1.0 + Math.random() * 3.0,
          speed: 0.15 + Math.random() * 0.45,
          angle: Math.random() * Math.PI * 2,
          opacityMultiplier: 0.2 + Math.random() * 0.8,
        });
      }
    }
  }, []);

  // 4) Initial Spotlights Swinging Phases
  useEffect(() => {
    if (spotlightSwing.current.length < 12) {
      const swings = [];
      for (let i = 0; i < 12; i++) {
        swings.push({
          phase: i * (Math.PI / 4.0) + Math.random() * 0.5,
          targetAngle: 0,
        });
      }
      spotlightSwing.current = swings;
    }
  }, []);

  // Recursive Lightning bolt lines builder of tree-fork segments
  const generateLightningBoltSegments = (
    startX: number,
    startY: number,
    endY: number,
    thickness: number,
    multiplier: number
  ): LightningSegment[] => {
    const list: LightningSegment[] = [];

    const recurse = (sx: number, sy: number, ey: number, thick: number, currentLvl: number, isMain: boolean) => {
      let cx = sx;
      let cy = sy;
      
      while (cy < ey) {
        const stepY = cy + 18 + Math.random() * 35;
        const stepX = cx + (Math.random() - 0.5) * 60;

        list.push({
          startX: cx,
          startY: cy,
          endX: stepX,
          endY: stepY,
          thickness: thick,
          isMain,
        });

        if (currentLvl > 1 && Math.random() < 0.14 * multiplier) {
          const forkEy = Math.min(1080, stepY + 110 + Math.random() * 210);
          recurse(stepX, stepY, forkEy, thick * 0.50, currentLvl - 1, false);
        }

        cx = stepX;
        cy = stepY;
      }
    };

    recurse(startX, startY, endY, thickness, 3, true);
    return list;
  };

  // Animation Loop Function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const drawFrame = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTime) / 16.666, 4.0);
      lastTime = timestamp;

      const scale = getScaleFactor(effectState.intensityLevel);

      // 1. Draw Static / Preset Backing Canvas
      if (loadedImg) {
        ctx.fillStyle = '#07050d';
        ctx.fillRect(0, 0, 1920, 1080);

        const imgRatio = loadedImg.width / loadedImg.height;
        const canvasRatio = 1920 / 1080;

        let renderW, renderH, x, y;
        if (imageFit === 'cover') {
          if (imgRatio > canvasRatio) {
            renderH = 1080;
            renderW = 1080 * imgRatio;
            x = (1920 - renderW) / 2;
            y = 0;
          } else {
            renderW = 1920;
            renderH = 1920 / imgRatio;
            x = 0;
            y = (1080 - renderH) / 2;
          }
        } else {
          if (imgRatio > canvasRatio) {
            renderW = 1920;
            renderH = 1920 / imgRatio;
            x = 0;
            y = (1080 - renderH) / 2;
          } else {
            renderH = 1080;
            renderW = 1080 * imgRatio;
            x = (1920 - renderW) / 2;
            y = 0;
          }
        }
        ctx.drawImage(loadedImg, x, y, renderW, renderH);
      } else {
        // Ambient background generator
        const grad = ctx.createLinearGradient(0, 0, 0, 1080);
        grad.addColorStop(0, '#040209'); // deeper rich velvet dark
        grad.addColorStop(0.5, '#0e0b1d'); // twilight ambient indigo
        grad.addColorStop(1, '#030106');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Ambient radial studio center blur glow
        const rGrad = ctx.createRadialGradient(960, 540, 30, 960, 540, 750);
        rGrad.addColorStop(0, 'rgba(168, 85, 247, 0.13)'); // soft warm purple-500
        rGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)'); // cyan sky hue
        rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Perspective grid floor matrix
        ctx.save();
        const horizon = 540;
        for (let y = horizon; y < 1080; y += 28) {
          const travel = (y - horizon) / 540;
          ctx.strokeStyle = `rgba(168, 85, 247, ${travel * 0.12})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1920, y);
          ctx.stroke();
        }
        for (let x = -700; x <= 2620; x += 150) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(960, horizon - 10);
          ctx.lineTo(x, 1080);
          ctx.stroke();
        }
        ctx.restore();

        // Welcome text label matching guidelines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '300 22px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chọn / Tải ảnh lên để hòa trộn hoạt ảnh sống động...', 960, 480);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.font = '550 11px "JetBrains Mono", monospace';
        ctx.fillText('HỖ TRỢ KÉO THẢ TỆP TIN - PHÁT TỰ ĐỘNG THU ÂM', 960, 515);
      }

      // --- RENDER ORDER ARRANGED BY BEHIND & FRONT CHARACTER DEPTHS ---

      // 2. Stage Lights (Spotlights)
      const sl = effectState.stageLight;
      if (sl.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(sl.blendMode);

        let activeColor = { r: 34, g: 211, b: 238 }; // Cyan-400 default
        if (sl.color.startsWith('#')) {
          const r = parseInt(sl.color.substring(1, 3), 16);
          const g = parseInt(sl.color.substring(3, 5), 16);
          const b = parseInt(sl.color.substring(5, 7), 16);
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            activeColor = { r, g, b };
          }
        }

        // Intensity maps to beam count (1 to 6)
        const beamCount = Math.max(1, Math.min(6, Math.round((sl.intensity / 100) * 5) + 1));
        const spacing = 1920 / (beamCount + 1);
        const positions: number[] = [];
        
        // Handle position aligning
        let startY = 0;
        let scaleY = 1.0;
        if (sl.position === 'bottom') {
          startY = 1080;
          scaleY = -1.0;
        }

        for (let i = 1; i <= beamCount; i++) {
          positions.push(i * spacing);
        }

        positions.forEach((topX, idx) => {
          const swingConfig = spotlightSwing.current[idx] || { phase: idx * 0.8, targetAngle: 0 };
          
          if (playing) {
            swingConfig.phase += 0.0006 * sl.speed * delta;
          }

          const maxSwingRad = (24 * Math.PI) / 180;
          const currentAngle = Math.sin(swingConfig.phase) * maxSwingRad;

          const targetFloorX = topX + Math.sin(currentAngle) * 980 * scaleY;
          // Width based on size slider
          const baseWidth = (sl.size / 100) * 800 * (0.8 + scale * 0.2);

          const gradient = ctx.createLinearGradient(topX, startY, targetFloorX, startY + 1080 * scaleY);
          gradient.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${(sl.opacity / 100) * 0.55})`);
          gradient.addColorStop(0.4, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${(sl.opacity / 100) * 0.22})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(topX - 30, startY);
          ctx.lineTo(topX + 30, startY);
          ctx.lineTo(targetFloorX + baseWidth / 2, startY + 1080 * scaleY);
          ctx.lineTo(targetFloorX - baseWidth / 2, startY + 1080 * scaleY);
          ctx.closePath();
          ctx.fill();

          // Flare Core
          if (sl.glow > 0) {
            const bloom = sl.glow * (0.85 + scale * 0.35);
            const emissionRadial = ctx.createRadialGradient(topX, startY, 4, topX, startY, 85);
            emissionRadial.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${(sl.opacity / 100) * 0.9})`);
            emissionRadial.addColorStop(0.4, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${(sl.opacity / 100) * 0.3})`);
            emissionRadial.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.save();
            ctx.shadowColor = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.8)`;
            ctx.shadowBlur = bloom;
            ctx.fillStyle = emissionRadial;
            ctx.beginPath();
            if (sl.position === 'bottom') {
              ctx.arc(topX, startY, 85, Math.PI, 0, false);
            } else {
              ctx.arc(topX, startY, 85, 0, Math.PI, false);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });
        
        // Haze/fog dust inside spotlights
        if (sl.glow > 20) {
          ctx.save();
          dustMotes.current.forEach(m => {
            if (playing) {
              m.y -= m.speed * delta;
              m.angle += 0.015 * delta;
              m.x += Math.sin(m.angle) * 0.2 * delta;

              if (m.y < -15) {
                m.y = 1095;
                m.x = Math.random() * 1920;
              }
            }

            const glowOpacity = (sl.opacity / 100) * m.opacityMultiplier * 0.3 * (0.8 + scale * 0.2);
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r * (0.8 + scale * 0.2), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${glowOpacity})`;
            ctx.shadowColor = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.75)`;
            ctx.shadowBlur = sl.glow * 0.2 + (scale * 2);
            ctx.fill();
          });
          ctx.restore();
        }
        ctx.restore();
      }

      // 3. Meteor Shower (meteorDream)
      const md = effectState.meteorDream;
      if (md.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(md.blendMode);

        const activeMeteors = meteorShower.current;
        const spawnOdds = (md.intensity / 100) * 0.16 * scale;
        
        if (playing && Math.random() < spawnOdds * delta) {
          const maxTail = (md.size / 100) * 180 * (0.8 + Math.random() * 0.4);
          activeMeteors.push({
            x: Math.random() * 1600 + 300,
            y: -100,
            length: maxTail,
            speed: (md.speed / 100) * 18.0 * (0.8 + Math.random() * 0.5),
            opacity: (md.opacity / 100) * (0.4 + Math.random() * 0.6),
            size: (2.0 + Math.random() * 3.5) * (md.size / 50.0),
          });
        }

        for (let i = activeMeteors.length - 1; i >= 0; i--) {
          const m = activeMeteors[i];
          const angleRad = (40 * Math.PI) / 180; // 40 degrees angle
          
          if (playing) {
            m.x -= Math.sin(angleRad) * m.speed * delta;
            m.y += Math.cos(angleRad) * m.speed * delta;
          }

          if (m.y > 1150 || m.x < -200) {
            activeMeteors.splice(i, 1);
            continue;
          }

          const tipX = m.x;
          const tipY = m.y;
          const tailX = m.x + Math.sin(angleRad) * m.length;
          const tailY = m.y - Math.cos(angleRad) * m.length;

          const meteorGrad = ctx.createLinearGradient(tipX, tipY, tailX, tailY);
          meteorGrad.addColorStop(0, md.color);
          meteorGrad.addColorStop(0.3, `rgba(255, 255, 255, ${m.opacity * 0.85})`);
          meteorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.lineCap = 'round';
          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = Math.max(1, m.size);
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Meteor core glow head
          if (md.glow > 0) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = md.color;
            ctx.shadowBlur = md.glow * (0.7 + scale * 0.3);
            ctx.beginPath();
            ctx.arc(tipX, tipY, m.size * 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      }

      // 4. Rain Overlays (rainSpace)
      const rs = effectState.rainSpace;
      if (rs.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(rs.blendMode);
        ctx.lineCap = 'round';

        rainParticles.current.forEach(r => {
          let layerSpeedFactor = 1.0;
          if (r.depthLayer === 0) layerSpeedFactor = 0.55; // Far (Rơi chậm)
          else if (r.depthLayer === 2) layerSpeedFactor = 1.6;  // Foreground (Rơi nhanh)

          if (playing) {
            const windStrength = 3.0; // static default wind wiggle
            r.y += r.speed * (rs.speed / 50.0) * layerSpeedFactor * delta;
            r.x += -1.5 * windStrength * 0.15 * delta; // slight left slanting wind

            if (r.y > 1080 + 40) {
              r.y = -60;
              r.x = Math.random() * 2100 - 100;
            }
          }

          // Compute size and lengths based on size slider (0-100)
          let finalLength = (rs.size / 100) * 35.0 * r.length;
          let finalThickness = (rs.size / 100) * 3.5 * (r.depthLayer === 0 ? 0.6 : r.depthLayer === 1 ? 1.0 : 1.7);
          
          if (r.depthLayer === 0) finalLength *= 0.6;
          else if (r.depthLayer === 2) finalLength *= 1.6;

          let baseOpacity = rs.opacity / 100.0;
          if (r.depthLayer === 0) baseOpacity *= 0.4;
          else if (r.depthLayer === 1) baseOpacity *= 0.8;

          ctx.strokeStyle = rs.color;
          ctx.lineWidth = Math.max(0.6, finalThickness);
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 2.5, r.y + finalLength);
          ctx.globalAlpha = baseOpacity;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        });
        ctx.restore();
      }

      // 5. Thunder & Lightning Strike (stormElectric)
      const se = effectState.stormElectric;
      if (se.enabled) {
        const now = Date.now();

        if (playing && now > nextLightningTime.current) {
          const spawnProb = (se.intensity / 100) * 0.85;
          if (Math.random() < spawnProb) {
            lightningType.current = Math.random() > 0.4 ? 'strike' : 'burst';
            lightningIntensity.current = 0.5 + Math.random() * 0.5;

            // Trigger sound effects (always safe on lofi volume triggers)
            if (audioSettings.enabled && playing) {
              ambiance.triggerThunderStrike(lightningIntensity.current);
            }

            if (lightningType.current === 'strike') {
              const startX = 250 + Math.random() * 1420;
              const maxThickness = (se.size / 100) * 12.0 * (0.85 + scale * 0.15);
              lightningPathSegments.current = generateLightningBoltSegments(
                startX,
                0,
                960,
                maxThickness,
                1.5
              );
            }
          }
          nextLightningTime.current = now + 1800 + (100 - se.intensity) * 90;
        }

        if (lightningIntensity.current > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = getCanvasCompositeOperation(se.blendMode);

          // Flash ambient color overlay
          const hexAlpha = Math.round(lightningIntensity.current * (se.opacity / 100.0) * 190);
          ctx.fillStyle = `rgba(255, 255, 255, ${hexAlpha / 255.0})`;
          ctx.fillRect(0, 0, 1920, 1080);

          if (lightningType.current === 'strike' && lightningPathSegments.current.length > 0) {
            // Neon lightning outer casing glow
            ctx.save();
            ctx.strokeStyle = se.color;
            ctx.shadowColor = se.color;
            ctx.shadowBlur = se.glow * lightningIntensity.current;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            lightningPathSegments.current.forEach(seg => {
              ctx.lineWidth = seg.thickness * 2.5 * lightningIntensity.current;
              ctx.beginPath();
              ctx.moveTo(seg.startX, seg.startY);
              ctx.lineTo(seg.endX, seg.endY);
              ctx.stroke();
            });
            ctx.restore();

            // Inner white lightning hot core
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            lightningPathSegments.current.forEach(seg => {
              ctx.lineWidth = seg.thickness * 0.8 * lightningIntensity.current;
              ctx.beginPath();
              ctx.moveTo(seg.startX, seg.startY);
              ctx.lineTo(seg.endX, seg.endY);
              ctx.stroke();
            });
            ctx.restore();
          }

          if (playing) {
            lightningIntensity.current *= 0.82; // rapid decay factor
          }
          ctx.restore();
        } else {
          lightningType.current = 'none';
        }
      }

      // 6. Falling Snow Overlays (snowDepth)
      const sd = effectState.snowDepth;
      if (sd.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(sd.blendMode);

        snowParticles.current.forEach(p => {
          let layerSpeedFactor = 1.0;
          if (p.depthLayer === 0) layerSpeedFactor = 0.4;
          else if (p.depthLayer === 2) layerSpeedFactor = 1.7;

          if (playing) {
            // physics formulas
            p.y += p.speed * (sd.speed / 40.0) * layerSpeedFactor * delta;
            p.swingPhase += (p.depthLayer === 0 ? 0.007 : p.depthLayer === 1 ? 0.015 : 0.025) * p.swing * delta;

            const swirlWobble = Math.sin(p.swingPhase) * 1.5;
            p.x += (swirlWobble + 0.3) * delta;

            if (p.y > 1080) {
              p.y = -20;
              p.x = Math.random() * 1920;
            }
            if (p.x > 1920) p.x = 0;
            if (p.x < 0) p.x = 1920;
          }

          // Size & dynamic scales mapped
          let radius = p.r * (sd.size / 30.0);
          if (p.depthLayer === 0) radius *= 0.55;
          else if (p.depthLayer === 2) radius *= 1.85;

          let finalAlpha = sd.opacity / 100.0;
          if (p.depthLayer === 0) finalAlpha *= 0.45;
          else if (p.depthLayer === 1) finalAlpha *= 0.8;

          ctx.fillStyle = sd.color;
          ctx.globalAlpha = Math.max(0, Math.min(1.0, finalAlpha));

          if (sd.glow > 0 && p.depthLayer === 2) {
            ctx.shadowColor = sd.color;
            ctx.shadowBlur = sd.glow * 0.45;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, radius), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
        ctx.restore();
      }

      // 7. Làn Sóng Âm (soundWave - previously visualizer)
      const sw = effectState.soundWave;
      if (sw.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(sw.blendMode);

        const columnCount = 120;
        const colWidth = 1920 / columnCount;
        
        let bottomY = 1080;
        if (sw.position === 'top') bottomY = 220;
        else if (sw.position === 'center') bottomY = 540;
        else if (sw.position === 'left') bottomY = 1080; // keep bottom or standard

        const baseHeight = (sw.intensity / 100.0) * 160.0 * (0.8 + scale * 0.2);

        if (playing) {
          audioWavePhase.current += 0.045 * (sw.speed / 50.0) * delta;
        }

        if (sw.glow > 0) {
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = sw.glow * 0.45;
        }

        const loadedLayers = 3; // 3 stacked elegant smooth lines

        for (let l = 0; l < loadedLayers; l++) {
          const layerHeightScalar = 1.0 - (l * 0.18);
          let layerOpacity = (sw.opacity / 100.0) * (1.0 - (l * 0.22));
          const layerPhaseOffset = l * (Math.PI / 2.5);

          ctx.fillStyle = sw.color;
          ctx.globalAlpha = Math.max(0.08, layerOpacity);

          ctx.beginPath();
          
          if (sw.position === 'center') {
            // Draw dual symmetric waves (classic music spectrum)
            ctx.moveTo(0, bottomY);
            for (let idx = 0; idx <= columnCount; idx++) {
              const x = idx * colWidth;
              const sin1 = Math.sin(idx * 0.08 + audioWavePhase.current + layerPhaseOffset) * 1.0;
              const cos1 = Math.cos(idx * 0.15 - audioWavePhase.current * 1.3 - layerPhaseOffset) * 0.4;
              const waveAmp = (sin1 + cos1) * baseHeight * layerHeightScalar * Math.sin((idx / columnCount) * Math.PI);
              ctx.lineTo(x, bottomY - waveAmp);
            }
            for (let idx = columnCount; idx >= 0; idx--) {
              const x = idx * colWidth;
              const sin1 = Math.sin(idx * 0.08 + audioWavePhase.current + layerPhaseOffset) * 1.0;
              const cos1 = Math.cos(idx * 0.15 - audioWavePhase.current * 1.3 - layerPhaseOffset) * 0.4;
              const waveAmp = (sin1 + cos1) * baseHeight * layerHeightScalar * Math.sin((idx / columnCount) * Math.PI);
              ctx.lineTo(x, bottomY + waveAmp);
            }
          } else {
            // pointing upwards or downwards
            const sign = (sw.position === 'top') ? 1.0 : -1.0;
            ctx.moveTo(0, bottomY);
            for (let idx = 0; idx <= columnCount; idx++) {
              const x = idx * colWidth;
              const sin1 = Math.sin(idx * 0.08 + audioWavePhase.current + layerPhaseOffset) * 1.0;
              const cos1 = Math.cos(idx * 0.15 - audioWavePhase.current * 1.3 - layerPhaseOffset) * 0.4;
              const waveAmp = (sin1 + cos1) * baseHeight * layerHeightScalar;
              const centerScale = Math.sin((idx / columnCount) * Math.PI);
              const finalY = bottomY + (waveAmp * centerScale * sign);
              ctx.lineTo(x, finalY);
            }
            ctx.lineTo(1920, bottomY);
          }

          ctx.closePath();
          ctx.fill();

          // Stroke border for professional premium outline neon look
          if (sw.size > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = (sw.size / 100.0) * 8.0 * 0.35;
            ctx.globalAlpha = Math.max(0.18, layerOpacity + 0.15);
            ctx.beginPath();
            
            if (sw.position === 'center') {
              for (let idx = 0; idx <= columnCount; idx++) {
                const x = idx * colWidth;
                const sin1 = Math.sin(idx * 0.08 + audioWavePhase.current + layerPhaseOffset) * 1.0;
                const cos1 = Math.cos(idx * 0.15 - audioWavePhase.current * 1.3 - layerPhaseOffset) * 0.4;
                const waveAmp = (sin1 + cos1) * baseHeight * layerHeightScalar * Math.sin((idx / columnCount) * Math.PI);
                if (idx === 0) ctx.moveTo(x, bottomY - waveAmp);
                else ctx.lineTo(x, bottomY - waveAmp);
              }
            } else {
              const sign = (sw.position === 'top') ? 1.0 : -1.0;
              for (let idx = 0; idx <= columnCount; idx++) {
                const x = idx * colWidth;
                const sin1 = Math.sin(idx * 0.08 + audioWavePhase.current + layerPhaseOffset) * 1.0;
                const cos1 = Math.cos(idx * 0.15 - audioWavePhase.current * 1.3 - layerPhaseOffset) * 0.4;
                const waveAmp = (sin1 + cos1) * baseHeight * layerHeightScalar;
                const centerScale = Math.sin((idx / columnCount) * Math.PI);
                const finalY = bottomY + (waveAmp * centerScale * sign);
                if (idx === 0) ctx.moveTo(x, finalY);
                else ctx.lineTo(x, finalY);
              }
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 8. Bass Pulse Effect
      const bp = effectState.bassPulse;
      if (bp.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(bp.blendMode);

        const speedFactor = (bp.speed / 50.0);
        const pulseRatio = 0.78 + Math.abs(Math.sin(timestamp * 0.005 * speedFactor)) * 0.22 * (bp.intensity / 50.0);
        
        let centerX = 960;
        let centerY = 540;
        if (bp.position === 'top') { centerX = 960; centerY = 280; }
        else if (bp.position === 'bottom') { centerX = 960; centerY = 820; }
        else if (bp.position === 'left') { centerX = 400; centerY = 540; }
        else if (bp.position === 'right') { centerX = 1520; centerY = 540; }

        const bpRadius = (bp.size / 100.0) * 350.0 * pulseRatio;

        const grad = ctx.createRadialGradient(centerX, centerY, bpRadius * 0.03, centerX, centerY, Math.max(50, bpRadius * 1.6));
        grad.addColorStop(0, `${bp.color}25`); // Glow density
        grad.addColorStop(0.4, `${bp.color}0f`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        // In full-screen choice, we color the whole page
        if (bp.position === 'fullscreen') {
          ctx.fillRect(0, 0, 1920, 1080);
        } else {
          ctx.beginPath();
          ctx.arc(centerX, centerY, bpRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (bp.glow > 0) {
          ctx.save();
          ctx.shadowBlur = bp.glow * 0.6;
          ctx.shadowColor = bp.color;
          ctx.strokeStyle = bp.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = bp.opacity / 100.0 * 0.2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, bpRadius * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // 9. EQ Circle Effect
      const eq = effectState.eqCircle;
      if (eq.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(eq.blendMode);

        let eqX = 960;
        let eqY = 540;
        if (eq.position === 'top') { eqX = 960; eqY = 280; }
        else if (eq.position === 'bottom') { eqX = 960; eqY = 825; }
        else if (eq.position === 'left') { eqX = 400; eqY = 540; }
        else if (eq.position === 'right') { eqX = 1520; eqY = 540; }

        ctx.strokeStyle = eq.color;
        ctx.fillStyle = eq.color;
        
        if (eq.glow > 0) {
          ctx.shadowColor = eq.color;
          ctx.shadowBlur = eq.glow * 0.5;
        }

        ctx.globalAlpha = eq.opacity / 100.0;
        
        ctx.beginPath();
        const baseRadius = (eq.size / 100.0) * 220.0 + 10;
        const numBars = 65;
        const maxBounce = (eq.intensity / 100.0) * 85.0 * (0.8 + scale * 0.25);
        const spinSpeed = (eq.speed / 50.0);

        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 + (timestamp * 0.0004 * spinSpeed);
          const bounce = Math.abs(Math.sin(i * 0.18 + timestamp * 0.004 * spinSpeed)) * maxBounce;
          const startR = baseRadius;
          const endR = baseRadius + bounce;

          const x1 = eqX + Math.cos(angle) * startR;
          const y1 = eqY + Math.sin(angle) * startR;
          const x2 = eqX + Math.cos(angle) * endR;
          const y2 = eqY + Math.sin(angle) * endR;

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.lineWidth = Math.max(1, (eq.size / 30.0));
        ctx.stroke();

        // draw center retro label circle
        ctx.fillStyle = '#0b0816';
        ctx.globalAlpha = (eq.opacity / 100.0) * 0.85;
        ctx.beginPath();
        ctx.arc(eqX, eqY, baseRadius * 0.82, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // 10. Neon Wave Effect
      const nw = effectState.neonWave;
      if (nw.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(nw.blendMode);

        if (nw.glow > 0) {
          ctx.shadowBlur = nw.glow * 0.5;
          ctx.shadowColor = nw.color;
        }

        ctx.strokeStyle = nw.color;
        ctx.lineWidth = Math.max(1.0, (nw.size / 100.0) * 8.0);
        ctx.globalAlpha = nw.opacity / 100.0;
        ctx.lineCap = 'round';

        const speedFactor = (nw.speed / 50.0);

        // Position offset
        let centerY = 540;
        if (nw.position === 'top') centerY = 240;
        else if (nw.position === 'bottom') centerY = 840;

        // Custom wavy layers counted by size (e.g. up to 4 stacked waves)
        const activeWavesCount = Math.max(1, Math.min(4, Math.round((nw.size / 100.0) * 3) + 1));

        for (let w = 0; w < activeWavesCount; w++) {
          ctx.beginPath();
          const waveAmplitude = (nw.intensity / 100.0) * 90.0 * (0.85 + scale * 0.15);
          const layerOffset = w * 70 - (activeWavesCount * 30);

          for (let x = 0; x <= 1920; x += 18) {
            const phase = timestamp * 0.0016 * speedFactor + w * Math.PI * 0.45;
            const sinVal = Math.sin(x * 0.0022 + phase) * waveAmplitude;
            const y = centerY + layerOffset + sinVal;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      // 11. Music Particles Effect
      const mp = effectState.musicParticles;
      if (mp.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(mp.blendMode);

        const plist = musicParticlesList.current;
        const targetCount = Math.round((mp.intensity / 100.0) * 160.0 * scale);

        if (plist.length < targetCount) {
          for (let i = plist.length; i < targetCount; i++) {
            plist.push({
              x: Math.random() * 1920,
              y: 1080 + Math.random() * 200,
              speed: (0.4 + Math.random() * 1.5) * (mp.speed / 50.0) * 2.2,
              angle: Math.random() * Math.PI * 2,
              size: (1.5 + Math.random() * 3.5) * (mp.size / 50.0),
              opacity: (mp.opacity / 100.0) * (0.35 + Math.random() * 0.65)
            });
          }
        } else if (plist.length > targetCount) {
          musicParticlesList.current = plist.slice(0, targetCount);
        }

        plist.forEach(p => {
          if (playing) {
            p.y -= p.speed * delta;
            p.angle += 0.02 * delta;
            p.x += Math.sin(p.angle) * 0.65 * delta;

            if (p.y < -50) {
              p.y = 1080 + Math.random() * 120;
              p.x = Math.random() * 1920;
            }
          }

          if (mp.glow > 0) {
            ctx.shadowBlur = mp.glow * 0.35;
            ctx.shadowColor = mp.color;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = mp.color;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 12. Vinyl Spin Effect
      const vs = effectState.vinylSpin;
      if (vs.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(vs.blendMode);

        if (playing) {
          vinylAnglePhase.current += 0.0055 * (vs.speed / 50.0) * delta;
        }

        // Adjust position dynamically
        let vx = 1680;
        let vy = 200;
        if (vs.position === 'center') { vx = 960; vy = 540; }
        else if (vs.position === 'top') { vx = 960; vy = 240; }
        else if (vs.position === 'bottom') { vx = 960; vy = 820; }
        else if (vs.position === 'left') { vx = 280; vy = 540; }

        const vSize = (vs.size / 100.0) * 320.0 + 40;

        ctx.translate(vx, vy);
        ctx.rotate(vinylAnglePhase.current);
        
        ctx.globalAlpha = vs.opacity / 100.0;
        
        if (vs.glow > 0) {
          ctx.shadowBlur = vs.glow * 0.65;
          ctx.shadowColor = vs.color;
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 15;
        }

        // Draw outer vinyl black ring body
        ctx.fillStyle = '#08080a';
        ctx.beginPath();
        ctx.arc(0, 0, vSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Disable shadow for inner lines

        // Track grooves lines
        ctx.strokeStyle = '#18181d';
        ctx.lineWidth = 1.3;
        for (let r = 16; r < vSize / 2; r += 14) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Inner paint sticker
        ctx.fillStyle = vs.color;
        ctx.beginPath();
        ctx.arc(0, 0, vSize * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Spindle center pin-hole
        ctx.fillStyle = '#111116';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 14. Audio Heartbeat Effect (audioHeartbeat)
      const hb = effectState.audioHeartbeat;
      if (hb.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(hb.blendMode);

        ctx.strokeStyle = hb.color;
        if (hb.glow > 0) {
          ctx.shadowColor = hb.color;
          ctx.shadowBlur = hb.glow * 0.45;
        }
        
        ctx.lineWidth = Math.max(1, (hb.size / 100.0) * 10.0);
        ctx.globalAlpha = hb.opacity / 100.0;

        let centerY = 600;
        if (hb.position === 'top') centerY = 280;
        else if (hb.position === 'bottom') centerY = 880;

        ctx.beginPath();
        const speedFactor = (hb.speed / 50.0);
        const shiftX = (timestamp * 0.14 * speedFactor) % 1920;

        const pulseScaleAmt = (hb.intensity / 100.0) * 130.0;

        for (let x = 0; x <= 1920; x += 6) {
          let y = centerY;
          
          const indexOffset = (x + shiftX) % 360;
          if (indexOffset > 40 && indexOffset < 65) {
            const phase = (indexOffset - 40) / 25;
            if (phase < 0.15) {
              y -= phase * 32 * (pulseScaleAmt / 40.0) * 0.3;
            } else if (phase >= 0.15 && phase < 0.3) {
              y += (phase - 0.15) * 55 * (pulseScaleAmt / 40.0) * 0.2;
            } else if (phase >= 0.3 && phase < 0.55) {
              y -= (phase - 0.3) * 220 * (pulseScaleAmt / 40.0) * 0.8;
            } else if (phase >= 0.55 && phase < 0.75) {
              y += (phase - 0.55) * 280 * (pulseScaleAmt / 40.0) * 0.8;
            } else if (phase >= 0.75 && phase < 0.95) {
              y -= (phase - 0.75) * 55 * (pulseScaleAmt / 40.0) * 0.25;
            }
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 7. Audio Spectrum Effect (audioSpectrum)
      const spec = effectState.audioSpectrum;
      if (spec.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(spec.blendMode);

        const barCount = Math.max(15, Math.min(100, Math.round((spec.intensity / 100.0) * 70) + 15));
        const activeBarWidth = Math.max(2, Math.round((spec.size / 100.0) * 12.0));
        
        const totalW = barCount * (activeBarWidth + 6);
        const startX = (1920 - totalW) / 2;

        ctx.fillStyle = spec.color;
        if (spec.glow > 0) {
          ctx.shadowColor = spec.color;
          ctx.shadowBlur = spec.glow * 0.45;
        }
        ctx.globalAlpha = spec.opacity / 100.0;

        const maxHeights = (spec.intensity / 100.0) * 240.0 * (0.8 + scale * 0.2);
        const oscSpeed = (spec.speed / 50.0);

        for (let i = 0; i < barCount; i++) {
          const waveVal = Math.sin(i * 0.22 + timestamp * 0.007 * oscSpeed) * 0.5 + 0.5;
          const bassKick = Math.abs(Math.sin(timestamp * 0.003)) * 0.12;
          const height = Math.max(6, (waveVal + bassKick) * maxHeights * Math.sin((i / barCount) * Math.PI));
          const x = startX + i * (activeBarWidth + 6);

          let y = 1010 - height;
          if (spec.position === 'top') {
            y = 100; // Point down from roof
          } else if (spec.position === 'center') {
            y = 540 - height / 2; // Symmetric mid
          }

          ctx.beginPath();
          if (spec.position === 'top') {
            ctx.roundRect(x, y, activeBarWidth, height, [0, 0, 4, 4]);
          } else if (spec.position === 'center') {
            ctx.roundRect(x, y, activeBarWidth, height, [4, 4, 4, 4]);
          } else {
            ctx.roundRect(x, y, activeBarWidth, height, [4, 4, 0, 0]);
          }
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Music Player Overlay
      const mPlay = effectState.musicPlayer;
      if (mPlay.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = getCanvasCompositeOperation(mPlay.blendMode);

        const scaleVal = (mPlay.size / 100.0) * 1.3 + 0.3; // safe size factor
        if (playing) {
          musicPlayerTime.current += 1.0 * delta;
        }

        const width = 360 * scaleVal;
        const height = 110 * scaleVal;

        let px = 960 - width / 2;
        let py = 1080 - 150 - height;

        if (mPlay.position === 'right') {
          px = 1920 - width - 60;
          py = 180;
        } else if (mPlay.position === 'left') {
          px = 60;
          py = 400;
        } else if (mPlay.position === 'center') {
          px = 960 - width / 2;
          py = 540 - height / 2;
        } else if (mPlay.position === 'top') {
          px = 960 - width / 2;
          py = 140;
        }

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 25;

        // Custom paint styling
        ctx.fillStyle = 'rgba(11, 8, 20, 0.88)';
        ctx.beginPath();
        ctx.roundRect(px, py, width, height, 16);
        ctx.fill();

        if (mPlay.glow > 0) {
          ctx.strokeStyle = mPlay.color;
          ctx.shadowColor = mPlay.color;
          ctx.shadowBlur = mPlay.glow * 0.45;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        const discX = px + 44 * scaleVal;
        const discY = py + 55 * scaleVal;
        const discR = 28 * scaleVal;

        ctx.save();
        ctx.translate(discX, discY);
        ctx.rotate(vinylAnglePhase.current);
        ctx.fillStyle = '#0a0a0c';
        ctx.beginPath();
        ctx.arc(0, 0, discR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mPlay.color;
        ctx.beginPath();
        ctx.arc(0, 0, discR * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = `650 ${14 * scaleVal}px "Inter", sans-serif`;
        ctx.textAlign = 'left';
        ctx.globalAlpha = mPlay.opacity / 100.0;
        ctx.fillText('Lofi Chill Station 📻', px + 90 * scaleVal, py + 36 * scaleVal);

        ctx.fillStyle = '#a892b1';
        ctx.font = `500 ${10 * scaleVal}px "JetBrains Mono", monospace`;
        ctx.fillText('Nghệ sĩ: Atmosphere AI', px + 90 * scaleVal, py + 54 * scaleVal);

        const progressW = 240 * scaleVal;
        const barStartX = px + 90 * scaleVal;
        const barY = py + 72 * scaleVal;
        const completeSecs = 180;
        const progressFraction = ((musicPlayerTime.current / 60) / completeSecs) % 1.0;

        ctx.fillStyle = '#22192e';
        ctx.beginPath();
        ctx.roundRect(barStartX, barY, progressW, 4 * scaleVal, 2);
        ctx.fill();

        ctx.fillStyle = mPlay.color;
        ctx.beginPath();
        ctx.roundRect(barStartX, barY, progressW * progressFraction, 4 * scaleVal, 2);
        ctx.fill();

        const curSeconds = Math.floor(musicPlayerTime.current / 60) % 60;
        const curMinutes = Math.floor(musicPlayerTime.current / 3600) % 10;
        const curStr = `${String(curMinutes).padStart(2, '0')}:${String(curSeconds).padStart(2, '0')}`;
        ctx.fillStyle = '#836f8f';
        ctx.font = `550 ${9 * scaleVal}px "JetBrains Mono", monospace`;
        ctx.fillText(`${curStr} / 03:00`, barStartX + progressW - 60 * scaleVal, py + 92 * scaleVal);

        ctx.restore();
      }

      // Render Vietnamese Artistic Text Layers (Text Editor) on canvas
      if (textLayers && textLayers.length > 0) {
        // Sort visible text layers by ascending zIndex so higher values draw on top
        const sortedTextLayers = [...textLayers]
          .filter(t => t.visible)
          .sort((a, b) => a.zIndex - b.zIndex);

        sortedTextLayers.forEach(layer => {
          ctx.save();

          // Animation coordinates/values modifiers
          let animOffset = { x: 0, y: 0 };
          let animScale = 1.0;
          let animOpacity = 1.0;
          let animGlowModifier = 1.0;

          const speedFactor = layer.animation.speed / 50.0;
          const animType = layer.animation.type;

          if (playing) {
            if (animType === 'fadeIn') {
              // Fade in cycling gently
              animOpacity = 0.5 + 0.5 * Math.sin(timestamp * 0.002 * speedFactor - Math.PI / 2);
            } else if (animType === 'fadeOut') {
              // Fade out cycling gently
              animOpacity = 0.5 + 0.5 * Math.cos(timestamp * 0.002 * speedFactor);
            } else if (animType === 'zoomIn') {
              animScale = 0.85 + Math.abs(Math.sin(timestamp * 0.0015 * speedFactor)) * 0.3;
            } else if (animType === 'zoomOut') {
              animScale = 1.15 - Math.abs(Math.sin(timestamp * 0.0015 * speedFactor)) * 0.3;
            } else if (animType === 'slideUp') {
              animOffset.y = Math.sin(timestamp * 0.002 * speedFactor) * 35;
            } else if (animType === 'slideDown') {
              animOffset.y = -Math.sin(timestamp * 0.002 * speedFactor) * 35;
            } else if (animType === 'bounce') {
              animOffset.y = -Math.abs(Math.sin(timestamp * 0.004 * speedFactor)) * 40;
            } else if (animType === 'pulse') {
              animScale = 1.0 + 0.08 * Math.sin(timestamp * 0.003 * speedFactor);
            } else if (animType === 'flicker') {
              animOpacity = Math.random() < 0.15 ? 0.25 : 1.0;
            } else if (animType === 'glowBreathing') {
              animGlowModifier = 0.4 + 0.6 * Math.abs(Math.sin(timestamp * 0.0025 * speedFactor));
            } else if (animType === 'float') {
              animOffset.y = Math.sin(timestamp * 0.0015 * speedFactor) * 15;
            } else if (animType === 'shake') {
              animOffset.x = (Math.random() - 0.5) * 6 * speedFactor;
              animOffset.y = (Math.random() - 0.5) * 6 * speedFactor;
            }
          }

          // Calculate layout position from 0-100 percentages to actual 1920x1080 canvas
          const px = (layer.x / 100) * 1920 + animOffset.x;
          const py = (layer.y / 100) * 1080 + animOffset.y;

          ctx.translate(px, py);
          ctx.rotate((layer.rotation * Math.PI) / 180);

          const finalScale = layer.scale * animScale;
          ctx.scale(finalScale, finalScale);

          ctx.globalAlpha = Math.max(0, Math.min(1.0, (layer.opacity / 100.0) * animOpacity));

          // Base styling configuration
          const uppercaseContent = layer.uppercase ? layer.content.toUpperCase() : layer.content;
          const lines = uppercaseContent.split('\n');

          const fontStyle = layer.italic ? 'italic' : 'normal';
          const fontSpec = `${fontStyle} ${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}", sans-serif`;
          ctx.font = fontSpec;
          ctx.textBaseline = 'top';

          // Measure each line carefully, calculating width per character + spacing
          const measuredLines = lines.map(line => {
            let lineW = 0;
            const charWidths: number[] = [];
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              // Measure char width and inject letterSpacing buffer
              const w = ctx.measureText(char).width + layer.letterSpacing;
              lineW += w;
              charWidths.push(w);
            }
            return { line, width: lineW, charWidths };
          });

          const maxLineWidth = Math.max(...measuredLines.map(ml => ml.width), 1);
          // Standard full layout height including lineHeight factor
          const lineYStep = layer.fontSize * layer.lineHeight;
          const totalTextHeight = measuredLines.length * lineYStep;

          // Rent/draw Box Background capsule behind letters
          const bg = layer.background;
          if (bg && bg.enabled) {
            ctx.save();
            const padX = bg.padding;
            const padY = bg.padding;
            const bgW = maxLineWidth + padX * 2;
            const bgH = totalTextHeight + padY * 2;

            let bgX = -bgW / 2;
            if (layer.align === 'left') {
              bgX = -padX;
            } else if (layer.align === 'right') {
              bgX = -maxLineWidth - padX;
            }

            const bgY = -padY - (layer.fontSize * 0.1); // baseline balance

            ctx.globalAlpha = Math.max(0, Math.min(1.0, (bg.opacity / 100.0) * animOpacity));

            if (bg.type === 'solid' || bg.type === 'blur') {
              ctx.fillStyle = bg.color;
              if (bg.type === 'blur') {
                ctx.save();
                // Backdrop shadow emulation
                ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                ctx.shadowBlur = bg.blur + 5;
                ctx.beginPath();
                ctx.roundRect(bgX, bgY, bgW, bgH, bg.radius);
                ctx.fill();
                ctx.restore();
              }
              ctx.beginPath();
              ctx.roundRect(bgX, bgY, bgW, bgH, bg.radius);
              ctx.fill();
            } else if (bg.type === 'gradient') {
              // Diagonal linear gradient
              const grad = ctx.createLinearGradient(bgX, bgY, bgX + bgW, bgY + bgH);
              grad.addColorStop(0, bg.color);
              grad.addColorStop(1, bg.colorEnd || bg.color);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(bgX, bgY, bgW, bgH, bg.radius);
              ctx.fill();
            } else if (bg.type === 'neon') {
              // Sleek neon borders
              ctx.fillStyle = 'rgba(10, 8, 16, 0.85)';
              ctx.strokeStyle = bg.color;
              ctx.lineWidth = 2.5;
              ctx.shadowColor = bg.color;
              ctx.shadowBlur = bg.blur + 5;
              ctx.beginPath();
              ctx.roundRect(bgX, bgY, bgW, bgH, bg.radius);
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          }

          // Initial Shadows & Glow setups before drawing characters
          if (layer.glow.enabled && layer.glow.intensity > 0) {
            ctx.shadowColor = layer.glow.color;
            ctx.shadowBlur = layer.glow.intensity * animGlowModifier;
          } else if (layer.shadow.enabled) {
            ctx.shadowColor = layer.shadow.color;
            ctx.shadowBlur = layer.shadow.blur;
            ctx.shadowOffsetX = layer.shadow.offsetX;
            ctx.shadowOffsetY = layer.shadow.offsetY;
          } else {
            ctx.shadowColor = 'rgba(0,0,0,0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Render line-by-line, character-by-character
          measuredLines.forEach((mLine, lineIdx) => {
            const lineY = lineIdx * lineYStep;
            let currentX = 0;

            if (layer.align === 'center') {
              currentX = -mLine.width / 2;
            } else if (layer.align === 'right') {
              currentX = -mLine.width;
            } else {
              currentX = 0;
            }

            // Typewriter limiting character length calculations
            let charsToDraw = mLine.line.length;
            if (playing && animType === 'typewriter') {
              // Sequence letters from start
              const totalCh = uppercaseContent.replace(/\n/g, '').length;
              const globalCharIdx = Math.floor(timestamp * 0.015 * speedFactor) % (totalCh + 15);

              let prevLinesCharCount = 0;
              for (let prevIdx = 0; prevIdx < lineIdx; prevIdx++) {
                prevLinesCharCount += lines[prevIdx].length;
              }
              const charsLeft = globalCharIdx - prevLinesCharCount;
              charsToDraw = Math.max(0, Math.min(mLine.line.length, charsLeft));
            }

            for (let charIdx = 0; charIdx < charsToDraw; charIdx++) {
              const char = mLine.line[charIdx];
              ctx.save();

              // Character wave offsets formula
              let charYOffset = 0;
              if (playing && animType === 'wave') {
                charYOffset = Math.sin(timestamp * 0.005 * speedFactor + charIdx * 0.35 + lineIdx * 0.6) * 12;
              }

              ctx.translate(currentX, lineY + charYOffset);

              // Set paint fill style (Gradient vs Solid Color)
              if (layer.gradientEnabled && layer.gradient.length >= 2) {
                // Apply karaoke highlight override inside graduates if needed
                let isKaraokeHighlight = false;
                if (playing && animType === 'karaoke') {
                  const lineTotalW = mLine.width || 1;
                  const karaokeProgress = (timestamp * 0.0003 * speedFactor) % 1.25;
                  
                  let relativeX = currentX;
                  if (layer.align === 'center') {
                    relativeX = currentX + mLine.width / 2;
                  } else if (layer.align === 'right') {
                    relativeX = currentX + mLine.width;
                  }
                  
                  if (relativeX < lineTotalW * karaokeProgress) {
                    isKaraokeHighlight = true;
                  }
                }

                const grad = ctx.createLinearGradient(0, -layer.fontSize * 0.8, 0, layer.fontSize * 0.2);
                if (isKaraokeHighlight) {
                  grad.addColorStop(0, '#ffff55'); // neon yellow shine
                  grad.addColorStop(0.5, '#f59e0b');
                  grad.addColorStop(1, '#ea580c');
                } else {
                  layer.gradient.forEach((color, gradIdx) => {
                    grad.addColorStop(gradIdx / (layer.gradient.length - 1), color);
                  });
                }
                ctx.fillStyle = grad;
              } else {
                ctx.fillStyle = layer.color;

                // Karaoke solid color paint highlight sweeps
                if (playing && animType === 'karaoke') {
                  const lineTotalW = mLine.width || 1;
                  const karaokeProgress = (timestamp * 0.0003 * speedFactor) % 1.25;
                  
                  let relativeX = currentX;
                  if (layer.align === 'center') {
                    relativeX = currentX + mLine.width / 2;
                  } else if (layer.align === 'right') {
                    relativeX = currentX + mLine.width;
                  }
                  
                  if (relativeX < lineTotalW * karaokeProgress) {
                    ctx.fillStyle = '#f59e0b'; // Amber yellow highlight highlight
                  }
                }
              }

              // Normal text rendering
              ctx.fillText(char, 0, 0);

              // Standard strokes text boundaries
              if (layer.stroke.enabled && layer.stroke.width > 0) {
                ctx.strokeStyle = layer.stroke.color;
                ctx.lineWidth = layer.stroke.width;
                ctx.strokeText(char, 0, 0);
              }

              ctx.restore();

              // Advance horizontal drawing position
              currentX += mLine.charWidths[charIdx];
            }
          });

          ctx.restore();
        });
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playing, effectState, loadedImg, imageFit, audioSettings.enabled, textLayers]);

  // Video recording logic via MediaRecorder API
  const handleStartCaptureVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setRecorderError(null);
      setIsRecording(true);
      setRecordingProgress(0);
      setRecordingTimeLeft(duration);

      setPlaying(true);
      await ambiance.start(audioSettings);

      const chunks: Blob[] = [];

      let stream: MediaStream;
      if ((canvas as any).captureStream) {
        stream = (canvas as any).captureStream(30);
      } else if ((canvas as any).mozCaptureStream) {
        stream = (canvas as any).mozCaptureStream(30);
      } else {
        throw new Error('Trình duyệt không hỗ trợ Media stream capture.');
      }

      const audioStream = ambiance.getAudioStream();
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        audioStream.getAudioTracks().forEach(track => {
          stream.addTrack(track.clone());
        });
      }

      let selectedMime = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000, // 6Mbps for crisp 1080p WebM encoding
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        setRecordingProgress(100);

        try {
          const finalBlob = new Blob(chunks, { type: 'video/webm' });
          const fileUrl = URL.createObjectURL(finalBlob);

          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = `atmosphere-canvas-${duration}s.webm`;
          document.body.appendChild(link);
          link.click();
          
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
        } catch (downloadErr) {
          setRecorderError('Gặp sự cố xuất video. Hãy thử lại với thời lượng ngắn hơn (10 - 30s).');
        }
      };

      mediaRecorder.start();

      const totalSeconds = duration;
      let tick = 0;

      const timerInterval = setInterval(() => {
        tick++;
        const left = totalSeconds - tick;
        setRecordingTimeLeft(left);
        setRecordingProgress(Math.min(99, Math.round((tick / totalSeconds) * 100)));

        if (tick >= totalSeconds) {
          clearInterval(timerInterval);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error('Capture err:', err);
      setIsRecording(false);
      setRecorderError(err?.message || 'Trình duyệt bị từ chối quyền hoặc thiếu driver capture.');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {imgError && (
        <div className="flex items-center gap-3 bg-red-950/40 border border-red-900 px-4 py-3 rounded-lg text-red-300 text-sm">
          <AlertTriangle className="size-5 text-red-400 shrink-0" />
          <span>{imgError}</span>
        </div>
      )}

      {recorderError && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-900 px-4 py-3 rounded-lg text-amber-300 text-sm">
          <ShieldAlert className="size-5 text-amber-400 shrink-0" />
          <span>{recorderError}</span>
        </div>
      )}

      {showAudioConsent && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-950 border border-indigo-800 p-4 rounded-xl text-indigo-100 text-sm shadow-xl">
          <div className="flex items-center gap-3">
            <Volume2 className="size-5 text-indigo-400 animate-bounce" />
            <div>
              <p className="font-semibold">Bật luồng âm thanh không lời?</p>
              <p className="text-xs text-indigo-300">Nhấp chuột khách quan để cho phép hệ thống synthesiser chơi lofi trực tuyến.</p>
            </div>
          </div>
          <button
            onClick={handleEnableAudioNow}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition animate-pulse"
          >
            Kích hoạt ngay
          </button>
        </div>
      )}

      <div className="relative w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl group">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain"
          id="visual-rendering-canvas"
        />

        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/95 border border-neutral-800/80 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 transform ${
          cinemaMode ? 'opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100'
        }`}>
          <button
            onClick={() => setPlaying(!playing)}
            id="canvas-play-pause-btn"
            className={`p-3 rounded-full flex items-center justify-center transition-all ${
              playing 
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 ring-4 ring-amber-500/20' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title={playing ? 'Tạm dừng hoạt cảnh' : 'Bật hoạt cảnh'}
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
          </button>

          <div className="w-px h-6 bg-neutral-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline uppercase">Thời lượng:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) as RenderDuration)}
              disabled={isRecording}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
            >
              <option value={10}>10 GIÂY</option>
              <option value={30}>30 GIÂY</option>
              <option value={60}>60 GIÂY</option>
              <option value={180}>3 PHÚT</option>
              <option value={300}>5 PHÚT</option>
            </select>
          </div>

          <div className="w-px h-6 bg-neutral-800" />

          <button
            onClick={handleStartCaptureVideo}
            disabled={isRecording}
            id="download-canvas-video-btn"
            className={`font-semibold text-xs px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 transition ${
              isRecording 
                ? 'bg-red-600/20 border border-red-500/40 text-red-400 animate-pulse cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold'
            }`}
          >
            {isRecording ? (
              <>
                <Video className="size-3.5 animate-spin" />
                <span>Đang ghi: {recordingTimeLeft}s</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>Xuất Video WebM</span>
              </>
            )}
          </button>
        </div>

        {isRecording && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 animate-fade-in">
            <div className="max-w-md w-full flex flex-col items-center gap-6">
              <div className="relative">
                <div className="size-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center animate-pulse">
                  <Video className="size-7 text-red-500" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Đang xuất video Atmosphere</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Dòng hình ảnh và nhạc synthesizer chất lượng cao đang được quay phim trực tuyến. Hãy giữ nguyên trang này để tiến trình hoàn tất thuận lợi.
                </p>
              </div>

              <div className="w-full bg-neutral-900 border border-neutral-850 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-xs font-mono text-neutral-400">
                <span>Tiến độ: {recordingProgress}%</span>
                <span className="text-red-400">Thời gian còn lại: {recordingTimeLeft}s</span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-none select-none">
          <Sparkles className="size-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-[10px] text-white/90 font-mono tracking-wider font-semibold uppercase">Atmosphere Studio</span>
        </div>
      </div>
    </div>
  );
}
