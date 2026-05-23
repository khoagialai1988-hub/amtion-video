import { Preset, EffectState, AudioSettings } from '../types';

export const INITIAL_STATE: EffectState = {
  intensityLevel: 'medium',
  snow: { 
    enabled: true, 
    count: 120, // Tăng mật độ mặc định rõ rệt
    speed: 1.5, 
    size: 3.5, 
    swirl: 3, 
    windDirection: 1, 
    windStrength: 2, 
    opacity: 0.8 
  },
  rain: { 
    enabled: false, 
    count: 200, 
    speed: 7.5, 
    length: 16, 
    thickness: 2, 
    windDirection: -2, 
    windStrength: 3, 
    opacity: 0.7 
  },
  thunder: { 
    enabled: false, 
    frequency: 35, 
    brightness: 0.7, 
    thickness: 4, 
    branching: 3, 
    color: '#e0f2fe', 
    playSound: true 
  },
  meteor: { 
    enabled: false, 
    count: 6, 
    frequency: 45, 
    speed: 9, 
    tailLength: 100, 
    glow: 12, 
    direction: 40, 
    opacity: 0.8 
  },
  spotlight: { 
    enabled: true, 
    count: 3, // Sử dụng nhiều beam cùng lúc để tăng tính sân khấu
    color: 'cyan', 
    brightness: 0.5, 
    width: 320, 
    angle: 22, 
    speed: 1.2, 
    glow: 15, 
    haze: 0.4 
  },
  visualizer: { 
    enabled: true, 
    height: 60, 
    speed: 1.8, 
    thickness: 3, 
    glow: 15, 
    count: 3, // Nhiều dải sóng chồng lớp rất sang xịn mịn
    opacity: 0.7, 
    color: '#f59e0b' 
  },
};

export const INITIAL_AUDIO: AudioSettings = {
  enabled: false, // Bắt đầu tắt âm do chính sách trình lặp của trình duyệt
  volume: 0.6,
  padVolume: 0.7,
  pianoVolume: 0.4,
  windVolume: 0.2,
  fireplaceVolume: 0.3,
  rainVolume: 0.0,
};

export const PRESETS: Preset[] = [
  {
    id: 'snow-studio',
    name: 'Mưa Tuyết Phòng Thu ❄️',
    description: 'Không gian tuyết rơi dày đậm đà, bao phủ lớp nền lofi đầy ấm cúng và sang trọng.',
    icon: 'Snowflake',
    state: {
      intensityLevel: 'heavy',
      snow: { 
        enabled: true, 
        count: 180, // Rơi dày xịn sò
        speed: 1.4, 
        size: 4.0, 
        swirl: 4.5, 
        windDirection: 1.2, 
        windStrength: 2.5, 
        opacity: 0.9 
      },
      rain: { 
        enabled: false, 
        count: 80, 
        speed: 5.0, 
        length: 12, 
        thickness: 2, 
        windDirection: 0, 
        windStrength: 1, 
        opacity: 0.6 
      },
      thunder: { 
        enabled: false, 
        frequency: 15, 
        brightness: 0.4, 
        thickness: 3, 
        branching: 2, 
        color: '#ffffff', 
        playSound: false 
      },
      meteor: { 
        enabled: false, 
        count: 3, 
        frequency: 20, 
        speed: 6, 
        tailLength: 70, 
        glow: 8, 
        direction: 35, 
        opacity: 0.6 
      },
      spotlight: { 
        enabled: true, 
        count: 3, 
        color: 'white', 
        brightness: 0.55, 
        width: 300, 
        angle: 15, 
        speed: 0.9, 
        glow: 18, 
        haze: 0.5 
      },
      visualizer: { 
        enabled: true, 
        height: 55, 
        speed: 1.4, 
        thickness: 4, 
        glow: 18, 
        count: 3, 
        opacity: 0.75, 
        color: '#38bdf8' // sky-400
      },
    },
    audio: {
      enabled: false,
      volume: 0.0,
      padVolume: 0.0,
      pianoVolume: 0.0,
      windVolume: 0.0,
      fireplaceVolume: 0.0,
      rainVolume: 0.0,
    }
  },
  {
    id: 'rainy-rnb',
    name: 'Đêm Mưa Sâu Lắng 🌧️',
    description: 'Khung cảnh màn mưa rơi mờ ảo xối xả kết hợp với các luồng ánh sáng hồng lãng mạn.',
    icon: 'CloudRain',
    state: {
      intensityLevel: 'medium',
      snow: { 
        enabled: false, 
        count: 60, 
        speed: 1.2, 
        size: 2.8, 
        swirl: 2, 
        windDirection: 0, 
        windStrength: 1, 
        opacity: 0.5 
      },
      rain: { 
        enabled: true, 
        count: 240, // Mưa rơi dày thấy rõ
        speed: 8.5, 
        length: 22, 
        thickness: 3, 
        windDirection: -1.5, 
        windStrength: 4, 
        opacity: 0.85 
      },
      thunder: { 
        enabled: false, 
        frequency: 20, 
        brightness: 0.5, 
        thickness: 4, 
        branching: 2, 
        color: '#e0f2fe', 
        playSound: true 
      },
      meteor: { 
        enabled: false, 
        count: 2, 
        frequency: 15, 
        speed: 8, 
        tailLength: 80, 
        glow: 10, 
        direction: 45, 
        opacity: 0.6 
      },
      spotlight: { 
        enabled: true, 
        count: 4, 
        color: 'pink', 
        brightness: 0.6, 
        width: 350, 
        angle: 28, 
        speed: 1.5, 
        glow: 20, 
        haze: 0.6 
      },
      visualizer: { 
        enabled: true, 
        height: 75, 
        speed: 2.2, 
        thickness: 4, 
        glow: 22, 
        count: 3, 
        opacity: 0.8, 
        color: '#ec4899' // pink-500
      },
    },
    audio: {
      enabled: false,
      volume: 0.0,
      padVolume: 0.0,
      pianoVolume: 0.0,
      windVolume: 0.0,
      fireplaceVolume: 0.0,
      rainVolume: 0.0,
    }
  },
  {
    id: 'thunder-drama',
    name: 'Bão Giông Kịch Tính ⚡',
    description: 'Bầu trời đêm kịch tính với chớp giăng bão tố xé toạc màn đêm và dòng nước rơi xối xả.',
    icon: 'CloudLightning',
    state: {
      intensityLevel: 'heavy',
      snow: { 
        enabled: false, 
        count: 0, 
        speed: 1.5, 
        size: 2.5, 
        swirl: 0, 
        windDirection: 0, 
        windStrength: 0, 
        opacity: 0 
      },
      rain: { 
        enabled: true, 
        count: 380, // Mưa xối xả
        speed: 10.5, 
        length: 28, 
        thickness: 4, 
        windDirection: -3.5, 
        windStrength: 6, 
        opacity: 0.9 
      },
      thunder: { 
        enabled: true, 
        frequency: 70, // Sét liên tiếp
        brightness: 0.95, 
        thickness: 7, 
        branching: 4, 
        color: '#faf5ff', 
        playSound: true 
      },
      meteor: { 
        enabled: false, 
        count: 0, 
        frequency: 0, 
        speed: 10, 
        tailLength: 80, 
        glow: 0, 
        direction: 45, 
        opacity: 0 
      },
      spotlight: { 
        enabled: true, 
        count: 2, 
        color: 'white', 
        brightness: 0.4, 
        width: 320, 
        angle: 12, 
        speed: 2.2, 
        glow: 25, 
        haze: 0.7 
      },
      visualizer: { 
        enabled: true, 
        height: 90, 
        speed: 3.0, 
        thickness: 5, 
        glow: 25, 
        count: 4, // 4 dải sóng xếp chồng hoành tráng
        opacity: 0.85, 
        color: '#a855f7' // purple-500
      },
    },
    audio: {
      enabled: false,
      volume: 0.0,
      padVolume: 0.0,
      pianoVolume: 0.0,
      windVolume: 0.0,
      fireplaceVolume: 0.0,
      rainVolume: 0.0,
    }
  },
  {
    id: 'meteor-dream',
    name: 'Mưa Sao Băng Thơ Mộng ☄️',
    description: 'Bầu trời rực rỡ bùng nổ những vệt mưa sao băng rạch ngang màn đêm lung linh và huyền ảo.',
    icon: 'Sparkles',
    state: {
      intensityLevel: 'extreme', // Cực kỳ bùng nổ mưa sao băng
      snow: { 
        enabled: false, 
        count: 0, 
        speed: 1.0, 
        size: 2.5, 
        swirl: 0, 
        windDirection: 0, 
        windStrength: 0, 
        opacity: 0 
      },
      rain: { 
        enabled: false, 
        count: 0, 
        speed: 5.0, 
        length: 12, 
        thickness: 1, 
        windDirection: 0, 
        windStrength: 0, 
        opacity: 0 
      },
      thunder: { 
        enabled: false, 
        frequency: 0, 
        brightness: 0, 
        thickness: 0, 
        branching: 0, 
        color: '#ffffff', 
        playSound: false 
      },
      meteor: { 
        enabled: true, 
        count: 18, 
        frequency: 85, // Mưa sao băng dày đặc rực rỡ
        speed: 12, 
        tailLength: 160, 
        glow: 22, 
        direction: 45, 
        opacity: 0.95 
      },
      spotlight: { 
        enabled: true, 
        count: 4, 
        color: 'warm', 
        brightness: 0.65, 
        width: 380, 
        angle: 35, 
        speed: 0.8, 
        glow: 22, 
        haze: 0.5 
      },
      visualizer: { 
        enabled: true, 
        height: 50, 
        speed: 1.2, 
        thickness: 3, 
        glow: 18, 
        count: 3, 
        opacity: 0.7, 
        color: '#f59e0b' // amber-500
      },
    },
    audio: {
      enabled: false,
      volume: 0.0,
      padVolume: 0.0,
      pianoVolume: 0.0,
      windVolume: 0.0,
      fireplaceVolume: 0.0,
      rainVolume: 0.0,
    }
  },
  {
    id: 'full-cinematic',
    name: 'Trải Nghiệm Toàn Cảnh 🌌',
    description: 'Khung cảnh kết hợp đỉnh cao toàn diện giữa mưa, tuyết, sao băng và dàn ánh sáng hoành tráng.',
    icon: 'Tv',
    state: {
      intensityLevel: 'extreme', // Cực đại tối đa
      snow: { 
        enabled: true, 
        count: 100, 
        speed: 1.4, 
        size: 3.0, 
        swirl: 3.5, 
        windDirection: 1, 
        windStrength: 2, 
        opacity: 0.85 
      },
      rain: { 
        enabled: true, 
        count: 180, 
        speed: 7.5, 
        length: 20, 
        thickness: 3, 
        windDirection: -1.5, 
        windStrength: 3.5, 
        opacity: 0.8 
      },
      thunder: { 
        enabled: true, 
        frequency: 45, 
        brightness: 0.75, 
        thickness: 5, 
        branching: 3, 
        color: '#e0f2fe', 
        playSound: true 
      },
      meteor: { 
        enabled: true, 
        count: 8, 
        frequency: 50, 
        speed: 10, 
        tailLength: 120, 
        glow: 18, 
        direction: 38, 
        opacity: 0.85 
      },
      spotlight: { 
        enabled: true, 
        count: 4, 
        color: 'cyan', 
        brightness: 0.5, 
        width: 340, 
        angle: 25, 
        speed: 1.3, 
        glow: 20, 
        haze: 0.6 
      },
      visualizer: { 
        enabled: true, 
        height: 70, 
        speed: 2.0, 
        thickness: 4, 
        glow: 20, 
        count: 4, 
        opacity: 0.8, 
        color: '#10b981' // emerald-500
      },
    },
    audio: {
      enabled: false,
      volume: 0.0,
      padVolume: 0.0,
      pianoVolume: 0.0,
      windVolume: 0.0,
      fireplaceVolume: 0.0,
      rainVolume: 0.0,
    }
  }
];
