import React from 'react';
import { ViewState, Trip, Lang } from '../../types';
import { 
  IconChevronRight, IconFileText, IconPlus, IconBot, IconMic, IconCalendar, 
  IconZap, IconCheckCircle, IconEdit, IconSend 
} from '../Icons';

interface ReportViewProps {
  t: any;
  language: Lang;
  activeTrip: Trip | null;
  allTrips: Trip[];
  reportPrompt: string;
  setReportPrompt: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  isSending: boolean;
  isEditingReport: boolean;
  setIsEditingReport: (editing: boolean) => void;
  generatedReport: string;
  setGeneratedReport: (report: string) => void;
  recipientEmail: string;
  setRecipientEmail: (email: string) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setView: (view: ViewState) => void;
  navigateToCreateTrip: (source: ViewState) => void;
  handleGenerateReport: (prompt?: string) => void;
  handleAiScheduleAction: () => void;
  handleSaveAndBack: () => void;
  handleExportToWord: () => void;
  handleShareReport: () => void;
  handleSendReport: () => void;
  renderMarkdown: (text: string) => string;
  setNotification: (notif: { message: string; type: 'success' | 'error' } | null) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  t,
  language,
  activeTrip,
  allTrips,
  reportPrompt,
  setReportPrompt,
  loading,
  isSending,
  isEditingReport,
  setIsEditingReport,
  generatedReport,
  setGeneratedReport,
  recipientEmail,
  setRecipientEmail,
  setActiveTrip,
  setView,
  navigateToCreateTrip,
  handleGenerateReport,
  handleAiScheduleAction,
  handleSaveAndBack,
  handleExportToWord,
  handleShareReport,
  handleSendReport,
  renderMarkdown,
  setNotification,
}) => {
  if (!activeTrip) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setView(ViewState.HOME)} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
          </button>
          <h2 className="text-lg font-bold dark:text-gray-100">{t.report_preview}</h2>
          <div className="w-8"></div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh] space-y-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-brand-orange dark:text-brand-orange rounded-full">
            <IconFileText className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {language === 'ja' ? '日報作成用の出張選択' : '일보작성용 출장 선택'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {language === 'ja' 
              ? '報告書を作成する出張計画を選択してください。' 
              : '보고서를 생성할 출장 계획을 선택하여 계속하세요.'}
          </p>
          
          {allTrips.length > 0 ? (
            <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto p-1 text-left">
              {allTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => {
                    setActiveTrip(trip);
                    handleGenerateReport();
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
            onClick={() => navigateToCreateTrip(ViewState.REPORT)}
            className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            <span>{t.btn_new_trip}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={handleSaveAndBack} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <IconChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
        </button>
        <h2 className="text-lg font-bold dark:text-gray-100">{t.report_preview}</h2>
        <div className="w-8"></div>
      </div>

      {/* AI Prompt & Automation Section */}
      <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/60 rounded-2xl p-4 space-y-3 shadow-sm transition-all duration-200">
        <div className="flex items-center space-x-2 text-brand-orange dark:text-brand-orange font-bold text-sm">
          <IconBot className="w-5 h-5 text-brand-orange" />
          <span>{language === 'ja' ? 'AI 日報・スケジュール自動化' : 'AI 일보 작성 및 출장 일정 자동화'}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {language === 'ja'
            ? '指示を入力して、日報にカスタム内容を反映したり、旅行スケジュールを自動的に調整/作成することができます。'
            : '원하시는 요청사항이나 세부 내용을 입력하여 일보를 맞춤형으로 작성하거나, 출장 일정을 자동으로 조정/추가하실 수 있습니다.'}
        </p>
        
        <div className="relative">
          <textarea
            value={reportPrompt}
            onChange={(e) => setReportPrompt(e.target.value)}
            placeholder={language === 'ja'
              ? '例: "今日の取引先ミーティングで追加契約案を議論した内容を強調して日報を作成し、明日の午後3時にB社訪問日程を追加して。"'
              : '예: "오늘 미팅에서 추가 계약 안건을 심도 있게 논의함 등의 내용을 반영해서 일보를 재생성해주고, 내일 오후 3시에는 B사 방문 일정을 새로 등록해줘."'}
            className="w-full text-xs text-gray-800 dark:text-gray-100 p-3 pb-9 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 resize-none h-20 leading-relaxed"
          />
          <button
            onClick={async () => {
              const windowRef = window as any;
              const SpeechRecognition = windowRef.SpeechRecognition || windowRef.webkitSpeechRecognition;
              if (!SpeechRecognition) {
                alert(language === 'ja' ? 'お使いのブラウザは音声認識をサポートしていません。' : '음성 인식을 지원하지 않는 브라우저입니다.');
                return;
              }
              const rec = new SpeechRecognition();
              rec.lang = language === 'ja' ? 'ja-JP' : 'ko-KR';
              rec.onstart = () => {
                setNotification({
                  message: language === 'ja' ? '音声入力受付中...' : '음성 인식 대기 중...',
                  type: 'success'
                });
              };
              rec.onresult = (e: any) => {
                const transcript = e.results[0][0].transcript;
                setReportPrompt(prev => prev ? prev + " " + transcript : transcript);
              };
              rec.onerror = () => {
                alert(language === 'ja' ? '音声認識エラーが発生しました。' : '음성 인식 오류가 발생했습니다.');
              };
              rec.start();
            }}
            className="absolute right-2.5 bottom-2 text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange p-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50 transition-colors"
            title="Speech to text"
          >
            <IconMic className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleGenerateReport(reportPrompt)}
            disabled={loading || !reportPrompt.trim()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900/40 text-brand-orange dark:text-brand-orange font-bold rounded-xl text-xs shadow-sm hover:bg-orange-50 dark:hover:bg-orange-950/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            <IconFileText className="w-3.5 h-3.5 text-brand-orange" />
            <span>{language === 'ja' ? '📝 AI 日報自動作成' : '📝 AI 일보 자동 작성'}</span>
          </button>
          <button
            onClick={handleAiScheduleAction}
            disabled={loading || !reportPrompt.trim()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-orange text-white font-bold rounded-xl text-xs shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            <IconCalendar className="w-3.5 h-3.5 text-orange-100" />
            <span>{language === 'ja' ? '🗓️ AI 日程自動調整' : '🗓️ AI 일정 자동 조정'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange dark:border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{isSending ? t.report_sending : t.report_loading}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center">
              <IconZap className="w-3 h-3 mr-1 text-yellow-500" />
              {t.report_ai_badge}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditingReport(!isEditingReport)}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 transition-colors"
              >
                {isEditingReport ? <IconCheckCircle className="w-4 h-4 text-green-500" /> : <IconEdit className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleGenerateReport()} 
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 transition-colors"
                title={t.btn_regenerate}
              >
                <IconZap className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {isEditingReport ? (
              <textarea 
                className="w-full h-96 text-sm text-gray-700 dark:text-gray-300 leading-relaxed p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 bg-white dark:bg-gray-700 outline-none"
                value={generatedReport}
                onChange={(e) => setGeneratedReport(e.target.value)}
              />
            ) : (
              <div 
                className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedReport) }}
              />
            )}
          </div>
          {/* Email and Submit Section */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t.label_email}</label>
              <input 
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 focus:border-brand-orange dark:focus:border-brand-orange outline-none text-sm"
                placeholder={t.placeholder_email}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={handleExportToWord}
                className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
              >
                <IconFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {language === 'ja' ? 'Wordに出力' : 'Word로 내보내기'}
              </button>
              <button 
                onClick={handleShareReport}
                className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-bold py-3 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4 fill-current text-[#191919]" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.531-.777 2.947-.118.503.193.497.402.357.164-.109 2.62-1.78 3.674-2.499.462.083.939.126 1.431.126 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                {language === 'ko' ? '카카오톡 공유' : 'KakaoTalk共有'}
              </button>
              <button 
                onClick={handleSendReport}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
              >
                <IconSend className="w-4 h-4" />
                {t.btn_submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
