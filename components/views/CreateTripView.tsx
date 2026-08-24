import React from 'react';
import { ViewState } from '../../types';
import { IconChevronRight, IconUserCheck } from '../Icons';

interface CreateTripViewProps {
  t: any;
  tripCreationSource: ViewState | null;
  newTripData: { title: string; destination: string; startDate: string; endDate: string; purpose: string; isSharedWithTeam?: boolean };
  setNewTripData: React.Dispatch<React.SetStateAction<{ title: string; destination: string; startDate: string; endDate: string; purpose: string; isSharedWithTeam?: boolean }>>;
  setView: (view: ViewState) => void;
  handleSaveTrip: () => void;
}

export const CreateTripView: React.FC<CreateTripViewProps> = ({
  t,
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
            onChange={(e) => setNewTripData({...newTripData, destination: e.target.value})}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-xs"
            placeholder="e.g. Tokyo, Japan"
          />
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

        {/* Team Sharing Switch */}
        <div className="bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUserCheck className="w-5 h-5 text-brand-orange" />
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">팀원들과 이 출장 일정 공유하기</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">동일한 팀 코드를 가진 팀원들의 대시보드에 공개됩니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewTripData({ ...newTripData, isSharedWithTeam: !(newTripData.isSharedWithTeam ?? true) })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ (newTripData.isSharedWithTeam ?? true) ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-gray-600' }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(newTripData.isSharedWithTeam ?? true) ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <button 
          onClick={handleSaveTrip}
          className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform text-xs"
        >
          {t.btn_save_trip}
        </button>
      </div>
    </div>
  );
};
