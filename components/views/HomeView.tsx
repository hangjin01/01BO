import React from 'react';
import { ViewState, Trip, CheckInRecord, Expense, Lang } from '../../types';
import { 
  IconSearch, IconFilter, IconTrain, IconPlane, IconHotel, IconBuilding, IconCar, 
  IconPlus, IconMapPin, IconBriefcase, IconCalendar, IconCamera, IconFileText, 
  IconCloudSun, IconCheckCircle, IconChevronRight, IconLogOut, IconZap, IconReceipt, IconUserCheck 
} from '../Icons';

import shinkansenImg from '../../assets/shinkansen.png';
import hotelImg from '../../assets/hotel.png';
import meetingImg from '../../assets/meeting.png';
import carImg from '../../assets/car.png';

interface HomeViewProps {
  t: any;
  language: Lang;
  activeTrip: Trip | null;
  teamTrips?: Trip[];
  checkIns: CheckInRecord[];
  expenses: Expense[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  setView: (view: ViewState) => void;
  setDurationFilter: (filter: any) => void;
  setCustomFilterStart: (val: string) => void;
  setCustomFilterEnd: (val: string) => void;
  navigateToCreateTrip: (source: ViewState) => void;
  handleManualCheckIn: (itemId: string) => void;
  handleGenerateReport: () => void;
  renderExpenseChart: () => React.ReactNode;
  setActiveTrip?: (trip: Trip) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  t,
  language,
  activeTrip,
  teamTrips = [],
  checkIns,
  expenses,
  fileInputRef,
  setView,
  setDurationFilter,
  setCustomFilterStart,
  setCustomFilterEnd,
  navigateToCreateTrip,
  handleManualCheckIn,
  handleGenerateReport,
  renderExpenseChart,
  setActiveTrip,
}) => {
  return (
    <div className="space-y-6 pb-4">
      {/* 1. Top Search & Filter Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-card-soft">
          <IconSearch className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder={t.search_placeholder || (language === 'ko' ? "출장지, 미팅장소 검색..." : "出張先、会議場所を検索...")}
            className="w-full text-xs font-medium bg-transparent text-gray-800 dark:text-white placeholder-gray-400 outline-none"
          />
          <button 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-brand-orange hover:bg-brand-orange hover:text-white transition-colors shrink-0"
            title="Search Filter"
          >
            <IconFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Booking 2x2 Grid (Ad/Affiliate Section with Dark Photo Backgrounds) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">{t.quick_booking}</h3>
          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">01Bo Direct</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Flight / Shinkansen */}
          <button 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="relative overflow-hidden p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/80 shadow-lg flex flex-col items-center justify-center text-center space-y-2 group min-h-[110px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
              style={{ backgroundImage: `url(${shinkansenImg})` }} 
            />
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] group-hover:bg-slate-950/60 transition-colors" />

            <div className="relative z-10 p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-brand-orange border border-white/20 group-hover:scale-110 transition-transform">
              <div className="flex items-center gap-1">
                <IconTrain className="w-5 h-5" />
                <IconPlane className="w-4 h-4 opacity-90" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="font-extrabold text-white text-xs drop-shadow-md">{t.quick_flight}</p>
              <p className="text-[10px] text-gray-300 font-medium">Shinkansen / Flights</p>
            </div>
          </button>

          {/* Card 2: Business Hotels */}
          <button 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="relative overflow-hidden p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/80 shadow-lg flex flex-col items-center justify-center text-center space-y-2 group min-h-[110px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
              style={{ backgroundImage: `url(${hotelImg})` }} 
            />
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] group-hover:bg-slate-950/60 transition-colors" />

            <div className="relative z-10 p-2.5 rounded-xl bg-orange-500/90 text-white backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform shadow-md">
              <IconHotel className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="font-extrabold text-white text-xs drop-shadow-md">{t.quick_hotel}</p>
              <p className="text-[10px] text-gray-300 font-medium">Business Hotels</p>
            </div>
          </button>

          {/* Card 3: Meeting Rooms */}
          <button 
            onClick={() => {
              setDurationFilter('all');
              setCustomFilterStart('');
              setCustomFilterEnd('');
              setView(ViewState.TRIP_DETAIL);
            }}
            className="relative overflow-hidden p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/80 shadow-lg flex flex-col items-center justify-center text-center space-y-2 group min-h-[110px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
              style={{ backgroundImage: `url(${meetingImg})` }} 
            />
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] group-hover:bg-slate-950/60 transition-colors" />

            <div className="relative z-10 p-2.5 rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
              <IconBuilding className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="font-extrabold text-white text-xs drop-shadow-md">{t.quick_meeting}</p>
              <p className="text-[10px] text-gray-300 font-medium">Meeting Rooms</p>
            </div>
          </button>

          {/* Card 4: Local Transportation */}
          <button 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="relative overflow-hidden p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/80 shadow-lg flex flex-col items-center justify-center text-center space-y-2 group min-h-[110px]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
              style={{ backgroundImage: `url(${carImg})` }} 
            />
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] group-hover:bg-slate-950/60 transition-colors" />

            <div className="relative z-10 p-2.5 rounded-xl bg-white/10 text-brand-orange backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
              <IconCar className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="font-extrabold text-white text-xs drop-shadow-md">{t.quick_trans}</p>
              <p className="text-[10px] text-gray-300 font-medium">Transportation / Car</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2.5 Team Trips Overview Section */}
      {teamTrips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
              <IconUserCheck className="w-4 h-4 text-brand-orange" />
              <span>{language === 'ko' ? '👥 우리 팀원 출장 현황' : '👥 チーム員出張状況'}</span>
            </h3>
            <span className="text-[10px] font-bold text-brand-orange bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
              {teamTrips.length}{language === 'ko' ? '건 공유됨' : '件共有'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {teamTrips.map(trip => (
              <div 
                key={trip.id}
                onClick={() => {
                  if (setActiveTrip) setActiveTrip(trip);
                  setView(ViewState.TRIP_DETAIL);
                }}
                className="min-w-[220px] max-w-[240px] bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm hover:border-brand-orange cursor-pointer transition-all shrink-0 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-orange-50 dark:bg-orange-950/50 text-brand-orange dark:text-brand-orange text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    👤 {trip.userName || '팀원'}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">{trip.startDate}</span>
                </div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs truncate">{trip.title}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                  <IconMapPin className="w-3 h-3 text-brand-orange shrink-0" />
                  <span>{trip.destination}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Trip Dashboard Hero Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
            {t.status_label}
          </h3>
          <button 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="text-xs text-brand-orange font-bold flex items-center gap-1 hover:underline"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>{t.btn_create_new || (language === 'ko' ? '새 출장' : '新規')}</span>
          </button>
        </div>

        {/* Active / Primary Trip Hero Card */}
        {activeTrip ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-slate-700/50">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-brand-orange/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Active Trip
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{activeTrip.title}</h2>
                {activeTrip.userName && (
                  <p className="text-[11px] text-orange-200 font-bold">
                    👤 작성자: {activeTrip.userName}
                  </p>
                )}
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <IconMapPin className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{activeTrip.destination}</span>
                  <span className="mx-1">•</span>
                  <span>{activeTrip.startDate} ~ {activeTrip.endDate}</span>
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-brand-orange border border-white/10">
                <IconBriefcase className="w-6 h-6" />
              </div>
            </div>

            {/* Quick Action bar inside Active Hero */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 relative z-10">
              <button
                onClick={() => {
                  setDurationFilter('all');
                  setCustomFilterStart('');
                  setCustomFilterEnd('');
                  setView(ViewState.TRIP_DETAIL);
                }}
                className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <IconCalendar className="w-4 h-4" />
                <span>{t.nav_schedule}</span>
              </button>
              
              <button
                onClick={() => {
                  setView(ViewState.SCANNER);
                  if (activeTrip) {
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }
                }}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
              >
                <IconCamera className="w-4 h-4 text-brand-orange" />
                <span>{t.btn_expense}</span>
              </button>

              <button
                onClick={() => {
                  if (activeTrip) handleGenerateReport();
                  setView(ViewState.REPORT);
                }}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
              >
                <IconFileText className="w-4 h-4 text-emerald-400" />
                <span>{t.nav_report}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Active Trip Card */
          <div 
            onClick={() => navigateToCreateTrip(ViewState.HOME)}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-gray-800 hover:border-brand-orange transition-colors cursor-pointer shadow-card-soft"
          >
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-brand-orange">
              <IconPlus className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{t.msg_create_first_trip}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.quick_booking}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Timeline & Destination Preview Widget */}
      {activeTrip && activeTrip.itinerary && activeTrip.itinerary.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-150 dark:border-gray-700 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse" />
              <h4 className="font-black text-gray-900 dark:text-white text-sm">
                {activeTrip.destination.toUpperCase()} TRIP TIMELINE
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
              {activeTrip.startDate}
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-4">
            <div className="timeline-vertical-line" />

            {/* Weather & Map Summary Badges */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-100 dark:border-sky-900/40">
                <IconCloudSun className="w-4 h-4 text-amber-500" />
                <span>59°F • 54°F • 78°F</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-900/40">
                <IconMapPin className="w-4 h-4 text-emerald-500" />
                <span>GPS Live 50m</span>
              </div>
            </div>

            {/* Detailed Itinerary Items */}
            {activeTrip.itinerary.slice(0, 4).map((item) => {
              const isCheckedIn = checkIns.some(ci => ci.itineraryItemId === item.id && ci.type === 'check-in');
              return (
                <div key={item.id} className="relative flex items-start gap-3 text-xs">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isCheckedIn ? 'bg-emerald-500' : 'bg-brand-orange'}`} />
                  
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-xs">{item.locationName}</p>
                      <span className="text-[10px] font-bold text-brand-orange bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                        {item.scheduledTime}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{item.address}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <IconCheckCircle className="w-3.5 h-3.5" />
                          Checked In
                        </span>
                      ) : (
                        <button
                          onClick={() => handleManualCheckIn(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-brand-orange text-white text-[10px] font-bold hover:bg-orange-600 active:scale-95 transition-all"
                        >
                          {t.btn_checkin_here}
                        </button>
                      )}
                      
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.coords.latitude},${item.coords.longitude}`, '_blank')}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-0.5"
                      >
                        <span>{t.btn_navigate}</span>
                        <IconChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Recent Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-150 dark:border-gray-700 shadow-card-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
            {t.recent_activity_title}
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Realtime Feed</span>
        </div>
        
        {checkIns.length === 0 && expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
            {t.no_history}
          </div>
        ) : (
          <div className="space-y-3">
            {checkIns.slice(0, 5).map(ci => (
              <div key={ci.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${ci.type === 'check-out' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : 'bg-orange-100 text-brand-orange dark:bg-orange-950/50 dark:text-brand-orange'}`}>
                    {ci.type === 'check-out' ? <IconLogOut className="w-4 h-4" /> : <IconZap className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{ci.locationName}</p>
                    <p className="text-[10px] text-gray-400">{new Date(ci.timestamp).toLocaleString(language === 'ja' ? 'ja-JP' : 'ko-KR')}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${ci.type === 'check-out' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                  {ci.type === 'check-out' ? 'Check-out' : 'Check-in'}
                </span>
              </div>
            ))}

            {expenses.slice(0, 3).map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <IconReceipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{ex.merchant}</p>
                    <p className="text-[10px] text-gray-400">{ex.category} • {ex.date}</p>
                  </div>
                </div>
                <span className="font-black text-gray-900 dark:text-white text-xs">
                  ¥{ex.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Breakdown Chart */}
      {renderExpenseChart()}
    </div>
  );
};
