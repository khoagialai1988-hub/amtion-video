import { TextLayer } from '../types';

export const TEXT_FONTS = [
  { name: 'Phông Sans Hiện đại', value: 'Montserrat' },
  { name: 'Phông Tiêu đề Elegant', value: 'Playfair Display' },
  { name: 'Chữ Cổ điển Cinematic', value: 'Cinzel' },
  { name: 'Chữ Viết tay Cursive', value: 'Charm' },
  { name: 'Nét Cọ Brush', value: 'Lobster' },
  { name: 'Chữ Đậm Khỏe Anton', value: 'Anton' },
  { name: 'Tiêu đề Nhạc Hộp Oswald', value: 'Oswald' },
  { name: 'Chữ Mềm Mại Cute', value: 'Fredoka' },
  { name: 'Chữ Phong trần Caveat', value: 'Caveat' },
  { name: 'Phát Sáng Neon', value: 'Pacifico' }
];

export const TEXT_PRESETS: { name: string; description: string; preset: Omit<TextLayer, 'id'> }[] = [
  {
    name: 'STAY WITH ME (Ballad Co)',
    description: 'Phong cách nhạc lofi, buồn da diết với nền mờ thanh lịch',
    preset: {
      name: 'Stay With Me',
      content: 'STAY WITH ME',
      fontFamily: 'Playfair Display',
      fontSize: 55,
      fontWeight: 700,
      italic: true,
      uppercase: true,
      color: '#ffffff',
      gradientEnabled: true,
      gradient: ['#ffffff', '#ffd6f5'],
      opacity: 100,
      letterSpacing: 4,
      lineHeight: 1.2,
      align: 'center',
      x: 50,
      y: 35,
      rotation: 0,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 15,
        offsetX: 0,
        offsetY: 6,
        color: 'rgba(0,0,0,0.6)'
      },
      stroke: {
        enabled: true,
        width: 1.5,
        color: '#1e0524'
      },
      glow: {
        enabled: true,
        intensity: 50,
        color: '#ff66cc'
      },
      background: {
        enabled: true,
        type: 'blur',
        color: 'rgba(15, 10, 20, 0.45)',
        colorEnd: 'rgba(30, 15, 45, 0.45)',
        opacity: 100,
        blur: 10,
        radius: 16,
        padding: 24
      },
      animation: {
        type: 'glowBreathing',
        speed: 40
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Sad Ballad Mood',
    description: 'Chữ Serif hoa lệ kết hợp đổ bóng sang trọng sâu lắng',
    preset: {
      name: 'Sad Ballad',
      content: 'Chuyện Chúng Ta Sau Này...',
      fontFamily: 'Playfair Display',
      fontSize: 48,
      fontWeight: 400,
      italic: true,
      uppercase: false,
      color: '#f8fafc',
      gradientEnabled: false,
      gradient: ['#f8fafc', '#cbd5e1'],
      opacity: 100,
      letterSpacing: 2,
      lineHeight: 1.3,
      align: 'center',
      x: 50,
      y: 45,
      rotation: -1,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 20,
        offsetX: 2,
        offsetY: 8,
        color: 'rgba(0, 0, 0, 0.75)'
      },
      stroke: {
        enabled: false,
        width: 1,
        color: '#000000'
      },
      glow: {
        enabled: false,
        intensity: 20,
        color: '#a855f7'
      },
      background: {
        enabled: false,
        type: 'solid',
        color: 'rgba(0,0,0,0.3)',
        colorEnd: 'rgba(0,0,0,0.3)',
        opacity: 50,
        blur: 0,
        radius: 8,
        padding: 12
      },
      animation: {
        type: 'float',
        speed: 30
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Neon Cyber Night',
    description: 'Chữ vẽ tay phát sáng rực rỡ phong cách lofi chill phố đêm',
    preset: {
      name: 'Neon Night',
      content: 'Lofi Chill Vibes',
      fontFamily: 'Pacifico',
      fontSize: 52,
      fontWeight: 400,
      italic: false,
      uppercase: false,
      color: '#ffffff',
      gradientEnabled: false,
      gradient: ['#ffffff', '#ffffff'],
      opacity: 100,
      letterSpacing: 1,
      lineHeight: 1.2,
      align: 'center',
      x: 50,
      y: 30,
      rotation: -4,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 10,
        offsetX: 0,
        offsetY: 0,
        color: '#ff2299'
      },
      stroke: {
        enabled: true,
        width: 2,
        color: '#2e0018'
      },
      glow: {
        enabled: true,
        intensity: 85,
        color: '#ff11aa'
      },
      background: {
        enabled: true,
        type: 'neon',
        color: '#ff11aa',
        colorEnd: '#a855f7',
        opacity: 15,
        blur: 15,
        radius: 12,
        padding: 20
      },
      animation: {
        type: 'flicker',
        speed: 45
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Luxury Premium Gold',
    description: 'Font chữ All-Caps hoàng gia quý tộc lấp lánh metallic',
    preset: {
      name: 'Luxury Gold',
      content: 'MEMORIES',
      fontFamily: 'Cinzel',
      fontSize: 60,
      fontWeight: 700,
      italic: false,
      uppercase: true,
      color: '#fbbf24',
      gradientEnabled: true,
      gradient: ['#fbbf24', '#fef08a', '#d97706'],
      opacity: 100,
      letterSpacing: 8,
      lineHeight: 1.1,
      align: 'center',
      x: 50,
      y: 40,
      rotation: 0,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 25,
        offsetX: 0,
        offsetY: 10,
        color: 'rgba(0,0,0,0.85)'
      },
      stroke: {
        enabled: true,
        width: 1.5,
        color: '#78350f'
      },
      glow: {
        enabled: true,
        intensity: 30,
        color: '#f59e0b'
      },
      background: {
        enabled: false,
        type: 'solid',
        color: 'rgba(0,0,0,0.4)',
        colorEnd: 'rgba(0,0,0,0.4)',
        opacity: 80,
        blur: 0,
        radius: 4,
        padding: 10
      },
      animation: {
        type: 'fadeIn',
        speed: 50
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Soft Pink Glow (Aesthetic)',
    description: 'Tông màu hồng kẹo ngọt thơ ngây cho nhạc Pop / Acoustic',
    preset: {
      name: 'Soft Pink Glow',
      content: 'Chỉ Muốn Đi Cùng Em ♡',
      fontFamily: 'Charm',
      fontSize: 44,
      fontWeight: 700,
      italic: false,
      uppercase: false,
      color: '#ffffff',
      gradientEnabled: true,
      gradient: ['#ffffff', '#fbcfe8', '#f472b6'],
      opacity: 100,
      letterSpacing: 2,
      lineHeight: 1.3,
      align: 'center',
      x: 50,
      y: 50,
      rotation: 1,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 15,
        offsetX: 0,
        offsetY: 4,
        color: 'rgba(190, 24, 74, 0.4)'
      },
      stroke: {
        enabled: true,
        width: 1,
        color: '#ec4899'
      },
      glow: {
        enabled: true,
        intensity: 45,
        color: '#f472b6'
      },
      background: {
        enabled: false,
        type: 'solid',
        color: 'rgba(0,0,0,0.3)',
        colorEnd: 'rgba(0,0,0,0.3)',
        opacity: 60,
        blur: 0,
        radius: 12,
        padding: 16
      },
      animation: {
        type: 'wave',
        speed: 35
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Blue R&B Midnight',
    description: 'Chữ Neon xanh Cyan huyền bí bay bổng quyến rũ',
    preset: {
      name: 'Blue R&B Mood',
      content: 'MIDNIGHT R&B',
      fontFamily: 'Oswald',
      fontSize: 54,
      fontWeight: 700,
      italic: false,
      uppercase: true,
      color: '#e2f8ff',
      gradientEnabled: true,
      gradient: ['#a5f3fc', '#06b6d4'],
      opacity: 100,
      letterSpacing: 6,
      lineHeight: 1.2,
      align: 'center',
      x: 50,
      y: 35,
      rotation: 0,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 15,
        offsetX: 0,
        offsetY: 6,
        color: 'rgba(0, 0, 0, 0.7)'
      },
      stroke: {
        enabled: true,
        width: 2,
        color: '#083344'
      },
      glow: {
        enabled: true,
        intensity: 70,
        color: '#06b6d4'
      },
      background: {
        enabled: true,
        type: 'blur',
        color: 'rgba(8, 15, 30, 0.6)',
        colorEnd: 'rgba(15, 30, 60, 0.6)',
        opacity: 100,
        blur: 10,
        radius: 12,
        padding: 20
      },
      animation: {
        type: 'pulse',
        speed: 25
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'New Song Announcement',
    description: 'Chữ tiêu đề đậm nổi khối góc cạnh, thích hợp làm banner thumbnail',
    preset: {
      name: 'New Song Label',
      content: 'NEW SONG • OUT NOW',
      fontFamily: 'Anton',
      fontSize: 34,
      fontWeight: 400,
      italic: false,
      uppercase: true,
      color: '#ffffff',
      gradientEnabled: false,
      gradient: ['#ffffff', '#ffffff'],
      opacity: 100,
      letterSpacing: 3,
      lineHeight: 1.1,
      align: 'center',
      x: 50,
      y: 18,
      rotation: 0,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 12,
        offsetX: 4,
        offsetY: 4,
        color: '#ef4444'
      },
      stroke: {
        enabled: true,
        width: 3,
        color: '#000000'
      },
      glow: {
        enabled: false,
        intensity: 0,
        color: '#ffffff'
      },
      background: {
        enabled: true,
        type: 'solid',
        color: '#ef4444',
        colorEnd: '#ef4444',
        opacity: 100,
        blur: 0,
        radius: 8,
        padding: 16
      },
      animation: {
        type: 'shake',
        speed: 20
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  },
  {
    name: 'Official Music Video',
    description: 'Nhãn phụ chuyên nghiệp nhỏ gọn thanh lịch tinh xảo',
    preset: {
      name: 'Official Label',
      content: 'OFFICIAL LYRIC VIDEO',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: 700,
      italic: false,
      uppercase: true,
      color: '#f8fafc',
      gradientEnabled: true,
      gradient: ['#f8fafc', '#94a3b8'],
      opacity: 90,
      letterSpacing: 5,
      lineHeight: 1.2,
      align: 'center',
      x: 51,
      y: 84,
      rotation: 0,
      scale: 1,
      shadow: {
        enabled: true,
        blur: 8,
        offsetX: 0,
        offsetY: 2,
        color: 'rgba(0,0,0,0.5)'
      },
      stroke: {
        enabled: false,
        width: 1,
        color: '#000000'
      },
      glow: {
        enabled: false,
        intensity: 0,
        color: '#ffffff'
      },
      background: {
        enabled: true,
        type: 'solid',
        color: 'rgba(15, 23, 42, 0.8)',
        colorEnd: 'rgba(15, 23, 42, 0.8)',
        opacity: 100,
        blur: 0,
        radius: 99,
        padding: 12
      },
      animation: {
        type: 'none',
        speed: 0
      },
      visible: true,
      locked: false,
      zIndex: 10
    }
  }
];

export const createDefaultTextLayer = (id: string, name: string): TextLayer => ({
  id,
  name,
  content: 'Nhập nội dung chữ của bạn...',
  fontFamily: 'Montserrat',
  fontSize: 36,
  fontWeight: 600,
  italic: false,
  uppercase: false,
  color: '#ffffff',
  gradientEnabled: false,
  gradient: ['#ffffff', '#a855f7'],
  opacity: 100,
  letterSpacing: 2,
  lineHeight: 1.2,
  align: 'center',
  x: 50,
  y: 50,
  rotation: 0,
  scale: 1,
  shadow: {
    enabled: true,
    blur: 10,
    offsetX: 2,
    offsetY: 2,
    color: 'rgba(0,0,0,0.5)'
  },
  stroke: {
    enabled: false,
    width: 2,
    color: '#000000'
  },
  glow: {
    enabled: false,
    intensity: 40,
    color: '#a855f7'
  },
  background: {
    enabled: false,
    type: 'solid',
    color: 'rgba(0,0,0,0.4)',
    colorEnd: 'rgba(0,0,0,0.4)',
    opacity: 100,
    blur: 0,
    radius: 8,
    padding: 12
  },
  animation: {
    type: 'none',
    speed: 50
  },
  visible: true,
  locked: false,
  zIndex: 10
});
