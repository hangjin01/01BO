import React from 'react';
import { ViewState, Trip, Lang } from '../types';
import { IconBot, IconX, IconCheckCircle, IconMic, IconStop, IconSend } from './Icons';

interface AIChatModalProps {
  t: any;
  language: Lang;
  showAIChat: boolean;
  setShowAIChat: (show: boolean) => void;
  generatedTripForShare: Trip | null;
  setGeneratedTripForShare: (trip: Trip | null) => void;
  isAiProcessing: boolean;
  aiChatInput: string;
  setAiChatInput: (val: string) => void;
  isListening: boolean;
  startListening: () => void;
  handleShareTrip: (trip: Trip) => void;
  handleCancelAiProcessing: () => void;
  handleAiChatSubmit: () => void;
  setView: (view: ViewState) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  t,
  language,
  showAIChat,
  setShowAIChat,
  generatedTripForShare,
  setGeneratedTripForShare,
  isAiProcessing,
  aiChatInput,
  setAiChatInput,
  isListening,
  startListening,
  handleShareTrip,
  handleCancelAiProcessing,
  handleAiChatSubmit,
  setView,
}) => {
  if (!showAIChat) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-brand-orange p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IconBot className="w-6 h-6" />
            <h3 className="font-bold">{t.ai_bot_title}</h3>
          </div>
          <button 
            onClick={() => {
              setShowAIChat(false);
              setGeneratedTripForShare(null);
            }} 
            className="text-orange-200 hover:text-white transition-colors"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
        
        {generatedTripForShare ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-5 space-y-5">
            <div className="text-center py-1.5 space-y-1 shrink-0">
              <div className="inline-flex p-2 bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full animate-bounce">
                <IconCheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                {language === 'ko' ? 'AI 출장 일정이 생성되었습니다!' : 'AI出張日程が作成されました！'}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'ko' ? '생성된 일정을 확인하고 카카오톡으로 공유해보세요.' : '作成された日程を確認し、KakaoTalkで共有してみてください。'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-2.5 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-brand-orange dark:text-brand-orange bg-orange-50 dark:bg-orange-950/50 font-bold px-2 py-0.5 rounded">
                  {generatedTripForShare.startDate} ~ {generatedTripForShare.endDate}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Preview</span>
              </div>
              <h5 className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">{generatedTripForShare.title}</h5>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                📍 <strong>{language === 'ko' ? '목적지' : '目的地'}:</strong> {generatedTripForShare.destination}
              </p>
              {generatedTripForShare.purpose && (
                <p className="text-xs text-gray-650 dark:text-gray-300">
                  🎯 <strong>{language === 'ko' ? '출장 목적' : '出張目的'}:</strong> {generatedTripForShare.purpose}
                </p>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-750/50 space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{language === 'ko' ? '상세 일정' : '詳細スケジュール'}</p>
                {generatedTripForShare.itinerary && generatedTripForShare.itinerary.length > 0 ? (
                  generatedTripForShare.itinerary.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-xs">
                      <span className="bg-orange-50 dark:bg-orange-950 text-brand-orange dark:text-brand-orange px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 mt-0.5">
                        {item.scheduledTime}
                      </span>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{item.locationName}</p>
                        <p className="text-[9px] text-gray-450 dark:text-gray-400">{item.address}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-450">{language === 'ko' ? '상세 일정이 없습니다.' : '詳細日程がありません。'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 shrink-0">
              <button
                onClick={() => handleShareTrip(generatedTripForShare)}
                className="w-full bg-[#FEE500] hover:bg-[#FDD100] text-[#191919] font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs shadow-sm"
              >
                <svg className="w-4 h-4 fill-current text-[#191919]" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.531-.777 2.947-.118.503.193.497.402.357.164-.109 2.62-1.78 3.674-2.499.462.083.939.126 1.431.126 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                {language === 'ko' ? '카카오톡으로 일정 공유' : '카카오톡으로 일정 공유'}
              </button>
              
              <button
                onClick={() => {
                  setGeneratedTripForShare(null);
                  setShowAIChat(false);
                  setAiChatInput('');
                  setView(ViewState.HOME);
                }}
                className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 text-gray-750 dark:text-gray-200 font-bold py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 transition-all text-xs"
              >
                {language === 'ko' ? '닫기' : '閉じる'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {language === 'ja' 
                    ? "出張の予定を教えてください。AIが自動でスケジュールを作成します。" 
                    : "출장 일정을 알려주세요. AI가 자동으로 스케줄을 작성해 드립니다."}
                </p>
              </div>
              {isAiProcessing && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange dark:border-brand-orange"></div>
                  <span className="ml-3 text-brand-orange dark:text-brand-orange font-medium">{t.ai_bot_processing}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl relative">
                  <textarea
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder={isListening ? t.ai_bot_listening : t.ai_bot_placeholder}
                    className="w-full bg-transparent p-3 pr-10 outline-none resize-none h-20 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isAiProcessing}
                  />
                  <button 
                    onClick={startListening}
                    disabled={isAiProcessing || isListening}
                    className={`absolute right-2 bottom-2 p-2 rounded-full ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500 hover:text-brand-orange dark:hover:text-brand-orange'}`}
                  >
                    <IconMic className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={isAiProcessing ? handleCancelAiProcessing : handleAiChatSubmit}
                  disabled={!aiChatInput.trim() && !isAiProcessing}
                  className={`${
                    isAiProcessing 
                      ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                      : 'bg-brand-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  } text-white p-3 rounded-xl active:scale-95 transition-all h-[80px] w-14 flex items-center justify-center shadow-md`}
                >
                  {isAiProcessing ? (
                    <IconStop className="w-6 h-6 animate-pulse" />
                  ) : (
                    <IconSend className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
