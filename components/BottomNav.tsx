import React from 'react';
import { ViewState } from '../types';
import { IconHome, IconCalendar, IconPlus, IconFileText, IconUser } from './Icons';

interface BottomNavProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  t: any;
  setDurationFilter: (filter: any) => void;
  setCustomFilterStart: (val: string) => void;
  setCustomFilterEnd: (val: string) => void;
  navigateToCreateTrip: (source: ViewState) => void;
  activeTrip: any;
  handleGenerateReport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  view,
  setView,
  t,
  setDurationFilter,
  setCustomFilterStart,
  setCustomFilterEnd,
  navigateToCreateTrip,
  activeTrip,
  handleGenerateReport,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-gray-700/80 px-6 py-2.5 flex justify-between items-center z-40 safe-area-bottom shadow-lg transition-colors duration-200">
      <button 
        onClick={() => setView(ViewState.HOME)}
        className={`flex flex-col items-center space-y-1 transition-all ${view === ViewState.HOME ? 'text-brand-orange font-black scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <IconHome className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.nav_home}</span>
      </button>
      
      <button 
        onClick={() => {
          setDurationFilter('all');
          setCustomFilterStart('');
          setCustomFilterEnd('');
          setView(ViewState.TRIP_DETAIL);
        }}
        className={`flex flex-col items-center space-y-1 transition-all ${view === ViewState.TRIP_DETAIL ? 'text-brand-orange font-black scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <IconCalendar className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.nav_schedule}</span>
      </button>

      {/* Central Floating Action Button (+) */}
      <div className="relative -top-5">
        <button 
          onClick={() => navigateToCreateTrip(ViewState.HOME)}
          className="bg-gradient-to-tr from-orange-600 to-brand-orange text-white p-4 rounded-full shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex items-center justify-center border-4 border-white dark:border-gray-800"
          title="Create New Trip"
        >
          <IconPlus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <button 
        onClick={() => {
          if (activeTrip) {
            handleGenerateReport();
          }
          setView(ViewState.REPORT);
        }}
        className={`flex flex-col items-center space-y-1 transition-all ${view === ViewState.REPORT ? 'text-brand-orange font-black scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <IconFileText className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.nav_report}</span>
      </button>

      <button 
        onClick={() => setView(ViewState.SETTINGS)}
        className={`flex flex-col items-center space-y-1 transition-all ${view === ViewState.SETTINGS ? 'text-brand-orange font-black scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <IconUser className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.nav_settings}</span>
      </button>
    </div>
  );
};
