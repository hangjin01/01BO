import { Coordinate } from '../types';

export type LocationFix = Coordinate & {accuracy: number; timestamp: number};
export const getCurrentPosition = async (): Promise<LocationFix> => {
  const {Capacitor}=await import('@capacitor/core');
  if(Capacitor.isNativePlatform()){
    const {Geolocation}=await import('@capacitor/geolocation');
    await Geolocation.requestPermissions();
    const pos=await Geolocation.getCurrentPosition({enableHighAccuracy:true,timeout:15000,maximumAge:0});
    return {latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:pos.timestamp};
  }
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation)return reject(new Error('위치 확인을 지원하지 않습니다.'));
    navigator.geolocation.getCurrentPosition(pos=>resolve({latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,timestamp:pos.timestamp}),reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });
};

// Calculate distance in meters using Haversine formula
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371e3; // metres
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - minLimit(a))); // wait, Math.sqrt(1 - a) is original

  return R * c;
};

function minLimit(val: number): number {
  return Math.min(1, Math.max(0, val));
}

export const geocodeAddress = async (address: string): Promise<Coordinate> => {
 const {apiFetch}=await import('./apiService');
 const result=await apiFetch<{places:{coords:Coordinate}[]}>('/places/search?q='+encodeURIComponent(address.trim()));
 if(result.places.length!==1)throw new Error('장소 검색에서 정확한 장소를 선택해 주세요.');
 return result.places[0].coords;
};
