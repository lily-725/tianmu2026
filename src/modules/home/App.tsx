/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Map as MapIcon, 
  ChevronRight, 
  RefreshCcw, 
  Volume2, 
  VolumeX, 
  X, 
  Maximize2,
  Maximize
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EXHIBITION_CONFIG, MapMarker, MapYearConfig } from './config';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

/**
 * 首页视图
 */
const HomeView = ({ onNavigate }: { onNavigate: (view: 'exhibition' | 'map') => void }) => {
  const { home } = EXHIBITION_CONFIG;
  
  return (
    <div className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-parchment">
      {/* Design Elements */}
      <div className="watermark">1404-2026</div>
      <div className="historical-line" />
      <div className="stamp">天穆<br />历史</div>

      {/* Left: Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 w-full md:w-1/2 h-full flex flex-col justify-center pl-12 md:pl-24 pr-12"
      >
        <div className="mb-4">
          <p className="text-sm tracking-[0.2em] opacity-60 mb-2 font-sans uppercase">
            TIANMU VILLAGE LOCAL HISTORY
          </p>
          <h1 className="font-serif text-8xl md:text-[10rem] font-bold leading-none tracking-tighter text-ink">
            {home.mainTitle}
          </h1>
          <h2 className="font-serif text-3xl italic mt-4 opacity-80">
            {home.subTitle}
          </h2>
        </div>
        
        <div className="mt-12 max-w-md">
          <p className="text-lg leading-relaxed opacity-70 font-sans font-light">
            跨越六百载的泊岸与生根。从运河边的聚落到现代化的社区，通过时间与空间的交织，回溯属于天穆的独特叙事。
          </p>
        </div>
      </motion.div>

      {/* Right: Navigation Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 w-full md:w-1/2 h-full flex items-center justify-center p-8 bg-white/30 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-12 w-full max-w-sm">
          <div className="text-center group">
            <button 
              onClick={() => onNavigate('exhibition')}
              className="nav-button"
            >
              去看展览
            </button>
            <p className="mt-4 text-[10px] tracking-widest opacity-60 font-sans uppercase">
              泊岸·生根 —— 天穆六百年
            </p>
          </div>

          <div className="text-center group">
            <button 
              onClick={() => onNavigate('map')}
              className="nav-button"
            >
              去看地图
            </button>
            <p className="mt-4 text-[10px] tracking-widest opacity-60 font-sans uppercase">
              1950 年与 2026 年的天穆村地图
            </p>
          </div>
        </div>

        {/* Vertical Rail */}
        <div className="vertical-rail">
          ARCHIVE SYSTEM v1.0 • NORTH CANAL AREA • TIANMU DISTRICT
        </div>

        {/* Scroll Indicator (Visual only) */}
        <div className="absolute bottom-8 right-12 flex items-center space-x-4 opacity-40 text-[10px] tracking-[0.3em] font-sans">
          <span>SCROLL TO EXPLORE</span>
          <div className="w-12 h-px bg-current"></div>
          <span>01 / 03</span>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 详情弹层
 */
const DetailModal = ({ 
  marker, 
  onClose, 
  audioPlaying, 
  setAudioPlaying 
}: { 
  marker: MapMarker; 
  onClose: () => void;
  audioPlaying: boolean;
  setAudioPlaying: (v: boolean) => void;
}) => {
  const [currentImg, setCurrentImg] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset audio when marker changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [marker.id]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
    >
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl h-[90vh] bg-parchment-light overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] p-2 bg-black/20 hover:bg-black/40 text-black md:text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left: Images */}
        <div className="w-full md:w-[60%] h-1/2 md:h-full bg-black relative">
          <img 
            key={marker.images[currentImg]}
            src={marker.images[currentImg] || 'https://via.placeholder.com/800x600?text=No+Image'}
            alt={marker.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute bottom-6 left-6 p-2 bg-black/50 text-[10px] text-white/70 font-mono">
            ARCHIVE_FILE // {marker.id} // {currentImg + 1} OF {marker.images.length}
          </div>

          {marker.images.length > 1 && (
            <div className="absolute bottom-6 right-6 flex gap-2">
              {marker.images.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentImg ? "bg-white w-6" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-[40%] h-1/2 md:h-full p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col">
          <span className="text-oldgold text-xs tracking-widest mb-4 font-serif italic">
            {marker.theme || "地方史实"}
          </span>
          <h3 className="font-serif text-4xl mb-6 text-gray-900 border-b border-gray-200 pb-4">
            {marker.title}
          </h3>
          <p className="text-gray-700 leading-relaxed font-sans text-sm mb-12">
            {marker.description}
          </p>

          <div className="mt-auto pt-8 border-t border-gray-200 flex flex-col gap-6">
            {marker.audio ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleAudio}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-cinnabar text-white hover:bg-cinnabar-dark transition-all scale-100 hover:scale-105 active:scale-95"
                >
                  {audioPlaying ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                    {audioPlaying ? "正在回响..." : "聆听历史原声"}
                  </p>
                  <p className="text-xs font-serif italic text-gray-600">
                    史料配音：{marker.title}
                  </p>
                </div>
                <audio 
                  ref={audioRef} 
                  src={marker.audio} 
                  onEnded={() => setAudioPlaying(false)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 opacity-30 cursor-not-allowed">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 text-gray-500">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">音频暂缺</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * 地图组件
 */
const MapComponent = ({ 
  config, 
  onMarkerSelect 
}: { 
  config: MapYearConfig; 
  onMarkerSelect: (m: MapMarker) => void 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Map
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: EXHIBITION_CONFIG.mapGlobal.minZoom,
        maxZoom: 18,
      }).setView(EXHIBITION_CONFIG.mapGlobal.initialCenter, EXHIBITION_CONFIG.mapGlobal.initialZoom);

      markersRef.current = L.layerGroup().addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;
    
    // Clear existing layers
    if (imageOverlayRef.current) map.removeLayer(imageOverlayRef.current);
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    markersRef.current?.clearLayers();

    // Map Type Specific Logic
    if (config.mapType === 'image' && config.bounds) {
      imageOverlayRef.current = L.imageOverlay(config.url, config.bounds).addTo(map);
      map.fitBounds(config.bounds);
    } else {
      tileLayerRef.current = L.tileLayer(config.url, {
        maxZoom: config.maxZoom
      }).addTo(map);
    }

    // Custom Icon
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="marker-pulse w-8 h-8">
          <div class="marker-inner"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add Markers
    config.markers.forEach(m => {
      L.marker([m.lat, m.lng], { icon: customIcon })
        .on('click', () => onMarkerSelect(m))
        .addTo(markersRef.current!);
    });

    return () => {
      // Clean up on component unmount
    };
  }, [config, onMarkerSelect]);

  // Reset View Handler
  const resetView = () => {
    if (leafletMapRef.current) {
      if (config.mapType === 'image' && config.bounds) {
        leafletMapRef.current.fitBounds(config.bounds);
      } else {
        leafletMapRef.current.setView(EXHIBITION_CONFIG.mapGlobal.initialCenter, EXHIBITION_CONFIG.mapGlobal.initialZoom);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full z-[1]" />
      <button 
        onClick={resetView}
        className="absolute top-6 right-6 z-[10] w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white transition-colors"
        title="重置视图"
      >
        <RefreshCcw className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};

/**
 * 主应用
 */
export default function App() {
  const [view, setView] = useState<'home' | 'exhibition' | 'map'>('home');
  const [currentYearIndex, setCurrentYearIndex] = useState(-1); // -1 is导览态
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Handle mobile back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (selectedMarker) {
        setSelectedMarker(null);
        setAudioPlaying(false);
      } else if (view !== 'home') {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedMarker, view]);

  const handleNavigate = (newView: 'exhibition' | 'map') => {
    setView(newView);
    window.history.pushState({ view: newView }, "");
    if (newView === 'map') setCurrentYearIndex(-1);
  };

  const currentYearConfig = currentYearIndex >= 0 ? EXHIBITION_CONFIG.maps[currentYearIndex] : null;

  return (
    <div className="h-screen w-full relative">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <HomeView onNavigate={handleNavigate} />
          </motion.div>
        )}

        {view === 'exhibition' && (
          <motion.div 
            key="exhibition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col bg-white"
          >
            <div className="h-14 bg-parchment flex items-center px-6 border-b border-gray-200">
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-sm font-serif hover:text-cinnabar transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </button>
              <div className="flex-1 text-center font-serif italic text-oldgold">
                天穆六百年线上展览
              </div>
              <div className="w-20" />
            </div>
            <div className="flex-1 relative">
              <iframe 
                src={EXHIBITION_CONFIG.exhibitionUrl} 
                className="w-full h-full border-none"
                title="Historical Exhibition"
              />
            </div>
          </motion.div>
        )}

        {view === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col bg-parchment"
          >
            {/* Header */}
            <div className="h-14 bg-white/50 backdrop-blur-md flex items-center px-6 z-[10] border-b border-gray-200">
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-sm font-serif hover:text-cinnabar transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>
              <div className="flex-1 text-center font-serif text-lg tracking-widest text-gray-900">
                时空档案：{currentYearConfig?.label || "请选择年代"}
              </div>
              <div className="w-20" />
            </div>

            {/* Content area: Split in desktop */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Map Column */}
              <div className="flex-1 relative">
                {currentYearIndex === -1 ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-parchment-light/80 p-8">
                    <div className="text-center max-w-sm">
                      <div className="w-12 h-12 bg-oldgold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapIcon className="text-oldgold w-6 h-6" />
                      </div>
                      <h2 className="font-serif text-3xl mb-4 text-gray-800">开启时空叙事</h2>
                      <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
                        请在下方时间轴上选择一个年份，<br/>开始探索天穆村在不同时代的变迁痕迹。
                      </p>
                    </div>
                  </div>
                ) : (
                  <MapComponent 
                    config={currentYearConfig!} 
                    onMarkerSelect={(m) => {
                      setSelectedMarker(m);
                      setAudioPlaying(false);
                      window.history.pushState({ marker: m.id }, "");
                    }} 
                  />
                )}
              </div>

              {/* Year Selector Desktop */}
              <div className="hidden lg:flex w-16 flex-col items-center justify-center gap-12 bg-white/30 border-l border-gray-200">
                {EXHIBITION_CONFIG.maps.map((m, idx) => (
                  <button 
                    key={m.year}
                    onClick={() => setCurrentYearIndex(idx)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-mono transition-all",
                      currentYearIndex === idx ? "bg-cinnabar text-white scale-125" : "bg-white/50 text-gray-400 hover:bg-white"
                    )}
                  >
                    {m.year}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Timeline (Floating for look) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl">
              <div className="glass-panel p-2 rounded-full flex gap-2">
                {EXHIBITION_CONFIG.maps.map((m, idx) => (
                  <button 
                    key={m.year}
                    onClick={() => setCurrentYearIndex(idx)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-full text-xs font-serif tracking-widest transition-all relative overflow-hidden",
                      currentYearIndex === idx ? "text-white bg-black" : "text-gray-600 hover:bg-black/5"
                    )}
                  >
                    {m.label}
                    {currentYearIndex === idx && (
                      <motion.div 
                        layoutId="activeYear"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-oldgold" 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Transition Overlay */}
      <AnimatePresence>
        {selectedMarker && (
          <DetailModal 
            marker={selectedMarker} 
            onClose={() => {
              setSelectedMarker(null);
              setAudioPlaying(false);
            }} 
            audioPlaying={audioPlaying}
            setAudioPlaying={setAudioPlaying}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
