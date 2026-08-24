import React from 'react';
import { ViewState, Trip, Lang } from '../../types';
import { IconCamera, IconChevronRight, IconPlus, IconImage } from '../Icons';

interface ScannerViewProps {
  t: any;
  language: Lang;
  activeTrip: Trip | null;
  allTrips: Trip[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  galleryInputRef: React.RefObject<HTMLInputElement>;
  setActiveTrip: (trip: Trip | null) => void;
  navigateToCreateTrip: (source: ViewState) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  t,
  language,
  activeTrip,
  allTrips,
  fileInputRef,
  galleryInputRef,
  setActiveTrip,
  navigateToCreateTrip,
}) => {
  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh] space-y-4">
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-brand-orange dark:text-brand-orange rounded-full">
          <IconCamera className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {language === 'ja' ? '経費登録用の出張選択' : '경비 등록용 출장 선택'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {language === 'ja' 
            ? '領収書をスキャンして経費を登録する出張を選択してください。' 
            : '영수증을 스캔하여 경비를 등록할 출장 계획을 선택해 주세요.'}
        </p>
        
        {allTrips.length > 0 ? (
          <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1 text-left">
            {allTrips.map(trip => (
              <button
                key={trip.id}
                onClick={() => {
                  setActiveTrip(trip);
                }}
                className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 hover:border-brand-orange rounded-xl flex justify-between items-center text-xs font-bold transition-all text-gray-700 dark:text-gray-200"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-sm truncate">{trip.title}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{trip.startDate} - {trip.endDate}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        ) : null}
        
        <button
          onClick={() => navigateToCreateTrip(ViewState.SCANNER)}
          className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          <span>{t.btn_new_trip}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center animate-pulse">
        <IconCamera className="w-10 h-10 text-brand-orange dark:text-brand-orange" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.scan_title}</h3>
      <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs">{t.scan_desc}</p>
      
      {/* Camera Button */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 w-64 flex items-center justify-center space-x-2 transition-all active:scale-95"
      >
        <IconCamera className="w-5 h-5" />
        <span>{t.btn_camera}</span>
      </button>

      {/* Gallery Button */}
      <button 
        onClick={() => galleryInputRef.current?.click()}
        className="bg-white dark:bg-gray-800 text-brand-orange dark:text-brand-orange border-2 border-orange-100 dark:border-gray-700 px-6 py-3 rounded-full font-bold shadow-sm w-64 flex items-center justify-center space-x-2 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all active:scale-95"
      >
        <IconImage className="w-5 h-5" />
        <span>{t.btn_upload}</span>
      </button>
    </div>
  );
};
