import { POINT_TYPE_META } from '../pointCategories';
import { MAP_CONFIG } from '../config';
import { PeriodData } from '../types';

interface TimelineProps {
  data: PeriodData[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const LegendGlyph = ({ type }: { type: 'river' | 'road' | 'area' }) => {
  if (type === 'river') {
    return (
      <svg
        width="20"
        height="12"
        viewBox="0 0 40 20"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M2 12c4-8 8 8 12 0s8 8 12 0s8 8 12 0"
          fill="none"
          stroke={MAP_CONFIG.COLORS.RIVER}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
        />
        <path
          d="M2 12c4-8 8 8 12 0s8 8 12 0s8 8 12 0"
          fill="none"
          stroke={MAP_CONFIG.COLORS.RIVER}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
    );
  }

  if (type === 'road') {
    return (
      <svg
        width="20"
        height="12"
        viewBox="0 0 40 20"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M2 10h36"
          fill="none"
          stroke={MAP_CONFIG.COLORS.ROAD}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.2"
        />
        <path
          d="M2 10h36"
          fill="none"
          stroke={MAP_CONFIG.COLORS.ROAD}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.92"
        />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 40 20"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="34"
        height="12"
        rx="2"
        fill={MAP_CONFIG.COLORS.AREA}
        opacity="0.22"
      />
      <rect
        x="3"
        y="4"
        width="34"
        height="12"
        rx="2"
        fill="none"
        stroke="#7b6244"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.75"
      />
    </svg>
  );
};

export const Timeline = ({ data, currentIndex, onSelect }: TimelineProps) => {
  const pointLegendItems = [
    { label: '宗教', color: POINT_TYPE_META.religion.color },
    { label: '经济', color: POINT_TYPE_META.economy.color },
    { label: '教育', color: POINT_TYPE_META.education.color },
    { label: '生活', color: POINT_TYPE_META.life.color },
    { label: '体育', color: POINT_TYPE_META.sports.color }
  ];

  return (
    <nav className="w-56 bg-archive-surface border-r border-archive-border flex flex-col items-center py-8 z-40 shadow-[6px_0_20px_rgba(0,0,0,0.03)] archive-paper-texture">
      <div className="flex-1 flex flex-col justify-center gap-8 w-full py-4 min-h-0">
        {data.map((period, idx) => (
          <button 
            key={period.id}
            type="button"
            onClick={() => onSelect(idx)}
            aria-label={`切换到${period.label} ${period.subLabel}`}
            aria-pressed={currentIndex === idx}
            className={`flex items-center gap-5 px-8 w-full group relative ${currentIndex === idx ? 'opacity-100 scale-[1.02]' : 'opacity-30 hover:opacity-100'}`}
          >
            <div className="relative flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full border-2 border-archive-bg shadow-md ${currentIndex === idx ? 'bg-archive-dark scale-125 ring-4 ring-archive-accent/20' : 'bg-archive-accent/30 group-hover:bg-archive-accent/60'}`}></div>
              {currentIndex === idx && (
                <div 
                  className="absolute -inset-2.5 border-2 border-archive-accent/30 rounded-full"
                />
              )}
            </div>

            <div className="flex flex-col items-start min-w-0">
              <span className={`font-black tracking-tight truncate w-full font-serif ${currentIndex === idx ? 'text-archive-dark text-[20px]' : 'text-archive-text text-[18px]'}`}>
                {period.label}
              </span>
              <span className={`text-[10px] uppercase tracking-[0.3em] block -mt-0.5 truncate w-full font-sans ${currentIndex === idx ? 'text-archive-accent font-black' : 'text-gray-400 font-bold'}`}>
                {period.subLabel}
              </span>
            </div>

            {currentIndex === idx && (
              <div 
                className="absolute left-0 w-1.5 h-10 bg-archive-accent rounded-r-full"
              />
            )}
          </button>
        ))}
      </div>
      
      <div 
        className="w-full px-8 py-10 border-t border-archive-border/30 bg-archive-bg/5 mt-auto"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-1.5 h-1.5 bg-archive-accent/80 rotate-45"></div>
          <h4 className="font-bold text-archive-dark uppercase tracking-[0.25em] text-[11px] opacity-90"> 地图图例 </h4>
        </div>
        
        <div className="space-y-3.5 font-sans font-bold text-archive-text/75 text-[10px]">
          <div className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-widest leading-tight truncate">河流</span>
            <LegendGlyph type="river" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-widest leading-tight truncate">道路</span>
            <LegendGlyph type="road" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-widest leading-tight truncate">聚集区</span>
            <LegendGlyph type="area" />
          </div>

          <div className="col-span-2 pt-3 border-t border-archive-border/30">
            <div className="uppercase tracking-widest text-archive-text/75">历史点位</div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 min-w-0">
              {pointLegendItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 min-w-0 text-[9px] tracking-[0.18em] text-archive-text/55 uppercase"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-[3px] border border-white/90 shadow-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
