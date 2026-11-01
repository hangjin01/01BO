import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sanitizeString } from '../services/apiService';
import { CheckInRecord, ItineraryItem } from '../types';
import { fetchRoadRoute, RoadRoute } from '../services/routeService';

export const TripMap = ({ items, t, theme, language = 'ko', startDate = '', checkIns = [] }: { items: ItineraryItem[]; t: any; theme?: 'light' | 'dark'; language?: 'ko' | 'ja'; startDate?: string; checkIns?: CheckInRecord[] }) => {
  const ja = language === 'ja';
  const days = [...new Set(items.map(item => (item.date || startDate).slice(0, 10)))].sort();
  const [selectedDay, setSelectedDay] = useState('');
  const day = days.includes(selectedDay) ? selectedDay : days[0] || '';
  const ordered = useMemo(() => items.filter(item => (item.date || startDate).slice(0, 10) === day).slice().sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)), [items, startDate, day]);
  const located = useMemo(() => ordered.filter(item => Number.isFinite(item.coords?.latitude) && Number.isFinite(item.coords?.longitude) && Math.abs(item.coords.latitude) <= 90 && Math.abs(item.coords.longitude) <= 180), [ordered]);
  const routeKey = JSON.stringify(located.map(item => item.coords));
  const [road, setRoad] = useState<{key: string; route: RoadRoute} | null>(null);
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState('');
  const roadRoute = road?.key === routeKey ? road.route : null;
  const requestVersion = useRef(0);
  useEffect(() => { requestVersion.current++; setRouteBusy(false); setRouteError(''); }, [routeKey]);
  useEffect(() => () => { requestVersion.current++; }, []);
  const loadRoute = async () => {
    const version = ++requestVersion.current;
    setRouteBusy(true); setRouteError('');
    try {
      const route = await fetchRoadRoute(located.map(item => item.coords));
      if (version === requestVersion.current) setRoad({key: routeKey, route});
    } catch {
      if (version === requestVersion.current) setRouteError(ja ? '経路を取得できませんでした。少し待って再試行してください。' : '도로 경로를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { if (version === requestVersion.current) setRouteBusy(false); }
  };
  const checkInKey = JSON.stringify(checkIns.filter(record => record.type === 'check-in').map(record => record.itineraryItemId).sort());
  const visited = (id: string) => checkIns.some(record => record.itineraryItemId === id && record.type === 'check-in');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);

  const [tileError,setTileError]=useState(false);
  const [retry,setRetry]=useState(0);

  // Leaflet (2D) Map logic
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([35.6812, 139.7671], 13);
    }

    const map = mapInstance.current;

    if (tileLayerInstance.current) {
      map.removeLayer(tileLayerInstance.current);
    }

    const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerInstance.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: theme === 'dark' ? 'trip-map-tiles-dark' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setTileError(false);
    tileLayerInstance.current.on('tileerror',()=>setTileError(true));

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    const bounds = L.latLngBounds([]);

    located.forEach((item) => {
      const index = ordered.indexOf(item) + 1;
      const { latitude, longitude } = item.coords||{};
      if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return;
      const markerLatLng = L.latLng(latitude, longitude);
      bounds.extend(markerLatLng);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="display:flex;align-items:center;justify-content:center;color:white;font-weight:800;background-color:${visited(item.id) ? '#15803d' : '#F97316'};width:28px;height:28px;border-radius:50%;border:2px solid ${theme === 'dark' ? '#1f2937' : 'white'};box-shadow:0 3px 6px rgba(0,0,0,0.4);">${index}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -10]
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family:'Noto Sans JP',sans-serif; background-color: ${theme === 'dark' ? '#1f2937' : 'white'}; color: ${theme === 'dark' ? '#f3f4f6' : '#1e1b4b'}; padding: 4px; border-radius: 4px;">
          <strong style="font-size:14px;">${sanitizeString(item.locationName)}</strong><br/>
          <span style="color:${theme === 'dark' ? '#9ca3af' : '#6b7280'};font-size:12px;">${sanitizeString(item.scheduledTime)}</span><br/>
          <div style="margin-top:8px;">
            <button class="nav-btn" style="background-color:#F97316;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:12px;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:bold;">
              <span>${sanitizeString(t.btn_navigate)}</span>
            </button>
          </div>
        </div>
      `;

      const navBtn = popupContent.querySelector('.nav-btn');
      if (navBtn) {
        navBtn.addEventListener('click', () => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
        });
      }

      L.marker(markerLatLng, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          className: theme === 'dark' ? 'dark-popup' : ''
        });
    });

    if (roadRoute) {
      L.polyline(roadRoute.coordinates, { color: '#f97316', weight: 5, opacity: 0.85 }).addTo(map);
      roadRoute.coordinates.forEach(point => bounds.extend(point));
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    }

    const resize=new ResizeObserver(()=>map.invalidateSize());
    resize.observe(mapRef.current);
    const timer=setTimeout(()=>map.invalidateSize(),250);
    return ()=>{clearTimeout(timer);resize.disconnect();map.remove();mapInstance.current=null;tileLayerInstance.current=null;};
  }, [located, ordered, t, theme, retry, roadRoute, checkInKey]);

  return (
    <div className="w-full space-y-3 p-2">
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <label>{ja ? '日付' : '날짜'} <select aria-label={ja ? '経路の日付' : '경로 날짜'} value={day} onChange={e => setSelectedDay(e.target.value)} className="p-2 rounded-lg bg-white dark:bg-gray-700">{days.map(d => <option key={d} value={d}>{d}</option>)}</select></label>
          <button type="button" disabled={routeBusy || located.length < 2 || located.length > 25 || located.length !== ordered.length} onClick={loadRoute} className="px-3 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50">{routeBusy ? (ja ? '計算中…' : '계산 중…') : (ja ? '道路経路を表示' : '도로 경로 보기')}</button>
        </div>
        <p>{ja ? '自動車の予定経路です。実際の移動軌跡ではありません。緑はチェックイン記録あり。' : '자동차 예상 경로입니다. 실제 이동 궤적이 아니며, 초록색은 체크인 기록이 있는 장소입니다.'}</p>
        <p>{ja ? 'ボタンを押すと訪問先の座標を外部のFOSSGIS経路サービスに送信します。' : '버튼을 누르면 방문 장소 좌표를 외부 FOSSGIS 경로 서비스에 전송합니다.'}</p>
        {located.length !== ordered.length && <p>{ja ? '座標のない予定があります。場所を選択してください。' : '좌표가 없는 일정이 있습니다. 장소 검색으로 위치를 선택해 주세요.'}</p>}
        {located.length < 2 && <p>{ja ? '経路には2か所以上必要です。' : '경로를 보려면 장소가 2개 이상 필요합니다.'}</p>}
        {located.length > 25 && <p>{ja ? '一日に最大25か所まで対応します。' : '하루 최대 25개 장소까지 경로를 지원합니다.'}</p>}
        {roadRoute && <p className="font-bold text-orange-600 dark:text-orange-400">{(roadRoute.distance / 1000).toFixed(1)} km · {Math.ceil(roadRoute.duration / 60)}{ja ? '分（交通状況・滞在時間を除く）' : '분 (교통 상황·체류 시간 미포함)'}</p>}
        {routeError && <p role="alert" className="text-red-500">{routeError}</p>}
        <p><a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer" className="underline">OSRM / FOSSGIS</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer" className="underline">{ja ? '地図の修正' : '지도 오류 제보'}</a></p>
      </div>
      <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-xl z-0" style={{height:400, minHeight:320}}
      />
      {tileError&&<div role="status" className="absolute top-2 left-12 right-2 z-30 bg-white text-gray-900 p-2 rounded shadow text-xs">지도를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요. <button type="button" className="underline" onClick={()=>setRetry(n=>n+1)}>지도 다시 불러오기</button></div>}
      </div>
      <ol className="space-y-2 text-sm text-gray-800 dark:text-gray-100">
        {ordered.map((item, index) => <li key={item.id} className="flex gap-2 items-start">
          <span className={`shrink-0 rounded-full w-6 h-6 text-center text-white ${visited(item.id) ? 'bg-green-700' : 'bg-orange-600'}`}>{index + 1}</span>
          <span className="min-w-0 break-words"><strong>{item.scheduledTime} · {item.locationName}</strong><br/><span className="text-xs text-gray-500 dark:text-gray-400">{visited(item.id) ? (ja ? 'チェックイン記録あり' : '체크인 기록 있음') : (ja ? '訪問記録なし' : '방문 기록 없음')}</span></span>
        </li>)}
      </ol>
    </div>
  );
};
