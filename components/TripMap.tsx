import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ItineraryItem } from '../types';

export const TripMap = ({ items, t, theme }: { items: ItineraryItem[]; t: any; theme?: 'light' | 'dark' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);

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

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerInstance.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    const bounds = L.latLngBounds([]);
    
    items.forEach((item) => {
      const { latitude, longitude } = item.coords;
      const markerLatLng = L.latLng(latitude, longitude);
      bounds.extend(markerLatLng);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#F97316;width:16px;height:16px;border-radius:50%;border:3px solid ${theme === 'dark' ? '#1f2937' : 'white'};box-shadow:0 3px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family:'Noto Sans JP',sans-serif; background-color: ${theme === 'dark' ? '#1f2937' : 'white'}; color: ${theme === 'dark' ? '#f3f4f6' : '#1e1b4b'}; padding: 4px; border-radius: 4px;">
          <strong style="font-size:14px;">${item.locationName}</strong><br/>
          <span style="color:${theme === 'dark' ? '#9ca3af' : '#6b7280'};font-size:12px;">${item.scheduledTime}</span><br/>
          <div style="margin-top:8px;">
            <button class="nav-btn" style="background-color:#F97316;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:12px;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:bold;">
              <span>${t.btn_navigate}</span>
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

    if (items.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [items, t, theme]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl z-0" 
      />
    </div>
  );
};
