import React from 'react';
import {PlaceSearch,Place} from '../PlaceSearch';
import { ViewState } from '../../types';
import { IconChevronRight, IconUserCheck } from '../Icons';

interface CreateTripViewProps {
  t: any;
  loading: boolean;
  tripCreationSource: ViewState | null;
  newTripData: { title: string; destination: string; startDate: string; endDate: string; purpose: string; isSharedWithTeam?: boolean; selectedPlace?: Place };
  setNewTripData: React.Dispatch<React.SetStateAction<{ title: string; destination: string; startDate: string; endDate: string; purpose: string; isSharedWithTeam?: boolean; selectedPlace?: Place }>>;
  setView: (view: ViewState) => void;
  handleSaveTrip: () => void;
}

export const CreateTripView: React.FC<CreateTripViewProps> = ({
  t,
  loading,
  tripCreationSource,
  newTripData,
  setNewTripData,
  setView,
  handleSaveTrip,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView(tripCreationSource || ViewState.HOME)} 
          className="text-sm text-gray-500 dark:text-gray-400 flex items-center hover:text-brand-orange dark:hover:text-brand-orange transition-colors bg-transparent border-none p-0 inline-flex"
        >
          <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
        </button>
        <h2 className="text-lg font-bold dark:text-gray-100">{t.title_create_trip}</h2>
        <div className="w-8"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_trip_title}</label>
          <input 
            type="text" 
            value={newTripData.title}
            onChange={(e) => setNewTripData({...newTripData, title: e.target.value})}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            placeholder="e.g. Tokyo Business Trip"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_destination}</label>
          <input 
            type="text" 
            value={newTripData.destination}
            onChange={(e) => setNewTripData({...newTripData, destination: e.target.value, selectedPlace: undefined})}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            placeholder="e.g. Tokyo, Japan"
          />
          <PlaceSearch disabled={loading} onSelect={place=>setNewTripData({...newTripData,destination:place.name,selectedPlace:place})}/>
          {newTripData.selectedPlace&&<p className="text-xs mt-2">선택한 주소: {newTripData.selectedPlace.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_start_date}</label>
            <input 
              type="date" 
              value={newTripData.startDate}
              onChange={(e) => setNewTripData({...newTripData, startDate: e.target.value})}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_end_date}</label>
            <input 
              type="date" 
              value={newTripData.endDate}
              onChange={(e) => setNewTripData({...newTripData, endDate: e.target.value})}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_trip_purpose}</label>
          <textarea 
            value={newTripData.purpose}
            onChange={(e) => setNewTripData({...newTripData, purpose: e.target.value})}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            placeholder="..."
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">저장한 출장은 본인과 회사 사장만 확인할 수 있습니다.</p>

        <button 
          onClick={handleSaveTrip}
          disabled={loading}
          className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform text-xs"
        >
          {t.btn_save_trip}
        </button>
      </div>
    </div>
  );
};
