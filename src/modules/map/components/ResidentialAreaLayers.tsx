import { Fragment, useEffect, useRef } from 'react';
import type { Polyline as LeafletPolyline } from 'leaflet';
import { Polygon, Polyline } from 'react-leaflet';
import type { HistoricalImage, ResidentialArea, SelectedFeature } from '../types';

export interface AnimatedAreaImage extends HistoricalImage {}

export interface AnimatedAreaData extends ResidentialArea {}

export interface AnimatedAreaFeature extends SelectedFeature {}

interface AreaPalette {
  fillColor: string;
  washColor: string;
  lineColor: string;
}

interface AnimatedResidentialAreaProps {
  area: AnimatedAreaData;
  onSelect?: (feature: AnimatedAreaFeature) => void;
  fillColor?: string;
  washColor?: string;
  lineColor?: string;
  fillOpacity?: number;
  lineOpacity?: number;
  className?: string;
}

const clamp255 = (value: number) => Math.max(0, Math.min(255, value));

const darkenHex = (hex: string, ratio: number) => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const factor = 1 - Math.max(0, Math.min(1, ratio));
  const nr = clamp255(Math.round(r * factor)).toString(16).padStart(2, '0');
  const ng = clamp255(Math.round(g * factor)).toString(16).padStart(2, '0');
  const nb = clamp255(Math.round(b * factor)).toString(16).padStart(2, '0');
  return `#${nr}${ng}${nb}`;
};

const DEFAULT_AREA_FILL = '#FAF2BF';
const DEFAULT_AREA_WASH = 'rgba(250, 242, 191, 0.30)';
const DEFAULT_AREA_LINE = darkenHex(DEFAULT_AREA_FILL, 0.55);

const getAreaPalette = (areaId: string): AreaPalette => {
  if (
    areaId.includes('core') ||
    areaId.includes('mujiazhuang') ||
    areaId.includes('tianqimiao')
  ) {
    const fillColor = '#FAF2BF';
    return {
      fillColor,
      washColor: 'rgba(250, 242, 191, 0.30)',
      lineColor: darkenHex(fillColor, 0.55)
    };
  }

  if (areaId.includes('mujiatai')) {
    const fillColor = '#f7d7b0';
    return {
      fillColor,
      washColor: 'rgba(247, 215, 176, 0.30)',
      lineColor: darkenHex(fillColor, 0.55)
    };
  }

  if (areaId.includes('shunyili')) {
    const fillColor = '#cfe8e4';
    return {
      fillColor,
      washColor: 'rgba(207, 232, 228, 0.26)',
      lineColor: darkenHex(fillColor, 0.55)
    };
  }

  if (areaId.includes('dongyuan')) {
    const fillColor = '#f3d0db';
    return {
      fillColor,
      washColor: 'rgba(243, 208, 219, 0.26)',
      lineColor: darkenHex(fillColor, 0.55)
    };
  }

  const fillColor = DEFAULT_AREA_FILL;
  return {
    fillColor,
    washColor: DEFAULT_AREA_WASH,
    lineColor: DEFAULT_AREA_LINE
  };
};

export function AnimatedResidentialArea({
  area,
  onSelect,
  fillColor = DEFAULT_AREA_FILL,
  washColor = DEFAULT_AREA_WASH,
  lineColor = DEFAULT_AREA_LINE,
  fillOpacity = 0.16,
  lineOpacity = 0.54,
  className = ''
}: AnimatedResidentialAreaProps) {
  const flowLineRef = useRef<LeafletPolyline | null>(null);
  const isHighlighted = className.includes('feature-highlight');
  const highlightPositions = isHighlighted && area.highlightPoints ? area.highlightPoints : area.points;

  useEffect(() => {
    const line = flowLineRef.current;
    const path = line?.getElement();
    if (!path) return;

    let frameId = 0;
    const dashCycle = 56;
    const durationMs = 7600;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = ((now - start) % durationMs) / durationMs;
      path.style.strokeDashoffset = `${-progress * dashCycle}`;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [area.id, area.points]);

  return (
    <Fragment>
      {isHighlighted && (
        <Polygon
          interactive={false}
          positions={highlightPositions}
          pathOptions={{
            stroke: false,
            fillColor,
            fillOpacity: 0.14,
            className: 'feature-highlight'
          }}
        />
      )}

      <Polygon
        interactive={false}
        positions={area.points}
        pathOptions={{
          stroke: false,
          fillColor: washColor,
          fillOpacity: 0.32,
          className: 'animated-area-feather'
        }}
      />

      <Polygon
        interactive={false}
        positions={area.points}
        pathOptions={{
          stroke: false,
          fillColor: washColor,
          fillOpacity: 0.48,
          className: 'animated-area-wash'
        }}
      />

      {isHighlighted && (
        <Polyline
          interactive={false}
          positions={highlightPositions}
          pathOptions={{
            color: '#ffffff',
            weight: 10,
            opacity: 0.42,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'feature-highlight'
          }}
        />
      )}

      <Polyline
        ref={flowLineRef}
        interactive={false}
        positions={highlightPositions}
        pathOptions={{
          color: lineColor,
          weight: 5.6,
          opacity: lineOpacity,
          dashArray: '7 7',
          lineCap: 'round',
          lineJoin: 'round',
          className: `animated-area-flow-line ${className}`
        }}
      />

      <Polygon
        positions={highlightPositions}
        eventHandlers={{
          click: () => {
            onSelect?.({
              type: 'area',
              id: area.id,
              title: area.name,
              description: area.description,
              images: area.images,
              tag: 'Residential Area'
            });
          }
        }}
        pathOptions={{
          stroke: false,
          fillColor,
          fillOpacity,
          cursor: onSelect ? 'pointer' : 'default',
          className: `animated-area-hit ${className}`
        }}
      />
    </Fragment>
  );
}

interface ResidentialAreaLayerProps {
  key?: string;
  area: ResidentialArea;
  onFeatureSelect: (feature: SelectedFeature) => void;
  selectedFeature?: SelectedFeature | null;
}

export function ResidentialAreaLayer({ area, onFeatureSelect, selectedFeature }: ResidentialAreaLayerProps) {
  const palette = getAreaPalette(area.id);
  const isSelected = selectedFeature?.id === area.id;

  return (
    <AnimatedResidentialArea
      area={area}
      onSelect={onFeatureSelect}
      fillColor={palette.fillColor}
      washColor={palette.washColor}
      lineColor={palette.lineColor}
      fillOpacity={0.9}
      lineOpacity={0.9}
      className={isSelected ? 'feature-highlight' : ''}
    />
  );
}
