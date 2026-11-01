import { Coordinate } from '../types';

export type RoadRoute = { coordinates: [number, number][]; distance: number; duration: number };
const cache = new Map<string, RoadRoute>();
let busy = false;
let lastRequest = 0;

// Explicit, small-scale previews only; never prefetch routes or send user identity.
export async function fetchRoadRoute(points: Coordinate[]): Promise<RoadRoute> {
  if (points.length < 2 || points.length > 25 || points.some(p => !Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180)) throw new Error('INVALID_POINTS');
  const key = points.map(p => `${p.longitude},${p.latitude}`).join(';');
  if (cache.has(key)) return cache.get(key)!;
  if (busy || Date.now() - lastRequest < 1100) throw new Error('RETRY_LATER');
  busy = true;
  lastRequest = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${key}?overview=full&geometries=geojson&steps=false`, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error('ROUTE_UNAVAILABLE');
    const data = await response.json();
    const route = data.routes?.[0];
    const coordinates = route?.geometry?.coordinates;
    if (data.code !== 'Ok' || !Array.isArray(coordinates) || coordinates.length < 2 || coordinates.some(p => !Array.isArray(p) || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) throw new Error('NO_ROUTE');
    const result: RoadRoute = { coordinates: coordinates.map(p => [p[1], p[0]]), distance: route.distance, duration: route.duration };
    if (cache.size >= 20) cache.delete(cache.keys().next().value!);
    cache.set(key, result);
    return result;
  } finally {
    clearTimeout(timeout);
    busy = false;
  }
}
