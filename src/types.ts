export interface SnowSettings {
  enabled: boolean;
  count: number; // Snow Amount / Density
  speed: number;
  size: number;
  swirl: number; // custom swirl wiggle factor (0 to 10)
  windDirection: number; // -5 (left) to 5 (right)
  windStrength: number; // 0 to 10
  opacity: number; // 0.1 to 1.0
}

export interface RainSettings {
  enabled: boolean;
  count: number; // Rain Amount / Density
  speed: number;
  length: number;
  thickness: number; // index of thickness (1px to 6px)
  windDirection: number; // -10 (heavy slant left) to 10 (heavy slant right)
  windStrength: number; // 0 to 10
  opacity: number; // 0.1 to 1.0
}

export interface ThunderSettings {
  enabled: boolean;
  frequency: number; // 0 (rare) to 100 (frequent)
  brightness: number; // flash opacity (0 to 1)
  thickness: number; // bolt width (1px to 12px)
  branching: number; // level of branching detail (1 to 5)
  color: string; // colors: '#ffffff' (white), '#e0f2fe' (soft blue), '#faf5ff' (violet)
  playSound: boolean;
}

export interface MeteorSettings {
  enabled: boolean;
  count: number; // meteor spawn frequency / speed
  frequency: number; // likelihood spawn (0 to 100)
  speed: number;
  tailLength: number;
  glow: number; // glow bloom (0 to 30)
  direction: number; // angle (15 to 75 degrees)
  opacity: number; // 0.1 to 1.0
}

export interface SpotlightSettings {
  enabled: boolean;
  count: number; // Beam Amount (1 to 6)
  color: 'warm' | 'pink' | 'cyan' | 'white';
  brightness: number; // general opacity (0 to 1)
  width: number; // beam width (100 to 800)
  angle: number; // sweep width swing angle
  speed: number; // swing speed
  glow: number; // glow bloom (0 to 30)
  haze: number; // dust fog intensity (0 to 1)
}

export interface VisualizerSettings {
  enabled: boolean;
  height: number; // scaling factor
  speed: number; // oscillation speed
  thickness: number; // line stroke width (1 to 10)
  glow: number; // drop shadow blur
  count: number; // number of wave layers stacked (1 to 4)
  opacity: number; // wave alpha (0.1 to 1.0)
  color: string; // wave hex color
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
  snow: SnowSettings;
  rain: RainSettings;
  thunder: ThunderSettings;
  meteor: MeteorSettings;
  spotlight: SpotlightSettings;
  visualizer: VisualizerSettings;
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
