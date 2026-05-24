export interface SingleEffectSettings {
  enabled: boolean;
  intensity: number; // 0 to 100
  speed: number;     // 0 to 100
  color: string;     // Hex color like "#ffffff"
  opacity: number;   // 0 to 100
  size: number;      // 0 to 100
  glow: number;      // 0 to 100
  position: 'fullscreen' | 'top' | 'bottom' | 'left' | 'right' | 'center' | 'behind' | 'front';
  blendMode: 'normal' | 'screen' | 'lighten' | 'overlay' | 'soft-light';
}

export interface AudioSettings {
  enabled: boolean;
  volume: number; // Master (0 to 1)
  padVolume: number; // Ambient Pad (0 to 1)
  pianoVolume: number; // Lofi Piano (0 to 1)
  windVolume: number; // Wind Whispers (0 to 1)
  fireplaceVolume: number; // Fire crackle (0 to 1)
  rainVolume: number; // Rain static overlay (0 to 1)
}

export type IntensityLevel = 'light' | 'medium' | 'heavy' | 'extreme';

export interface EffectState {
  intensityLevel: IntensityLevel;
  snowDepth: SingleEffectSettings;
  rainSpace: SingleEffectSettings;
  stormElectric: SingleEffectSettings;
  meteorDream: SingleEffectSettings;
  soundWave: SingleEffectSettings;
  musicPlayer: SingleEffectSettings;
  audioSpectrum: SingleEffectSettings;
  bassPulse: SingleEffectSettings;
  eqCircle: SingleEffectSettings;
  neonWave: SingleEffectSettings;
  musicParticles: SingleEffectSettings;
  vinylSpin: SingleEffectSettings;
  stageLight: SingleEffectSettings;
  audioHeartbeat: SingleEffectSettings;
}

export type PresetName = 
  | 'snow-studio' 
  | 'rainy-rnb' 
  | 'thunder-drama' 
  | 'meteor-dream' 
  | 'full-cinematic';

export interface Preset {
  id: PresetName;
  name: string;
  description: string;
  icon: string;
  state: EffectState;
  audio: AudioSettings;
}

export type RenderDuration = 10 | 30 | 60 | 180 | 300; // in seconds

export interface TextLayer {
  id: string;
  name: string; // for layering panel
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  uppercase: boolean;
  color: string;
  gradientEnabled: boolean;
  gradient: string[];
  opacity: number;
  letterSpacing: number;
  lineHeight: number;
  align: 'left' | 'center' | 'right';
  x: number; // percent 0-100
  y: number; // percent 0-100
  rotation: number; // degrees
  scale: number;
  shadow: {
    enabled: boolean;
    blur: number;
    offsetX: number;
    offsetY: number;
    color: string;
  };
  stroke: {
    enabled: boolean;
    width: number;
    color: string;
  };
  glow: {
    enabled: boolean;
    intensity: number;
    color: string;
  };
  background: {
    enabled: boolean;
    type: 'solid' | 'blur' | 'gradient' | 'neon';
    color: string;
    colorEnd: string;
    opacity: number;
    blur: number;
    radius: number;
    padding: number;
  };
  animation: {
    type: 'none' | 'fadeIn' | 'fadeOut' | 'slideUp' | 'slideDown' | 'zoomIn' | 'zoomOut' | 'bounce' | 'pulse' | 'flicker' | 'glowBreathing' | 'typewriter' | 'karaoke' | 'wave' | 'float' | 'shake';
    speed: number;
  };
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

