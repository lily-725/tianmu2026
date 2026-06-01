import type { HistoricalPoint, PointType } from './types';

export interface PointCategoryMeta {
  color: string;
  iconSvg: string;
}

export const POINT_TYPE_META: Record<PointType, PointCategoryMeta> = {
  religion: {
    color: '#5c7667',
    iconSvg: `<path d="M6 16.5c0-3.3 2.7-6 6-6s6 2.7 6 6M5 16.5h14v2.5H5zM11 6.5c.5-1 1.4-1.4 2.2-1.3c-.5.6-.6 1.4-.3 2.2c-.8.1-1.5-.2-1.9-.9Z" />`
  },
  economy: {
    color: '#d16163',
    iconSvg: `<path d="M4 10h16l-2-3H6zM5 10v8.5h14v-8.5M9 14h6M9 17h6" />`
  },
  education: {
    color: '#f0b56a',
    iconSvg: `<path d="M12 6.5c-2-1-4.2-1.5-6.5-1.5v12.5c2.3 0 4.5.5 6.5 1.5M12 6.5c2-1 4.2-1.5 6.5-1.5v12.5c-2.3 0-4.5.5-6.5 1.5M12 6.5v12.5" />`
  },
  life: {
    color: '#e68aa3',
    iconSvg: `<path d="M7 11h10M8 11l-2 8M16 11l2 8M9 15h6" />`
  },
  sports: {
    color: '#78b7c2',
    iconSvg: `<path d="M7 11.5c1.5-1.5 3.5-.5 5 1l3 3" /><circle cx="15.5" cy="11.5" r="1.5" /><path d="M4 16.5c2-1 4 0 6-1s4 0 6-1s4 0 6-1" /><path d="M4 18.5c2-1 4 0 6-1s4 0 6-1s4 0 6-1" />`
  }
};

const POINT_ICON_BY_TITLE: Array<{
  match: (point: Pick<HistoricalPoint, 'id' | 'title' | 'type'>) => boolean;
  iconSvg: string;
}> = [
  {
    match: (point) => point.type === 'religion' && point.title.includes('北寺'),
    iconSvg: `<path d="M6 16c0-3.3 2.7-6 6-6s6 2.7 6 6M5 16h14v3H5zM11 6c.5-1 1.4-1.4 2.2-1.3c-.5.6-.6 1.4-.3 2.2c-.8.1-1.5-.2-1.9-.9Z" />`
  },
  {
    match: (point) => point.type === 'religion' && point.title.includes('南寺'),
    iconSvg: `<path d="M5 19h14M7 19v-7l5-4 5 4v7M10 19v-3.5h4V19" />`
  },
  {
    match: (point) => point.type === 'economy' && point.title.includes('漕运'),
    iconSvg: `<path d="M4 14.5c2 2.5 14 2.5 16 0M6 14v-6l6 2v4M12 14V5l5 2v7" />`
  },
  {
    match: (point) => point.type === 'economy' && (point.title.includes('自行车') || point.title.includes('DDT')),
    iconSvg: `<circle cx="7.5" cy="15" r="2.5" /><circle cx="16.5" cy="15" r="2.5" /><path d="M7.5 15h3.5l1.5-4h3l1.5 4M11 11V8h5v3M13 15h3.5" />`
  },
  {
    match: (point) => point.type === 'economy' && point.title.includes('马车'),
    iconSvg: `<path d="M7 18c0-4 1-6 4-6h3l2-3 1 1-2 3v3l2 2-1 1-3-2h-4l-2 1zM11 12c0-2 1-3 2-3" />`
  },
  {
    match: (point) => point.type === 'economy' && (point.title.includes('批发市场') || point.title.includes('市场') || point.title.includes('农贸市场')),
    iconSvg: `<path d="M4 10.5h16l-2-3.5H6zM5 10.5v8.5h14v-8.5M9 14h6M9 17h6" />`
  },
  {
    match: (point) => point.type === 'economy' && point.title.includes('牛羊肉'),
    iconSvg: `<path d="M7 8c2-2 6-2 8 0v4c0 3-2 5-4 5s-4-2-4-5V8zM11 11h3" />`
  },
  {
    match: (point) => point.type === 'economy' && (point.title.includes('食品街') || point.title.includes('商业街')),
    iconSvg: `<path d="M5 18h14M7 18v-5l5-4 5 4v5M9 18v-4h6v4M5 9h14l-2-2.5h-10z" />`
  },
  {
    match: (point) => point.type === 'economy' && (point.title.includes('羊圈') || point.title.includes('羊圈业')),
    iconSvg: `<path d="M9 14c0-2.5 2-4 4-4s4 1.5 4 4v2c0 1.5-1 2.5-2.5 2.5h-3c-1.5 0-2.5-1-2.5-2.5v-2zM7 11c-1.5 0-2-1.5-1-2s2 0 1 2M17 11c1.5 0 2-1.5 1-2s-2 0-1 2" />`
  },
  {
    match: (point) => point.type === 'education' && (point.title.includes('经房子') || point.title.includes('私塾') || point.title.includes('小学堂') || point.title.includes('小学') || point.title.includes('学校')),
    iconSvg: `<path d="M12 6.5c-2-1-4.2-1.5-6.5-1.5v12.5c2.3 0 4.5.5 6.5 1.5M12 6.5c2-1 4.2-1.5 6.5-1.5v12.5c-2.3 0-4.5.5-6.5 1.5M12 6.5v12.5" />`
  },
  {
    match: (point) => point.type === 'sports',
    iconSvg: `<path d="M7 11.5c1.5-1.5 3.5-.5 5 1l3 3" /><circle cx="15.5" cy="11.5" r="1.5" /><path d="M4 16.5c2-1 4 0 6-1s4 0 6-1s4 0 6-1" /><path d="M4 18.5c2-1 4 0 6-1s4 0 6-1s4 0 6-1" />`
  }
];

export const getPointIconSvg = (point: Pick<HistoricalPoint, 'id' | 'title' | 'type'>) => {
  const matched = POINT_ICON_BY_TITLE.find((item) => item.match(point));
  return matched?.iconSvg ?? POINT_TYPE_META[point.type].iconSvg;
};
