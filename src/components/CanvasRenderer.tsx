import React, { useRef, useEffect, useState } from 'react';
import { EffectState, AudioSettings, RenderDuration, IntensityLevel } from '../types';
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
}

interface SnowParticle {
  x: number;
  y: number;
  r: number;
  speed: number;
  swing: number;
  swingPhase: number;
  depthLayer: number; // 0 = xa, 1 = trung, 2 = gan
}

interface RainParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  depthLayer: number; // 0 = xa, 1 = trung, 2 = gan
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

export default function CanvasRenderer({
  effectState,
  audioSettings,
  backgroundImage,
  imageFit,
  playing,
  setPlaying,
  cinemaMode,
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
      // Wait, let's gracefully show the backing preset scenery if images fails or falls back
      setImgError('Không thể tải ảnh này. Vui lòng thử ảnh khác hoặc dùng hình nền mặc định.');
    };
  }, [backgroundImage]);

  // Handle Play/Pause change for audio context sync
  useEffect(() => {
    if (playing) {
      if (audioSettings.enabled) {
        // Safe play triggers
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

  // 1) Initialize/Sync Snow particle systems on count changes (Supports multi-depth layers)
  useEffect(() => {
    const { count, size, speed } = effectState.snow;
    const current = snowParticles.current;
    
    // Scale count based on Chosen Custom Intensity Level!
    const intensityMult = getScaleFactor(effectState.intensityLevel);
    const targetCount = Math.round(count * intensityMult);

    if (current.length < targetCount) {
      for (let i = current.length; i < targetCount; i++) {
        // Distribute cyclic depthLayer 0: Far (xa), 1: Mid (trung), 2: Near (gan/to/sang)
        const depthLayer = i % 3;
        current.push({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          r: (0.6 + Math.random() * 0.8) * size,
          speed: (0.35 + Math.random() * 0.65) * speed * 1.5,
          swing: 0.3 + Math.random() * 0.7,
          swingPhase: Math.random() * Math.PI * 2,
          depthLayer,
        });
      }
    } else if (current.length > targetCount) {
      snowParticles.current = current.slice(0, targetCount);
    }
  }, [effectState.snow.count, effectState.snow.size, effectState.snow.speed, effectState.intensityLevel]);

  // 2) Initialize/Sync Rain particle systems on count changes (Supports multi-depth layers)
  useEffect(() => {
    const { count, speed, length } = effectState.rain;
    const current = rainParticles.current;

    const intensityMult = getScaleFactor(effectState.intensityLevel);
    const targetCount = Math.round(count * intensityMult);

    if (current.length < targetCount) {
      for (let i = current.length; i < targetCount; i++) {
        const depthLayer = i % 3;
        current.push({
          x: Math.random() * 2200 - 150,
          y: Math.random() * 1080 - 200,
          length: (0.75 + Math.random() * 0.5) * length,
          speed: (0.8 + Math.random() * 0.5) * speed * 1.8,
          opacity: 0.15 + Math.random() * 0.45,
          depthLayer,
        });
      }
    } else if (current.length > targetCount) {
      rainParticles.current = current.slice(0, targetCount);
    }
  }, [effectState.rain.count, effectState.rain.speed, effectState.rain.length, effectState.intensityLevel]);

  // 3) Sync Twinkling Stage Fog / Dust Motes
  useEffect(() => {
    if (dustMotes.current.length === 0) {
      for (let i = 0; i < 75; i++) {
        dustMotes.current.push({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          r: 1.0 + Math.random() * 3.0,
          speed: 0.15 + Math.random() * 0.55,
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
          phase: i * (Math.PI / 4.5) + Math.random() * 0.5,
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
    branchingFactor: number
  ): LightningSegment[] => {
    const list: LightningSegment[] = [];

    const recurse = (sx: number, sy: number, ey: number, thick: number, currentLvl: number, isMain: boolean) => {
      let cx = sx;
      let cy = sy;
      
      while (cy < ey) {
        // Step downward
        const stepY = cy + 18 + Math.random() * 30;
        // Jagged slints
        const stepX = cx + (Math.random() - 0.5) * 55;

        list.push({
          startX: cx,
          startY: cy,
          endX: stepX,
          endY: stepY,
          thickness: thick,
          isMain,
        });

        // Potential side branch branching
        if (currentLvl > 1 && Math.random() < 0.12 * branchingFactor) {
          const forkEy = Math.min(1080, stepY + 120 + Math.random() * 200);
          recurse(stepX, stepY, forkEy, thick * 0.5, currentLvl - 1, false);
        }

        cx = stepX;
        cy = stepY;
      }
    };

    recurse(startX, startY, endY, thickness, branchingFactor, true);
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
      const delta = Math.min((timestamp - lastTime) / 16.666, 4.0); // Normalize based on 60fps, cap at 4x delay
      lastTime = timestamp;

      const scale = getScaleFactor(effectState.intensityLevel);

      // 1. Draw Static / Preset Backing Canvas
      if (loadedImg) {
        ctx.fillStyle = '#090514';
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
        grad.addColorStop(0, '#030712'); // deep dark slate
        grad.addColorStop(0.5, '#0c1022'); // twilight ambient indigo
        grad.addColorStop(1, '#02040a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Ambient radial studio center blur glow
        const rGrad = ctx.createRadialGradient(960, 540, 40, 960, 540, 700);
        rGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)'); // soft violet-500
        rGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)'); // sky indigo
        rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Perspective grid floor matrix
        ctx.save();
        const horizon = 540;
        for (let y = horizon; y < 1080; y += 25) {
          const travel = (y - horizon) / 540;
          ctx.strokeStyle = `rgba(168, 85, 247, ${travel * 0.16})`; // purple-500
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1920, y);
          ctx.stroke();
        }
        for (let x = -800; x <= 2720; x += 140) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)'; // indigo-500
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(960, horizon - 15);
          ctx.lineTo(x, 1080);
          ctx.stroke();
        }
        ctx.restore();

        // Welcome human literal prompt
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '300 22px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chọn ảnh để tải lên hoạt ảnh sống động...', 960, 480);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.font = '550 11px "JetBrains Mono", monospace';
        ctx.fillText('HỖ TRỢ KÉO THẢ ẢNH - CHẤT LƯỢNG CAO GPX', 960, 515);
      }

      // 2. Glowing Volumetric Lights (Spotlights)
      if (effectState.spotlight.enabled) {
        ctx.save();
        const colors = {
          warm: { r: 245, g: 158, b: 11 },   // Amber Gold
          pink: { r: 236, g: 72, b: 153 },   // Lover Blossom
          cyan: { r: 6, g: 182, b: 212 },    // Aurora Sky
          white: { r: 255, g: 255, b: 255 }, // Pure Ice Velvet
        };
        const activeColor = colors[effectState.spotlight.color] || colors.white;

        // Dynamic Spacing based on chosen custom count (1 to 6 beams)
        const beamCount = Math.max(1, Math.min(6, effectState.spotlight.count));
        const spacing = 1920 / (beamCount + 1);
        const positions: number[] = [];
        for (let i = 1; i <= beamCount; i++) {
          positions.push(i * spacing);
        }

        positions.forEach((topX, idx) => {
          const swingConfig = spotlightSwing.current[idx] || { phase: idx * 0.8, targetAngle: 0 };
          
          if (playing) {
            swingConfig.phase += 0.0055 * effectState.spotlight.speed * delta;
          }

          // Pendulum sweep angle limits
          const maxSwingRad = (effectState.spotlight.angle * Math.PI) / 180;
          const currentAngle = Math.sin(swingConfig.phase) * maxSwingRad;

          const targetFloorX = topX + Math.sin(currentAngle) * 1080;
          // Scale spotlight base-width by intensity level chosen
          const baseWidth = effectState.spotlight.width * (0.8 + scale * 0.2);

          // Volumetric cone linear transparency falloff
          const gradient = ctx.createLinearGradient(topX, 0, targetFloorX, 1080);
          gradient.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${effectState.spotlight.brightness * 0.55})`);
          gradient.addColorStop(0.35, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${effectState.spotlight.brightness * 0.28})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(topX - 35, 0);
          ctx.lineTo(topX + 35, 0);
          ctx.lineTo(targetFloorX + baseWidth / 2, 1080);
          ctx.lineTo(targetFloorX - baseWidth / 2, 1080);
          ctx.closePath();
          ctx.fill();

          // Emission source point lens glow flare
          const capGlowStrength = effectState.spotlight.glow * (0.8 + scale * 0.25);
          const emissionRadial = ctx.createRadialGradient(topX, 0, 5, topX, 0, 80);
          emissionRadial.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${effectState.spotlight.brightness * 1.0})`);
          emissionRadial.addColorStop(0.5, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${effectState.spotlight.brightness * 0.45})`);
          emissionRadial.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.save();
          ctx.shadowColor = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.8)`;
          ctx.shadowBlur = capGlowStrength;
          ctx.fillStyle = emissionRadial;
          ctx.beginPath();
          ctx.arc(topX, 0, 80, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();

        // 2b. Stage Dust / Haze motes twinkling inside volumetric lights
        if (effectState.spotlight.haze > 0) {
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

            // Haze visibility scaling
            const glowOpacity = effectState.spotlight.haze * m.opacityMultiplier * 0.7 * (0.8 + scale * 0.2);
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r * (0.85 + scale * 0.15), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${glowOpacity})`;
            ctx.shadowColor = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.7)`;
            ctx.shadowBlur = 4 + (scale * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      // 3. Meteor Shower
      if (effectState.meteor.enabled) {
        ctx.save();
        const activeMeteors = meteorShower.current;
        
        // Meteor spawn rate is scaled by both meteor count setting & the intensity preset factor
        const spawnOdds = (effectState.meteor.frequency / 100) * 0.15 * scale;
        
        if (playing && Math.random() < spawnOdds * delta) {
          activeMeteors.push({
            x: Math.random() * 1500 + 350,
            y: -120,
            length: effectState.meteor.tailLength * (0.8 + Math.random() * 0.5),
            speed: effectState.meteor.speed * (0.9 + Math.random() * 0.55) * 2.5,
            opacity: effectState.meteor.opacity * (0.45 + Math.random() * 0.55),
            size: (2.0 + Math.random() * 4.0) * (0.9 + scale * 0.15),
          });
        }

        for (let i = activeMeteors.length - 1; i >= 0; i--) {
          const m = activeMeteors[i];
          const angleRad = (effectState.meteor.direction * Math.PI) / 180;
          
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
          meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
          meteorGrad.addColorStop(0.18, `rgba(224, 242, 254, ${m.opacity * 0.75})`);
          meteorGrad.addColorStop(0.55, `rgba(56, 189, 248, ${m.opacity * 0.3})`);
          meteorGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.lineCap = 'round';
          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = m.size;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Header bloom sparkles
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#56c2f8';
          ctx.shadowBlur = effectState.meteor.glow * (0.8 + scale * 0.3);
          ctx.beginPath();
          ctx.arc(tipX, tipY, m.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // 4. Rain Overlays (Enhanced with 3 Layer Spatial Depth coordinates)
      if (effectState.rain.enabled) {
        ctx.save();
        ctx.lineCap = 'round';

        rainParticles.current.forEach(r => {
          let layerSpeedFactor = 1.0;
          if (r.depthLayer === 0) layerSpeedFactor = 0.5; // Xa (Chậm hơn)
          else if (r.depthLayer === 2) layerSpeedFactor = 1.5; // Gần (Rất nhanh)

          if (playing) {
            r.y += r.speed * layerSpeedFactor * delta;
            
            // X slanting speed based on rain wind parameters
            const windShift = effectState.rain.windDirection * effectState.rain.windStrength * 0.15;
            r.x += windShift * delta;

            if (r.y > 1080 + 40) {
              r.y = -60;
              r.x = Math.random() * 2100 - 100;
            }
          }

          // Compute thickness and lengths for 3 levels of depth
          let finalLength = r.length;
          if (r.depthLayer === 0) finalLength *= 0.6;
          else if (r.depthLayer === 2) finalLength *= 1.7; // Foreground drops are long/visible

          let finalThickness = effectState.rain.thickness;
          if (r.depthLayer === 0) finalThickness *= 0.55;
          else if (r.depthLayer === 2) finalThickness *= 1.85; // Close drops are thick

          let baseOpacity = effectState.rain.opacity;
          if (r.depthLayer === 0) baseOpacity *= 0.35;
          else if (r.depthLayer === 1) baseOpacity *= 0.8;

          ctx.strokeStyle = `rgba(186, 230, 253, ${baseOpacity})`;
          ctx.lineWidth = Math.max(1.0, finalThickness);
          
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          // Angle calculation matching physical slanting
          ctx.lineTo(r.x + (effectState.rain.windDirection * (effectState.rain.windStrength * 0.25)), r.y + finalLength);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 5. Thunder & Lightning Strikes (Enhanced recursive branches generation on trigger)
      if (effectState.thunder.enabled) {
        const now = Date.now();

        // Spawn lighting strike
        if (playing && now > nextLightningTime.current) {
          const spawnProb = (effectState.thunder.frequency / 100) * 0.85;
          if (Math.random() < spawnProb) {
            lightningType.current = Math.random() > 0.35 ? 'strike' : 'burst';
            lightningIntensity.current = 0.6 + Math.random() * 0.4;

            // Trigger sound effects
            if (effectState.thunder.playSound && audioSettings.enabled && playing) {
              ambiance.triggerThunderStrike(lightningIntensity.current);
            }

            // If heavy strike, build jagged recursive branches
            if (lightningType.current === 'strike') {
              const startX = 250 + Math.random() * 1420;
              const maxThickness = effectState.thunder.thickness * (0.8 + scale * 0.2);
              lightningPathSegments.current = generateLightningBoltSegments(
                startX, // startX
                0,      // startY
                950,    // targetEndY
                maxThickness,
                effectState.thunder.branching
              );
            }
          }
          // Set delay for next lightning check
          nextLightningTime.current = now + 2500 + (100 - effectState.thunder.frequency) * 85;
        }

        // Render Lightning Flash and the fork paths
        if (lightningIntensity.current > 0.01) {
          ctx.save();
          
          // Flash overlay
          const hexAlpha = Math.floor(lightningIntensity.current * effectState.thunder.brightness * 180)
            .toString(16)
            .padStart(2, '0');
          ctx.fillStyle = `${effectState.thunder.color}${hexAlpha}`;
          ctx.fillRect(0, 0, 1920, 1080);

          // Draw the fork lines
          if (lightningType.current === 'strike' && lightningPathSegments.current.length > 0) {
            // Neon outer tube
            ctx.save();
            ctx.strokeStyle = effectState.thunder.color;
            ctx.shadowColor = effectState.thunder.color;
            ctx.shadowBlur = 22 * lightningIntensity.current;
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

            // Searing inner white core
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            lightningPathSegments.current.forEach(seg => {
              ctx.lineWidth = seg.thickness * 0.9 * lightningIntensity.current;
              ctx.beginPath();
              ctx.moveTo(seg.startX, seg.startY);
              ctx.lineTo(seg.endX, seg.endY);
              ctx.stroke();
            });
            ctx.restore();
          }

          if (playing) {
            // Lightning decays fast
            lightningIntensity.current *= 0.85;
          }
          ctx.restore();
        } else {
          lightningType.current = 'none';
        }
      }

      // 6. Falling Snow Overlays (Enhanced with 3 Layer Spatial Depth coordinates & Swirls)
      if (effectState.snow.enabled) {
        ctx.save();

        snowParticles.current.forEach(p => {
          let layerSpeedFactor = 1.0;
          if (p.depthLayer === 0) layerSpeedFactor = 0.45; // Far (Rơi chậm)
          else if (p.depthLayer === 2) layerSpeedFactor = 1.65; // Foreground lens (Rơi cực nhanh)

          if (playing) {
            p.y += p.speed * layerSpeedFactor * delta;
            
            p.swingPhase += (p.depthLayer === 0 ? 0.009 : p.depthLayer === 1 ? 0.016 : 0.026) * p.swing * delta;
            
            // Compounding swirl wobble and wind offsets
            const swirlWiggle = Math.sin(p.swingPhase) * (effectState.snow.swirl * 0.55);
            const windPush = effectState.snow.windDirection * effectState.snow.windStrength * 0.16;

            p.x += (swirlWiggle + windPush) * delta;

            if (p.y > 1080) {
              p.y = -20;
              p.x = Math.random() * 1920;
            }
            if (p.x > 1920) p.x = 0;
            if (p.x < 0) p.x = 1920;
          }

          // Opacity based on layer + slider
          let alpha = effectState.snow.opacity;
          if (p.depthLayer === 0) alpha *= 0.4;
          else if (p.depthLayer === 1) alpha *= 0.8;

          // Radius sizing based on layer + slider
          let radius = p.r;
          if (p.depthLayer === 0) radius *= 0.55;
          else if (p.depthLayer === 2) radius *= 1.95; // Foreground flakes are big/spectacular

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          
          if (p.depthLayer === 2) {
            // Foreground snowflakes have misty glow halo
            ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
            ctx.shadowBlur = 7 + (scale * 3);
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 7. Dynamic Audio Visualizer Waves (Enhanced with stacked waves layers)
      if (effectState.visualizer.enabled) {
        ctx.save();
        
        const columnCount = 125;
        const colWidth = 1920 / columnCount;
        const bottomY = 1080;
        
        // Scale baseline height by chooser multiplier
        const baseHeight = effectState.visualizer.height * (0.8 + scale * 0.25);
        
        if (playing) {
          audioWavePhase.current += 0.045 * effectState.visualizer.speed * delta;
        }

        ctx.shadowColor = effectState.visualizer.color;
        ctx.shadowBlur = effectState.visualizer.glow * (0.85 + scale * 0.15);

        // Render stacked layers waves based on visualizer count settings
        const loadedLayers = Math.max(1, Math.min(4, effectState.visualizer.count));
        
        for (let l = 0; l < loadedLayers; l++) {
          // Stagger heights and alphas
          const layerHeightScalar = 1.0 - (l * 0.18);
          const layerOpacity = effectState.visualizer.opacity * (1.0 - (l * 0.22)) * (0.55 + scale * 0.2);
          const layerPhaseOffset = l * (Math.PI / 2.5);

          ctx.fillStyle = effectState.visualizer.color;
          ctx.globalAlpha = Math.max(0.12, layerOpacity);

          ctx.beginPath();
          ctx.moveTo(0, bottomY);

          for (let idx = 0; idx <= columnCount; idx++) {
            const x = idx * colWidth;
            
            // Compound wave structures
            const sin1 = Math.sin(idx * 0.07 + audioWavePhase.current + layerPhaseOffset) * 1.0;
            const cos1 = Math.cos(idx * 0.14 - audioWavePhase.current * 1.4 - layerPhaseOffset) * 0.38;
            const sin2 = Math.sin(idx * 0.03 + audioWavePhase.current * 0.6) * 0.25;
            
            let waveAmp = (sin1 + cos1 + sin2) * baseHeight * layerHeightScalar;

            // Introduce slight pulse beat kicks
            if (playing && idx % 12 === 0) {
              const kickStrength = Math.sin(audioWavePhase.current * 0.35) * 0.5 + 0.5;
              waveAmp += Math.random() * 9 * kickStrength;
            }

            // Curve horizontal borders flat
            const centerScale = Math.sin((idx / columnCount) * Math.PI);
            const finalY = bottomY - Math.max(3, waveAmp * centerScale);

            ctx.lineTo(x, finalY);
          }

          ctx.lineTo(1920, bottomY);
          ctx.closePath();
          ctx.fill();

          // Stroke line borders for premium neon edge aesthetic
          if (effectState.visualizer.thickness > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = effectState.visualizer.thickness * 0.35;
            ctx.globalAlpha = Math.max(0.2, layerOpacity + 0.15);
            
            // Redraw line on outline borders
            ctx.beginPath();
            ctx.moveTo(0, bottomY);
            for (let idx = 0; idx <= columnCount; idx++) {
              const x = idx * colWidth;
              const sin1 = Math.sin(idx * 0.07 + audioWavePhase.current + layerPhaseOffset) * 1.0;
              const cos1 = Math.cos(idx * 0.14 - audioWavePhase.current * 1.4 - layerPhaseOffset) * 0.38;
              const sin2 = Math.sin(idx * 0.03 + audioWavePhase.current * 0.6) * 0.25;
              const waveAmp = (sin1 + cos1 + sin2) * baseHeight * layerHeightScalar;
              const centerScale = Math.sin((idx / columnCount) * Math.PI);
              const finalY = bottomY - Math.max(3, waveAmp * centerScale);
              ctx.lineTo(x, finalY);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Run first frame
    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playing, effectState, loadedImg, imageFit, audioSettings.enabled]);

  // Video recording logic via MediaRecorder API
  const handleStartCaptureVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setRecorderError(null);
      setIsRecording(true);
      setRecordingProgress(0);
      setRecordingTimeLeft(duration);

      // 1. Ensure audio engine is booted securely
      setPlaying(true);
      await ambiance.start(audioSettings);

      // Create chunks storage
      const chunks: Blob[] = [];

      // 2. Capture canvas visuals stream (30 frames/sec)
      let stream: MediaStream;
      if ((canvas as any).captureStream) {
        stream = (canvas as any).captureStream(30);
      } else if ((canvas as any).mozCaptureStream) {
        stream = (canvas as any).mozCaptureStream(30);
      } else {
        throw new Error('Trình duyệt không hỗ trợ Media Connection capture.');
      }

      // 3. Extract synthesized procedural sound and inject into video tracks!
      const audioStream = ambiance.getAudioStream();
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        audioStream.getAudioTracks().forEach(track => {
          stream.addTrack(track.clone());
        });
      }

      // Check supported recording format mime-types
      let selectedMime = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        selectedMime = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/webm';
        }
      }

      // 4. Instantiate MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000, // 6Mbps for clear 1920x1080 outputs
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

          // Force programmatic anchor click download
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = `atmosphere-canvas-clip-${duration}s.webm`;
          document.body.appendChild(link);
          link.click();
          
          // cleanups
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
        } catch (downloadErr) {
          setRecorderError('Xuất file gặp sự cố. Bạn hãy thử thời lượng ngắn hơn (10 - 30 giây).');
        }
      };

      // 5. Start Recording loop
      mediaRecorder.start();

      // Implement timers/progress counters
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
      console.error('Recording initialization failure:', err);
      setIsRecording(false);
      setRecorderError(err?.message || 'Trình duyệt bị từ chối hoặc không tương thích tính năng MediaRecorder.');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Fallback browser alerts */}
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

      {/* Audio permission notice banner to pass strict autoplay blocking */}
      {showAudioConsent && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-950 border border-indigo-800 p-4 rounded-xl text-indigo-100 text-sm shadow-xl">
          <div className="flex items-center gap-3">
            <Volume2 className="size-5 text-indigo-400 animate-bounce" />
            <div>
              <p className="font-semibold">Bật luồng âm thanh không lời?</p>
              <p className="text-xs text-indigo-300">Trình duyệt yêu cầu nhấp chuột để kích hoạt hệ thống phát nhạc Synth & Lofi.</p>
            </div>
          </div>
          <button
            onClick={handleEnableAudioNow}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition"
          >
            Kích hoạt ngay
          </button>
        </div>
      )}

      {/* The 16:9 Cinema Preview Frame */}
      <div className="relative w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl group">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-contain"
          id="visual-rendering-canvas"
        />

        {/* Floating Controls Bar overlays (visible on hover, or when not Cinema mode) */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/95 border border-neutral-800/80 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 transform ${
          cinemaMode ? 'opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100'
        }`}>
          {/* Play/Pause state togglers */}
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

          {/* Export length selector */}
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

          {/* Record / Export Canvas Clip triggers */}
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
                <span>Đang thu: {recordingTimeLeft}s</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>Xuất Video WebM</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Progressive Rendering Dialog overlay */}
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
                <h3 className="text-white font-bold text-lg leading-tight">Đang ghi hoạt ảnh thực tế</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Luồng hình ảnh 1080p và âm thanh lofi đang được tổng hợp. Hãy giữ nguyên tab này cho đến khi tải xuống tự động bắt đầu.
                </p>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-neutral-900 border border-neutral-800 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>

              {/* Countdown metrics */}
              <div className="flex items-center justify-between w-full text-xs font-mono text-neutral-400">
                <span>Tiến độ: {recordingProgress}%</span>
                <span className="text-red-400">Còn lại: {recordingTimeLeft} giây</span>
              </div>
            </div>
          </div>
        )}

        {/* Atmosphere Brand Watermark */}
        <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-none select-none">
          <Sparkles className="size-3.5 text-amber-400 animate-spin" />
          <span className="text-[10px] text-white/90 font-mono tracking-wider font-semibold uppercase">1080P Studio Live</span>
        </div>
      </div>
    </div>
  );
}
