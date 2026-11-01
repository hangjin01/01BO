import React, {useRef, useState} from 'react';
import {getCurrentPosition} from '../services/locationService';
import {apiFetch} from '../services/apiService';
export type Place = {name:string;address:string;coords:{latitude:number;longitude:number}};
export function PlaceSearch({onSelect,initialValue='',disabled=false}:{onSelect:(place:Place)=>void;initialValue?:string;disabled?:boolean}) {
 const [query,setQuery]=useState(initialValue),[places,setPlaces]=useState<Place[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const version=useRef(0);
 const search=async()=>{const current=++version.current;setBusy(true);setError('');setPlaces([]);try{const result=await apiFetch<{places:Place[]}>('/places/search?q='+encodeURIComponent(query.trim()));if(current===version.current){setPlaces(result.places);if(!result.places.length)setError('장소가 없습니다. 한국어·일본어 지명이나 공개 주소로 검색해 주세요.');}}catch(e){if(current===version.current)setError(e instanceof Error?e.message:'검색 실패');}finally{setBusy(false);}};
 const useCurrentLocation=async()=>{const current=++version.current;setBusy(true);setError('');setPlaces([]);try{const fix=await getCurrentPosition();if(current!==version.current)return;if(!Number.isFinite(fix.accuracy)||fix.accuracy>50)throw new Error('위치 오차가 50m를 넘습니다. 정확한 위치를 켜고 창가나 야외에서 다시 시도해 주세요.');const place={name:'현재 위치',address:`GPS 위치 (오차 약 ${Math.ceil(fix.accuracy)}m)`,coords:{latitude:fix.latitude,longitude:fix.longitude}};onSelect(place);setQuery(place.name);}catch(e){if(current===version.current)setError(e instanceof Error?e.message:'위치 확인에 실패했습니다. 휴대폰 위치와 앱의 정확한 위치 권한을 확인해 주세요.');}finally{setBusy(false);}};
 return <div className="space-y-2 text-sm">
  <div className="flex gap-2"><input aria-label="장소 검색어" disabled={disabled||busy} value={query} onChange={e=>{setQuery(e.target.value);setPlaces([]);version.current++;}} placeholder="서울역 / 東京駅 / 공개 주소" className="w-full p-2 border rounded-lg dark:bg-gray-700"/><button type="button" onClick={search} disabled={disabled||busy||!query.trim()} className="p-2 border rounded-lg shrink-0">{busy?'검색 중':'장소 검색'}</button></div>
  <p className="text-xs text-gray-500">한국·일본 장소 검색 · 비공개 주소는 입력하지 마세요.</p>
  <button type="button" disabled={disabled||busy} onClick={()=>void useCurrentLocation()} className="p-2 border rounded-lg">현재 위치 사용</button>
  <p className="text-xs text-gray-500">현재 위치는 장소 검색 업체에 보내지 않으며, 일정을 저장하면 방문 장소로 저장됩니다.</p>
  {error&&<p role="alert" className="text-red-600">{error}</p>}
  {places.map((p,i)=><button type="button" disabled={disabled} key={i} onClick={()=>{onSelect(p);setPlaces([]);setQuery(p.name);}} className="block w-full text-left p-3 border rounded-lg"><strong>{p.name}</strong><br/>{p.address}</button>)}
  <a className="text-xs underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
 </div>;
}
