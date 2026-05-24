import { Preset, EffectState, AudioSettings, SingleEffectSettings } from '../types';

export const DEFAULT_EFFECT_SETTINGS: Record<string, Omit<SingleEffectSettings, 'enabled'>> = {
  snowDepth: {
    intensity: 45,
    speed: 35,
    color: "#ffffff",
    opacity: 85,
    size: 40,
    glow: 10,
    position: 'fullscreen',
    blendMode: 'lighten'
  },
  rainSpace: {
    intensity: 55,
    speed: 60,
    color: "#cbd5e1", // soft white slate rain
    opacity: 80,
    size: 30,
    glow: 10,
    position: 'fullscreen',
    blendMode: 'lighten'
  },
  stormElectric: {
    intensity: 40,
    speed: 50,
    color: "#cbd5e1",
    opacity: 85,
    size: 45,
    glow: 60,
    position: 'fullscreen',
    blendMode: 'screen'
  },
  meteorDream: {
    intensity: 35,
    speed: 55,
    color: "#f59e0b", // Gold / Amber
    opacity: 80,
    size: 35,
    glow: 60,
    position: 'fullscreen',
    blendMode: 'screen'
  },
  soundWave: {
    intensity: 65,
    speed: 45,
    color: "#f59e0b", // Warm gold wave
    opacity: 75,
    size: 55,
    glow: 40,
    position: 'bottom',
    blendMode: 'screen'
  },
  musicPlayer: {
    intensity: 50,
    speed: 40,
    color: "#ec4899", // pink
    opacity: 90,
    size: 80, // scale
    glow: 35,
    position: 'bottom',
    blendMode: 'normal'
  },
  audioSpectrum: {
    intensity: 75,
    speed: 50,
    color: "#38bdf8", // sky blue
    opacity: 85,
    size: 45, // bar width
    glow: 50,
    position: 'bottom',
    blendMode: 'screen'
  },
  bassPulse: {
    intensity: 60,
    speed: 50,
    color: "#ec4899", // pink-500
    opacity: 65,
    size: 50,
    glow: 75,
    position: 'center',
    blendMode: 'screen'
  },
  eqCircle: {
    intensity: 65,
    speed: 45,
    color: "#10b981", // emerald
    opacity: 80,
    size: 65, // radius
    glow: 55,
    position: 'center',
    blendMode: 'screen'
  },
  neonWave: {
    intensity: 55,
    speed: 55,
    color: "#a855f7", // purple
    opacity: 75,
    size: 45,
    glow: 65,
    position: 'center',
    blendMode: 'screen'
  },
  musicParticles: {
    intensity: 65,
    speed: 45,
    color: "#fbbf24", // amber
    opacity: 85,
    size: 40,
    glow: 45,
    position: 'fullscreen',
    blendMode: 'screen'
  },
  vinylSpin: {
    intensity: 50,
    speed: 45,
    color: "#a855f7", // purple vinyl
    opacity: 90,
    size: 65,
    glow: 35,
    position: 'top',
    blendMode: 'normal'
  },
  stageLight: {
    intensity: 45,
    speed: 35,
    color: "#22d3ee", // cyan spotlight
    opacity: 70,
    size: 55,
    glow: 60,
    position: 'top',
    blendMode: 'screen'
  },
  audioHeartbeat: {
    intensity: 55,
    speed: 50,
    color: "#ef4444", // red
    opacity: 80,
    size: 45,
    glow: 65,
    position: 'center',
    blendMode: 'screen'
  }
};

export const createDefaultEffectState = (): EffectState => {
  const state: Partial<EffectState> = {
    intensityLevel: 'medium'
  };

  Object.entries(DEFAULT_EFFECT_SETTINGS).forEach(([key, values]) => {
    state[key as keyof Omit<EffectState, 'intensityLevel'>] = {
      enabled: false,
      ...values
    } as SingleEffectSettings;
  });

  return state as EffectState;
};

// Default initial state (Tuyết + Sóng âm + Ánh sáng sân khấu được bật mặc định giống như trước)
export const INITIAL_STATE: EffectState = createDefaultEffectState();
INITIAL_STATE.snowDepth.enabled = true;
INITIAL_STATE.soundWave.enabled = true;
INITIAL_STATE.stageLight.enabled = true;

export const INITIAL_AUDIO: AudioSettings = {
  enabled: false, // Turn off by default due to browser security restrictions
  volume: 0.6,
  padVolume: 0.7,
  pianoVolume: 0.4,
  windVolume: 0.2,
  fireplaceVolume: 0.3,
  rainVolume: 0.0,
};

// Helper to clone base state and patch particular attributes
const patchState = (patch: Partial<Record<keyof Omit<EffectState, 'intensityLevel'>, Partial<SingleEffectSettings>>>): EffectState => {
  const base = createDefaultEffectState();
  Object.entries(patch).forEach(([key, innerPatch]) => {
    const k = key as keyof Omit<EffectState, 'intensityLevel'>;
    base[k] = {
      ...base[k],
      ...innerPatch,
      enabled: innerPatch.enabled !== undefined ? innerPatch.enabled : true
    } as SingleEffectSettings;
  });
  return base;
};

export const PRESETS: Preset[] = [
  {
    id: 'snow-studio',
    name: 'Mưa Tuyết Phòng Thu ❄️',
    description: 'Không gian tuyết rơi dày đậm đà, bao phủ lớp nền lofi đầy ấm cúng và sang trọng.',
    icon: 'Snowflake',
    state: patchState({
      snowDepth: { enabled: true, intensity: 70, speed: 45, opacity: 90, size: 45 },
      soundWave: { enabled: true, intensity: 65, speed: 40, color: "#38bdf8", opacity: 75 },
      stageLight: { enabled: true, intensity: 50, speed: 30, color: "#ffffff", opacity: 60 }
    }),
    audio: {
      enabled: false,
      volume: 0.5,
      padVolume: 0.8,
      pianoVolume: 0.6,
      windVolume: 0.1,
      fireplaceVolume: 0.4,
      rainVolume: 0.0
    }
  },
  {
    id: 'rainy-rnb',
    name: 'Đêm Mưa Sâu Lắng 🌧️',
    description: 'Khung cảnh màn mưa rơi mờ ảo xối xả kết hợp với các luồng ánh sáng hồng lãng mạn.',
    icon: 'CloudRain',
    state: patchState({
      rainSpace: { enabled: true, intensity: 80, speed: 80, color: "#94a3b8", opacity: 85, size: 40 },
      soundWave: { enabled: true, intensity: 75, speed: 60, color: "#ec4899", opacity: 80 },
      stageLight: { enabled: true, intensity: 65, speed: 45, color: "#ec4899", opacity: 70 }
    }),
    audio: {
      enabled: false,
      volume: 0.6,
      padVolume: 0.5,
      pianoVolume: 0.7,
      windVolume: 0.3,
      fireplaceVolume: 0.1,
      rainVolume: 0.8
    }
  },
  {
    id: 'thunder-drama',
    name: 'Bão Giông Kịch Tính ⚡',
    description: 'Bầu trời đêm kịch tính với chớp giăng bão tố xé toạc màn đêm và dòng nước rơi xối xả.',
    icon: 'CloudLightning',
    state: patchState({
      rainSpace: { enabled: true, intensity: 90, speed: 90, color: "#64748b", opacity: 90, size: 50 },
      stormElectric: { enabled: true, intensity: 80, speed: 60, color: "#ffffff", opacity: 90, glow: 90 },
      audioHeartbeat: { enabled: true, intensity: 70, speed: 60, color: "#ef4444", opacity: 80, size: 55 }
    }),
    audio: {
      enabled: false,
      volume: 0.7,
      padVolume: 0.6,
      pianoVolume: 0.3,
      windVolume: 0.8,
      fireplaceVolume: 0.2,
      rainVolume: 0.9
    }
  },
  {
    id: 'meteor-dream',
    name: 'Mưa Sao Băng Thần Thoại ☄️',
    description: 'Sao băng quét lướt lãng mạn trên nền trời đêm vàng ấm lung linh bụi hạt.',
    icon: 'Sparkles',
    state: patchState({
      meteorDream: { enabled: true, intensity: 75, speed: 70, color: "#fbbf24", glow: 85, size: 50 },
      musicParticles: { enabled: true, intensity: 70, speed: 50, color: "#fbbf24", opacity: 85 },
      eqCircle: { enabled: true, intensity: 60, speed: 40, color: "#fbbf24", size: 65 }
    }),
    audio: {
      enabled: false,
      volume: 0.6,
      padVolume: 0.7,
      pianoVolume: 0.5,
      windVolume: 0.4,
      fireplaceVolume: 0.4,
      rainVolume: 0.0
    }
  },
  {
    id: 'full-cinematic',
    name: 'Sân Khấu Lofi Đọc Bản 🎭',
    description: 'Sự giao thoa diệu kỳ từ đĩa vinyl quay, đường sóng neon dạt dào và dải phổ âm đầy phấn khởi.',
    icon: 'Film',
    state: patchState({
      vinylSpin: { enabled: true, intensity: 50, speed: 50, size: 70, color: "#a855f7" },
      neonWave: { enabled: true, intensity: 65, speed: 60, color: "#cbd5e1" },
      audioSpectrum: { enabled: true, intensity: 75, speed: 50, color: "#38bdf8" }
    }),
    audio: {
      enabled: false,
      volume: 0.7,
      padVolume: 0.7,
      pianoVolume: 0.8,
      windVolume: 0.2,
      fireplaceVolume: 0.5,
      rainVolume: 0.1
    }
  }
];
