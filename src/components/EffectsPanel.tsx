import React, { useState } from 'react';
import { EffectState, AudioSettings, IntensityLevel, SingleEffectSettings, TextLayer } from '../types';
import { DEFAULT_EFFECT_SETTINGS } from '../constants/presets';
import { TEXT_FONTS, TEXT_PRESETS, createDefaultTextLayer } from '../constants/textPresets';
import { 
  Snowflake, CloudRain, CloudLightning, Sparkles, Tv, HelpCircle, 
  Sliders, Music, ToggleLeft, ToggleRight, Sun, Volume2, Flame, Wind,
  Layers, Gauge, Activity, Compass, Cpu, Zap, Disc, Heart, ArrowLeft, RotateCcw, FlameKindling,
  Type, Plus, Trash2, Copy, Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown, Palette, 
  Layout, Heading, Bold, Italic, AlignLeft, AlignCenter, AlignRight, RefreshCw
} from 'lucide-react';

interface EffectsPanelProps {
  effectState: EffectState;
  setEffectState: React.Dispatch<React.SetStateAction<EffectState>>;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  textLayers: TextLayer[];
  setTextLayers: React.Dispatch<React.SetStateAction<TextLayer[]>>;
  activeTextLayerId: string | null;
  setActiveTextLayerId: (id: string | null) => void;
}

const EFFECT_METADATA = [
  {
    key: 'snowDepth' as const,
    name: '1. Tuyết Rơi 3 Chiều',
    icon: Snowflake,
    desc: 'Hạt tuyết rơi chuyển động phân lớp xa và gần lập thể.'
  },
  {
    key: 'rainSpace' as const,
    name: '2. Mưa Giông 3 Chiều',
    icon: CloudRain,
    desc: 'Hiệu ứng các vệt mưa rơi xiên phân tầng sống động.'
  },
  {
    key: 'stormElectric' as const,
    name: '3. Sấm Sét & Chớp Nháy',
    icon: CloudLightning,
    desc: 'Tia sét rạch ngang mờ ảo ngẫu nhiên kèm chớp giật.'
  },
  {
    key: 'meteorDream' as const,
    name: '4. Mưa Sao Băng Thơ Mộng',
    icon: Sparkles,
    desc: 'Các vệt sáng sao băng lướt qua cực kỳ lãng mạn.'
  },
  {
    key: 'soundWave' as const,
    name: '5. Làn Sóng Âm',
    icon: Music,
    desc: 'Sóng âm dao động uốn lượn uốn khúc đầy tính nghệ sĩ.'
  },
  {
    key: 'musicPlayer' as const,
    name: '6. Máy Phát Nhạc',
    icon: Tv,
    desc: 'Khung máy phát lofi tối giản hiển thị đĩa than & tiến trình.'
  },
  {
    key: 'audioSpectrum' as const,
    name: '7. Thanh Phổ Âm',
    icon: Sliders,
    desc: 'Cột nhảy tần phổ âm thanh nhảy dập dình theo nhịp bass.'
  },
  {
    key: 'bassPulse' as const,
    name: '8. Nhịp Bass Phát Sáng',
    icon: Zap,
    desc: 'Ánh sáng neon dập dình tỏa nhiệt rực rỡ ảo dịu.'
  },
  {
    key: 'eqCircle' as const,
    name: '9. Vòng Tròn Equalizer',
    icon: Compass,
    desc: 'Xung tròn dao động đồng tâm, thích hợp xuất clip nhạc.'
  },
  {
    key: 'neonWave' as const,
    name: '10. Đường Sóng Neon',
    icon: Wind,
    desc: 'Những dải sóng neon uốn lượn song song mềm mại.'
  },
  {
    key: 'musicParticles' as const,
    name: '11. Hạt Sáng Theo Nhạc',
    icon: Layers,
    desc: 'Bụi hạt cát sáng bay lơ lửng bừng nảy khi có nhịp nhạc.'
  },
  {
    key: 'vinylSpin' as const,
    name: '12. Đĩa Nhạc Xoay',
    icon: Disc,
    desc: 'Mô phỏng chiếc đĩa than xoay chậm lãng đãng đầy cổ điển.'
  },
  {
    key: 'stageLight' as const,
    name: '13. Ánh Sáng Sân Khấu',
    icon: Sun,
    desc: 'Các luồng rọi ánh sáng nhẹ quét dạt dào sang chảnh.'
  },
  {
    key: 'audioHeartbeat' as const,
    name: '14. Nhịp Tim Âm Thanh',
    icon: Heart,
    desc: 'Đột quỵ tim ECG dao động phồng nảy đầy sống động.'
  }
];

const PRESET_COLORS = [
  { name: 'Trắng', hex: '#ffffff' },
  { name: 'Vàng', hex: '#eab308' },
  { name: 'Xanh Neon', hex: '#22c55e' },
  { name: 'Tím', hex: '#a855f7' },
  { name: 'Hồng', hex: '#ec4899' },
  { name: 'Đỏ', hex: '#ef4444' },
  { name: 'Xanh Dương', hex: '#3b82f6' }
];

export default function EffectsPanel({
  effectState,
  setEffectState,
  audioSettings,
  setAudioSettings,
  textLayers = [],
  setTextLayers,
  activeTextLayerId,
  setActiveTextLayerId,
}: EffectsPanelProps) {
  // Tabs: 'effects' | 'text' | 'audio'
  const [activeTab, setActiveTab] = useState<'effects' | 'text' | 'audio'>('effects');
  
  // Accordions or expand sections in text customizer
  const [expandedTextSection, setExpandedTextSection] = useState<string>('content');

  
  // Track which effect is being customized in the sub-panel (key or null)
  const [customizeEffectKey, setCustomizeEffectKey] = useState<keyof Omit<EffectState, 'intensityLevel'> | null>(null);

  // Toggle master audio switcher
  const toggleAudioMaster = () => {
    setAudioSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Toggle individual effect switch on the list
  const toggleEffect = (key: keyof Omit<EffectState, 'intensityLevel'>) => {
    setEffectState(prev => {
      const current = prev[key] as SingleEffectSettings;
      return {
        ...prev,
        [key]: {
          ...current,
          enabled: !current.enabled
        }
      };
    });
  };

  // Change individual parameter
  const updateSetting = (
    key: keyof Omit<EffectState, 'intensityLevel'>, 
    param: keyof SingleEffectSettings, 
    value: any
  ) => {
    setEffectState(prev => {
      const current = prev[key] as SingleEffectSettings;
      return {
        ...prev,
        [key]: {
          ...current,
          [param]: value
        }
      };
    });
  };

  // Reset standard setup for key
  const handleReset = (key: keyof Omit<EffectState, 'intensityLevel'>) => {
    const defaults = DEFAULT_EFFECT_SETTINGS[key];
    if (defaults) {
      setEffectState(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...defaults,
          enabled: prev[key].enabled // keep current power alive
        }
      }));
    }
  };

  // Random beautifully optimized setup for key
  const handleRandomBeauty = (key: keyof Omit<EffectState, 'intensityLevel'>) => {
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex;
    const randomIntensity = Math.floor(Math.random() * 55) + 35; // 35 - 90
    const randomSpeed = Math.floor(Math.random() * 60) + 25;     // 25 - 85
    const randomOpacity = Math.floor(Math.random() * 35) + 60;   // 60 - 95
    const randomGlow = Math.floor(Math.random() * 55) + 30;      // 30 - 85
    const randomSize = Math.floor(Math.random() * 50) + 30;      // 30 - 80

    setEffectState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        intensity: randomIntensity,
        speed: randomSpeed,
        color: randomColor,
        opacity: randomOpacity,
        glow: randomGlow,
        size: randomSize,
        enabled: true // Auto-enable upon trigger
      }
    }));
  };

  // Global modifiers preset multiplier
  const handleIntensityPresetChange = (level: IntensityLevel) => {
    setEffectState(prev => ({
      ...prev,
      intensityLevel: level
    }));
  };

  // Text layers operations helpers
  const handleAddTextLayer = () => {
    const newId = `text_${Date.now()}`;
    const newLayer = createDefaultTextLayer(newId, `Văn bản rực rỡ #${textLayers.length + 1}`);
    setTextLayers(prev => [...prev, newLayer]);
    setActiveTextLayerId(newId);
  };

  const handleApplyPresetAsNew = (p: typeof TEXT_PRESETS[0]) => {
    const newId = `text_${Date.now()}`;
    const newLayer: TextLayer = {
      ...p.preset,
      id: newId,
      name: p.name
    };
    setTextLayers(prev => [...prev, newLayer]);
    setActiveTextLayerId(newId);
  };

  const handleApplyPresetToActive = (p: typeof TEXT_PRESETS[0]) => {
    if (!activeTextLayerId) return;
    setTextLayers(prev => prev.map(layer => {
      if (layer.id === activeTextLayerId) {
        return {
          ...layer,
          ...p.preset,
          name: layer.name, // keep original label
          id: layer.id // keep original identification
        };
      }
      return layer;
    }));
  };

  const updateActiveLayerProp = (prop: keyof TextLayer, value: any) => {
    if (!activeTextLayerId) return;
    setTextLayers(prev => prev.map(layer => {
      if (layer.id === activeTextLayerId) {
        return { ...layer, [prop]: value };
      }
      return layer;
    }));
  };

  const updateActiveLayerNestedProp = (
    section: 'shadow' | 'stroke' | 'glow' | 'background' | 'animation',
    prop: string,
    value: any
  ) => {
    if (!activeTextLayerId) return;
    setTextLayers(prev => prev.map(layer => {
      if (layer.id === activeTextLayerId) {
        return {
          ...layer,
          [section]: {
            ...layer[section],
            [prop]: value
          }
        };
      }
      return layer;
    }));
  };

  const handleRenameLayer = (id: string, newName: string) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, name: newName } : l));
  };

  const handleDuplicateLayer = (id: string) => {
    const source = textLayers.find(l => l.id === id);
    if (!source) return;
    const newId = `text_${Date.now()}`;
    const dup: TextLayer = {
      ...source,
      id: newId,
      name: `${source.name} (Bản sao)`,
      zIndex: source.zIndex + 2,
      x: Math.min(90, source.x + 4),
      y: Math.min(90, source.y + 4)
    };
    setTextLayers(prev => [...prev, dup]);
    setActiveTextLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    setTextLayers(prev => prev.filter(l => l.id !== id));
    if (activeTextLayerId === id) {
      const remaining = textLayers.filter(l => l.id !== id);
      setActiveTextLayerId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleMoveLayerZIndex = (id: string, direction: 'up' | 'down') => {
    const idx = textLayers.findIndex(l => l.id === id);
    if (idx === -1) return;
    const updated = [...textLayers];
    if (direction === 'up' && idx > 0) {
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      updated.forEach((l, i) => { l.zIndex = (updated.length - i) * 5; });
      setTextLayers(updated);
    } else if (direction === 'down' && idx < updated.length - 1) {
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      updated.forEach((l, i) => { l.zIndex = (updated.length - i) * 5; });
      setTextLayers(updated);
    }
  };

  const handleToggleLock = (id: string) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const handleToggleVisibility = (id: string) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const activeTextLayer = textLayers.find(l => l.id === activeTextLayerId);


  // Safe color picker helper
  const activeEffectConfig = customizeEffectKey ? (effectState[customizeEffectKey] as SingleEffectSettings) : null;
  const activeMetadata = customizeEffectKey ? EFFECT_METADATA.find(m => m.key === customizeEffectKey) : null;

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl min-h-[640px]">
      
      {/* Tab selection panel */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 p-1 shrink-0">
        {[
          { id: 'effects', label: 'Cảnh Quan (14)' },
          { id: 'text', label: 'Chữ Nghệ Thuật ✨' },
          { id: 'audio', label: 'Lofi Mixer 🎧' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              if (t.id !== 'effects') setCustomizeEffectKey(null); // Clear customization on tab switch
            }}
            className={`flex-1 py-2.5 px-1.5 text-xs rounded-lg font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-neutral-800 text-amber-400 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto max-h-[680px]">
        {activeTab === 'effects' ? (
          <>
            {/* SUB-VIEW 1: DETAILED CUSTOMIZER DRAWER FOR SPECIFIC EFFECT */}
            {customizeEffectKey && activeEffectConfig && activeMetadata ? (
              <div className="p-5 space-y-5 animate-fade-in text-neutral-250 select-none">
                
                {/* Back Link Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <button
                    onClick={() => setCustomizeEffectKey(null)}
                    className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-850 hover:bg-neutral-900 transition"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReset(customizeEffectKey)}
                      title="Đặt lại cài đặt gốc cho riêng hiệu ứng này"
                      className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-750 px-2.5 py-1.5 rounded transition font-mono border border-neutral-750"
                    >
                      <RotateCcw className="size-3" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => handleRandomBeauty(customizeEffectKey)}
                      title="Tải cấu hình ngẫu nhiên được phối màu đẹp"
                      className="flex items-center gap-1 text-[10px] text-neutral-950 font-bold bg-amber-500 hover:bg-amber-400 px-2.5 py-1.5 rounded transition font-mono"
                    >
                      <Activity className="size-3 text-neutral-950" />
                      <span>Random Đẹp</span>
                    </button>
                  </div>
                </div>

                {/* Effect Identity Banner */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex items-start gap-4">
                  <div className="p-2.5 bg-neutral-900 text-amber-400 rounded-lg shadow-inner">
                    <activeMetadata.icon className="size-6 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white">{activeMetadata.name}</h3>
                    <p className="text-[10px] text-neutral-400 leading-relaxed font-mono mt-0.5">{activeMetadata.desc}</p>
                  </div>
                </div>

                {/* 1. Toggle ON/OFF switch */}
                <div className="flex items-center justify-between bg-neutral-950/45 border border-neutral-850 px-4 py-3 rounded-xl">
                  <span className="text-xs font-bold text-neutral-200">Trạng thái hoạt động:</span>
                  <button
                    onClick={() => toggleEffect(customizeEffectKey)}
                    className="flex items-center focus:outline-none transition"
                  >
                    {activeEffectConfig.enabled ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <span className="font-mono tracking-wider">ĐANG BẬT</span>
                        <ToggleRight className="size-8 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-neutral-500 font-medium text-xs">
                        <span className="font-mono tracking-wider">ĐANG TẮT</span>
                        <ToggleLeft className="size-8 text-neutral-700" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Sliders Grid wrapper */}
                <div className={`space-y-4 ${!activeEffectConfig.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                  
                  {/* 2. Cường độ / Intensity (0 - 100) */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60">
                    <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5 font-mono">
                      <span>Cường độ (Density / Intensity):</span>
                      <span className="text-amber-400">{activeEffectConfig.intensity}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={activeEffectConfig.intensity}
                      onChange={(e) => updateSetting(customizeEffectKey, 'intensity', Number(e.target.value))}
                      className="w-full accent-amber-500 bg-neutral-950 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  {/* 3. Tốc độ / Speed (0 - 100) */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60">
                    <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5 font-mono">
                      <span>Tốc độ chuyển động (Speed):</span>
                      <span className="text-emerald-400">{activeEffectConfig.speed}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={activeEffectConfig.speed}
                      onChange={(e) => updateSetting(customizeEffectKey, 'speed', Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-neutral-950 rounded-lg appearance-none h-1"
                    />
                  </div>

                  {/* 5. Độ trong suốt / Opacity (0 - 100) */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60">
                    <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5 font-mono">
                      <span>Độ trong suốt (Opacity):</span>
                      <span className="text-sky-400">{activeEffectConfig.opacity}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={activeEffectConfig.opacity}
                      onChange={(e) => updateSetting(customizeEffectKey, 'opacity', Number(e.target.value))}
                      className="w-full accent-sky-400 bg-neutral-950 rounded-lg appearance-none h-1"
                    />
                  </div>

                  {/* 6. Kích thước / Size (0 - 100) */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60">
                    <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5 font-mono">
                      <span>Kích thước phần tử (Size Scale):</span>
                      <span className="text-pink-400">{activeEffectConfig.size}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={activeEffectConfig.size}
                      onChange={(e) => updateSetting(customizeEffectKey, 'size', Number(e.target.value))}
                      className="w-full accent-pink-500 bg-neutral-950 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  {/* 7. Độ phát sáng / Glow (0 - 100) */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60">
                    <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5 font-mono">
                      <span>Độ phát sáng (Glow Bloom):</span>
                      <span className="text-purple-400">{activeEffectConfig.glow}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={activeEffectConfig.glow}
                      onChange={(e) => updateSetting(customizeEffectKey, 'glow', Number(e.target.value))}
                      className="w-full accent-purple-500 bg-neutral-950 rounded-lg appearance-none h-1"
                    />
                  </div>

                  {/* 4. Bộ chọn màu chính / Color selector */}
                  <div className="bg-neutral-950/30 p-3.5 rounded-lg border border-neutral-850/60 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-300 font-mono">
                      <span>Màu sắc hiển thị chính (Color Paint):</span>
                      <span className="font-mono text-[10px] text-amber-500">{activeEffectConfig.color}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Interactive Picker */}
                      <div className="relative group shrink-0">
                        <input
                          type="color"
                          value={activeEffectConfig.color}
                          onChange={(e) => updateSetting(customizeEffectKey, 'color', e.target.value)}
                          className="w-11 h-11 rounded-xl cursor-pointer border border-neutral-700 bg-neutral-900 p-0.5 outline-none ring-offset-neutral-900 focus:ring-1 focus:ring-amber-500/55"
                        />
                      </div>
                      
                      {/* Presets Row */}
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c.hex}
                            onClick={() => updateSetting(customizeEffectKey, 'color', c.hex)}
                            title={c.name}
                            className={`w-6 h-6 rounded-full border transition-all shrink-0 ${
                              activeEffectConfig.color.toLowerCase() === c.hex.toLowerCase() 
                                ? 'border-amber-400 scale-110 ring-2 ring-amber-500/25' 
                                : 'border-neutral-800 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 8. Vị trí hiển thị / Position selection */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 font-mono block">Vị trí hiển thị (Overlay Frame):</label>
                    <select
                      value={activeEffectConfig.position}
                      onChange={(e) => updateSetting(customizeEffectKey, 'position', e.target.value)}
                      className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-amber-500 font-semibold"
                    >
                      <option value="fullscreen">Toàn màn hình</option>
                      <option value="top">Trên cùng (Header Area)</option>
                      <option value="bottom">Dưới cùng (Footer Stage)</option>
                      <option value="left">Bên trái (Left Pillar)</option>
                      <option value="right">Bên phải (Right Pillar)</option>
                      <option value="center">Trung tâm (Canvas Center)</option>
                      <option value="behind">Phía sau nhân vật (Distant Back)</option>
                      <option value="front">Phía trước nhân vật (Cinema Front)</option>
                    </select>
                  </div>

                  {/* 9. Blend mode */}
                  <div className="bg-neutral-950/30 p-3 rounded-lg border border-neutral-850/60 space-y-2">
                    <label className="text-xs font-bold text-neutral-300 font-mono block">Chế độ hòa trộn (Canvas Blend Mode):</label>
                    <div className="grid grid-cols-5 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
                      {[
                        { id: 'normal', label: 'Normal' },
                        { id: 'screen', label: 'Screen' },
                        { id: 'lighten', label: 'Lighten' },
                        { id: 'overlay', label: 'Overlay' },
                        { id: 'soft-light', label: 'Soft' }
                      ].map(b => (
                        <button
                          key={b.id}
                          onClick={() => updateSetting(customizeEffectKey, 'blendMode', b.id)}
                          className={`py-1 rounded text-[9px] font-bold text-center transition ${
                            activeEffectConfig.blendMode === b.id 
                              ? 'bg-neutral-800 text-amber-400 font-black' 
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* SUB-VIEW 2: GRID LIST OF ALL 14 EFFECTS W/ INDIVIDUAL CONFIG PORTALS */
              <div className="p-4 space-y-4 animate-fade-in text-neutral-200">
                
                {/* Intensity Multiplier HUD */}
                <div className="bg-neutral-950/80 p-4 border border-neutral-850 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      <Gauge className="size-3.5 text-amber-500 animate-pulse" />
                      Cường độ mạt định tổng (Scale Multiplier):
                    </span>
                    <span className="text-amber-400 uppercase font-bold text-xs ring-1 ring-amber-500/10 px-2 py-0.5 rounded">
                      {effectState.intensityLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    {(['light', 'medium', 'heavy', 'extreme'] as IntensityLevel[]).map((level) => {
                      const isSelected = effectState.intensityLevel === level;
                      const levelLabels = {
                        light: 'Nhẹ (0.5x)',
                        medium: 'Vừa (1.0x)',
                        heavy: 'Dày (1.7x)',
                        extreme: 'Khủng (2.8x)'
                      };
                      return (
                        <button
                          key={level}
                          onClick={() => handleIntensityPresetChange(level)}
                          className={`py-2 px-1 text-[10px] rounded font-bold transition ${
                            isSelected 
                              ? 'bg-amber-500 text-neutral-950 shadow font-extrabold' 
                              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                          }`}
                        >
                          {levelLabels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 14 Elements Column Grid */}
                <div className="space-y-3 font-sans">
                  {EFFECT_METADATA.map((effect) => {
                    const cfg = effectState[effect.key] as SingleEffectSettings;
                    const IconComp = effect.icon;
                    return (
                      <div 
                        key={effect.key} 
                        className={`bg-neutral-950/60 border rounded-xl transition duration-300 group ${
                          cfg.enabled 
                            ? 'border-amber-500/30 bg-neutral-950/80 shadow-md shadow-amber-500/2' 
                            : 'border-neutral-850/80 hover:border-neutral-800'
                        }`}
                      >
                        <div className="p-3.5 flex items-center justify-between gap-4">
                          {/* Left contents block */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                              cfg.enabled 
                                ? 'bg-amber-500/10 text-amber-400' 
                                : 'bg-neutral-900 text-neutral-500 group-hover:text-neutral-400'
                            }`}>
                              <IconComp className="size-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-neutral-200 truncate">{effect.name}</span>
                                {cfg.enabled ? (
                                  <span className="text-[8px] font-black bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded font-mono border border-emerald-500/20">BẬT</span>
                                ) : (
                                  <span className="text-[8px] font-semibold bg-neutral-900 text-neutral-500 px-1 py-0.5 rounded font-mono border border-neutral-800">TẮT</span>
                                )}
                              </div>
                              <span className="text-[10px] text-neutral-400 truncate block mt-0.5 font-mono">{effect.desc}</span>
                            </div>
                          </div>

                          {/* Right triggers action row */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Detailed Customizer Link button */}
                            <button
                              onClick={() => setCustomizeEffectKey(effect.key)}
                              className="text-[10px] font-bold text-amber-500 hover:text-amber-400 hover:bg-neutral-900 border border-neutral-800 bg-neutral-950/90 active:scale-95 px-2.5 py-1.5 rounded-lg transition"
                            >
                              Tùy chỉnh ⚙️
                            </button>

                            {/* Easy Toggle Left/Right switch */}
                            <button 
                              onClick={() => toggleEffect(effect.key)}
                              className="text-neutral-400 hover:text-white transition cursor-pointer"
                            >
                              {cfg.enabled ? (
                                <ToggleRight className="size-6.5 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="size-6.5 text-neutral-700" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </>
        ) : activeTab === 'text' ? (
          /* ARTISTIC TEXT LAYER EDITOR WORKSPACE PANEL */
          <div className="p-4 space-y-5 animate-fade-in text-neutral-200 font-sans select-none text-xs">
            
            {/* TOP BAR: LAYER CREATION CONTROLS */}
            <div className="flex items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="font-bold flex items-center gap-1.5 font-mono text-xs text-neutral-300">
                <Type className="size-4 text-emerald-400" />
                DANH SÁCH LỚP CHỮ ({textLayers.length})
              </span>
              <button
                onClick={handleAddTextLayer}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-955 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide shadow-lg cursor-pointer transition hover:scale-103 active:scale-97"
              >
                <Plus className="size-3.5 text-neutral-950" />
                THÊM CHỮ MỚI
              </button>
            </div>

            {/* SECTION 1: GRAPHICS TEXT LAYERS LIST PANEL */}
            {textLayers.length > 0 ? (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {textLayers.map((l, index) => {
                  const isActive = l.id === activeTextLayerId;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setActiveTextLayerId(isActive ? null : l.id)}
                      className={`group/row flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                        isActive
                          ? 'bg-neutral-800/80 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-neutral-950/60 border-neutral-850/60 hover:bg-neutral-900/40 hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[10px] text-neutral-500 font-mono w-4 shrink-0 text-center">
                          {textLayers.length - index}
                        </span>
                        
                        <input
                          type="text"
                          value={l.name || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRenameLayer(l.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-none outline-none focus:bg-neutral-950 px-1 py-0.5 rounded text-neutral-200 focus:text-white font-semibold truncate placeholder-neutral-500 min-w-0 text-xs w-full"
                          placeholder="Đặt tên lớp..."
                        />
                      </div>

                      {/* ACTIONS ROW FOR LAYER */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        {/* Up arrow */}
                        <button
                          onClick={() => handleMoveLayerZIndex(l.id, 'up')}
                          disabled={index === 0}
                          title="Đẩy lên trên"
                          className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-20 disabled:pointer-events-none transition"
                        >
                          <ChevronUp className="size-3" />
                        </button>
                        {/* Down arrow */}
                        <button
                          onClick={() => handleMoveLayerZIndex(l.id, 'down')}
                          disabled={index === textLayers.length - 1}
                          title="Hạ xuống dưới"
                          className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-20 disabled:pointer-events-none transition"
                        >
                          <ChevronDown className="size-3" />
                        </button>
                        {/* Visibility toggle bar */}
                        <button
                          onClick={() => handleToggleVisibility(l.id)}
                          title={l.visible ? "Ẩn hộp chữ" : "Hiện hộp chữ"}
                          className={`p-1 rounded transition ${l.visible ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'}`}
                        >
                          {l.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        </button>
                        {/* Lock toggle bar */}
                        <button
                          onClick={() => handleToggleLock(l.id)}
                          title={l.locked ? "Mở khóa hộp chữ" : "Khóa hộp chữ"}
                          className={`p-1 rounded transition ${l.locked ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}
                        >
                          {l.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                        </button>
                        {/* Duplicate button */}
                        <button
                          onClick={() => handleDuplicateLayer(l.id)}
                          title="Sao chép lớp"
                          className="p-1 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 rounded transition"
                        >
                          <Copy className="size-3" />
                        </button>
                        {/* Trash button */}
                        <button
                          onClick={() => handleDeleteLayer(l.id)}
                          title="Xóa lớp chữ"
                          className="p-1 text-neutral-400 hover:text-red-400 hover:bg-rose-500/10 rounded transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-neutral-950/40 border border-dashed border-neutral-850 p-6 rounded-xl text-center text-neutral-500">
                <Type className="size-6 mx-auto mb-2 text-neutral-600" />
                <p className="text-[11px] font-mono leading-relaxed">Chưa có lớp văn bản nào.<br />Bấm "THÊM CHỮ MỚI" ở trên để tạo và biên tập !</p>
              </div>
            )}

            {/* ARTISTIC PRESETS CHOICE ACCORDION HUD */}
            <div className="bg-neutral-950/50 rounded-xl border border-neutral-850 p-3 space-y-2.5">
              <span className="text-[10px] font-black text-amber-500/85 uppercase tracking-widest font-mono block">
                ⭐ THƯ VIỆN MẪU CHỮ ĐẸP DÙNG NHANH
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {TEXT_PRESETS.map((p) => (
                  <div
                    key={p.name}
                    className="bg-neutral-955 border border-neutral-850 hover:border-neutral-750 p-2 rounded-lg flex flex-col justify-between gap-1.5 transition text-left"
                  >
                    <div className="truncate">
                      <p className="text-[10px] font-black text-neutral-200 truncate">{p.name}</p>
                      <p className="text-[9px] text-neutral-500 truncate font-mono mt-0.5">{p.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleApplyPresetAsNew(p)}
                        className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-750 text-[8px] font-semibold text-neutral-300 rounded text-center transition cursor-pointer"
                      >
                        Tạo Lớp Mới
                      </button>
                      <button
                        onClick={() => handleApplyPresetToActive(p)}
                        disabled={!activeTextLayerId}
                        className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed text-neutral-950 text-[8px] font-black rounded text-center transition cursor-pointer"
                      >
                        Áp Dụng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVE TEXT LAYER EDIT WORKBENCH DESK */}
            {activeTextLayer ? (
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Palette className="size-3.5 text-amber-500" />
                    Biên Tập: {activeTextLayer.name}
                  </span>
                  {activeTextLayer.locked && (
                    <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                      BỊ KHÓA 🔒
                    </span>
                  )}
                </div>

                {/* Collapsible Customizer Panels */}
                <div className={`space-y-3.5 ${activeTextLayer.locked ? 'opacity-35 pointer-events-none' : ''}`}>
                  
                  {/* CATEGORY 1: CONTENT & FACE */}
                  <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                        <Heading className="size-3.5 text-sky-400" />
                        1. Nội dung & Phông chữ
                      </span>
                    </div>

                    {/* Content area */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 font-mono">Nội dung chữ (Hỗ trợ xuống dòng):</label>
                      <textarea
                        rows={2}
                        value={activeTextLayer.content || ''}
                        onChange={(e) => updateActiveLayerProp('content', e.target.value)}
                        className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 outline-none focus:border-amber-500 font-medium"
                        placeholder="Nhập nội dung vào đây..."
                      />
                    </div>

                    {/* Font selections */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-400 font-mono">Nhóm phông đẹp:</label>
                        <select
                          value={activeTextLayer.fontFamily || 'Inter'}
                          onChange={(e) => updateActiveLayerProp('fontFamily', e.target.value)}
                          className="w-full text-[10px] bg-neutral-950 border border-neutral-800 rounded-md p-1.5 text-neutral-200 outline-none focus:border-amber-500 font-semibold"
                        >
                          {TEXT_FONTS.map(f => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-400 font-mono">Dữ liệu Chữ:</label>
                        <div className="flex gap-1 h-[29px]">
                          <button
                            onClick={() => updateActiveLayerProp('italic', !activeTextLayer.italic)}
                            className={`flex-1 flex items-center justify-center rounded border transition text-xs ${activeTextLayer.italic ? 'bg-amber-500 text-neutral-955 border-amber-500' : 'bg-neutral-955 border-neutral-850 text-neutral-400 hover:bg-neutral-900'}`}
                            title="Xéo (Italic)"
                          >
                            <Italic className="size-3.5" />
                          </button>
                          <button
                            onClick={() => updateActiveLayerProp('uppercase', !activeTextLayer.uppercase)}
                            className={`flex-1 flex items-center justify-center rounded border transition text-[9px] font-black ${activeTextLayer.uppercase ? 'bg-amber-500 text-neutral-955 border-amber-500' : 'bg-neutral-955 border-neutral-850 text-neutral-400 hover:bg-neutral-900'}`}
                            title="VIẾT HOA (All Caps)"
                          >
                            AA
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Alignment options */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 font-mono">Căn lề văn bản:</label>
                      <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-md border border-neutral-850">
                        {[
                          { id: 'left', icon: AlignLeft, label: 'Trái' },
                          { id: 'center', icon: AlignCenter, label: 'Giữa' },
                          { id: 'right', icon: AlignRight, label: 'Phải' }
                        ].map((align) => {
                          const isSel = activeTextLayer.align === align.id;
                          return (
                            <button
                              key={align.id}
                              onClick={() => updateActiveLayerProp('align', align.id)}
                              className={`flex items-center justify-center gap-1 py-1 rounded text-[9px] font-bold transition ${isSel ? 'bg-neutral-800 text-amber-400 font-black' : 'text-neutral-400 hover:text-white'}`}
                            >
                              <align.icon className="size-3.5" />
                              <span>{align.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font sizes & weights */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                          <span>Cỡ chữ:</span>
                          <span className="text-amber-400">{activeTextLayer.fontSize}px</span>
                        </div>
                        <input
                          type="range" min="10" max="150" step="1"
                          value={activeTextLayer.fontSize || 30}
                          onChange={(e) => updateActiveLayerProp('fontSize', Number(e.target.value))}
                          className="w-full h-1 accent-amber-500 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                          <span>Độ dày nét:</span>
                          <span className="text-amber-400">{activeTextLayer.fontWeight}</span>
                        </div>
                        <input
                          type="range" min="100" max="900" step="100"
                          value={activeTextLayer.fontWeight || 500}
                          onChange={(e) => updateActiveLayerProp('fontWeight', Number(e.target.value))}
                          className="w-full h-1 accent-amber-500 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Spacing adjustments */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                          <span>Giãn cách kí tự:</span>
                          <span className="text-sky-400">{activeTextLayer.letterSpacing}px</span>
                        </div>
                        <input
                          type="range" min="-5" max="25" step="0.5"
                          value={activeTextLayer.letterSpacing || 0}
                          onChange={(e) => updateActiveLayerProp('letterSpacing', Number(e.target.value))}
                          className="w-full h-1 accent-sky-400 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                          <span>Giãn cách dòng:</span>
                          <span className="text-sky-400">{activeTextLayer.lineHeight}x</span>
                        </div>
                        <input
                          type="range" min="0.8" max="2.5" step="0.1"
                          value={activeTextLayer.lineHeight || 1.2}
                          onChange={(e) => updateActiveLayerProp('lineHeight', Number(e.target.value))}
                          className="w-full h-1 accent-sky-400 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 2: COLOR EFFECTS & GRADIENTS */}
                  <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-3">
                    <span className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Palette className="size-3.5 text-pink-400" />
                      2. Phối Màu & Viền Viền
                    </span>

                    {/* Core color selection */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                        <span>Lựa chọn màu sắc chữ:</span>
                        <span className="text-pink-400">{activeTextLayer.color}</span>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={activeTextLayer.color || '#ffffff'}
                          onChange={(e) => updateActiveLayerProp('color', e.target.value)}
                          className="w-9 h-9 rounded bg-neutral-950 border border-neutral-800 p-0.5 cursor-pointer shrink-0"
                        />
                        <div className="flex flex-wrap gap-1 flex-1">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.hex}
                              onClick={() => {
                                updateActiveLayerProp('color', c.hex);
                              }}
                              title={c.name}
                              className={`w-5 h-5 rounded-full border transition shrink-0 ${
                                activeTextLayer.color && activeTextLayer.color.toLowerCase() === c.hex.toLowerCase() ? 'border-pink-400 scale-110' : 'border-neutral-800 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gradient Fill effects */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-neutral-300">Tô màu hiệu ứng Gradient (Đa Sắc):</span>
                        <input
                          type="checkbox"
                          checked={activeTextLayer.gradientEnabled || false}
                          onChange={(e) => updateActiveLayerProp('gradientEnabled', e.target.checked)}
                          className="accent-pink-500 cursor-pointer"
                        />
                      </div>

                      {activeTextLayer.gradientEnabled && (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <label className="text-[8px] text-neutral-400 font-mono block mb-1">Màu sắc chuyển lớp {"(Start -> End)"}:</label>
                          <div className="flex gap-3">
                            <div className="flex-1 flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 rounded px-2 py-1">
                              <span className="text-[8px] font-mono text-neutral-500 shrink-0">Bắt đầu:</span>
                              <input
                                type="color"
                                value={activeTextLayer.gradient ? activeTextLayer.gradient[0] : '#ffffff'}
                                onChange={(e) => {
                                  const list = [...(activeTextLayer.gradient || ['#ffffff', '#f43f5e'])];
                                  list[0] = e.target.value;
                                  updateActiveLayerProp('gradient', list);
                                }}
                                className="w-5 h-5 rounded bg-neutral-950 border border-neutral-800 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 rounded px-2 py-1">
                              <span className="text-[8px] font-mono text-neutral-500 shrink-0">Kết thúc:</span>
                              <input
                                type="color"
                                value={activeTextLayer.gradient ? textLayers.find(l => l.id === activeTextLayerId)?.gradient?.[1] || '#ffd6f5' : '#ffd6f5'}
                                onChange={(e) => {
                                  const list = [...(activeTextLayer.gradient || ['#ffffff', '#ffd6f5'])];
                                  list[1] = e.target.value;
                                  updateActiveLayerProp('gradient', list);
                                }}
                                className="w-5 h-5 rounded bg-neutral-950 border border-neutral-800 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stroke border overlay */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-neutral-300">Viền biên chữ (Stroke Outline):</span>
                        <input
                          type="checkbox"
                          checked={activeTextLayer.stroke?.enabled || false}
                          onChange={(e) => updateActiveLayerNestedProp('stroke', 'enabled', e.target.checked)}
                          className="accent-pink-500 cursor-pointer"
                        />
                      </div>

                      {activeTextLayer.stroke?.enabled && (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                                <span>Cỡ viền:</span>
                                <span className="text-pink-400">{activeTextLayer.stroke?.width || 1}px</span>
                              </div>
                              <input
                                type="range" min="0.5" max="10" step="0.5"
                                value={activeTextLayer.stroke?.width || 1}
                                onChange={(e) => updateActiveLayerNestedProp('stroke', 'width', Number(e.target.value))}
                                className="w-full accent-pink-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-neutral-400 font-mono block mb-1">Màu đường viền:</span>
                              <div className="flex gap-1 items-center bg-neutral-900 p-1 rounded border border-neutral-850">
                                <input
                                  type="color"
                                  value={activeTextLayer.stroke?.color || '#000000'}
                                  onChange={(e) => updateActiveLayerNestedProp('stroke', 'color', e.target.value)}
                                  className="w-5 h-5 rounded cursor-pointer shrink-0"
                                />
                                <span className="text-[8px] font-mono text-neutral-400 select-all truncate shrink-0">{activeTextLayer.stroke?.color}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CATEGORY 3: SHADOW & GLOW SPECIALS */}
                  <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-3">
                    <span className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Sparkles className="size-3.5 text-purple-400" />
                      3. Đổ Bóng & Phát Sáng Neon
                    </span>

                    {/* Standard shadow text drop */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-neutral-300">Đổ bóng chữ (Drop Shadow):</span>
                        <input
                          type="checkbox"
                          checked={activeTextLayer.shadow?.enabled || false}
                          onChange={(e) => updateActiveLayerNestedProp('shadow', 'enabled', e.target.checked)}
                          className="accent-purple-500 cursor-pointer"
                        />
                      </div>

                      {activeTextLayer.shadow?.enabled && (
                        <div className="space-y-2 pt-1 animate-fade-in grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                              <span>Mờ nhòe:</span>
                              <span className="text-purple-400">{activeTextLayer.shadow?.blur || 5}px</span>
                            </div>
                            <input
                              type="range" min="0" max="30" step="1"
                              value={activeTextLayer.shadow?.blur || 5}
                              onChange={(e) => updateActiveLayerNestedProp('shadow', 'blur', Number(e.target.value))}
                              className="w-full accent-purple-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1 flex flex-col justify-center">
                            <span className="text-[8px] text-neutral-400 font-mono mb-1">Màu bóng tối:</span>
                            <input
                              type="color"
                              value={activeTextLayer.shadow?.color?.startsWith('rgba') ? '#000000' : (activeTextLayer.shadow?.color || '#000000')}
                              onChange={(e) => updateActiveLayerNestedProp('shadow', 'color', e.target.value)}
                              className="w-5 h-5 rounded cursor-pointer bg-neutral-950"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Glowing effect text shadow */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-neutral-300">Phát sáng Neon mờ ảo (Neon Glow):</span>
                        <input
                          type="checkbox"
                          checked={activeTextLayer.glow?.enabled || false}
                          onChange={(e) => updateActiveLayerNestedProp('glow', 'enabled', e.target.checked)}
                          className="accent-purple-500 cursor-pointer"
                        />
                      </div>

                      {activeTextLayer.glow?.enabled && (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                                <span>Cường độ phát:</span>
                                <span className="text-purple-400">{activeTextLayer.glow?.intensity || 50}%</span>
                              </div>
                              <input
                                type="range" min="5" max="100" step="5"
                                value={activeTextLayer.glow?.intensity || 50}
                                onChange={(e) => updateActiveLayerNestedProp('glow', 'intensity', Number(e.target.value))}
                                className="w-full accent-purple-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-neutral-400 font-mono block mb-1">Màu tỏa sáng:</span>
                              <div className="flex gap-1.5 items-center bg-neutral-900 p-1 rounded border border-neutral-850">
                                <input
                                  type="color"
                                  value={activeTextLayer.glow?.color || '#ffd6f5'}
                                  onChange={(e) => updateActiveLayerNestedProp('glow', 'color', e.target.value)}
                                  className="w-5 h-5 rounded cursor-pointer shrink-0"
                                />
                                <span className="text-[8px] font-mono text-neutral-400 truncate shrink-0">{activeTextLayer.glow?.color}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CATEGORY 4: BACKGROUND PADDED CAPSULE */}
                  <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-3">
                    <span className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Layout className="size-3.5 text-emerald-400" />
                      4. Mảnh Nền Chữ Đệm
                    </span>

                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-neutral-300">Khung vỏ nền ôm dưới (Background Capsule):</span>
                        <input
                          type="checkbox"
                          checked={activeTextLayer.background?.enabled || false}
                          onChange={(e) => updateActiveLayerNestedProp('background', 'enabled', e.target.checked)}
                          className="accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {activeTextLayer.background?.enabled && (
                        <div className="space-y-2.5 pt-1 animate-fade-in">
                          {/* Type select solid blur gradient */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-neutral-400 font-mono">Chế độ hiển thị nền:</label>
                            <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-900 rounded border border-neutral-850 text-center">
                              {[
                                { id: 'solid', label: 'Tối đặc' },
                                { id: 'blur', label: 'Kính mờ' },
                                { id: 'gradient', label: 'Đa sắc' },
                                { id: 'neon', label: 'Neon' }
                              ].map((bgType) => {
                                const isSel = activeTextLayer.background?.type === bgType.id;
                                return (
                                  <button
                                    key={bgType.id}
                                    onClick={() => updateActiveLayerNestedProp('background', 'type', bgType.id)}
                                    className={`py-1 rounded text-[8px] font-bold transition cursor-pointer ${isSel ? 'bg-neutral-800 text-emerald-400 font-black shadow-inner border border-emerald-500/10' : 'text-neutral-500 hover:text-neutral-300'}`}
                                  >
                                    {bgType.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Primary back color */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[8px] text-neutral-400 font-mono block mb-1">Màu nền chính:</span>
                              <input
                                type="color"
                                value={activeTextLayer.background?.color?.startsWith('rgba') ? '#0c0714' : (activeTextLayer.background?.color || '#07040e')}
                                onChange={(e) => updateActiveLayerNestedProp('background', 'color', e.target.value)}
                                className="w-[45px] h-5 rounded cursor-pointer"
                              />
                            </div>

                            {activeTextLayer.background?.type === 'gradient' && (
                              <div className="space-y-1 animate-fade-in">
                                <span className="text-[8px] text-neutral-400 font-mono block mb-1">Màu đa sắc góc cuối:</span>
                                <input
                                  type="color"
                                  value={activeTextLayer.background?.colorEnd?.startsWith('rgba') ? '#1e0c2f' : (activeTextLayer.background?.colorEnd || '#1e0c2f')}
                                  onChange={(e) => updateActiveLayerNestedProp('background', 'colorEnd', e.target.value)}
                                  className="w-[45px] h-5 rounded cursor-pointer"
                                />
                              </div>
                            )}

                            {activeTextLayer.background?.type === 'blur' && (
                              <div className="space-y-1 animate-fade-in">
                                <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                                  <span>Độ nhòe kính:</span>
                                  <span>{activeTextLayer.background?.blur || 5}px</span>
                                </div>
                                <input
                                  type="range" min="0" max="25" step="1"
                                  value={activeTextLayer.background?.blur || 5}
                                  onChange={(e) => updateActiveLayerNestedProp('background', 'blur', Number(e.target.value))}
                                  className="w-full accent-emerald-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                                />
                              </div>
                            )}
                          </div>

                          {/* Opacity and corner padding controls */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                                <span>Bo góc tròn:</span>
                                <span className="text-emerald-400">{activeTextLayer.background?.radius || 10}px</span>
                              </div>
                              <input
                                type="range" min="0" max="60" step="1"
                                value={activeTextLayer.background?.radius || 10}
                                onChange={(e) => updateActiveLayerNestedProp('background', 'radius', Number(e.target.value))}
                                className="w-full accent-emerald-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                                <span>Độ phình đệm:</span>
                                <span className="text-emerald-400">{activeTextLayer.background?.padding || 12}px</span>
                              </div>
                              <input
                                type="range" min="4" max="60" step="2"
                                value={activeTextLayer.background?.padding || 12}
                                onChange={(e) => updateActiveLayerNestedProp('background', 'padding', Number(e.target.value))}
                                className="w-full accent-emerald-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CATEGORY 5: PLACEMENT & ANIMATION MOTION */}
                  <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-3">
                    <span className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Compass className="size-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
                      5. Tọa Độ & Hoạt Ảnh Chuyển Động
                    </span>

                    {/* Coordinates location placement */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                            <span>Đôi Ngang (X):</span>
                            <span className="text-amber-400">{activeTextLayer.x ? activeTextLayer.x.toFixed(0) : 50}%</span>
                          </div>
                          <input
                            type="range" min="0" max="100" step="1"
                            value={activeTextLayer.x || 50}
                            onChange={(e) => updateActiveLayerProp('x', Number(e.target.value))}
                            className="w-full accent-amber-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                            <span>Đôi Dọc (Y):</span>
                            <span className="text-amber-400">{activeTextLayer.y ? activeTextLayer.y.toFixed(0) : 50}%</span>
                          </div>
                          <input
                            type="range" min="0" max="100" step="1"
                            value={activeTextLayer.y || 50}
                            onChange={(e) => updateActiveLayerProp('y', Number(e.target.value))}
                            className="w-full accent-amber-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                            <span>Góc xoay chữ:</span>
                            <span className="text-emerald-400">{activeTextLayer.rotation || 0}°</span>
                          </div>
                          <input
                            type="range" min="-180" max="180" step="5"
                            value={activeTextLayer.rotation || 0}
                            onChange={(e) => updateActiveLayerProp('rotation', Number(e.target.value))}
                            className="w-full accent-emerald-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                            <span>Thu phóng kích cỡ:</span>
                            <span className="text-emerald-400">{(activeTextLayer.scale || 1.0).toFixed(1)}x</span>
                          </div>
                          <input
                            type="range" min="0.3" max="3.0" step="0.1"
                            value={activeTextLayer.scale || 1.0}
                            onChange={(e) => updateActiveLayerProp('scale', Number(e.target.value))}
                            className="w-full accent-emerald-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Infinite animation setup */}
                    <div className="bg-neutral-950/50 p-2.5 rounded-md border border-neutral-850 space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[8px] text-neutral-400 font-mono">Kiểu hoạt ảnh chuyển động:</label>
                        <select
                          value={activeTextLayer.animation?.type || 'none'}
                          onChange={(e) => updateActiveLayerNestedProp('animation', 'type', e.target.value)}
                          className="w-full text-[10px] bg-neutral-950 border border-neutral-800 rounded p-1.5 text-neutral-200 outline-none focus:border-amber-500 font-semibold cursor-pointer"
                        >
                          <option value="none">Không hoạt ảnh (Tĩnh)</option>
                          <option value="fadeIn">Fade In mờ dần mộng ảo</option>
                          <option value="fadeOut">Fade Out tối dần lặng thinh</option>
                          <option value="zoomIn">Zoom In hoa nở mềm dẻo</option>
                          <option value="zoomOut">Zoom Out thu mình khuất sâu</option>
                          <option value="bounce">Bounce nảy nảy đàn hồi</option>
                          <option value="pulse">Pulse dập dình nhịp Bass</option>
                          <option value="flicker">Flicker nhấp nháy Neon cổ</option>
                          <option value="glowBreathing">Glow Breathing nhịp thở lung linh</option>
                          <option value="typewriter">Typewriter gõ dần từng chữ lyric</option>
                          <option value="karaoke">Karaoke bôi vàng karaoke chuẩn MV</option>
                          <option value="wave">Wave bập bồng uốn lượn uốn dải</option>
                          <option value="float">Float bay lơ lửng bồng bềnh mây trôi</option>
                          <option value="shake">Shake rung giật tiết tấu Bass</option>
                        </select>
                      </div>

                      {activeTextLayer.animation?.type !== 'none' && (
                        <div className="space-y-1.5 animate-fade-in pt-1">
                          <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                            <span>Tốc độ chuyển động:</span>
                            <span className="text-amber-400">{activeTextLayer.animation?.speed || 40}%</span>
                          </div>
                          <input
                            type="range" min="10" max="100" step="5"
                            value={activeTextLayer.animation?.speed || 40}
                            onChange={(e) => updateActiveLayerNestedProp('animation', 'speed', Number(e.target.value))}
                            className="w-full accent-amber-500 bg-neutral-900 h-1 appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-neutral-950/40 border border-dashed border-neutral-850 p-6 rounded-xl text-center text-neutral-500">
                <Palette className="size-5 mx-auto mb-2 text-neutral-600" />
                <p className="text-[10px] font-mono leading-relaxed">Hãy chọn 1 Hộp chữ ở danh sách phía trên<br />để tùy chỉnh phông chữ, tô vạt đa sắc, đổ bóng sẫm, quầng sáng Neon và tạo hoạt ảnh múa lyric !</p>
              </div>
            )}
            
          </div>
        ) : (
          <div className="p-5 space-y-5 animate-fade-in text-neutral-300 font-sans select-none">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="size-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">Bảng Mixer Âm Thanh Lofi</span>
              </div>
              <button
                onClick={toggleAudioMaster}
                className={`text-[10px] font-black px-3.5 py-2 border rounded-xl transition ${
                  audioSettings.enabled
                    ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md font-extrabold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {audioSettings.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl flex items-start gap-3">
              <Cpu className="size-5 text-amber-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <p className="text-[10px] text-neutral-400 leading-normal font-mono mb-0.5">
                  Hệ thống tổng hợp sóng âm trực tiếp tự động (Web Audio API) giúp tạo nhạc không lời ngẫu nhiên chất lượng cao.
                </p>
                <p className="text-[9px] text-zinc-500 font-mono">⚠️ Khi tải Canvas hoặc Xuất video, âm thanh này sẽ tự gộp đồng bộ vào luồng trực tiếp.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* Master volume controller */}
              <div className="bg-neutral-950 border border-neutral-850 px-4 py-3.5 rounded-2xl space-y-1.5 shadow-sm">
                <div className="flex justify-between text-xs font-extrabold text-neutral-200 font-mono">
                  <span className="flex items-center gap-1.5">📢 Âm lượng tổng (Gain Level)</span>
                  <span className="text-amber-400">{(audioSettings.volume * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range" min="0" max="1.0" step="0.05"
                  value={audioSettings.volume}
                  disabled={!audioSettings.enabled}
                  onChange={(e) => setAudioSettings(prev => ({
                    ...prev,
                    volume: Number(e.target.value)
                  }))}
                  className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Instruments Mixer board container */}
              <div className="bg-neutral-950/40 p-4 rounded-2xl border border-neutral-850 space-y-4.5">
                <h4 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <FlameKindling className="size-3.5" />
                  Cơ cấu nhạc cụ & Sóng bổ sung
                </h4>

                {/* Instrument 1: lush deep keyboard pad */}
                <div className="space-y-1.5 bg-neutral-950/45 p-3 rounded-xl border border-neutral-850/40">
                  <div className="flex justify-between text-[10px] text-neutral-300 font-black font-mono">
                    <span className="flex items-center gap-1.5">🎹 Lush Keyboard Pad nền sâu:</span>
                    <span>{(audioSettings.padVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.05"
                    value={audioSettings.padVolume}
                    disabled={!audioSettings.enabled}
                    onChange={(e) => setAudioSettings(prev => ({
                      ...prev,
                      padVolume: Number(e.target.value)
                    }))}
                    className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Instrument 2: piano keys trigger */}
                <div className="space-y-1.5 bg-neutral-950/45 p-3 rounded-xl border border-neutral-850/40">
                  <div className="flex justify-between text-[10px] text-neutral-300 font-black font-mono">
                    <span className="flex items-center gap-1.5">🎵 Lofi Jazz Piano gõ ngắt quãng:</span>
                    <span>{(audioSettings.pianoVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.05"
                    value={audioSettings.pianoVolume}
                    disabled={!audioSettings.enabled}
                    onChange={(e) => setAudioSettings(prev => ({
                      ...prev,
                      pianoVolume: Number(e.target.value)
                    }))}
                    className="w-full accent-cyan-400 bg-neutral-900 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Instrument 3: Ambient wind ripples */}
                <div className="space-y-1.5 bg-neutral-950/45 p-3 rounded-xl border border-neutral-850/40">
                  <div className="flex justify-between text-[10px] text-neutral-300 font-black font-mono">
                    <span className="flex items-center gap-1.5">🍃 Tiếng Gió rít nhẹ (Wind whispers):</span>
                    <span>{(audioSettings.windVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.05"
                    value={audioSettings.windVolume}
                    disabled={!audioSettings.enabled}
                    onChange={(e) => setAudioSettings(prev => ({
                      ...prev,
                      windVolume: Number(e.target.value)
                    }))}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Instrument 4: Fireside crackling */}
                <div className="space-y-1.5 bg-neutral-950/45 p-3 rounded-xl border border-neutral-850/40">
                  <div className="flex justify-between text-[10px] text-neutral-300 font-black font-mono">
                    <span className="flex items-center gap-1.5">🔥 Củi sấy lò sưởi lách tách (Fireside):</span>
                    <span>{(audioSettings.fireplaceVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.05"
                    value={audioSettings.fireplaceVolume}
                    disabled={!audioSettings.enabled}
                    onChange={(e) => setAudioSettings(prev => ({
                      ...prev,
                      fireplaceVolume: Number(e.target.value)
                    }))}
                    className="w-full accent-orange-500 bg-neutral-900 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Instrument 5: Static Rain background */}
                <div className="space-y-1.5 bg-neutral-950/45 p-3 rounded-xl border border-neutral-850/40">
                  <div className="flex justify-between text-[10px] text-neutral-300 font-black font-mono">
                    <span className="flex items-center gap-1.5">🌧️ Sóng hạt mưa tĩnh (Rain static):</span>
                    <span>{(audioSettings.rainVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.05"
                    value={audioSettings.rainVolume}
                    disabled={!audioSettings.enabled}
                    onChange={(e) => setAudioSettings(prev => ({
                      ...prev,
                      rainVolume: Number(e.target.value)
                    }))}
                    className="w-full accent-purple-500 bg-neutral-900 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
