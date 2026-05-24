import React, { useState, useEffect } from 'react';
import { EffectState, AudioSettings, TextLayer } from './types';
import { INITIAL_STATE, INITIAL_AUDIO } from './constants/presets';
import CanvasRenderer from './components/CanvasRenderer';
import EffectsPanel from './components/EffectsPanel';
import { 
  Sparkles, UploadCloud, Eye, EyeOff, Image as ImageIcon, 
  Trash2, Compass, HelpCircle, Laptop, Film
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Premium high-quality handpicked lofi backdrop URLs for demo
const DEMO_BACKDROPS = [
  {
    id: 'lofi-studio',
    name: 'Phòng Thu Lofi',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
    author: 'Unsplash Lofi Studio',
  },
  {
    id: 'rainy-neon',
    name: 'Phố Đêm Mưa',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    author: 'Unsplash Rainy Dream',
  },
  {
    id: 'cozy-fireplace',
    name: 'Lò Sưởi Ấm Áp',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    author: 'Unsplash Fireside Cozy',
  },
  {
    id: 'cyber-neon',
    name: 'Horizon Neon Cát',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
    author: 'Vaporwave Sunset',
  },
];

export default function App() {
  // Primary States
  const [effectState, setEffectState] = useState<EffectState>(INITIAL_STATE);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(INITIAL_AUDIO);

  // Load from localStorage or default
  const [textLayers, setTextLayers] = useState<TextLayer[]>(() => {
    try {
      const persisted = localStorage.getItem('atmosphere_text_layers');
      if (persisted) {
        return JSON.parse(persisted);
      }
    } catch (e) {
      console.warn('Failed to parse text layers:', e);
    }
    return [
      {
        id: 'text_1',
        name: 'Tiêu đề Stay With Me',
        content: 'Stay With Me',
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
          color: 'rgba(0,0,0,0.5)'
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
      },
      {
        id: 'text_2',
        name: 'Nhãn Official Music Video',
        content: 'OFFICIAL MUSIC VIDEO',
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
        x: 50,
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
        zIndex: 5
      }
    ];
  });

  const [activeTextLayerId, setActiveTextLayerId] = useState<string | null>(() => {
    try {
      const persisted = localStorage.getItem('atmosphere_text_layers');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch (_) {}
    return 'text_1';
  });

  useEffect(() => {
    localStorage.setItem('atmosphere_text_layers', JSON.stringify(textLayers));
  }, [textLayers]);
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [playing, setPlaying] = useState<boolean>(true); // Play on start
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  
  // Drag and drop interactive hover state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Time ticks for UTC details placeholder
  const [currentTimeUTC, setCurrentTimeUTC] = useState<string>('13:31:12');

  useEffect(() => {
    // Keep UTC time ticking gently in the header
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // File Upload Handlers (FileReader dataURL setup)
  const processBackdropFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, Custom WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBackgroundImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processBackdropFile(e.target.files[0]);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processBackdropFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
  };

  return (
    <div 
      className="min-h-screen bg-[#07050d] text-neutral-100 flex flex-col font-sans relative overflow-x-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Absolute Drag HUD Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 pointer-events-none"
          >
            <div className="border-3 border-dashed border-amber-500 rounded-3xl p-12 text-center max-w-md bg-neutral-900 shadow-2xl flex flex-col items-center gap-5">
              <UploadCloud className="size-16 text-amber-500 animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">Thả ảnh vào đây</h3>
                <p className="text-sm text-neutral-400 mt-1 max-w-xs">
                  Hỗ trợ định dạng PNG, JPG, JPEG, GIF làm ảnh nền Atmosphere Canvas.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Sleek Cinematic Header */}
      {!cinemaMode && (
        <header className="border-b border-neutral-900 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-amber-500 rounded-xl flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-white/10 shrink-0">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black font-sans tracking-wide text-white uppercase uppercase-0 select-text">
                  Atmosphere Canvas
                </h1>
                <span className="text-[9px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest hidden sm:inline-block">Beta</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono tracking-tight select-text">
                Studio tạo hoạt ảnh video tĩnh & âm thanh không lời độc đáo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 hidden md:flex">
            <span className="text-neutral-400">Time: <strong className="text-neutral-200">{currentTimeUTC}</strong></span>
          </div>
        </header>
      )}

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* LEFT COLUMN: THE CANVAS VIEWER */}
        <section className={`lg:col-span-7 space-y-5 transition-all duration-500 ${cinemaMode ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : ''}`}>
          
          <CanvasRenderer
            effectState={effectState}
            audioSettings={audioSettings}
            backgroundImage={backgroundImage}
            imageFit={imageFit}
            playing={playing}
            setPlaying={setPlaying}
            cinemaMode={cinemaMode}
            textLayers={textLayers}
          />

          {/* Toggle buttons underneath Canvas block */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Cinema Mode switch buttons */}
              <button
                onClick={() => setCinemaMode(!cinemaMode)}
                id="toggle-cinema-mode-btn"
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl border flex items-center gap-2 transition ${
                  cinemaMode 
                    ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/10' 
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800/80 text-neutral-300'
                }`}
              >
                {cinemaMode ? (
                  <>
                    <EyeOff className="size-4 shrink-0" />
                    <span>Thoát Chế Độ Cinema</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-4 shrink-0" />
                    <span>Chế Độ Cinema</span>
                  </>
                )}
              </button>

              {/* Cover/Contain options */}
              {!cinemaMode && backgroundImage && (
                <div className="flex items-center bg-neutral-900/60 border border-neutral-800 p-0.5 rounded-xl">
                  <button
                    onClick={() => setImageFit('cover')}
                    className={`text-[10px] font-bold px-3 py-2 rounded-lg transition ${
                      imageFit === 'cover' ? 'bg-neutral-800 text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Bao phủ (Cover)
                  </button>
                  <button
                    onClick={() => setImageFit('contain')}
                    className={`text-[10px] font-bold px-3 py-2 rounded-lg transition ${
                      imageFit === 'contain' ? 'bg-neutral-800 text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Chứa (Contain)
                  </button>
                </div>
              )}
            </div>

            {/* Clear custom background button */}
            {!cinemaMode && backgroundImage && (
              <button
                onClick={handleRemoveImage}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition"
              >
                <Trash2 className="size-3.5" />
                <span>Gỡ ảnh đã đăng</span>
              </button>
            )}
          </div>

          {/* 2. DEMO STUDIO ASSETS BACKDROPS CHANGER (Collapses on cinema mode) */}
          {!cinemaMode && (
            <div className="bg-neutral-950/60 border border-neutral-900 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-amber-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Ảnh nền phòng thu mẫu</h3>
                </div>
                <span className="text-[10px] text-neutral-500">Bấm một ảnh để thử hiệu ứng</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_BACKDROPS.map((backdrop) => (
                  <button
                    key={backdrop.id}
                    onClick={() => {
                      setBackgroundImage(backdrop.url);
                    }}
                    className={`relative aspect-video rounded-xl overflow-hidden border group transition-all ${
                      backgroundImage === backdrop.url 
                        ? 'border-amber-500 ring-2 ring-amber-500/10' 
                        : 'border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <img 
                      src={backdrop.url} 
                      alt={backdrop.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-2">
                      <span className="text-[9px] text-neutral-300 font-medium truncate w-full text-left">{backdrop.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload custom box */}
              <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-900/10 hover:bg-neutral-900/20 p-6 rounded-2xl text-center relative transition-all">
                <input
                  type="file"
                  id="custom-backdrop-uploader"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <UploadCloud className="size-8 text-neutral-500" />
                  <p className="text-xs font-semibold text-neutral-300">Tải ảnh static của bạn lên đây</p>
                  <p className="text-[10px] text-neutral-500 font-mono">PNG, JGP, WEBP lên tới 10MB hoặc Drag & Drop mảnh ảnh</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: CONTROLLERS CONTROL CABINET */}
        {!cinemaMode && (
          <section className="lg:col-span-5 h-full">
            <EffectsPanel
              effectState={effectState}
              setEffectState={setEffectState}
              audioSettings={audioSettings}
              setAudioSettings={setAudioSettings}
              textLayers={textLayers}
              setTextLayers={setTextLayers}
              activeTextLayerId={activeTextLayerId}
              setActiveTextLayerId={setActiveTextLayerId}
            />
          </section>
        )}
      </main>

      {/* Compact Global Footer details */}
      {!cinemaMode && (
        <footer className="border-t border-neutral-900 bg-neutral-950/60 backdrop-blur-inner py-5 px-6 text-center text-[11px] text-neutral-500 space-y-1 relative z-10 font-mono mt-12 w-full">
          <p>© 2026 Atmosphere Canvas Studio. Bản quyền thuộc về Studio Âm Nhạc Cinematic.</p>
          <p className="text-[10px] text-neutral-600">Sử dụng HTML5 Canvas API và Web Audio lofi Synthesizer để vẽ sóng hoạt ảnh.</p>
        </footer>
      )}
    </div>
  );
}
