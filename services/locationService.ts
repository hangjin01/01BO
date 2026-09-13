import { Coordinate } from '../types';

export const getCurrentPosition = (): Promise<Coordinate> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
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
  if (!address || !address.trim()) {
    throw new Error('Address is empty');
  }

  // 1. Google Maps Geocoding API (using VITE_GOOGLE_MAPS_API_KEY or localStorage override)
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string)
    || (typeof window !== 'undefined' ? localStorage.getItem('o1bo_google_maps_api_key') || "" : "");

  if (mapsApiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsApiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
          const loc = data.results[0].geometry.location;
          console.log(`Geocoded via Google Maps: ${address} ->`, loc);
          return {
            latitude: loc.lat,
            longitude: loc.lng
          };
        } else {
          console.warn('Google Maps Geocoding failed or returned no results:', data.status, data.error_message || '');
        }
      }
    } catch (err) {
      console.error('Error with Google Maps Geocoding:', err);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log(`Geocoded via Nominatim: ${address} ->`, lat, lon);
        return {
          latitude: lat,
          longitude: lon
        };
      }
    }
  } catch (err) {
    console.error('Error with Nominatim Geocoding:', err);
  }

  // 3. Failover default coordinates
  console.warn('Geocoding failover: Tokyo default coordinates applied');
  return { latitude: 35.6812, longitude: 139.7671 };
};