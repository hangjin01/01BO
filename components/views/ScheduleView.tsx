import React, { useState } from 'react';
import { ViewState, Trip, ItineraryItem, CheckInRecord, Lang } from '../../types';
import { TripMap } from '../TripMap';
import { 
  IconCalendar, IconChevronRight, IconPlus, IconFileText, IconMap, IconTrash, 
  IconX, IconSave, IconEdit, IconCheckCircle, IconClock, IconUserCheck 
} from '../Icons';

interface ScheduleViewProps {
  t: any;
  language: Lang;
  theme?: 'light' | 'dark';
  activeTrip: Trip | null;
  allTrips: Trip[];
  teamTrips?: Trip[];
  checkIns: CheckInRecord[];
  isNfcCheckoutEnabled: boolean;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  showDateFilterMenu: boolean;
  setShowDateFilterMenu: (show: boolean) => void;
  durationFilter: 'all' | '1day' | '1week' | '1month' | 'custom';
  setDurationFilter: (filter: 'all' | '1day' | '1week' | '1month' | 'custom') => void;
  customFilterStart: string;
  setCustomFilterStart: (val: string) => void;
  customFilterEnd: string;
  setCustomFilterEnd: (val: string) => void;
  calendarMonth: number;
  setCalendarMonth: React.Dispatch<React.SetStateAction<number>>;
  calendarYear: number;
  setCalendarYear: React.Dispatch<React.SetStateAction<number>>;
  editingItemId: string | null;
  editItemData: Partial<ItineraryItem>;
  setEditItemData: (data: Partial<ItineraryItem>) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setView: (view: ViewState) => void;
  navigateToCreateTrip: (source: ViewState) => void;
  handleShareTrip: (trip: Trip) => void;
  handleDeleteTrip: (e: React.MouseEvent, id: string) => void;
  handleManualCheckIn: (itemId: string) => void;
  handleManualCheckOut: (itemId: string) => void;
  handleCheckOut: (itemId: string) => void;
  handleEditClick: (item: ItineraryItem) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleDeleteItineraryItem: (id: string) => void;
  normalizeDateStr: (dateStr?: string) => string;
  addDaysToDateString: (dateStr: string, days: number) => string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  t,
  language,
  theme,
  activeTrip,
  allTrips,
  teamTrips = [],
  checkIns,
  isNfcCheckoutEnabled,
  showMap,
  setShowMap,
  showDateFilterMenu,
  setShowDateFilterMenu,
  durationFilter,
  setDurationFilter,
  customFilterStart,
  setCustomFilterStart,
  customFilterEnd,
  setCustomFilterEnd,
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  editingItemId,
  editItemData,
  setEditItemData,
  setActiveTrip,
  setView,
  navigateToCreateTrip,
  handleShareTrip,
  handleDeleteTrip,
  handleManualCheckIn,
  handleManualCheckOut,
  handleCheckOut,
  handleEditClick,
  handleSaveEdit,
  handleCancelEdit,
  handleDeleteItineraryItem,
  normalizeDateStr,
  addDaysToDateString,
}) => {
  const [tripFilterTab, setTripFilterTab] = useState<'my' | 'team'>('my');

  if (!activeTrip) {
    const displayedTrips = tripFilterTab === 'my' ? allTrips : teamTrips;

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-[65vh] space-y-4">
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-brand-orange dark:text-brand-orange rounded-full">
          <IconCalendar className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {language === 'ja' ? '出張スケジュールの選択' : '출장 일정 선택'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {language === 'ja' 
            ? '登録された出張計画を選択してください。' 
            : '조회할 출장 계획을 선택하거나 팀원들의 출장을 확인하세요.'}
        </p>

        {/* Tab Selector: My Trips vs Team Trips */}
        {teamTrips.length > 0 && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full max-w-sm">
            <button
              onClick={() => setTripFilterTab('my')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tripFilterTab === 'my' ? 'bg-white dark:bg-gray-700 text-brand-orange shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {language === 'ko' ? `내 출장 (${allTrips.length})` : `マイ出張 (${allTrips.length})`}
            </button>
            <button
              onClick={() => setTripFilterTab('team')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tripFilterTab === 'team' ? 'bg-white dark:bg-gray-700 text-brand-orange shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              👥 {language === 'ko' ? `팀원 출장 (${teamTrips.length})` : `チーム員出張 (${teamTrips.length})`}
            </button>
          </div>
        )}
        
        {displayedTrips.length > 0 ? (
          <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1">
            {displayedTrips.map(trip => (
              <button
                key={trip.id}
                onClick={() => {
                  setActiveTrip(trip);
                  setDurationFilter('all');
                  setCustomFilterStart('');
                  setCustomFilterEnd('');
                }}
                className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 hover:border-brand-orange rounded-xl flex justify-between items-center text-xs font-bold transition-all text-gray-700 dark:text-gray-200"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm truncate">{trip.title}</p>
                    {trip.userName && (
                      <span className="text-[9px] bg-orange-50 dark:bg-orange-950/40 text-brand-orange px-1.5 py-0.5 rounded font-extrabold shrink-0">
                        👤 {trip.userName}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{trip.startDate} - {trip.endDate}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        ) : null}
        
        <button
          onClick={() => navigateToCreateTrip(ViewState.TRIP_DETAIL)}
          className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          <span>{t.btn_new_trip}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between shrink-0">
        <button onClick={() => setView(ViewState.HOME)} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold dark:text-gray-100 leading-tight">{activeTrip.title}</h2>
          {activeTrip.userName && (
            <span className="text-[10px] font-extrabold text-brand-orange bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full inline-block mt-0.5">
              👤 작성자: {activeTrip.userName}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleShareTrip(activeTrip)}
            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 rounded-full transition-colors"
            title={language === 'ko' ? '카카오톡 공유' : '카카오톡 공유'}
          >
            <svg className="w-4 h-4 fill-current text-amber-500 hover:text-amber-600" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.531-.777 2.947-.118.503.193.497.402.357.164-.109 2.62-1.78 3.674-2.499.462.083.939.126 1.431.126 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
            </svg>
          </button>
          <button 
            onClick={(e) => handleDeleteTrip(e, activeTrip.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Delete trip"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex shrink-0">
        <button 
          onClick={() => setShowMap(false)}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-md transition-all ${!showMap ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-orange' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <IconFileText className="w-3 h-3 mr-1" />
          {t.tab_list}
        </button>
        <button 
          onClick={() => setShowMap(true)}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-md transition-all ${showMap ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-orange' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <IconMap className="w-3 h-3 mr-1" />
          {t.tab_map}
        </button>
      </div>

      {showMap ? (
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative bg-gray-100 dark:bg-gray-800">
          <TripMap items={activeTrip.itinerary} t={t} theme={theme} />
        </div>
      ) : (
        <div className="bg-orange-50/40 dark:bg-gray-800/50 p-4 rounded-xl border border-orange-100 dark:border-gray-700 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-100/50 dark:border-gray-700 relative">
            <h3 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wide">{t.trip_schedule_title}</h3>
            
            {/* Date Range Selector Badge */}
            <span 
              onClick={() => setShowDateFilterMenu(!showDateFilterMenu)}
              className="text-[10px] text-brand-orange dark:text-brand-orange bg-orange-100 dark:bg-orange-950/40 font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900/60 active:scale-95 transition-all flex items-center gap-1 hover:shadow-sm border border-orange-200/20 dark:border-orange-800/30"
            >
              <IconCalendar className="w-3 h-3" />
              {durationFilter === 'all' ? (
                `${activeTrip.startDate} ~ ${activeTrip.endDate}`
              ) : durationFilter === '1day' ? (
                language === 'ja' ? `1日 (${activeTrip.startDate})` : `하루 (${activeTrip.startDate})`
              ) : durationFilter === '1week' ? (
                language === 'ja' ? `1週間 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 6)})` : `1주 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 6)})`
              ) : durationFilter === '1month' ? (
                language === 'ja' ? `1ヶ月 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 29)})` : `한달 (${activeTrip.startDate} ~ ${addDaysToDateString(activeTrip.startDate, 29)})`
              ) : (
                `${customFilterStart || '?'} ~ ${customFilterEnd || '?'}`
              )}
            </span>

            {/* Duration Filter Dropdown */}
            {showDateFilterMenu && (
              <div className="absolute top-10 right-0 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-72 md:w-80 text-gray-900 dark:text-gray-100 animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {language === 'ja' ? '期間フィルター' : '기간 필터'}
                  </h4>
                  <button 
                    onClick={() => setShowDateFilterMenu(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  {[
                    { id: 'all', ko: '전체', ja: 'すべて' },
                    { id: '1day', ko: '하루', ja: '1日' },
                    { id: '1week', ko: '1주', ja: '1週間' },
                    { id: '1month', ko: '한달', ja: '1ヶ月' },
                    { id: 'custom', ko: '지정', ja: '지정' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setDurationFilter(tab.id as any);
                        if (tab.id !== 'custom') {
                          setShowDateFilterMenu(false);
                        }
                      }}
                      className={`text-[10px] font-bold py-1.5 px-0.5 rounded-md text-center transition-all ${
                        durationFilter === tab.id
                          ? 'bg-brand-orange text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {language === 'ja' ? tab.ja : tab.ko}
                    </button>
                  ))}
                </div>

                {durationFilter === 'custom' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <button 
                        type="button"
                        onClick={() => {
                          if (calendarMonth === 0) {
                            setCalendarMonth(11);
                            setCalendarYear(calendarYear - 1);
                          } else {
                            setCalendarMonth(calendarMonth - 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
                      >
                        <IconChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        {language === 'ja' ? `${calendarYear}年 ${calendarMonth + 1}月` : `${calendarYear}년 ${calendarMonth + 1}월`}
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          if (calendarMonth === 11) {
                            setCalendarMonth(0);
                            setCalendarYear(calendarYear + 1);
                          } else {
                            setCalendarMonth(calendarMonth + 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
                      >
                        <IconChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold">
                      {language === 'ja' 
                        ? ['日', '月', '火', '水', '木', '金', '土'].map(d => <span key={d}>{d}</span>)
                        : ['일', '월', '화', '수', '목', '금', '토'].map(d => <span key={d}>{d}</span>)
                      }
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
                        
                        const offsetCells = Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`offset-${i}`} className="w-7 h-7 flex items-center justify-center"></div>
                        ));

                        const dayCells = Array.from({ length: totalDays }).map((_, idx) => {
                          const dNum = idx + 1;
                          const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
                          
                          const isSelectedStart = customFilterStart === dayStr;
                          const isSelectedEnd = customFilterEnd === dayStr;
                          const isInRange = customFilterStart && customFilterEnd && dayStr > customFilterStart && dayStr < customFilterEnd;
                          const isTripDate = dayStr >= normalizeDateStr(activeTrip.startDate) && dayStr <= normalizeDateStr(activeTrip.endDate);
                          const hasActivities = activeTrip.itinerary.some(item => normalizeDateStr(item.date || activeTrip.startDate) === dayStr);

                          let cellClass = "w-7 h-7 rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-all ";
                          if (isSelectedStart || isSelectedEnd) {
                            cellClass += "bg-brand-orange text-white shadow-sm font-bold scale-105 z-10 rounded-full";
                          } else if (isInRange) {
                            cellClass += "bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 rounded-none";
                          } else if (isTripDate || hasActivities) {
                            cellClass += "bg-orange-50/50 dark:bg-orange-900/10 text-brand-orange dark:text-brand-orange hover:bg-orange-100/50 dark:hover:bg-orange-900/30";
                          } else {
                            cellClass += "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50";
                          }

                          return (
                            <button
                              key={`day-${dNum}`}
                              type="button"
                              onClick={() => {
                                if (!customFilterStart || (customFilterStart && customFilterEnd)) {
                                  setCustomFilterStart(dayStr);
                                  setCustomFilterEnd('');
                                } else {
                                  if (dayStr >= customFilterStart) {
                                    setCustomFilterEnd(dayStr);
                                  } else {
                                    setCustomFilterStart(dayStr);
                                    setCustomFilterEnd('');
                                  }
                                }
                              }}
                              className={cellClass}
                              title={dayStr}
                            >
                              <span>{dNum}</span>
                              {hasActivities && (
                                <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelectedStart || isSelectedEnd ? 'bg-white' : 'bg-brand-orange'}`} />
                              )}
                            </button>
                          );
                        });

                        return [...offsetCells, ...dayCells];
                      })()}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomFilterStart('');
                          setCustomFilterEnd('');
                          setDurationFilter('all');
                          setShowDateFilterMenu(false);
                        }}
                        className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors"
                      >
                        {language === 'ja' ? 'リセット' : '전체 해제'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDateFilterMenu(false)}
                        className="flex-1 py-1.5 bg-brand-orange text-white text-[11px] font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        {language === 'ja' ? '適用' : '적용'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* List items rendering */}
          <div className="space-y-6">
            {(() => {
              const filtered = (() => {
                if (durationFilter === 'all') return activeTrip.itinerary;
                
                let start = '';
                let end = '';
                
                if (durationFilter === '1day') {
                  start = normalizeDateStr(activeTrip.startDate);
                  end = normalizeDateStr(activeTrip.startDate);
                } else if (durationFilter === '1week') {
                  start = normalizeDateStr(activeTrip.startDate);
                  end = addDaysToDateString(normalizeDateStr(activeTrip.startDate), 6);
                } else if (durationFilter === '1month') {
                  start = normalizeDateStr(activeTrip.startDate);
                  end = addDaysToDateString(normalizeDateStr(activeTrip.startDate), 29);
                } else if (durationFilter === 'custom') {
                  if (!customFilterStart) return activeTrip.itinerary;
                  start = customFilterStart;
                  end = customFilterEnd || customFilterStart;
                }
                
                return activeTrip.itinerary.filter((item) => {
                  const itemDate = normalizeDateStr(item.date || activeTrip.startDate);
                  return itemDate >= start && itemDate <= end;
                });
              })();

              if (filtered.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="p-3 bg-orange-100/50 dark:bg-orange-900/20 text-brand-orange dark:text-brand-orange rounded-full mb-3">
                      <IconCalendar className="w-6 h-6 animate-pulse-slow" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {language === 'ja' ? '選択期間内にスケジュールはありません' : '선택한 기간 내에 일정이 없습니다'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDurationFilter('all');
                        setCustomFilterStart('');
                        setCustomFilterEnd('');
                      }}
                      className="mt-2 text-xs text-brand-orange dark:text-brand-orange hover:underline font-bold"
                    >
                      {language === 'ja' ? '全日程を表示' : '전체 일정 보기'}
                    </button>
                  </div>
                );
              }

              const grouped: Record<string, ItineraryItem[]> = {};
              filtered.forEach((item) => {
                const d = normalizeDateStr(item.date || activeTrip.startDate);
                if (!grouped[d]) grouped[d] = [];
                grouped[d].push(item);
              });
              
              const sortedDates = Object.keys(grouped).sort();
              
              const formatDateHeading = (dateStr: string) => {
                try {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
                  return d.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', options);
                } catch {
                  return dateStr;
                }
              };

              return sortedDates.map((dateStr) => {
                const items = grouped[dateStr].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
                
                return (
                  <div key={dateStr} className="space-y-3">
                    <div className="flex items-center space-x-2 py-1">
                      <div className="h-px bg-orange-200 dark:bg-orange-500/20 flex-1"></div>
                      <span className="text-[11px] font-bold text-brand-orange dark:text-brand-orange px-3 py-1 bg-orange-100/50 dark:bg-orange-900/40 rounded-lg shadow-sm border border-orange-100/30 dark:border-orange-900/20">
                        {formatDateHeading(dateStr)}
                      </span>
                      <div className="h-px bg-orange-200 dark:bg-orange-500/20 flex-1"></div>
                    </div>
                    
                    <div className="space-y-4 pl-1">
                      {items.map((item) => {
                        const isCheckedIn = checkIns.some(c => c.itineraryItemId === item.id && c.type === 'check-in');
                        const isManualCheckedOut = checkIns.some(c => c.itineraryItemId === item.id && c.type === 'check-out' && c.nfcTagId === 'manual');
                        const isNfcCheckedOut = checkIns.some(c => c.itineraryItemId === item.id && c.type === 'check-out' && c.nfcTagId && c.nfcTagId !== 'manual');
                        const isCheckedOut = isNfcCheckoutEnabled ? (isManualCheckedOut && isNfcCheckedOut) : isManualCheckedOut;
                        const isEditing = editingItemId === item.id;
                        
                        return (
                          <div key={item.id} className="relative pl-6 pb-2 border-l-2 border-orange-200 dark:border-orange-500/30 last:pb-0 last:border-l-0">
                            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-brand-orange border-2 border-white dark:border-gray-900 shadow-sm animate-pulse-slow"></div>
                            
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 relative group transition-all duration-200 hover:shadow">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{language === 'ja' ? '日付' : '날짜'}</label>
                                      <input 
                                        type="date" 
                                        value={normalizeDateStr(editItemData.date || activeTrip.startDate || '')}
                                        onChange={(e) => setEditItemData({...editItemData, date: e.target.value})}
                                        className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none font-sans"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_time}</label>
                                      <input 
                                        type="time" 
                                        value={editItemData.scheduledTime || ''} 
                                        onChange={(e) => setEditItemData({...editItemData, scheduledTime: e.target.value})}
                                        className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none font-sans"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_location_name}</label>
                                    <input 
                                      type="text" 
                                      value={editItemData.locationName || ''}
                                      onChange={(e) => setEditItemData({...editItemData, locationName: e.target.value})}
                                      className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t.label_address}</label>
                                    <input 
                                      type="text" 
                                      value={editItemData.address || ''}
                                      onChange={(e) => setEditItemData({...editItemData, address: e.target.value})}
                                      className="w-full text-xs p-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none"
                                    />
                                  </div>
                                  <div className="flex space-x-2 pt-2">
                                    <button onClick={handleSaveEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors">
                                      <IconSave className="w-3 h-3 mr-1" /> {t.btn_save}
                                    </button>
                                    <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors">
                                      <IconX className="w-3 h-3 mr-1" /> {t.btn_cancel}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="absolute top-2 right-2 flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => handleEditClick(item)}
                                      className="p-2 text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange hover:bg-orange-50/50 dark:hover:bg-orange-900/30 rounded-full transition-colors"
                                    >
                                      <IconEdit className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItineraryItem(item.id)}
                                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                    >
                                      <IconTrash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex justify-between items-start mb-2 pr-12">
                                    <div>
                                      <span className="text-xs font-bold text-brand-orange dark:text-brand-orange bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">{item.scheduledTime}</span>
                                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mt-1">{item.locationName}</h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.address}</p>
                                    </div>
                                    {isCheckedIn && isCheckedOut && (
                                      <span className="text-green-500 flex items-center gap-1 text-[11px] font-bold"><IconCheckCircle className="w-4 h-4 text-green-500" /> {language === 'ja' ? '完了' : '완료'}</span>
                                    )}
                                    {isCheckedIn && !isCheckedOut && (
                                      <span className="text-amber-500 flex items-center gap-1 text-[11px] font-bold animate-pulse"><IconClock className="w-4 h-4 text-amber-500" /> {language === 'ja' ? '進行中' : '진행 중'}</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex space-x-2 mt-3">
                                    {!isCheckedIn ? (
                                      <button 
                                        onClick={() => handleManualCheckIn(item.id)}
                                        className="flex-1 bg-brand-orange text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                                      >
                                        {t.btn_checkin}
                                      </button>
                                    ) : !isCheckedOut ? (
                                      <>
                                        {!isManualCheckedOut ? (
                                          <button 
                                            onClick={() => handleManualCheckOut(item.id)}
                                            className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 transition-all"
                                          >
                                            📝 {t.btn_manual_checkout || '수동 체크아웃'}
                                          </button>
                                        ) : (
                                          <div className="flex-1 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 text-center text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                            <span>✅</span> {t.status_manual_checked_out || '수동 완료'}
                                          </div>
                                        )}

                                        {isNfcCheckoutEnabled && (
                                          !isNfcCheckedOut ? (
                                            <button 
                                              onClick={() => handleCheckOut(item.id)}
                                              className="flex-1 bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-all shadow-sm"
                                            >
                                              ⚡ {t.btn_nfc_checkout || 'NFC 체크아웃'}
                                            </button>
                                          ) : (
                                            <div className="flex-1 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 text-center text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                              <span>⚡</span> {t.status_nfc_checked_out || 'NFC 완료'}
                                            </div>
                                          )
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/20 text-brand-orange dark:text-brand-orange text-center text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5">
                                        <span>🎉</span> {language === 'ja' 
                                          ? (isNfcCheckoutEnabled ? 'チェックアウト完了 (2重検証)' : 'チェックアウト完了') 
                                          : (isNfcCheckoutEnabled ? '체크아웃 완료 (2중 검증)' : '체크아웃 완료')}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
