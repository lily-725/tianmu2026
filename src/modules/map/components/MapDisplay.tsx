import { useEffect, memo, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-rotate';
import { ARCHIVE_BOUNDS, MAP_CONFIG } from '../config';
import { getPointIconSvg, POINT_TYPE_META } from '../pointCategories';
import { PeriodData, SelectedFeature, PointType } from '../types';
import { ResidentialAreaLayer } from './ResidentialAreaLayers';
import {
  polygonIntersectsPolygon,
  polylineIntersectsPolygon,
  polygonCentroid,
  scalePolygon,
  shrinkPolygonNearPolyline
} from '../geometry';

interface MapDisplayProps {
  activePeriod: PeriodData;
  onFeatureSelect: (feature: SelectedFeature) => void;
  selectedFeature?: SelectedFeature | null;
}

function MapController() {
  const map = useMap() as any;
  useEffect(() => {
    if (!map) return;
    
    try {
      const lockBearing = MAP_CONFIG.VISUAL.BEARING;
      if (map.setBearing) {
        map.setBearing(lockBearing);
      }

      map.fitBounds(ARCHIVE_BOUNDS, { padding: [0, 0], animate: false });
      
      const baseZoom = Math.max(
        map.getBoundsZoom(ARCHIVE_BOUNDS, false),
        MAP_CONFIG.VISUAL.MIN_BASE_ZOOM
      );
      const finalZoom = baseZoom + MAP_CONFIG.VISUAL.ZOOM_OFFSET;
      
      map.setZoom(finalZoom);
      map.setMinZoom(finalZoom); 
      map.setMaxZoom(finalZoom);
      
      const center = ARCHIVE_BOUNDS.getCenter();
      const adjustedCenter: [number, number] = [
        center.lat + MAP_CONFIG.VISUAL.LAT_OFFSET, 
        center.lng + MAP_CONFIG.VISUAL.LNG_OFFSET
      ];
      
      map.setView(adjustedCenter, finalZoom, { animate: false });

      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.touchRotate?.disable?.();
      map.shiftKeyRotate?.disable?.();
      map.compassBearing?.disable?.();
      if (map.tap) map.tap.disable();

      // 防止惯性造成尾部位移（进一步确保“完全固定”）
      if (map.options) {
        map.options.inertia = false;
      }

      const lockBounds = map.getBounds?.();
      if (lockBounds && map.setMaxBounds) {
        map.setMaxBounds(lockBounds);
      }
      if (map.options) {
        map.options.maxBoundsViscosity = 1;
      }

      const handleMapClick = (e: any) => {
        e?.originalEvent?.stopPropagation?.();
        e?.originalEvent?.preventDefault?.();
        map.stop?.();
      };
      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
      };
      
    } catch (e) {
      console.warn('Map lock-down fail...', e);
    }
  }, [map]);
  return null;
}

const ICON_CACHE = new Map<string, L.DivIcon>();

const createCustomIcon = (
  point: { id: string; type: PointType; title: string },
  isSelected: boolean = false
) => {
  const color = MAP_CONFIG.COLORS.MARKERS[point.type];
  const iconSvg = getPointIconSvg(point);
  const toRgba = (hex: string, alpha: number) => {
    const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(255,255,255,${alpha})`;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  const scaleStyle = isSelected ? 'scale(1.22)' : 'scale(1)';
  const shadowStyle = isSelected
    ? `drop-shadow(0 0 16px rgba(255,255,255,0.96)) drop-shadow(0 0 8px rgba(255,255,255,0.72)) drop-shadow(0 0 12px ${toRgba(color, 0.36)})`
    : 'none';
  const haloColor = toRgba(color, 0.28);
  const haloBaseOpacity = isSelected ? '0.24' : '0';
  const haloBaseScale = isSelected ? '1.02' : '0.92';

  const htmlContent = `
    <style>
      @keyframes badge-float-anim-${point.id} {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
      }
      @keyframes marker-halo-pulse-${point.id} {
        0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0; }
        35% { opacity: 0.32; }
        100% { transform: translate(-50%, -50%) scale(1.36); opacity: 0; }
      }
      .archive-marker-icon:hover .marker-visual-target-${point.id},
      .marker-selected .marker-visual-target-${point.id} {
        animation: badge-float-anim-${point.id} 3s ease-in-out infinite;
      }
      .archive-marker-icon:hover .marker-halo-${point.id},
      .marker-selected .marker-halo-${point.id} {
        animation: marker-halo-pulse-${point.id} 1.55s ease-out infinite;
      }
    </style>
    <div style="transition: all 0.3s ease; opacity: 1; filter: ${shadowStyle}; transform: ${scaleStyle};">
      <div class="marker-visual-target-${point.id}" style="width: 34px; height: 42px; position: relative; display: flex; align-items: center; justify-content: center; will-change: transform;">
        <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div class="marker-halo-${point.id}" style="position: absolute; left: 50%; top: 15px; width: 32px; height: 32px; border-radius: 9999px; background: ${haloColor}; transform: translate(-50%, -50%) scale(${haloBaseScale}); opacity: ${haloBaseOpacity};"></div>
          <svg viewBox="0 0 34 42" width="34" height="42" style="position: absolute; inset: 0;" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 41c0 0 14-14.1 14-24.5C31 7.4 24.6 1 17 1S3 7.4 3 16.5C3 26.9 17 41 17 41Z" fill="${color}" stroke="rgba(255, 255, 255, 0.92)" stroke-width="1.6" />
          </svg>
          <svg viewBox="0 0 24 24" style="position: relative; width: 21px; height: 21px; transform: translateY(-6px);" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            ${iconSvg}
          </svg>
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: `archive-marker-icon ${isSelected ? 'marker-selected' : ''}`,
    html: htmlContent,
    iconSize: [34, 42],
    iconAnchor: [17, 39]
  });
};

const getMarkerIcon = (
  point: { id: string; type: PointType; title: string },
  isSelected: boolean = false
) => {
  const key = `${point.id}-${isSelected}`;
  const cached = ICON_CACHE.get(key);
  if (cached) return cached;
  const icon = createCustomIcon(point, isSelected);
  ICON_CACHE.set(key, icon);
  return icon;
};

/**
 * 路线动态流量（行旅/人流/机动车）配置生成器
 * 为不同时代塑造定制特有的人物、车船及车流分布状况以建立浓厚的本土代入感：
 * - p2 (民国时代): 京津古驿道上行走着戴斗笠的赶荒挑担人群、木骨马车。
 * - p3 (建国初期): 沥青公路上骑行着经典的双梁载重自行车、昂首挺胸背挎挎包去工厂的工人职工。
 * - p4 (当代进程): 流水般的现代小汽车，红黄蓝绿各色车尾流川行。
 */
const getTrafficConfigs = (periodId: string) => {
  if (periodId === 'p2') {
    return [
      { id: 1, isForward: true, phase: 0.05, type: 'carriage' },
      { id: 2, isForward: true, phase: 0.38, type: 'people' },
      { id: 3, isForward: true, phase: 0.72, type: 'carriage' },
      { id: 4, isForward: false, phase: 0.22, type: 'people' },
      { id: 5, isForward: false, phase: 0.55, type: 'carriage' },
      { id: 6, isForward: false, phase: 0.88, type: 'people' }
    ];
  } else if (periodId === 'p3') {
    return [
      { id: 1, isForward: true, phase: 0.02, type: 'bicycle' },
      { id: 2, isForward: true, phase: 0.15, type: 'worker' },
      { id: 3, isForward: true, phase: 0.32, type: 'bicycle' },
      { id: 4, isForward: true, phase: 0.48, type: 'worker' },
      { id: 5, isForward: false, phase: 0.12, type: 'bicycle' },
      { id: 6, isForward: false, phase: 0.28, type: 'worker' },
      { id: 7, isForward: false, phase: 0.58, type: 'bicycle' },
      { id: 8, isForward: false, phase: 0.72, type: 'worker' },
      { id: 9, isForward: true, phase: 0.82, type: 'worker' },
      { id: 10, isForward: false, phase: 0.90, type: 'bicycle' }
    ];
  } else {
    return [
      { id: 1, isForward: true, phase: 0.0, type: 'car', color: '#f8fafc' },
      { id: 2, isForward: true, phase: 0.35, type: 'car', color: '#ef4444' },
      { id: 3, isForward: true, phase: 0.7, type: 'car', color: '#0ea5e9' },
      { id: 4, isForward: false, phase: 0.15, type: 'car', color: '#fbbf24' },
      { id: 5, isForward: false, phase: 0.5, type: 'car', color: '#10b981' },
      { id: 6, isForward: false, phase: 0.85, type: 'car', color: '#64748b' }
    ];
  }
};

interface CompiledPath {
  segments: { p1: [number, number]; p2: [number, number]; start: number; length: number }[];
  totalLength: number;
}

/**
 * 静态编译经纬度路径线段列表
 */
const compilePathSegments = (pList: [number, number][]) => {
  let totalLength = 0;
  const segments: { p1: [number, number]; p2: [number, number]; start: number; length: number }[] = [];
  for (let i = 0; i < pList.length - 1; i++) {
    const latAvg = (pList[i][0] + pList[i+1][0]) / 2;
    const latDiff = pList[i+1][0] - pList[i][0];
    const lngDiff = (pList[i+1][1] - pList[i][1]) * Math.cos(latAvg * Math.PI / 180);
    const len = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    segments.push({ p1: pList[i], p2: pList[i+1], start: totalLength, length: len });
    totalLength += len;
  }
  return { segments, totalLength };
};

/**
 * 精调运动插值算法
 */
const getPointAndAngle = (
  compiledPath: CompiledPath,
  progress: number,
  periodId: string,
  bearing: number,
  fallbackPos: [number, number]
) => {
  const { segments, totalLength } = compiledPath;
  if (totalLength === 0 || segments.length === 0) return { pos: fallbackPos, angle: 0, opacity: 1.0 };

  const targetDist = progress * totalLength;
  let seg = segments[segments.length - 1];
  for (let i = 0; i < segments.length; i++) {
    if (targetDist >= segments[i].start && targetDist <= segments[i].start + segments[i].length) {
      seg = segments[i];
      break;
    }
  }

  const ratio = seg.length === 0 ? 0 : (targetDist - seg.start) / seg.length;
  const lat = seg.p1[0] + (seg.p2[0] - seg.p1[0]) * ratio;
  const lng = seg.p1[1] + (seg.p2[1] - seg.p1[1]) * ratio;

  let pos: [number, number] = [lat, lng];
  const cosLat = Math.cos(lat * Math.PI / 180);
  const dLat = seg.p2[0] - seg.p1[0];
  const dLng = seg.p2[1] - seg.p1[1];
  const dLngScaled = dLng * cosLat;
  const distance = Math.sqrt(dLat * dLat + dLngScaled * dLngScaled);

  if (distance > 0) {
    const uLat = dLat / distance;
    const uLngScaled = dLngScaled / distance;
    let factor = 0.000018; 
    if (periodId === 'p4') {
      factor = 0.00024; 
    }
    const offsetLat = -uLngScaled * factor;
    const offsetLng = (uLat * factor) / cosLat;
    pos = [lat + offsetLat, lng + offsetLng];
  }

  const latAvgDeg = (seg.p1[0] + seg.p2[0]) / 2;
  const dy = -(seg.p2[0] - seg.p1[0]);
  const dx = (seg.p2[1] - seg.p1[1]) * Math.cos(latAvgDeg * Math.PI / 180);
  const baseAngle = Math.atan2(dy, dx) * 180 / Math.PI;
  const angle = baseAngle + bearing;

  let opacity = 1.0;
  if (progress < 0.05) {
    opacity = progress / 0.05;
  } else if (progress > 0.95) {
    opacity = (1.0 - progress) / 0.05;
  }

  return { pos, angle, opacity };
};

const getIconHtml = (type: string, color?: string, initialAngle: number = 0, initialOpacity: number = 1) => {
  if (type === 'car') {
    return `
      <div style="
        width: 14px;
        height: 7px;
        position: absolute;
        left: -7px;
        top: -3.5px;
        transform: rotate(${initialAngle}deg);
        transform-origin: center center;
        background-color: ${color || '#ffffff'};
        border-radius: 2.5px;
        box-shadow: 0 1.5px 4px rgba(0,0,0,0.48);
        border: 0.5px solid rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        pointer-events: none;
        opacity: ${initialOpacity};
        transition: transform 0s linear, opacity 0.3s ease;
      ">
        <div style="position: absolute; right: -0.5px; top: 0px; width: 1.5px; height: 1.5px; background-color: #fef08a; border-radius: 50%; box-shadow: 0 0 2px #fef08a;"></div>
        <div style="position: absolute; right: -0.5px; bottom: 0px; width: 1.5px; height: 1.5px; background-color: #fef08a; border-radius: 50%; box-shadow: 0 0 2px #fef08a;"></div>
        <div style="position: absolute; left: -0.5px; top: 0.5px; width: 1.2px; height: 1.2px; background-color: #ef4444; border-radius: 25%;"></div>
        <div style="position: absolute; left: -0.5px; bottom: 0.5px; width: 1.2px; height: 1.2px; background-color: #ef4444; border-radius: 25%;"></div>
      </div>
    `;
  } else if (type === 'carriage') {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: -24px;
        top: -12px;
        width: 48px;
        height: 24px;
        transform: rotate(${initialAngle}deg);
        transform-origin: center center;
        pointer-events: auto;
        cursor: pointer;
        opacity: ${initialOpacity};
        transition: transform 0s linear, opacity 0.3s ease;
      " class="ancient-carriage">
        <svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke="#5c4033" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.25)); float: left;">
          <rect x="4" y="4" width="18" height="11" rx="2.5" fill="#fcf8f2" stroke="#5c4033" stroke-width="2" />
          <rect x="9" y="6" width="8" height="4.5" rx="0.5" fill="#ebdcb9" stroke="#5c4033" stroke-width="1.2" />
          <circle cx="13" cy="18" r="4.5" stroke="#78350f" stroke-width="2.2" />
          <circle cx="13" cy="18" r="1.2" fill="#78350f" />
          <line x1="13" y1="13.5" x2="13" y2="22.5" stroke="#78350f" stroke-width="1.2" />
          <line x1="8.5" y1="18" x2="17.5" y2="18" stroke="#78350f" stroke-width="1.2" />
          <path d="M 22 12.5 L 32 12.5" stroke="#5c4033" stroke-width="2" />
          <path d="M 32 12.5 C 34 10.5, 39 10.5, 41 12.5 L 40 16.5" stroke="#5c4033" stroke-width="2.5" fill="none" />
          <path d="M 39 11.5 L 41 6.5 Q 45 5.5 46 7.5" stroke="#5c4033" stroke-width="2.2" fill="none" />
          <line x1="33" y1="12.5" x2="32.5" y2="19.5" stroke="#5c4033" stroke-width="1.8" />
          <line x1="35.5" y1="12.5" x2="36" y2="19.5" stroke="#5c4033" stroke-width="1.8" />
          <line x1="38" y1="12.5" x2="37.5" y2="19.5" stroke="#5c4033" stroke-width="1.8" />
          <line x1="40" y1="12.5" x2="40.5" y2="19.5" stroke="#5c4033" stroke-width="1.8" />
          <path d="M 32 11.5 Q 29 13.5 30 16.5" stroke="#5c4033" stroke-width="1.5" />
        </svg>
      </div>
    `;
  } else if (type === 'bicycle') {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: -16px;
        top: -10px;
        width: 32px;
        height: 20px;
        transform: rotate(${initialAngle}deg);
        transform-origin: center center;
        pointer-events: auto;
        cursor: pointer;
        opacity: ${initialOpacity};
        transition: transform 0s linear, opacity 0.3s ease;
      " class="modern-bicycle">
        <svg viewBox="0 0 32 20" width="32" height="20" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 1.5px rgba(0,0,0,0.18));">
          <circle cx="8" cy="13" r="4.5" stroke="#475569" stroke-width="2"/>
          <circle cx="24" cy="13" r="4.5" stroke="#475569" stroke-width="2"/>
          <path d="M 8 13 L 15 13 L 21 8 L 13 8 Z" stroke="#475569" stroke-width="1.6"/>
          <line x1="15" y1="13" x2="13" y2="8" stroke="#475569" stroke-width="1.6"/>
          <line x1="11.5" y1="6" x2="14.5" y2="6" stroke="#475569" stroke-width="2.2" />
          <line x1="13" y1="6" x2="13" y2="8" stroke="#475569" stroke-width="1.2" />
          <path d="M 21 13 L 20 7 L 17 7" stroke="#475569" stroke-width="1.6" fill="none"/>
          <rect x="5" y="7" width="5" height="3" fill="#94a3b8" />
        </svg>
      </div>
    `;
  } else if (type === 'worker') {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: -12px;
        top: -12px;
        width: 24px;
        height: 24px;
        transform: rotate(${initialAngle}deg);
        transform-origin: center center;
        pointer-events: auto;
        cursor: pointer;
        opacity: ${initialOpacity};
        transition: transform 0s linear, opacity 0.3s ease;
      " class="modern-worker">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 1.5px rgba(0,0,0,0.18));">
          <circle cx="10" cy="6" r="2" fill="#f8fafc" stroke="#1e293b" stroke-width="1.8" />
          <path d="M 8 5 Q 10.5 2.5 13 5" stroke="#1e293b" stroke-width="2" fill="#1e293b" />
          <path d="M 10 8 L 10 14" stroke="#1e293b" stroke-width="2.2" />
          <path d="M 10 9.5 L 7 12.5" stroke="#1e293b" stroke-width="1.6" />
          <path d="M 10 9.5 L 13 11.5" stroke="#1e293b" stroke-width="1.6" />
          <path d="M 10 14 L 7.5 19.5" stroke="#1e293b" stroke-width="1.8" />
          <path d="M 10 14 L 12.5 19.5" stroke="#1e293b" stroke-width="1.8" />
          <circle cx="16" cy="9" r="1.5" fill="#f8fafc" stroke="#1e293b" stroke-width="1.4" opacity="0.8" />
          <path d="M 16 10.5 L 16 15" stroke="#1e293b" stroke-width="1.8" opacity="0.8" />
          <path d="M 16 15 L 14.5 19" stroke="#1e293b" stroke-width="1.5" opacity="0.8" />
          <path d="M 16 15 L 17.5 19" stroke="#1e293b" stroke-width="1.5" opacity="0.8" />
        </svg>
      </div>
    `;
  } else {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: -12px;
        top: -12px;
        width: 24px;
        height: 24px;
        transform: rotate(${initialAngle}deg);
        transform-origin: center center;
        pointer-events: auto;
        cursor: pointer;
        opacity: ${initialOpacity};
        transition: transform 0s linear, opacity 0.3s ease;
      " class="ancient-traveler">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5c4033" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 1.5px rgba(0,0,0,0.18));">
          <circle cx="9" cy="6" r="2" fill="#fcf8f2" stroke="#5c4033" stroke-width="1.8" />
          <path d="M 9 8 L 9 14.5" stroke="#5c4033" stroke-width="2" />
          <path d="M 9 9.5 L 6.5 12" stroke="#5c4033" stroke-width="1.5" />
          <path d="M 9 9.5 L 11.5 12" stroke="#5c4033" stroke-width="1.5" />
          <path d="M 9 14.5 L 6.5 19.5" stroke="#5c4033" stroke-width="1.8" />
          <path d="M 9 14.5 L 11.5 19.5" stroke="#5c4033" stroke-width="1.8" />
          <path d="M 4.5 7 L 9 3 L 13.5 7 Z" fill="#ebcda1" stroke="#5c4033" stroke-width="1.2" />
          <circle cx="16" cy="9" r="1.5" fill="#fcf8f2" stroke="#5c4033" stroke-width="1.2" opacity="0.8" />
          <path d="M 16 10.5 L 16 15" stroke="#5c4033" stroke-width="1.5" opacity="0.8" />
          <path d="M 16 15 L 14.5 19" stroke="#5c4033" stroke-width="1.3" opacity="0.8" />
          <path d="M 16 15 L 17.5 19" stroke="#5c4033" stroke-width="1.3" opacity="0.8" />
          <path d="M 13 9.5 L 16 7 L 19 9.5 Z" fill="#ebcda1" stroke="#5c4033" stroke-width="1" opacity="0.8" />
        </svg>
      </div>
    `;
  }
};

interface RoadTrafficProps {
  path: [number, number][];
  periodId: string;
  onFeatureSelect?: (feature: SelectedFeature) => void;
}

const RoadTraffic = ({ path, periodId, onFeatureSelect }: RoadTrafficProps) => {
  const map = useMap();
  const markerRefs = useRef<Record<number, any>>({});
  const configs = useMemo(() => getTrafficConfigs(periodId), [periodId]);

  const forwardPath = path;
  const backwardPath = useMemo(() => [...path].reverse(), [path]);

  const compiledForward = useMemo(() => {
    const isAncient = periodId === 'p2' || periodId === 'p3';
    // 针对古道（p2/p3）将人流/车流路径向东偏置，避开西侧的河流波纹动画
    const offsetPath = isAncient ? getOffsetPath(forwardPath, 0.000025) : forwardPath;
    return compilePathSegments(offsetPath);
  }, [forwardPath, periodId]);

  const compiledBackward = useMemo(() => {
    const isAncient = periodId === 'p2' || periodId === 'p3';
    // 针对古道（p2/p3）将人流/车流路径向东偏置（负向偏移在反向路径上即为向东），避开西侧的河流
    const offsetPath = isAncient ? getOffsetPath(backwardPath, -0.000075) : backwardPath;
    return compilePathSegments(offsetPath);
  }, [backwardPath, periodId]);

  const startTimeRef = useRef<number | null>(null);
  const lastProgressRef = useRef<Record<number, number>>({});

  useEffect(() => {
    startTimeRef.current = null;
    lastProgressRef.current = {};
  }, [periodId]);

  const initialVehicles = useMemo(() => {
    const bearing = (map as any).getBearing ? (map as any).getBearing() : 0;
    const elapsed = startTimeRef.current !== null ? (performance.now() - startTimeRef.current) : 0;
    
    let cycleDuration = 14000;
    if (periodId === 'p2') {
      cycleDuration = 36000;
    } else if (periodId === 'p3') {
      cycleDuration = 22000;
    }

    return configs.map(item => {
      const progress = ((elapsed / cycleDuration) + item.phase) % 1;
      const compiledPath = item.isForward ? compiledForward : compiledBackward;
      const { pos, angle, opacity } = getPointAndAngle(compiledPath, progress, periodId, bearing, path[0]);
      return {
        ...item,
        pos,
        angle,
        opacity
      };
    });
  }, [configs, compiledForward, compiledBackward, periodId, map, path]);

  useEffect(() => {
    if (!path || path.length < 2) return;

    let cycleDuration = 14000;
    if (periodId === 'p2') {
      cycleDuration = 36000;
    } else if (periodId === 'p3') {
      cycleDuration = 22000;
    }

    let animFrame: number;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    const startTime = startTimeRef.current;

    const update = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const bearing = (map as any).getBearing ? (map as any).getBearing() : 0;

      configs.forEach(item => {
        const progress = ((elapsed / cycleDuration) + item.phase) % 1;
        const compiledPath = item.isForward ? compiledForward : compiledBackward;
        const { pos, angle, opacity } = getPointAndAngle(compiledPath, progress, periodId, bearing, path[0]);

        const marker = markerRefs.current[item.id];
        if (marker) {
          const element = marker.getElement();
          const lastProgress = lastProgressRef.current[item.id];
          
          if (element) {
            const wrapped = lastProgress !== undefined && Math.abs(progress - lastProgress) > 0.5;
            
            if (wrapped) {
              element.style.setProperty('transition', 'none', 'important');
              const container = element.firstElementChild as HTMLElement;
              if (container) {
                container.style.setProperty('transition', 'none', 'important');
              }
              const _triggerReflow = element.offsetHeight;
            } else {
              element.style.setProperty('transition', 'transform 0.12s linear, opacity 0.3s ease', 'important');
              const container = element.firstElementChild as HTMLElement;
              if (container) {
                container.style.setProperty('transition', 'transform 0.12s linear, opacity 0.3s ease', 'important');
              }
            }
          }
          
          marker.setLatLng(pos);
          if (element) {
            const container = element.firstElementChild as HTMLElement;
            if (container) {
              container.style.transform = `rotate(${angle}deg)`;
              container.style.opacity = opacity !== undefined ? opacity.toString() : '1';
            }
          }
          
          lastProgressRef.current[item.id] = progress;
        }
      });

      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [path, map, periodId, configs, compiledForward, compiledBackward]);

  return (
    <>
      {initialVehicles.map(v => {
        const iconHtml = getIconHtml(v.type, v.color, v.angle, v.opacity);
        const finalIcon = L.divIcon({
          className: v.type === 'car' ? 'road-vehicle-icon' : 'road-ancient-icon',
          html: iconHtml,
          iconSize: [1, 1],
          iconAnchor: [0, 0]
        });

        return (
          <Marker 
            key={`${v.id}_${periodId}`} 
            ref={(el) => {
              if (el) {
                markerRefs.current[v.id] = el;
              } else {
                delete markerRefs.current[v.id];
              }
            }}
            position={v.pos} 
            icon={finalIcon} 
            interactive={v.type !== 'car'}
            eventHandlers={{
              click: () => {
                if (v.type === 'car' || !onFeatureSelect) return;
                let title = '';
                let description = '';
                if (v.type === 'carriage') {
                  title = '古道马车行旅';
                  description = '京津御道上骨碌而过的木制马车。民国民众与商旅在此载客运货，其车头始终顺着蜿蜒的古道方向平稳前进。';
                } else if (v.type === 'people') {
                  title = '古道赶路人群';
                  description = '结伴同行的京津赶路人。他们戴着斗笠，背负行囊或挑担负重，或徒步赶集、或述职游历，行进在昔日的林荫大道上。';
                } else if (v.type === 'bicycle') {
                  title = '国营时代双梁自行车';
                  description = '1950至1970年代经典的国货自行车。它是工厂职工引以为傲的代步工具，伴随清脆的车铃声，在拓阔的京津公路上频繁穿梭，数量与车速较之旧时均大幅增加。';
                } else if (v.type === 'worker') {
                  title = '新中国社会主义建设者';
                  description = '意气风发的天穆村国营工厂职工与村民。他们身穿朴素洗练的工作装，斜挎水壶军包，不戴斗笠而头戴解放帽，精气神十足地在京津大路上往来川流。';
                }

                onFeatureSelect({
                  type: 'landmark',
                  title,
                  tag: 'Dynamic Flow',
                  images: [
                    { url: 'https://images.unsplash.com/photo-1551062402-92161b979555?q=80&w=1000&auto=format&fit=crop', name: '时代交通缩影', source: '天穆历史考察' }
                  ],
                  description
                });
              }
            }}
          />
        );
      })}
    </>
  );
};

const cottagePositions: Record<string, [number, number][]> = {
  'area-mujiazhuang-p1': [
    [39.19315, 117.1437],
    [39.19412, 117.14455]
  ],
  'area-tianqimiao-p1': [
    [39.18978, 117.14605],
    [39.1907, 117.14725]
  ],
  'area-mujiazhuang-p2': [
    [39.19235, 117.14305],
    [39.19335, 117.14445],
    [39.19445, 117.14535],
    [39.19385, 117.14315]
  ],
  'area-tianqimiao-p2': [
    [39.1897, 117.1451],
    [39.1906, 117.14635],
    [39.19155, 117.14815],
    [39.19115, 117.14415]
  ],
  'area-core-p3': [
      [39.191362, 117.142985], [39.192113, 117.144882], [39.192715, 117.142226], [39.193015, 117.144503],
      [39.193316, 117.146021], [39.193616, 117.147159], [39.194067, 117.144503], [39.194518, 117.145452],
      [39.189061, 117.144191], [39.189526, 117.145937], [39.189874, 117.146156], [39.190223, 117.145064],
      [39.190572, 117.143755], [39.190804, 117.148775], [39.191153, 117.147684], [39.191501, 117.147247]
    ]
};

const createCottageIcon = () => {
  return L.divIcon({
    className: 'ancient-village-cottage',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        pointer-events: none;
      ">
        <svg viewBox="0 0 32 32" style="width: 28px; height: 28px; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.18));" fill="none">
          <path d="M 4 14 L 16 6 L 28 14" stroke="#5c4033" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 6 13 L 16 8 L 26 13" stroke="#5c4033" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
          <path d="M 3 15 Q 1 12 3 10" stroke="#5c4033" stroke-width="1.5" stroke-linecap="round" />
          <path d="M 29 15 Q 31 12 29 10" stroke="#5c4033" stroke-width="1.5" stroke-linecap="round" />
          <rect x="7" y="14" width="18" height="12" rx="1.5" fill="#fcf8f2" stroke="#5c4033" stroke-width="1.8" />
          <rect x="14" y="19" width="4" height="7" fill="#ebcda1" stroke="#5c4033" stroke-width="1.2" />
          <rect x="9" y="16" width="3" height="3" stroke="#5c4033" stroke-width="1" />
          <rect x="20" y="16" width="3" height="3" stroke="#5c4033" stroke-width="1" />
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const modernBuildingPositions: Record<string, [number, number][]> = {
  'area-core': [
    [39.1909, 117.1409],
    [39.1919, 117.1429],
    [39.1930, 117.1450],
    [39.1911, 117.1492]
  ],
  'area-mujiatai': [
    [39.1994, 117.1448],
    [39.2006, 117.1459],
    [39.2018, 117.1472],
    [39.2028, 117.1486],
    [39.2025, 117.1497]
  ],
  'area-shunyili': [
    [39.1976, 117.1467],
    [39.1982, 117.1478],
    [39.1989, 117.1491],
    [39.1996, 117.1482]
  ],
  'area-dongyuan': [
    [39.1957, 117.1510],
    [39.1963, 117.1518],
    [39.1969, 117.1527],
    [39.1976, 117.1532],
    [39.1979, 117.1520],
    [39.1968, 117.1506]
  ]
};

const createModernBuildingIcon = () => {
  return L.divIcon({
    className: 'modern-apartment-block',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 27px;
        height: 36px;
        pointer-events: none;
      " class="modern-apartment-tower">
        <svg viewBox="0 0 36 48" style="width: 27px; height: 36px; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.18));" fill="none">
          <rect x="5" y="4" width="26" height="40" rx="2.4" fill="#f8fafc" stroke="#334155" stroke-width="2" />
          <rect x="9" y="1.5" width="18" height="5" rx="1.2" fill="#e2e8f0" stroke="#334155" stroke-width="1.6" />
          <line x1="7" y1="10" x2="29" y2="10" stroke="#cbd5e1" stroke-width="1" opacity="0.7" />
          <line x1="7" y1="17" x2="29" y2="17" stroke="#cbd5e1" stroke-width="1" opacity="0.7" />
          <line x1="7" y1="24" x2="29" y2="24" stroke="#cbd5e1" stroke-width="1" opacity="0.7" />
          <line x1="7" y1="31" x2="29" y2="31" stroke="#cbd5e1" stroke-width="1" opacity="0.7" />
          <rect x="8" y="8" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="16" y="8" width="4" height="4" fill="#f8d37a" rx="0.5" class="modern-window modern-window-a" />
          <rect x="24" y="8" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="8" y="15" width="4" height="4" fill="#94a3b8" rx="0.5" />
          <rect x="16" y="15" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="24" y="15" width="4" height="4" fill="#f2c14f" rx="0.5" class="modern-window modern-window-b" />
          <rect x="8" y="22" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="16" y="22" width="4" height="4" fill="#94a3b8" rx="0.5" />
          <rect x="24" y="22" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="8" y="29" width="4" height="4" fill="#f6d57e" rx="0.5" class="modern-window modern-window-c" />
          <rect x="16" y="29" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="24" y="29" width="4" height="4" fill="#94a3b8" rx="0.5" />
          <rect x="8" y="36" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="16" y="34" width="5" height="10" fill="#334155" rx="0.8" />
          <rect x="24" y="36" width="4" height="4" fill="#f3cd67" rx="0.5" class="modern-window modern-window-d" />
          <rect x="12" y="5.5" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.75)" />
        </svg>
      </div>
    `,
    iconSize: [27, 36],
    iconAnchor: [13.5, 18]
  });
};

const createLegacyModernBuildingIcon = () => {
  return L.divIcon({
    className: 'modern-apartment-block',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 27px;
        pointer-events: none;
      ">
        <svg viewBox="0 0 32 36" style="width: 24px; height: 27px; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.18));" fill="none">
          <rect x="4" y="2" width="24" height="32" rx="2" fill="#ffffff" stroke="#334155" stroke-width="2" />
          <line x1="2" y1="2" x2="30" y2="2" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
          <rect x="7" y="6" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="14" y="6" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="21" y="6" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="7" y="13" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="14" y="13" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="21" y="13" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="7" y="20" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="14" y="20" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="21" y="20" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="7" y="27" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="14" y="27" width="4" height="7" fill="#334155" rx="0.5" />
          <rect x="21" y="27" width="4" height="4" fill="#64748b" rx="0.5" />
        </svg>
      </div>
    `,
    iconSize: [24, 27],
    iconAnchor: [12, 13.5]
  });
};

const createBungalowIcon = () => {
  return L.divIcon({
    className: 'modern-bungalow',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 21px;
        pointer-events: none;
      ">
        <svg viewBox="0 0 32 28" style="width: 24px; height: 21px; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.18));" fill="none">
          <path d="M 2 10 L 16 3 L 30 10" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="5" y="10" width="22" height="15" rx="1" fill="#ffffff" stroke="#334155" stroke-width="2" />
          <rect x="9" y="13" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="19" y="13" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="9" y="19" width="4" height="4" fill="#64748b" rx="0.5" />
          <rect x="16" y="18" width="5" height="7" fill="#475569" rx="0.5" />
        </svg>
      </div>
    `,
    iconSize: [24, 21],
    iconAnchor: [12, 10.5]
  });
};

const smoothPath = (path: [number, number][]): [number, number][] => {
  if (!path || path.length < 3) return path;
  const iterations = path.length > 50 ? 1 : 2;
  let current = [...path];
  for (let iter = 0; iter < iterations; iter++) {
    const next: [number, number][] = [];
    next.push(current[0]);
    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];
      const q: [number, number] = [
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1]
      ];
      const r: [number, number] = [
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1]
      ];
      next.push(q);
      next.push(r);
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
};

const getOffsetPath = (coords: [number, number][], offsetFactor: number): [number, number][] => {
  if (!coords || coords.length < 2) return coords;
  return coords.map((point, idx) => {
    const lat = point[0];
    const lng = point[1];
    const cosLat = Math.cos((lat * Math.PI) / 180);

    let dLat = 0;
    let dLng = 0;

    if (idx === 0) {
      dLat = coords[1][0] - coords[0][0];
      dLng = coords[1][1] - coords[0][1];
    } else if (idx === coords.length - 1) {
      dLat = coords[idx][0] - coords[idx - 1][0];
      dLng = coords[idx][1] - coords[idx - 1][1];
    } else {
      dLat = (coords[idx + 1][0] - coords[idx - 1][0]) / 2;
      dLng = (coords[idx + 1][1] - coords[idx - 1][1]) / 2;
    }

    const dLngScaled = dLng * cosLat;
    const dist = Math.sqrt(dLat * dLat + dLngScaled * dLngScaled);
    if (dist === 0) return point;

    const uLat = dLat / dist;
    const uLngScaled = dLngScaled / dist;

    const offsetLat = -uLngScaled * offsetFactor;
    const offsetLng = (uLat * offsetFactor) / cosLat;

    return [lat + offsetLat, lng + offsetLng] as [number, number];
  });
};

const MapDisplayImpl = ({ activePeriod, onFeatureSelect, selectedFeature }: MapDisplayProps) => {
  const hasSelection = !!selectedFeature;
  const smoothedRiverPath = useMemo(() => smoothPath(activePeriod.riverPath), [activePeriod.riverPath]);
  const leftExpandedRiverPath = useMemo(
    () => getOffsetPath(smoothedRiverPath, -0.0003),
    [smoothedRiverPath]
  );
  const riverVisualPaths = useMemo(
    () => [leftExpandedRiverPath, smoothedRiverPath],
    [leftExpandedRiverPath, smoothedRiverPath]
  );
  const adjustedResidentialAreas = useMemo(() => {
    const areas = activePeriod.residentialAreas;
    if (!areas?.length) return areas;

    const meta = areas.map(area => ({
      area,
      centroid: polygonCentroid(area.points),
      overlapCount: 0,
      overlapsRiver: false,
      overlapsRoad: false
    }));

    for (let i = 0; i < meta.length; i++) {
      for (let j = i + 1; j < meta.length; j++) {
        if (polygonIntersectsPolygon(meta[i].area.points, meta[j].area.points)) {
          meta[i].overlapCount += 1;
          meta[j].overlapCount += 1;
        }
      }
    }

    for (const item of meta) {
      if (smoothedRiverPath?.length && polylineIntersectsPolygon(smoothedRiverPath, item.area.points)) {
        item.overlapsRiver = true;
      }
      if (activePeriod.roadPath?.length && polylineIntersectsPolygon(activePeriod.roadPath, item.area.points)) {
        item.overlapsRoad = true;
      }
    }

    return meta.map(item => {
      const areaOverlapScale = 1 - 0.08 * Math.min(item.overlapCount, 2);
      const scale = Math.max(0.72, Math.min(1, areaOverlapScale));
      let points = scale === 1 ? item.area.points : scalePolygon(item.area.points, scale, item.centroid);

      if (item.overlapsRiver && smoothedRiverPath?.length) {
        points = shrinkPolygonNearPolyline(points, smoothedRiverPath, {
          influenceDistance: 0.0022,
          minClearance: 0.00045,
          maxIterations: 10,
          maxMoveRatio: 0.4
        });
      }

      if (item.overlapsRoad && activePeriod.roadPath?.length) {
        points = shrinkPolygonNearPolyline(points, activePeriod.roadPath, {
          influenceDistance: 0.0026,
          minClearance: 0.00055,
          maxIterations: 12,
          maxMoveRatio: 0.44
        });
      }

      if (points === item.area.points) return item.area;
      return {
        ...item.area,
        points
      };
    });
  }, [activePeriod.residentialAreas, activePeriod.roadPath, smoothedRiverPath]);

  return (
    <main className="flex-1 relative archive-map overflow-hidden bg-archive-surface p-4 shadow-2xl border-r border-archive-border/30">
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none', zIndex: -1 }}>
        <defs>
          <pattern
            id="river-waves"
            width="160"
            height="32"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(12)"
          >
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to="160 0"
              dur="10s"
              repeatCount="indefinite"
              additive="sum"
            />
            <path 
              d="M 15,10 C 22.5,7 27.5,7 35,10 C 42.5,7 47.5,7 55,10 C 62.5,7 67.5,7 75,10" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.2" 
              strokeLinecap="round"
              opacity="0.85"
            />
            <path 
              d="M 95,22 C 101,19 105,19 111,22 C 117,19 121,19 127,22" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.7)" 
              strokeWidth="1.8" 
              strokeLinecap="round"
              opacity="0.75"
            />
          </pattern>
        </defs>
      </svg>
      <div className="w-full h-full relative shadow-[0_0_40px_rgba(0,0,0,0.1)] border-4 border-white/50">
        <MapContainer 
          center={MAP_CONFIG.INITIAL_CENTER}
          zoom={15} 
          scrollWheelZoom={false}
          zoomControl={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          trackResize={false}
          attributionControl={false}
          rotate={true}
          zoomSnap={0}
        >
          <TileLayer url={MAP_CONFIG.TILE_LAYER_URL} />
          <MapController />
          
          {activePeriod.riverPath && (
            (() => {
              const isRiverSelected = selectedFeature?.type === 'river';
              return (
                <>
                  <Polyline
                    eventHandlers={{
                      click: () => onFeatureSelect({
                        type: 'river',
                        title: '北运河',
                        tag: 'River Way',
                        images: [
                          { url: '/import/picture1.jpg', name: '北运河', source: '无' }
                        ],
                        description: '自元代始，北运河便是京畿漕运咽喉。明永乐二年，穆氏先祖立庄时获赐漕船，依北运河为业、靠漕运扎根立足。民国时期，天穆村民先后创办河运公司、船运保险机构。丰沛的运河水域资源，也让天穆村孕育了深厚水上体育底蕴，获评游泳之乡，1933年村内组建游泳队，健儿屡在国内外赛事摘得佳绩。1956年，开展拓宽调直工程，改造村域运河弯道，原有运河故道先改为公社鱼塘，后逐步废弃填平。'
                      })
                    }}
                    className={`river-underlay ${isRiverSelected ? 'feature-highlight' : ''}`}
                    pathOptions={{ 
                      color: MAP_CONFIG.COLORS.RIVER, 
                      weight: isRiverSelected ? 27 : 23,
                      opacity: 1,
                      lineCap: 'round', 
                      lineJoin: 'round',
                      cursor: 'pointer' 
                    }} 
                    positions={riverVisualPaths}
                  />

                  <Polyline
                    className="river-wave-overlay river-wave-overlay-extended"
                    pathOptions={{
                      color: 'transparent',
                      weight: isRiverSelected ? 18 : 14,
                      lineCap: 'round',
                      lineJoin: 'round',
                      interactive: false
                    }}
                    positions={leftExpandedRiverPath}
                  />

                  <Polyline 
                    className="river-wave-overlay"
                    pathOptions={{ 
                      color: 'transparent', 
                      weight: isRiverSelected ? 28 : 24,
                      lineCap: 'round',
                      lineJoin: 'round',
                      interactive: false 
                    }} 
                    positions={smoothedRiverPath}
                  />
                </>
              );
            })()
          )}

          {activePeriod.railwayPath && (
            (() => {
              const isRailwaySelected = selectedFeature?.type === 'railway';
              return (
                <Polyline 
                  eventHandlers={{
                    click: (e) => {
                      e?.originalEvent?.stopPropagation?.();
                      e?.originalEvent?.preventDefault?.();
                      onFeatureSelect({
                      type: 'railway',
                      title: '京津铁路旧线',
                      tag: 'Railway',
                      images: [
                        { url: 'https://images.unsplash.com/photo-1515165562839-978bbad18241?q=80&w=1000&auto=format&fit=crop', name: '20世纪初铁路实录', source: '北方铁路档案' },
                        { url: 'https://images.unsplash.com/photo-1532102235608-dc8fc689c9ab?q=80&w=1000&auto=format&fit=crop', name: '铁路桥梁工程资料', source: '近代路政史' }
                      ],
                      description: '标志着天穆地区进入铁路文明的重要交通动脉，连接北京与天津的历史轨道。这条铁路不仅带来了物资，更带来了现代观念的冲击。'
                      });
                    }
                  }}
                  className={isRailwaySelected ? 'feature-highlight' : ''}
                  pathOptions={{ 
                    color: MAP_CONFIG.COLORS.RAILWAY, 
                    weight: isRailwaySelected ? 12 : 8, 
                    dashArray: '8, 8', 
                    opacity: 0.6, 
                    cursor: 'pointer' 
                  }} 
                  positions={activePeriod.railwayPath} 
                />
              );
            })()
          )}
          
          {activePeriod.roadPath && (
            (() => {
              const isAncient = activePeriod.id === 'p2' || activePeriod.id === 'p3';
              const isRoadSelected = selectedFeature?.type === 'road';
              
              const shoulderWeight = isAncient ? 14 : 36;
              const bodyWeight = isAncient ? 9 : 26;
              const roadColor = isAncient ? '#5c4033' : '#334155'; 
              const shoulderColor = isAncient ? '#3e2723' : '#1e293b'; 
              
              return (
                <>
                  <Polyline 
                    pathOptions={{ 
                      color: shoulderColor, 
                      weight: shoulderWeight, 
                      lineCap: 'round',
                      opacity: isAncient ? 0.22 : 0.18,
                      interactive: false 
                    }} 
                    positions={activePeriod.roadPath} 
                  />

                  <Polyline 
                    eventHandlers={{
                      click: () => onFeatureSelect({
                        type: 'road',
                        title: "京津公路",
                        tag: isAncient ? 'Ancient Road' : 'Highway',
                        description: "穿过天穆村，前身为明清驿道和北运河大堤。1921年，道路竣工但仍为土路，在日伪期间延长并改铺为水泥路面单车道。直到五十年代末，天穆村一带随运河转弯的道路裁弯取直，才最终修成线性的一级公路，南段称天穆大道京津公路。",
                        images: [
                          { url: "/shuru/gonglu.jpg", name: "京津公路建设的报道", source: "《The North-China Daily News》，1938 年 3 月 27 日， 第9版" },
                         ]
                        })
                    }}
                    pathOptions={{ 
                      color: roadColor, 
                      weight: isRoadSelected ? bodyWeight + 4 : bodyWeight, 
                      lineCap: 'round',
                      opacity: 0.95, 
                      cursor: 'pointer',
                      className: isRoadSelected ? 'feature-highlight' : ''
                    }} 
                    positions={activePeriod.roadPath} 
                  />

                  {!isAncient && (
                    <>
                      <Polyline 
                        pathOptions={{ 
                          color: '#f59e0b', 
                          weight: 1.8, 
                          opacity: 0.95,
                          interactive: false 
                        }} 
                        positions={getOffsetPath(activePeriod.roadPath, -0.000010)} 
                      />
                      <Polyline 
                        pathOptions={{ 
                          color: '#f59e0b', 
                          weight: 1.8, 
                          opacity: 0.95,
                          interactive: false 
                        }} 
                        positions={getOffsetPath(activePeriod.roadPath, 0.000020)} 
                      />
                    </>
                  )}

                  <RoadTraffic path={activePeriod.roadPath} periodId={activePeriod.id} onFeatureSelect={onFeatureSelect} />
                </>
              );
            })()
          )}

          {adjustedResidentialAreas?.map(area => (
            <ResidentialAreaLayer key={area.id} area={area} onFeatureSelect={onFeatureSelect} selectedFeature={selectedFeature} />
          ))}

          {(activePeriod.id === 'p1' || activePeriod.id === 'p2' || activePeriod.id === 'p3') && (
            activePeriod.residentialAreas?.flatMap(area => {
              const positions = cottagePositions[area.id] || cottagePositions[`${area.id}-${activePeriod.id}`] || [];
              return positions.map((pos, idx) => (
                <Marker
                  key={`cottage-${area.id}-${idx}`}
                  position={pos}
                  icon={createCottageIcon()}
                  interactive={false}
                />
              ));
            })
          )}

          {activePeriod.id === 'p4' && (
            activePeriod.residentialAreas?.flatMap(area => {
              const positions = modernBuildingPositions[area.id] || modernBuildingPositions[`${area.id}-${activePeriod.id}`] || [];
              return positions.map((pos, idx) => {
                const isTianmuOldVillage = area.id === 'area-core';
                const isDongyuan = area.id.includes('dongyuan');
                const isShunyili = area.id.includes('shunyili');
                return (
                  <Marker
                    key={`modern-building-${area.id}-${idx}`}
                    position={pos}
                    icon={
                      isTianmuOldVillage
                        ? createCottageIcon()
                        : isDongyuan
                        ? createModernBuildingIcon()
                        : isShunyili
                          ? createLegacyModernBuildingIcon()
                          : createBungalowIcon()
                    }
                    interactive={false}
                  />
                );
              });
            })
          )}

          {activePeriod.points.map(point => {
            const isSelected = selectedFeature?.id === point.id;

            return (
              <Marker
                key={point.id}
                position={point.position}
                 icon={getMarkerIcon(point, isSelected)}
                keyboard={false}
                autoPanOnFocus={false}
                eventHandlers={{
                  click: (e) => {
                    e?.originalEvent?.stopPropagation?.();
                    onFeatureSelect({
                    type: point.type,
                    title: point.title,
                    description: point.description,
                    images: point.images,
                    id: point.id,
                    tag: `Point Ref #${point.id}`
                    });
                  }
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </main>
  );
};

export const MapDisplay = memo(
  MapDisplayImpl,
  (prev, next) =>
    prev.activePeriod.id === next.activePeriod.id &&
    prev.onFeatureSelect === next.onFeatureSelect &&
    prev.selectedFeature?.id === next.selectedFeature?.id &&
    prev.selectedFeature?.type === next.selectedFeature?.type
);
