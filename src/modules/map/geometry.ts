export type LatLngTuple = [number, number];

type Bounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type XY = { x: number; y: number };

const toXY = (p: LatLngTuple, refLat: number): XY => {
  const cos = Math.cos((refLat * Math.PI) / 180);
  return { x: p[1] * cos, y: p[0] };
};

export const getBounds = (points: LatLngTuple[]): Bounds => {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lng < minLng) minLng = lng;
    if (lat > maxLat) maxLat = lat;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, minLng, maxLat, maxLng };
};

export const boundsIntersect = (a: Bounds, b: Bounds) =>
  !(a.maxLat < b.minLat || a.minLat > b.maxLat || a.maxLng < b.minLng || a.minLng > b.maxLng);

export const polygonCentroid = (points: LatLngTuple[]): LatLngTuple => {
  if (points.length === 0) return [0, 0];
  let lat = 0;
  let lng = 0;
  for (const p of points) {
    lat += p[0];
    lng += p[1];
  }
  return [lat / points.length, lng / points.length];
};

const orientation = (a: XY, b: XY, c: XY) => {
  const v = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(v) < 1e-12) return 0;
  return v > 0 ? 1 : 2;
};

const onSegment = (a: XY, b: XY, c: XY) =>
  Math.min(a.x, c.x) - 1e-12 <= b.x &&
  b.x <= Math.max(a.x, c.x) + 1e-12 &&
  Math.min(a.y, c.y) - 1e-12 <= b.y &&
  b.y <= Math.max(a.y, c.y) + 1e-12;

const segmentsIntersectXY = (p1: XY, p2: XY, q1: XY, q2: XY) => {
  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, q1, p2)) return true;
  if (o2 === 0 && onSegment(p1, q2, p2)) return true;
  if (o3 === 0 && onSegment(q1, p1, q2)) return true;
  if (o4 === 0 && onSegment(q1, p2, q2)) return true;
  return false;
};

const distanceXY = (a: XY, b: XY) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const normalizeXY = (v: XY) => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len < 1e-12) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

const fromXY = (p: XY, refLat: number): LatLngTuple => {
  const cos = Math.cos((refLat * Math.PI) / 180);
  return [p.y, cos === 0 ? 0 : p.x / cos];
};

const closestPointOnSegmentXY = (point: XY, a: XY, b: XY) => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-12) return { point: a, distance: distanceXY(point, a) };

  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
  const closest = { x: a.x + abx * t, y: a.y + aby * t };
  return { point: closest, distance: distanceXY(point, closest) };
};

export const densifyPolygon = (polygon: LatLngTuple[], rounds: number = 1) => {
  let current = [...polygon];
  for (let round = 0; round < rounds; round++) {
    const next: LatLngTuple[] = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      const b = current[(i + 1) % current.length];
      next.push(a);
      next.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    current = next;
  }
  return current;
};

export const pointInPolygon = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  const [py, px] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [iy, ix] = polygon[i];
    const [jy, jx] = polygon[j];
    const intersect =
      iy > py !== jy > py && px < ((jx - ix) * (py - iy)) / (jy - iy + 0.0) + ix;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const polygonIntersectsPolygon = (a: LatLngTuple[], b: LatLngTuple[]) => {
  if (a.length < 3 || b.length < 3) return false;
  if (!boundsIntersect(getBounds(a), getBounds(b))) return false;

  const ca = polygonCentroid(a);
  const cb = polygonCentroid(b);
  const refLat = (ca[0] + cb[0]) / 2;

  const aXY = a.map(p => toXY(p, refLat));
  const bXY = b.map(p => toXY(p, refLat));

  for (let i = 0; i < aXY.length; i++) {
    const a1 = aXY[i];
    const a2 = aXY[(i + 1) % aXY.length];
    for (let j = 0; j < bXY.length; j++) {
      const b1 = bXY[j];
      const b2 = bXY[(j + 1) % bXY.length];
      if (segmentsIntersectXY(a1, a2, b1, b2)) return true;
    }
  }

  if (pointInPolygon(a[0], b)) return true;
  if (pointInPolygon(b[0], a)) return true;
  return false;
};

export const polylineIntersectsPolygon = (line: LatLngTuple[], polygon: LatLngTuple[]) => {
  if (line.length < 2 || polygon.length < 3) return false;
  if (!boundsIntersect(getBounds(line), getBounds(polygon))) return false;

  const c = polygonCentroid(polygon);
  const refLat = c[0];
  const polyXY = polygon.map(p => toXY(p, refLat));

  for (const p of line) {
    if (pointInPolygon(p, polygon)) return true;
  }

  for (let i = 0; i < line.length - 1; i++) {
    const l1 = toXY(line[i], refLat);
    const l2 = toXY(line[i + 1], refLat);
    for (let j = 0; j < polyXY.length; j++) {
      const p1 = polyXY[j];
      const p2 = polyXY[(j + 1) % polyXY.length];
      if (segmentsIntersectXY(l1, l2, p1, p2)) return true;
    }
  }
  return false;
};

export const scalePolygon = (polygon: LatLngTuple[], scale: number, center?: LatLngTuple) => {
  if (polygon.length === 0) return polygon;
  const [cy, cx] = center ?? polygonCentroid(polygon);
  return polygon.map(
    ([lat, lng]) => [cy + (lat - cy) * scale, cx + (lng - cx) * scale] as LatLngTuple
  );
};

export const scalePolygonAxes = (
  polygon: LatLngTuple[],
  xScale: number,
  yScale: number = 1,
  center?: LatLngTuple
) => {
  if (polygon.length === 0) return polygon;
  const anchor = center ?? polygonCentroid(polygon);
  const refLat = anchor[0];
  const anchorXY = toXY(anchor, refLat);

  return polygon.map(point => {
    const xy = toXY(point, refLat);
    const next = {
      x: anchorXY.x + (xy.x - anchorXY.x) * xScale,
      y: anchorXY.y + (xy.y - anchorXY.y) * yScale
    };
    return fromXY(next, refLat);
  });
};

interface ShrinkPolygonNearPolylineOptions {
  influenceDistance: number;
  minClearance: number;
  maxIterations?: number;
  maxMoveRatio?: number;
}

export const shrinkPolygonNearPolyline = (
  polygon: LatLngTuple[],
  line: LatLngTuple[],
  options: ShrinkPolygonNearPolylineOptions
) => {
  if (polygon.length < 3 || line.length < 2) return polygon;

  const {
    influenceDistance,
    minClearance,
    maxIterations = 8,
    maxMoveRatio = 0.32
  } = options;

  let current = densifyPolygon(polygon, 1);

  for (let iter = 0; iter < maxIterations; iter++) {
    if (!polylineIntersectsPolygon(line, current)) break;

    const centroid = polygonCentroid(current);
    const refLat = centroid[0];
    const centroidXY = toXY(centroid, refLat);
    const lineXY = line.map(point => toXY(point, refLat));
    let moved = false;

    current = current.map(point => {
      const pointXY = toXY(point, refLat);
      let nearest = { point: lineXY[0], distance: Number.POSITIVE_INFINITY };

      for (let i = 0; i < lineXY.length - 1; i++) {
        const candidate = closestPointOnSegmentXY(pointXY, lineXY[i], lineXY[i + 1]);
        if (candidate.distance < nearest.distance) {
          nearest = candidate;
        }
      }

      if (nearest.distance > influenceDistance) {
        return point;
      }

      const proximity = 1 - nearest.distance / influenceDistance;
      const targetRatio = Math.min(
        maxMoveRatio,
        Math.max(0, (minClearance - nearest.distance) / Math.max(influenceDistance, 1e-12)) + proximity * 0.18
      );

      if (targetRatio <= 0) {
        return point;
      }

      const inward = normalizeXY({
        x: centroidXY.x - pointXY.x,
        y: centroidXY.y - pointXY.y
      });

      if (inward.x === 0 && inward.y === 0) {
        return point;
      }

      const moveDistance = distanceXY(pointXY, centroidXY) * targetRatio;
      const movedXY = {
        x: pointXY.x + inward.x * moveDistance,
        y: pointXY.y + inward.y * moveDistance
      };

      const movedPoint = fromXY(movedXY, refLat);
      moved = true;
      return movedPoint;
    });

    if (!moved) break;
  }

  return current;
};
