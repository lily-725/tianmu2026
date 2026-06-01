import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PeriodData, HistoricalImage } from '../types';
import { Mic, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarDefaultProps {
  activePeriod: PeriodData;
  onImageZoom: (image: HistoricalImage) => void;
}

const WAVEFORM_BARS = [
  30, 50, 40, 70, 90, 60, 50, 80, 100, 70,
  50, 40, 60, 85, 95, 75, 55, 45, 65, 85,
  100, 80, 60, 50, 70, 90, 65, 45, 55, 75,
  90, 70, 50, 40, 60, 80, 95, 60, 40, 30
];

export const SidebarDefault = ({ activePeriod, onImageZoom }: SidebarDefaultProps) => {
  const [isOralPlaying, setIsOralPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationStr, setDurationStr] = useState('00:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const sectionTitleClassName =
    'text-[16px] font-semibold text-archive-dark uppercase tracking-[6px] mb-3 font-serif -ml-5 flex items-center justify-center';
  const evolutionSections = activePeriod.evolutionNotes
    .split('\n\n')
    .map((section) => section.trim())
    .filter(Boolean);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsOralPlaying(false);
      setProgress(0);
      setDurationStr('00:00');
      audioRef.current.src = activePeriod.oralHistory?.url || '';
    }
  }, [activePeriod.id]);

  const toggleOralAudio = () => {
    if (!audioRef.current) return;
    if (isOralPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsOralPlaying(!isOralPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const totalSeconds = Math.floor(audioRef.current.duration);
      const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');
      setDurationStr(`${m}:${s}`);
    }
  };

  const handleEnded = () => {
    setIsOralPlaying(false);
    setProgress(0);
  };

  const galleryImages = activePeriod.historicalImages || (activePeriod.coverImage ? [activePeriod.coverImage] : []);

  const handlePrevImage = () => {
    setActiveGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    setActiveGalleryIndex(0);
  }, [activePeriod.id]);

  return (
    <div
      className="flex flex-col h-full p-6 overflow-y-scroll archive-scrollbar"
    >
      <div className="flex-1 mx-auto max-w-xs space-y-6">
        <section>
          <h3 className={`${sectionTitleClassName} pt-[16px] pb-[3px]`}>
            <span className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-archive-accent/50"></span>
              <span>历史地图</span>
              <span className="w-8 h-[1px] bg-archive-accent/50"></span>
            </span>
          </h3>
          <div className="relative group" key={activePeriod.id}>
            <div className="relative">
              {galleryImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i === activeGalleryIndex ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`relative w-full cursor-zoom-in overflow-hidden rounded-sm aspect-[16/10] ${i === activeGalleryIndex ? 'block' : 'hidden'}`}
                  onClick={() => onImageZoom(img)}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-white text-[10px] font-bold tracking-widest uppercase">{img.name}</div>
                  </div>
                </motion.div>
              ))}

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-archive-dark hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg z-10 hover:scale-105"
                    aria-label="上一张图片"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-archive-dark hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg z-10 hover:scale-105"
                    aria-label="下一张图片"
                  >
                    <ChevronRight size={20} />
                  </button>


                </>
              )}
            </div>
          </div>
        </section>

        {activePeriod.oralHistory && (
          <section>
            <h3 className={`${sectionTitleClassName} pt-[8px]`}>
              <span className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-archive-accent/50"></span>
                <span>口述回忆</span>
                <span className="w-8 h-[1px] bg-archive-accent/50"></span>
              </span>
            </h3>
            <div className="p-4 border border-archive-border/40 bg-archive-surface rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-archive-accent/10 border border-archive-border/40 flex items-center justify-center shrink-0">
                  <Mic className="text-archive-accent w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-archive-dark text-[14px] font-semibold truncate">{activePeriod.oralHistory.name}</h4>
                  <div className="text-archive-dark/50 text-[11px] font-normal mt-0.5">
                    讲述者: {activePeriod.oralHistory.narrator}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleOralAudio}
                  aria-label={isOralPlaying ? '暂停口述史音频' : '播放口述史音频'}
                  aria-pressed={isOralPlaying}
                  className="w-10 h-10 rounded-full bg-archive-accent/10 border border-archive-border/40 flex items-center justify-center text-archive-accent hover:bg-archive-accent/15 transition-all duration-300 shrink-0 hover:scale-105"
                >
                  {isOralPlaying ? <Pause size={19} /> : <Play size={19} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between h-5 w-full gap-[1.5px]">
                    {WAVEFORM_BARS.map((h, i) => {
                      const isActive = progress >= (i / WAVEFORM_BARS.length) * 100;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors duration-300 ${isActive ? 'bg-archive-accent' : 'bg-archive-border/60'}`}
                          style={{
                            height: `${h}%`,
                            animation: isOralPlaying ? `waveform 0.8s ease-in-out infinite alternate ${i * 0.03}s` : 'none',
                            transformOrigin: 'center'
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-archive-dark/35 uppercase tracking-widest mt-2 font-mono">
                    <span>{isOralPlaying ? 'Playing' : 'Paused'}</span>
                    <span>{durationStr}</span>
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={activePeriod.oralHistory.url}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                className="hidden"
              />
            </div>
          </section>
        )}

        <section className="cursor-default">
          <h3 className={`${sectionTitleClassName} pt-[6px]`}>
            <span className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-archive-accent/50"></span>
              <span>时光长河</span>
              <span className="w-8 h-[1px] bg-archive-accent/50"></span>
            </span>
          </h3>
          <div className="space-y-3 text-archive-text/90 font-serif tracking-normal">
            {evolutionSections.map((section) => (
              <p
                key={section}
                className="text-[15.5px] leading-[1.85]"
              >
                {section}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
