import type { Coordinate, ItineraryItem } from '../types';

export function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error('날짜를 YYYY-MM-DD 형식으로 확인해 주세요.');
  }
}
export function assertTripDates(start: string, end: string): void {
  assertDate(start); assertDate(end);
  if (start > end) throw new Error('종료일은 시작일보다 빠를 수 없습니다.');
}
export function isCoordinate(value: unknown): value is Coordinate {
  const c = value as Coordinate | undefined;
  return !!c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude) && Math.abs(c.latitude) <= 90 && Math.abs(c.longitude) <= 180;
}
export async function normalizeItinerary(raw: unknown, start: string, end: string, geocode: (address: string) => Promise<Coordinate>): Promise<ItineraryItem[]> {
  assertTripDates(start, end);
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('일정이 비어 있습니다. 방문 장소와 시간을 입력해 주세요.');
  const ids = new Set<string>();
  const result: ItineraryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') throw new Error('일정 형식이 올바르지 않습니다.');
    const locationName = String(item.locationName || item.title || '').trim();
    const address = String(item.address || locationName).trim();
    const date = item.date || start;
    assertDate(date);
    if (date < start || date > end) throw new Error('일정 날짜가 출장 기간을 벗어났습니다.');
    if (!locationName || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.scheduledTime)) throw new Error('일정의 장소와 시간을 확인해 주세요.');
    const coords = isCoordinate(item.coords) ? item.coords : await geocode(address);
    if (!isCoordinate(coords)) throw new Error('방문 장소의 좌표를 확인하지 못했습니다.');
    const id = typeof item.id === 'string' && item.id && !ids.has(item.id) ? item.id : crypto.randomUUID();
    ids.add(id);
    result.push({ id, title: String(item.title || locationName), locationName, address, date, scheduledTime: item.scheduledTime, coords });
  }
  return result.sort((a, b) => `${a.date} ${a.scheduledTime}`.localeCompare(`${b.date} ${b.scheduledTime}`));
}
