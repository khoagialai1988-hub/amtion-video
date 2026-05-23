import React, { useState } from 'react';
import { EffectState, AudioSettings, PresetName, IntensityLevel } from '../types';
import { PRESETS } from '../constants/presets';
import { 
  Snowflake, CloudRain, CloudLightning, Sparkles, Tv, HelpCircle, 
  Sliders, Music, ToggleLeft, ToggleRight, Sun, Volume2, Flame, Wind,
  Layers, Gauge, Activity, Compass, Cpu
} from 'lucide-react';

interface EffectsPanelProps {
  effectState: EffectState;
  setEffectState: React.Dispatch<React.SetStateAction<EffectState>>;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  onApplyPreset: (presetId: PresetName) => void;
  activePresetId: PresetName | null;
}

export default function EffectsPanel({
  effectState,
  setEffectState,
  audioSettings,
  setAudioSettings,
  onApplyPreset,
  activePresetId,
}: EffectsPanelProps) {
  // Tabs: 'preset' | 'weather' | 'lights' | 'audio'
  const [activeTab, setActiveTab] = useState<'preset' | 'weather' | 'lights' | 'audio'>('preset');

  // Toggle helpers
  const toggleSnow = () => {
    setEffectState(prev => ({
      ...prev,
      snow: { ...prev.snow, enabled: !prev.snow.enabled }
    }));
  };

  const toggleRain = () => {
    setEffectState(prev => ({
      ...prev,
      rain: { ...prev.rain, enabled: !prev.rain.enabled }
    }));
  };

  const toggleThunder = () => {
    setEffectState(prev => ({
      ...prev,
      thunder: { ...prev.thunder, enabled: !prev.thunder.enabled }
    }));
  };

  const toggleMeteor = () => {
    setEffectState(prev => ({
      ...prev,
      meteor: { ...prev.meteor, enabled: !prev.meteor.enabled }
    }));
  };

  const toggleSpotlight = () => {
    setEffectState(prev => ({
      ...prev,
      spotlight: { ...prev.spotlight, enabled: !prev.spotlight.enabled }
    }));
  };

  const toggleVisualizer = () => {
    setEffectState(prev => ({
      ...prev,
      visualizer: { ...prev.visualizer, enabled: !prev.visualizer.enabled }
    }));
  };

  const toggleAudioMaster = () => {
    setAudioSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Change of intensity level preset globally
  const handleIntensityChange = (level: IntensityLevel) => {
    setEffectState(prev => ({
      ...prev,
      intensityLevel: level
    }));
  };

  // Preset helper mapping to display corresponding icons
  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="size-4 text-sky-400" />;
      case 'CloudRain': return <CloudRain className="size-4 text-blue-400" />;
      case 'CloudLightning': return <CloudLightning className="size-4 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="size-4 text-amber-500 animate-pulse" />;
      case 'Tv': return <Tv className="size-4 text-emerald-400" />;
      default: return <Sparkles className="size-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sleek Tabs Selection Panel */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 p-1">
        {[
          { id: 'preset', label: 'Preset Space' },
          { id: 'weather', label: 'Thời Tiết (3D Close)' },
          { id: 'lights', label: 'Sân Khấu & Sóng' },
          { id: 'audio', label: 'Lofi Audio Mixer' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2.5 px-2 text-xs rounded-lg font-medium transition-all ${
              activeTab === t.id
                ? 'bg-neutral-800 text-white shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Global Intensity Modifier Controls Panel - Persistent for extreme control */}
      <div className="bg-neutral-950/80 p-4 border-b border-neutral-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
          <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
            <Gauge className="size-3.5 text-amber-400 animate-pulse" />
            Cường độ tổng thể (Intensity Preset):
          </span>
          <span className="text-amber-400 uppercase font-bold text-xs">
            {effectState.intensityLevel}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-0.5 bg-neutral-900 rounded-lg">
          {(['light', 'medium', 'heavy', 'extreme'] as IntensityLevel[]).map((level) => {
            const isSelected = effectState.intensityLevel === level;
            const levelLabels = {
              light: 'Mỏng (0.5x)',
              medium: 'Vừa (1.0x)',
              heavy: 'Dày (1.7x)',
              extreme: 'Cự̣c Đại (2.8x)'
            };
            return (
              <button
                key={level}
                onClick={() => handleIntensityChange(level)}
                className={`py-1.5 px-1 text-[10px] rounded font-semibold transition ${
                  isSelected 
                    ? 'bg-amber-500 text-neutral-950 shadow font-extrabold' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
                }`}
              >
                {levelLabels[level]}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-neutral-500 italic mt-1 leading-normal text-center">
          * Thang số nhân tự động tăng/giảm mật độ hạt hiệu ứng trên màn hình chuẩn lofi cinematic.
        </p>
      </div>

      {/* Main Tab Contents Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar select-none max-h-[620px]">
        
        {/* TAB 1: PRESETS */}
        {activeTab === 'preset' && (
          <div className="space-y-4 animate-fade-in text-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="size-4 text-amber-500 animate-pulse" />
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Chọn không gian lofi mẫu</h3>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-normal">
              Bật ngay các preset nhanh được định cấu hình mức tối ưu nhất về mật độ chiều sâu, chuyển động đèn rọi và hoạt ảnh 3D.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset.id)}
                    className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                      isActive 
                        ? 'bg-neutral-800/80 border-amber-500/80 ring-2 ring-amber-500/15' 
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-950/90'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 h-full w-1.5 bg-amber-500" />
                    )}

                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        isActive ? 'bg-neutral-900 text-amber-500' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                      }`}>
                        {getPresetIcon(preset.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isActive ? 'text-amber-400' : 'text-neutral-200'}`}>
                            {preset.name}
                          </h4>
                          {isActive && <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded uppercase font-semibold">Đang Bật</span>}
                        </div>
                        <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-normal">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: WEATHER & NATURALS */}
        {activeTab === 'weather' && (
          <div className="space-y-4 animate-fade-in text-neutral-200">
            
            {/* 1. FALLING SNOW */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.snow.enabled ? 'bg-sky-500/10 text-sky-400' : 'bg-neutral-900 text-neutral-500'}`}>
                    <Snowflake className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Tuyết Rơi 3 Chiều (Snow Depth)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Tự động khuếch đại 3 lớp xa/trung/gần</span>
                  </div>
                </div>
                <button 
                  onClick={toggleSnow} 
                  id="toggle-snow-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.snow.enabled ? <ToggleRight className="size-6 text-sky-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.snow.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Amount / Density */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Mật độ & Số lượng bông:</span>
                      <span>{effectState.snow.count} hạt</span>
                    </div>
                    <input
                      type="range" min="15" max="320" step="5"
                      value={effectState.snow.count}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, count: Number(e.target.value) }
                      }))}
                      className="w-full accent-sky-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tốc độ rơi trung bình:</span>
                      <span>{effectState.snow.speed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min="0.2" max="6.0" step="0.1"
                      value={effectState.snow.speed}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, speed: Number(e.target.value) }
                      }))}
                      className="w-full accent-emerald-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Kích cỡ lớn nhất hạt:</span>
                      <span>{effectState.snow.size.toFixed(1)}px</span>
                    </div>
                    <input
                      type="range" min="1.0" max="10.0" step="0.2"
                      value={effectState.snow.size}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, size: Number(e.target.value) }
                      }))}
                      className="w-full accent-blue-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Swirl / Xoáy nhẹ */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Mức độ lắc lư, xoáy gió nhẹ:</span>
                      <span>{effectState.snow.swirl.toFixed(1)} độ lắc</span>
                    </div>
                    <input
                      type="range" min="0" max="10.0" step="0.5"
                      value={effectState.snow.swirl}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, swirl: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Wind Direction */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Hướng gió:</span>
                      <span>{effectState.snow.windDirection > 0 ? `Sang phải (+${effectState.snow.windDirection})` : effectState.snow.windDirection < 0 ? `Sang trái (${effectState.snow.windDirection})` : 'Không có gió'}</span>
                    </div>
                    <input
                      type="range" min="-5.0" max="5.0" step="0.5"
                      value={effectState.snow.windDirection}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, windDirection: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Wind Strength */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Sức thổi của gió:</span>
                      <span>Cấp {effectState.snow.windStrength}</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="1"
                      value={effectState.snow.windStrength}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, windStrength: Number(e.target.value) }
                      }))}
                      className="w-full accent-teal-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ rõ ràng tuyết / Opacity:</span>
                      <span>{(effectState.snow.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={effectState.snow.opacity}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        snow: { ...prev.snow, opacity: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. RAIN EFFECT */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.rain.enabled ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-900 text-neutral-500'}`}>
                    <CloudRain className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Mưa Giông 3 Chiều (Rain Space)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Các sợi mưa lớn nhỏ tùy theo khoảng cách ống kính</span>
                  </div>
                </div>
                <button 
                  onClick={toggleRain} 
                  id="toggle-rain-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.rain.enabled ? <ToggleRight className="size-6 text-blue-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.rain.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Amount */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Mật độ & Số lượng vệt mưa:</span>
                      <span>{effectState.rain.count} sợi fader</span>
                    </div>
                    <input
                      type="range" min="20" max="480" step="10"
                      value={effectState.rain.count}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, count: Number(e.target.value) }
                      }))}
                      className="w-full accent-blue-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tốc độ rơi xối xả:</span>
                      <span>{effectState.rain.speed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min="1.0" max="16.0" step="0.5"
                      value={effectState.rain.speed}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, speed: Number(e.target.value) }
                      }))}
                      className="w-full accent-violet-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Length */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ dài dải vệt mưa:</span>
                      <span>{effectState.rain.length}px</span>
                    </div>
                    <input
                      type="range" min="5" max="45" step="1"
                      value={effectState.rain.length}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, length: Number(e.target.value) }
                      }))}
                      className="w-full accent-teal-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Thickness */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ mảnh - dày của mưa:</span>
                      <span>{effectState.rain.thickness}px</span>
                    </div>
                    <input
                      type="range" min="1" max="6" step="1"
                      value={effectState.rain.thickness}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, thickness: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Window direction */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Góc xiên của gió lùa:</span>
                      <span>{effectState.rain.windDirection > 0 ? `Nghiêng phải (~${effectState.rain.windDirection})` : effectState.rain.windDirection < 0 ? `Nghiêng trái (~${effectState.rain.windDirection})` : 'Rơi đứng'}</span>
                    </div>
                    <input
                      type="range" min="-10.0" max="10.0" step="0.5"
                      value={effectState.rain.windDirection}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, windDirection: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Wind strength */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Sức mãnh liệt của bão:</span>
                      <span>Cấp {effectState.rain.windStrength}</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="1"
                      value={effectState.rain.windStrength}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, windStrength: Number(e.target.value) }
                      }))}
                      className="w-full accent-purple-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Rain Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ hiển thị hạt mưa:</span>
                      <span>{(effectState.rain.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.10" max="1.0" step="0.05"
                      value={effectState.rain.opacity}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        rain: { ...prev.rain, opacity: Number(e.target.value) }
                      }))}
                      className="w-full accent-indigo-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. THUNDER & LIGHTNING */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.thunder.enabled ? 'bg-purple-500/10 text-purple-400 animate-pulse' : 'bg-neutral-900 text-neutral-500'}`}>
                    <CloudLightning className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Sấm Sét & Chớp Nháy (Storm Electric)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Phân nhánh ngẫu nhiên, sấm rống rền rĩ sinh động</span>
                  </div>
                </div>
                <button 
                  onClick={toggleThunder} 
                  id="toggle-thunder-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.thunder.enabled ? <ToggleRight className="size-6 text-purple-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.thunder.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Frequency */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tần suất xuất hiện tia sét:</span>
                      <span>{effectState.thunder.frequency}% cơ hội</span>
                    </div>
                    <input
                      type="range" min="5" max="95" step="5"
                      value={effectState.thunder.frequency}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        thunder: { ...prev.thunder, frequency: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ sáng chớp lóa (Haze flash):</span>
                      <span>{(effectState.thunder.brightness * 100).toFixed(0)}% sáng</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={effectState.thunder.brightness}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        thunder: { ...prev.thunder, brightness: Number(e.target.value) }
                      }))}
                      className="w-full accent-yellow-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Thickness */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ dày thân sét đánh:</span>
                      <span>{effectState.thunder.thickness}px đường kính</span>
                    </div>
                    <input
                      type="range" min="1" max="12" step="1"
                      value={effectState.thunder.thickness}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        thunder: { ...prev.thunder, thickness: Number(e.target.value) }
                      }))}
                      className="w-full accent-orange-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Branching */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Mức độ phân nhánh phụ:</span>
                      <span>Cấp {effectState.thunder.branching} (Tia nhánh)</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="1"
                      value={effectState.thunder.branching}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        thunder: { ...prev.thunder, branching: Number(e.target.value) }
                      }))}
                      className="w-full accent-sky-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Lightning color options */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono mb-2">Màu điện tích plasma:</label>
                    <div className="flex items-center gap-3">
                      {[
                        { color: '#ffffff', label: 'Bạch Tuyết' },
                        { color: '#e0f2fe', label: 'Băng Lam' },
                        { color: '#faf5ff', label: 'Tím Điện' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => setEffectState(prev => ({
                            ...prev,
                            thunder: { ...prev.thunder, color: preset.color }
                          }))}
                          className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
                            effectState.thunder.color === preset.color 
                              ? 'bg-neutral-800 border-purple-500 text-purple-300' 
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Play sound toggle */}
                  <div className="flex items-center justify-between bg-neutral-900/50 border border-neutral-800/40 p-2.5 rounded-lg mt-1 text-[11px]">
                    <span className="text-neutral-300 font-medium font-mono text-[10px]">Âm thanh sấm đập ngẫu nhiên:</span>
                    <button
                      onClick={() => setEffectState(prev => ({
                        ...prev,
                        thunder: { ...prev.thunder, playSound: !prev.thunder.playSound }
                      }))}
                      className={`px-3 py-1 text-[10px] font-semibold border rounded-md transition ${
                        effectState.thunder.playSound 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {effectState.thunder.playSound ? 'KÈM SẤM' : 'TẮT SẤM'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. METEOR SHOWER */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.meteor.enabled ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-neutral-900 text-neutral-500'}`}>
                    <Sparkles className="size-4 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Mưa Sao Băng Thơ Mộng (Meteor Dream)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Đuôi sáng lướt dài rực rỡ, lung linh cực đẹp</span>
                  </div>
                </div>
                <button 
                  onClick={toggleMeteor} 
                  id="toggle-meteor-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.meteor.enabled ? <ToggleRight className="size-6 text-amber-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.meteor.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Amount / Count */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Mật độ lượng sao xuất hiện tối đa:</span>
                      <span>{effectState.meteor.count} sao băng</span>
                    </div>
                    <input
                      type="range" min="1" max="30" step="1"
                      value={effectState.meteor.count}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, count: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Frequency check */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Xác suất sinh sao bay:</span>
                      <span>{effectState.meteor.frequency}% khả năng</span>
                    </div>
                    <input
                      type="range" min="5" max="100" step="5"
                      value={effectState.meteor.frequency}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, frequency: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tốc độ sao lướt:</span>
                      <span>{effectState.meteor.speed.toFixed(1)}x tốc</span>
                    </div>
                    <input
                      type="range" min="2.0" max="25.0" step="0.5"
                      value={effectState.meteor.speed}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, speed: Number(e.target.value) }
                      }))}
                      className="w-full accent-emerald-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Tail Length */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ dài dải đuôi sao tàn biến:</span>
                      <span>{effectState.meteor.tailLength}px</span>
                    </div>
                    <input
                      type="range" min="30" max="250" step="5"
                      value={effectState.meteor.tailLength}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, tailLength: Number(e.target.value) }
                      }))}
                      className="w-full accent-indigo-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Glow strength */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Cường độ rực sáng / Glow Bloom:</span>
                      <span>{effectState.meteor.glow}px quầng sáng</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="2"
                      value={effectState.meteor.glow}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, glow: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Direction angle */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Góc lệch rơi xiên:</span>
                      <span>{effectState.meteor.direction}° độ nghiêng</span>
                    </div>
                    <input
                      type="range" min="15" max="75" step="5"
                      value={effectState.meteor.direction}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, direction: Number(e.target.value) }
                      }))}
                      className="w-full accent-teal-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ trong suốt vệt sao:</span>
                      <span>{(effectState.meteor.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.10" max="1.0" step="0.05"
                      value={effectState.meteor.opacity}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        meteor: { ...prev.meteor, opacity: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM LIGHTS & AUDIO WAVES */}
        {activeTab === 'lights' && (
          <div className="space-y-4 animate-fade-in text-neutral-200">
            
            {/* 1. VOLUMETRIC SPOTLIGHT BEAMS */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.spotlight.enabled ? 'bg-amber-400/10 text-amber-400' : 'bg-neutral-900 text-neutral-500'}`}>
                    <Sun className="size-4 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Đèn Rọi Sân Khấu (Volumetric Spotlights)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Dàn đèn quét sân khấu kết hợp sương mờ lung linh</span>
                  </div>
                </div>
                <button 
                  onClick={toggleSpotlight} 
                  id="toggle-spotlight-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.spotlight.enabled ? <ToggleRight className="size-6 text-amber-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.spotlight.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Select Colors */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono mb-2">Tông màu luồng ánh sáng đèn rọi:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyan', label: 'Lam Tiên Cảnh', colorBG: 'bg-cyan-500' },
                        { id: 'pink', label: 'Hồng Tình Yêu', colorBG: 'bg-pink-500' },
                        { id: 'warm', label: 'Vàng Ấm Lofi', colorBG: 'bg-amber-500' },
                        { id: 'white', label: 'Trắng Tuyết Tuyệt', colorBG: 'bg-white' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setEffectState(prev => ({
                            ...prev,
                            spotlight: { ...prev.spotlight, color: item.id as any }
                          }))}
                          className={`flex items-center gap-2 py-1.5 px-3 rounded text-[10px] font-bold border transition ${
                            effectState.spotlight.color === item.id 
                              ? 'bg-neutral-800 border-amber-500 text-amber-400' 
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          <div className={`size-2.5 rounded-full ${item.colorBG} shrink-0`} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spotlight Beam Count */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Số lượng dàn đèn quét đồng thời:</span>
                      <span>{effectState.spotlight.count} bóng rọi</span>
                    </div>
                    <input
                      type="range" min="1" max="6" step="1"
                      value={effectState.spotlight.count}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, count: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ rõ luồng sáng (Volumetric intensity):</span>
                      <span>{(effectState.spotlight.brightness * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.05" max="1.0" step="0.05"
                      value={effectState.spotlight.brightness}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, brightness: Number(e.target.value) }
                      }))}
                      className="w-full accent-orange-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Beam Width */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Chiều rộng luồng sáng đáy:</span>
                      <span>{effectState.spotlight.width}px</span>
                    </div>
                    <input
                      type="range" min="100" max="800" step="20"
                      value={effectState.spotlight.width}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, width: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Sweep Angle */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Góc quét xòe di động:</span>
                      <span>{effectState.spotlight.angle}° quạt</span>
                    </div>
                    <input
                      type="range" min="5" max="55" step="1"
                      value={effectState.spotlight.angle}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, angle: Number(e.target.value) }
                      }))}
                      className="w-full accent-emerald-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Swing motion speed */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tốc độ đảo dập dình:</span>
                      <span>{effectState.spotlight.speed.toFixed(1)}x tốc</span>
                    </div>
                    <input
                      type="range" min="0.1" max="4.0" step="0.1"
                      value={effectState.spotlight.speed}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, speed: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Glow Bloom */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Kích sáng thấu kính phát / Lens Blur:</span>
                      <span>Blur {effectState.spotlight.glow}px</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="2"
                      value={effectState.spotlight.glow}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, glow: Number(e.target.value) }
                      }))}
                      className="w-full accent-indigo-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Haze / Dust Twinkle */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Bụi sáng lơ lửng / Haze (Twinkle):</span>
                      <span>{(effectState.spotlight.haze * 100).toFixed(0)}% bụi sương</span>
                    </div>
                    <input
                      type="range" min="0" max="1.0" step="0.05"
                      value={effectState.spotlight.haze}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, haze: Number(e.target.value) }
                      }))}
                      className="w-full accent-teal-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. DYNAMIC AUDIO VISUALIZER WAVES */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${effectState.visualizer.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-900 text-neutral-500'}`}>
                    <Music className="size-4 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Sóng Âm Đáy Màn Hình (Acoustic Waves)</span>
                    <span className="text-[9px] text-neutral-400 block italic">Sắp chồng xếp dải dập dình theo nhạc tuyệt sắc</span>
                  </div>
                </div>
                <button 
                  onClick={toggleVisualizer} 
                  id="toggle-visualizer-btn"
                  className="text-neutral-400 hover:text-white transition"
                >
                  {effectState.visualizer.enabled ? <ToggleRight className="size-6 text-emerald-400" /> : <ToggleLeft className="size-6 text-neutral-600" />}
                </button>
              </div>

              {effectState.visualizer.enabled && (
                <div className="space-y-3 pt-1 border-t border-neutral-900 animate-slide-down">
                  {/* Height */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Biên độ cao tối đa dải sóng:</span>
                      <span>{effectState.visualizer.height}px</span>
                    </div>
                    <input
                      type="range" min="10" max="180" step="5"
                      value={effectState.visualizer.height}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, height: Number(e.target.value) }
                      }))}
                      className="w-full accent-emerald-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Tốc độ tần số dao động:</span>
                      <span>{effectState.visualizer.speed.toFixed(1)}x tần số</span>
                    </div>
                    <input
                      type="range" min="0.2" max="6.0" step="0.2"
                      value={effectState.visualizer.speed}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, speed: Number(e.target.value) }
                      }))}
                      className="w-full accent-fuchsia-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Thickness */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ dày viền neon rực sáng:</span>
                      <span>{effectState.visualizer.thickness}px nét vẽ</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="1"
                      value={effectState.visualizer.thickness}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, thickness: Number(e.target.value) }
                      }))}
                      className="w-full accent-amber-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Wave Layers Count */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Số lượng lớp sóng xếp dải chồng nhau:</span>
                      <span>{effectState.visualizer.count} dải chồng lớp</span>
                    </div>
                    <input
                      type="range" min="1" max="4" step="1"
                      value={effectState.visualizer.count}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, count: Number(e.target.value) }
                      }))}
                      className="w-full accent-sky-400 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Glow Drop */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ tỏa sáng bóng mờ neon / Glow Blur:</span>
                      <span>{effectState.visualizer.glow}px quả cầu</span>
                    </div>
                    <input
                      type="range" min="0" max="30" step="2"
                      value={effectState.visualizer.glow}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, glow: Number(e.target.value) }
                      }))}
                      className="w-full accent-indigo-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>Độ hiển thị mờ đục dải sóng:</span>
                      <span>{(effectState.visualizer.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={effectState.visualizer.opacity}
                      onChange={(e) => setEffectState(prev => ({
                        ...prev,
                        visualizer: { ...prev.visualizer, opacity: Number(e.target.value) }
                      }))}
                      className="w-full accent-pink-500 bg-neutral-900 rounded-lg appearance-none h-1.5"
                    />
                  </div>

                  {/* Color selection */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono mb-2">Bảng màu sắc dải tần phổ âm lofi:</label>
                    <div className="flex gap-2">
                      {[
                        { color: '#f59e0b', label: 'Cam Lofi' },
                        { color: '#ec4899', label: 'Neon Hồng' },
                        { color: '#38bdf8', label: 'Lam Dương' },
                        { color: '#10b981', label: 'Ngọc Bích' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => setEffectState(prev => ({
                            ...prev,
                            visualizer: { ...prev.visualizer, color: item.color }
                          }))}
                          className="flex-1 py-1.5 rounded border text-[9px] font-bold text-center uppercase transition truncate"
                          style={{
                            borderColor: effectState.visualizer.color === item.color ? item.color : '#262626',
                            color: effectState.visualizer.color === item.color ? item.color : '#a3a3a3',
                            backgroundColor: effectState.visualizer.color === item.color ? `${item.color}0a` : '#0a0a0a',
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROCEDURAL LOFI AUDIO MIXER CLIENT */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-fade-in text-neutral-300">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="size-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-200">Âm thanh lofi không lời</span>
              </div>
              <button
                onClick={toggleAudioMaster}
                id="toggle-master-audio-btn"
                className={`text-[10px] font-bold px-3 py-1.5 border rounded-md transition ${
                  audioSettings.enabled
                    ? 'bg-amber-500 border-amber-500/80 text-neutral-950 shadow-md font-extrabold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {audioSettings.enabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 leading-normal font-mono">
              Hệ thống sử dụng **Web Audio API** tạo trực tiếp sóng âm vô tận một cách tự nhiên. Khi xuất video, âm thanh này sẽ tự động tổng hòa vào file WebM một cách chất lượng.
            </p>

            {/* Mixer Subfaders */}
            <div className="space-y-4 pt-1">
              {/* Master volume knob */}
              <div className="bg-neutral-950/80 border border-neutral-800 px-3.5 py-3 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-neutral-200 mb-1.5">
                  <span className="flex items-center gap-1">Volume Tổng fader</span>
                  <span className="font-mono">{(audioSettings.volume * 100).toFixed(0)}%</span>
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

              {/* Sub mixer parameters */}
              <div className="space-y-3 bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/40">
                <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2.5">Cơ cấu nhạc cụ phụ trợ</h4>

                {/* 1. Pad Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5"><Tv className="size-3 text-violet-400" /> Lush Pad nền sâu:</span>
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
                    className="w-full accent-violet-500 bg-neutral-900 rounded-lg appearance-none h-1 disabled:opacity-30"
                  />
                </div>

                {/* 2. Piano Chords */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5"><Music className="size-3 text-pink-400" /> Piano hợp âm rải chậm:</span>
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
                    className="w-full accent-pink-500 bg-neutral-900 rounded-lg appearance-none h-1 disabled:opacity-30"
                  />
                </div>

                {/* 3. Wind Whispers */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5"><Wind className="size-3 text-teal-400" /> Hơi gió thổi làu bàu:</span>
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
                    className="w-full accent-teal-500 bg-neutral-900 rounded-lg appearance-none h-1 disabled:opacity-30"
                  />
                </div>

                {/* 4. Fireplace Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5"><Flame className="size-3 text-orange-400 animate-pulse" /> Tiếng lửa lò bếp bập bùng:</span>
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
                    className="w-full accent-orange-500 bg-neutral-900 rounded-lg appearance-none h-1 disabled:opacity-30"
                  />
                </div>

                {/* 5. Rain Volume Overlay */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5"><CloudRain className="size-3 text-blue-400" /> Tiếng mưa tĩnh xọc xọc:</span>
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
                    className="w-full accent-blue-500 bg-neutral-900 rounded-lg appearance-none h-1 disabled:opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Help Hints Footer */}
      <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Cpu className="size-3 text-amber-500 animate-spin" />
          CPU Hardware acceleration
        </span>
        <span className="text-neutral-400 font-bold">ATMOSPHERE 1.9.8 PRO</span>
      </div>
    </div>
  );
}
