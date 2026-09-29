import { PasswordLogin } from './components/PasswordLogin';
import { CompanyMembership } from './components/CompanyMembership';
import { ExpenseReview, ExpenseDraft } from './components/ExpenseReview';
import { assertDate, assertTripDates, normalizeItinerary } from './services/tripValidation';
import { createReportDocx } from './services/reportExport';
import React, { useState, useEffect, useRef } from 'react';
import { Trip, ViewState, Coordinate, CheckInRecord, Expense, ItineraryItem, User, TripSummary } from './types';
import { getCurrentPosition, calculateDistance, geocodeAddress } from './services/locationService';
import { analyzeReceiptImage, generateTripReport, adjustTripItinerary } from './services/geminiService';
import {
  ApiError, fetchHealth, fetchExchangeRate, fetchUsers,
  fetchTrips, fetchTripById, createTrip, fetchTripSummary, updateTrip, deleteTrip, sendReportEmail, sanitizeString, fetchSessionUser, updateMembership, updateProfile, endSession,
  fetchCheckIns, createCheckIn, fetchExpenses, createExpense, deleteExpense
} from './services/apiService';

import {
  IconCheckCircle, IconXCircle, Icon1BLogo, IconZap, IconBot, IconX, IconMic
} from './components/Icons';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AIChatModal } from './components/AIChatModal';
import { TutorialModal, HelpModal } from './components/Modals';
import { HomeView } from './components/views/HomeView';
import { ScheduleView } from './components/views/ScheduleView';
import { ReportView } from './components/views/ReportView';
import { SettingsView } from './components/views/SettingsView';
import { AdminView } from './components/views/AdminView';
import { ScannerView } from './components/views/ScannerView';
import { CreateTripView } from './components/views/CreateTripView';

// --- Translations ---
type Lang = 'ja' | 'ko';

const TRANSLATIONS = {
  ja: {
    status_label: "現在のステータス",
    status_active: "出張中 (Active)",
    status_inactive: "出張予定なし",
    btn_checkin: "手動チェックイン",
    btn_expense: "経費入力",
    history_title: "最近の活動履歴",
    history_subtitle: "History",
    no_history: "まだ活動記録がありません",
    btn_create_report: "日報作成 (AI)",
    trip_schedule_title: "訪問スケジュール",
    trip_schedule_hint: "現地に到着すると自動でチェックインされます",
    btn_checkin_here: "手動チェックイン",
    locating: "測位中...",
    scan_title: "レシートをスキャン",
    scan_desc: "カメラでレシートを撮影するか、画像を選択してください。AIが自動で内容を読み取ります。",
    btn_camera: "カメラを起動",
    btn_upload: "アルバムから選択",
    analyzing: "解析中... (Analyzing)",
    report_preview: "出張日報プレビュー",
    report_ai_badge: "AI Generated",
    report_loading: "レポート作成中...",
    report_sending: "送信中...",
    report_failed: "レポートを生成できませんでした。",
    btn_regenerate: "再生成",
    btn_submit: "メールで提出 (Submit)",
    btn_edit: "編集",
    btn_done: "完了",
    nav_home: "ホーム",
    nav_schedule: "日程",
    nav_report: "日報",
    nav_settings: "設定",
    error_loc_perm: "位置情報を取得できません。権限を確認してください。",
    error_loc_fetch: "現在地を取得できませんでした。",
    msg_checkin_ok: "✅ {name}にチェックインしました",
    msg_checkin_warn: "⚠️ {name}から離れていますが、記録しました。",
    msg_receipt_fail: "レシート解析に失敗しました。もう一度お試しください。",
    msg_img_fail: "画像の読み込みに失敗しました。",
    debug_gps: "GPS:",
    status_checked_in: "チェックイン済み:",
    auto_checkin_active: "自動チェックイン有効",
    auto_checkin_desc: "目的地付近(50m以内)で自動記録",
    toast_auto_checkin: "📍 自動チェックイン完了: {name}",
    btn_checkout: "チェックアウト",
    status_checked_out: "チェックアウト:",
    msg_checkout_ok: "👋 {name}からチェックアウトしました",
    title_create_trip: "新規出張計画",
    label_trip_title: "出張名",
    label_destination: "行き先",
    label_start_date: "開始日",
    label_end_date: "終了日",
    label_trip_purpose: "出張の目的",
    btn_save_trip: "日程作成完了",
    section_upcoming: "今後の出張予定",
    msg_trip_created: "新しい出張計画を作成しました",
    btn_new_trip: "新規作成",
    msg_fill_all: "すべての項目を入力してください",
    confirm_delete_trip: "この出張計画を削除してもよろしいですか？",
    msg_trip_deleted: "出張計画を削除しました",
    confirm_delete_itinerary: "この日程を削除してもよろしいですか？",
    msg_itinerary_deleted: "日程を削除しました",
    msg_no_trip_selected: "出張が選択されていません",
    msg_create_first_trip: "新しい出張計画を作成してください",
    quick_booking: "クイック予約",
    quick_flight: "新幹線 / 航空券",
    quick_hotel: "ビジネスホテル",
    quick_meeting: "会議室・ミーティング",
    quick_trans: "現地交通・レンタカー",
    explore_destinations: "人気出張先",
    recent_activity_title: "最近の活動フィード",
    tab_list: "リスト",
    tab_map: "マップ",
    btn_navigate: "経路案内",
    btn_cancel: "キャンセル",
    btn_save: "保存",
    label_location_name: "場所名",
    label_address: "住所",
    label_time: "時間",
    label_email: "送信先メールアドレス",
    placeholder_email: "manager@company.com",
    msg_email_sent: "日報を送信しました: {email}",
    error_email_required: "メールアドレスを入力してください",
    company_code_title: "会社コード",
    company_code_desc: "管理者が発行した会社コードを入力してください。",
    btn_join_company: "参加する",
    msg_company_joined: "会社に参加しました",
    admin_company_code: "会社識別コード:",
    chart_title: "経費内訳",
    chart_total: "合計",
    ai_bot_title: "AIアシスタント",
    ai_bot_placeholder: "「明日から東京に出張します...」",
    ai_bot_listening: "音声入力中...",
    ai_bot_processing: "AIがスケジュールを作成しています...",
    ai_bot_success: "スケジュールを作成しました！",
    ai_bot_error: "スケジュールの作成に失敗しました。",
    wake_word_enable: "音声ウェイクアップ",
    wake_word_listening: "音声入力中",
    theme_title: "テーマ設定",
    theme_light: "ライトモード",
    theme_dark: "ダークモード",
    nfc_title: "NFC チェックアウト認証",
    nfc_waiting: "デバイスの背面をNFCタグに近づけてください。",
    nfc_success: "NFC認証が完了しました！",
    nfc_error: "NFCの読み取りに失敗しました。再試行してください。",
    nfc_gps_warning: "目的地から離れています（現在距離: {dist}m）。50m以内にいる必要があります。",
    nfc_unsupported: "このデバイス/ブラウザはWeb NFCをサポートしていません。",
    btn_manual_checkout: "手動チェックアウト",
    btn_nfc_checkout: "NFCチェックアウト",
    status_manual_checked_out: "手動完了",
    status_nfc_checked_out: "NFC完了",
    nfc_key_error: "無効なNFCキーです: {key}"
  },
  ko: {
    status_label: "현재 상태",
    status_active: "출장 중 (Active)",
    status_inactive: "출장 일정 없음",
    btn_checkin: "수동 체크인",
    btn_expense: "경비 입력",
    history_title: "최근 활동 내역",
    history_subtitle: "History",
    no_history: "아직 활동 기록이 없습니다",
    btn_create_report: "일보 작성 (AI)",
    trip_schedule_title: "방문 일정",
    trip_schedule_hint: "현지에 도착하면 자동으로 체크인됩니다",
    btn_checkin_here: "수동 체크인",
    locating: "위치 확인 중...",
    scan_title: "영수증 스캔",
    scan_desc: "카메라로 영수증을 찍거나 이미지를 선택하세요. AI가 자동으로 내용을 읽어옵니다.",
    btn_camera: "카메라 실행",
    btn_upload: "앨범에서 선택",
    analyzing: "분석 중... (Analyzing)",
    report_preview: "출장 일보 미리보기",
    report_ai_badge: "AI 생성됨",
    report_loading: "리포트 작성 중...",
    report_sending: "전송 중...",
    report_failed: "리포트를 생성할 수 없습니다.",
    btn_regenerate: "재생성",
    btn_submit: "메일로 제출 (Submit)",
    btn_edit: "편집",
    btn_done: "완료",
    nav_home: "홈",
    nav_schedule: "일정",
    nav_report: "일보",
    nav_settings: "설정",
    error_loc_perm: "위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.",
    error_loc_fetch: "현재 위치를 가져올 수 없습니다.",
    msg_checkin_ok: "✅ {name}에 체크인했습니다",
    msg_checkin_warn: "⚠️ {name}에서 떨어져 있지만 기록했습니다.",
    msg_receipt_fail: "영수증 분석에 실패했습니다. 다시 시도해주세요.",
    msg_img_fail: "이미지를 불러오는데 실패했습니다.",
    debug_gps: "GPS:",
    status_checked_in: "체크인 완료:",
    auto_checkin_active: "자동 체크인 활성",
    auto_checkin_desc: "목적지 부근(50m 이내) 자동 기록",
    toast_auto_checkin: "📍 자동 체크인 완료: {name}",
    btn_checkout: "체크아웃",
    status_checked_out: "체크아웃:",
    msg_checkout_ok: "👋 {name}에서 체크아웃했습니다",
    title_create_trip: "새 출장 계획",
    label_trip_title: "출장명",
    label_destination: "목적지",
    label_start_date: "시작일",
    label_end_date: "종료일",
    label_trip_purpose: "출장 목적",
    btn_save_trip: "일정 작성완료",
    section_upcoming: "예정된 출장",
    msg_trip_created: "새 출장 계획이 생성되었습니다",
    btn_new_trip: "새로 만들기",
    msg_fill_all: "모든 항목을 입력해주세요",
    confirm_delete_trip: "이 출장 계획을 삭제하시겠습니까?",
    msg_trip_deleted: "출장 계획이 삭제되었습니다",
    confirm_delete_itinerary: "이 일정을 삭제하시겠습니까?",
    msg_itinerary_deleted: "일정이 삭제되었습니다",
    msg_no_trip_selected: "선택된 출장이 없습니다",
    msg_create_first_trip: "새로운 출장 계획을 만들어보세요",
    quick_booking: "빠른 예약",
    quick_flight: "신칸센 / 항공권",
    quick_hotel: "비즈니스 호텔",
    quick_meeting: "회의실 · 미팅룸",
    quick_trans: "현지 교통 · 렌터카",
    explore_destinations: "인기 출장지",
    recent_activity_title: "최근 활동 기록",
    tab_list: "목록",
    tab_map: "지도",
    btn_navigate: "길찾기",
    btn_cancel: "취소",
    btn_save: "저장",
    label_location_name: "장소명",
    label_address: "주소",
    label_time: "시간",
    label_email: "수신 이메일 주소",
    placeholder_email: "manager@company.com",
    msg_email_sent: "일보를 전송했습니다: {email}",
    error_email_required: "이메일 주소를 입력해주세요",
    company_code_title: "회사 코드",
    company_code_desc: "관리자가 발급한 회사 코드를 입력해주세요.",
    btn_join_company: "참여하기",
    msg_company_joined: "회사에 참여했습니다",
    admin_company_code: "회사 식별 코드:",
    chart_title: "경비 내역",
    chart_total: "합계",
    ai_bot_title: "AI 어시스턴트",
    ai_bot_placeholder: "「내일 도쿄로 2박 3일 출장갑니다...」",
    ai_bot_listening: "음성 입력 중...",
    ai_bot_processing: "AI가 일정을 작성하고 있습니다...",
    ai_bot_success: "일정이 작성되었습니다!",
    ai_bot_error: "일정 작성에 실패했습니다.",
    wake_word_enable: "음성 호출",
    wake_word_listening: "음성 입력 중",
    theme_title: "테마 설정",
    theme_light: "라이트 모드",
    theme_dark: "다크 모드",
    nfc_title: "NFC 체크아웃 인증",
    nfc_waiting: "스마트폰 뒷면을 현장의 NFC 태그 스티커에 접촉해 주세요.",
    nfc_success: "NFC 물리 인증 성공!",
    nfc_error: "NFC 리딩 도중 오류가 발생했습니다. 다시 시도해 주세요.",
    nfc_gps_warning: "목적지에서 너무 멀리 떨어져 있습니다. (현재 거리: {dist}m, 제한: 50m)",
    nfc_unsupported: "이 브라우저/디바이스는 Web NFC 기능을 지원하지 않습니다.",
    btn_manual_checkout: "수동 체크아웃",
    btn_nfc_checkout: "NFC 체크아웃",
    status_manual_checked_out: "수동 완료",
    status_nfc_checked_out: "NFC 완료",
    nfc_key_error: "유효하지 않은 NFC 카드 키입니다. (인식된 키: {key})"
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-4 right-4 z-[9999] p-4 rounded-xl shadow-lg flex items-center space-x-3 transition-all transform translate-y-0 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
      }`}>
      {type === 'success' ? <IconCheckCircle className="w-6 h-6" /> : <IconXCircle className="w-6 h-6" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

const formatTripForSharing = (trip: Trip, lang: Lang): string => {
  const isKo = lang === 'ko';
  let text = isKo
    ? `[O1BO 출장 일정] ${trip.title}\n`
    : `[O1BO 出張日程] ${trip.title}\n`;
  text += isKo
    ? `📍 목적지: ${trip.destination}\n`
    : `📍 目的地: ${trip.destination}\n`;
  text += isKo
    ? `📅 기간: ${trip.startDate} ~ ${trip.endDate}\n`
    : `📅 期間: ${trip.startDate} ~ ${trip.endDate}\n`;
  if (trip.purpose) {
    text += isKo
      ? `🎯 목적: ${trip.purpose}\n`
      : `🎯 目的: ${trip.purpose}\n`;
  }
  text += `\n${isKo ? '--- 상세 일정 ---' : '--- 詳細日程 ---'}\n`;

  if (trip.itinerary && trip.itinerary.length > 0) {
    const sortedItinerary = [...trip.itinerary].sort((a, b) => {
      const dateA = a.date || trip.startDate;
      const dateB = b.date || trip.startDate;
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    sortedItinerary.forEach((item, idx) => {
      const dateStr = item.date ? `${item.date} ` : '';
      text += `${idx + 1}. [${dateStr}${item.scheduledTime}] ${item.locationName}\n   (${item.address})\n`;
    });
  } else {
    text += isKo ? '상세 일정이 없습니다.\n' : '詳細日程がありません。\n';
  }

  return text;
};

const App: React.FC = () => {
  // Auth State
  const [authUser, setAuthUser] = useState<{ uid: string; email: string; displayName?: string } | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // State
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [language, setLanguage] = useState<Lang>(() => localStorage.getItem('o1bo_language') === 'ja' ? 'ja' : 'ko');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('o1bo_theme') === 'dark' ? 'dark' : 'light');

  // Multi-trip States
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripCreationSource, setTripCreationSource] = useState<ViewState | null>(null);

  // Team Sharing & Profile States
  const [teamTrips, setTeamTrips] = useState<Trip[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamCodeInput, setTeamCodeInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');

  // New Trip Form State
  const [newTripData, setNewTripData] = useState({
    title: '',
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    purpose: '',
    isSharedWithTeam: true
  });

  // Check-ins & Expenses
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft | null>(null);

  // Admin Dashboard States
  const [adminTrips, setAdminTrips] = useState<Trip[]>([]);
  const [adminCheckIns, setAdminCheckIns] = useState<CheckInRecord[]>([]);
  const [adminExpenses, setAdminExpenses] = useState<Expense[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Record<string, User>>({});

  // Form Inputs
  const [recipientEmail, setRecipientEmail] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [reportPrompt, setReportPrompt] = useState<string>('');
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);

  // Modals & Navigation Controls
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');

  // Date Range Filter & Map View States
  const [durationFilter, setDurationFilter] = useState<'all' | '1day' | '1week' | '1month' | 'custom'>('all');
  const [customFilterStart, setCustomFilterStart] = useState<string>('');
  const [customFilterEnd, setCustomFilterEnd] = useState<string>('');
  const [showDateFilterMenu, setShowDateFilterMenu] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());

  // Edit Itinerary Item States
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<Partial<ItineraryItem>>({});

  // NFC Verification States
  const [isNfcCheckoutEnabled, setIsNfcCheckoutEnabled] = useState<boolean>(() => {
    return localStorage.getItem('o1bo_nfc_checkout_enabled') === 'true';
  });
  const [nfcModal, setNfcModal] = useState<{
    show: boolean;
    itemId: string;
    item: ItineraryItem | null;
    distance: number;
    isChecking: boolean;
    status: 'idle' | 'scanning' | 'success' | 'error';
    errorMsg?: string;
  } | null>(null);

  // Voice Wake-Word State
  const [isListening, setIsListening] = useState(false);

  // Kakao Sharing App Key State
  const [kakaoAppKey, setKakaoAppKey] = useState(() => {
    return localStorage.getItem('o1bo_kakao_app_key') || '';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const nfcControllerRef = useRef<AbortController | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => { localStorage.setItem('o1bo_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('o1bo_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('o1bo_nfc_checkout_enabled', String(isNfcCheckoutEnabled)); }, [isNfcCheckoutEnabled]);
  useEffect(() => { localStorage.setItem('o1bo_kakao_app_key', kakaoAppKey); }, [kakaoAppKey]);
  useEffect(() => {
    if (userData) {
      localStorage.setItem('o1bo_current_user', JSON.stringify(userData));

    }
  }, [userData]);

  useEffect(() => {
    if (!nfcModal?.show) nfcControllerRef.current?.abort();
    return () => { nfcControllerRef.current?.abort(); };
  }, [nfcModal?.show]);
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  // Sync profile name to input
  useEffect(() => {
    if (userData?.name) {
      setUserNameInput(userData.name);
    }
  }, [userData?.name]);

  // Helper date normalization
  const normalizeDateStr = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const match = dateStr.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch { }
    return dateStr;
  };

  const addDaysToDateString = (dateStr: string, days: number): string => {
    try {
      const normalized = normalizeDateStr(dateStr);
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  // Server session is the only source of identity; never restore a local test account.
  useEffect(() => {
    let cancelled = false;
    const initAuthSession = async () => {
      localStorage.removeItem('is_local_guest');
      localStorage.removeItem('o1bo_current_user');
      try {
        const user = await fetchSessionUser();
        if (cancelled) return;
        setAuthUser({ uid: user.uid, email: user.email, displayName: user.name });
        setUserData(user);
      } catch (error) {
        if (cancelled) return;
        setAuthUser(null);
        setUserData(null);
        if (!(error instanceof ApiError && error.status === 401)) {
          setNotification({ message: error instanceof Error ? error.message : '서버 연결을 확인해 주세요.', type: 'error' });
        }
      } finally {
        if (!cancelled) setIsAuthReady(true);
      }
    };
    initAuthSession();
    return () => { cancelled = true; };
  }, []);

  // Kakao SDK Init
  useEffect(() => {
    if (kakaoAppKey && typeof window !== 'undefined') {
      const windowRef = window as any;
      if (!windowRef.Kakao) {
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
        script.integrity = 'sha384-TiGlNWd3eM4tZOFy2a65f9Yj5V9+sC3C6fJz9k3jN19Hj3Hj3Hj3Hj3Hj3Hj3Hj3';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          if (windowRef.Kakao && !windowRef.Kakao.isInitialized()) {
            try {
              windowRef.Kakao.init(kakaoAppKey);
            } catch (_) { }
          }
        };
        document.head.appendChild(script);
      } else if (!windowRef.Kakao.isInitialized()) {
        try {
          windowRef.Kakao.init(kakaoAppKey);
        } catch (_) { }
      }
    }
  }, [kakaoAppKey]);

  // REST API Sync Effect: Load data from REST API backend
  useEffect(() => {
    setAiChatInput(''); setShowAIChat(false);
    recognitionRef.current?.stop();
    setAllTrips([]); setActiveTrip(null); setCheckIns([]); setExpenses([]);
    setTeamTrips([]); setTeamMembers([]); setCompanyUsers({});
    setAdminTrips([]); setAdminCheckIns([]); setAdminExpenses([]);
    if (!authUser || !userData?.companyCode) return;

    let isMounted = true;

    const loadRestApiData = async () => {
      try {
        const companyCode = userData?.companyCode;
        const [visibleTrips, users, apiCheckIns, apiExpenses] = await Promise.all([
          fetchTrips(), fetchUsers(), fetchCheckIns({ userId: authUser.uid }), fetchExpenses({ userId: authUser.uid })
        ]);
        if (!isMounted) return;
        const usersById = Object.fromEntries(users.map(user => [user.uid, user]));
        const trips = visibleTrips.map(trip => ({ ...trip, userName: usersById[trip.userId]?.name, userEmail: usersById[trip.userId]?.email }));
        const ownTrips = trips.filter(trip => trip.userId === authUser.uid);
        setAllTrips(ownTrips);
        setActiveTrip(previous => ownTrips.find(trip => trip.id === previous?.id) || ownTrips[0] || null);
        setCheckIns(apiCheckIns);
        setExpenses(apiExpenses);
        setTeamMembers(userData?.teamCode ? users.filter(user => user.teamCode === userData.teamCode) : []);
        setTeamTrips(userData?.role === 'admin' ? trips.filter(trip => trip.userId !== authUser.uid) : []);
        if (userData?.role === 'admin' && companyCode) {
          const [records, companyExpenses] = await Promise.all([
            fetchCheckIns({ companyCode }), fetchExpenses({ companyCode })
          ]);
          if (!isMounted) return;
          setCompanyUsers(usersById);
          setAdminTrips(trips);
          setAdminCheckIns(records);
          setAdminExpenses(companyExpenses);
        } else {
          setCompanyUsers({}); setAdminTrips([]); setAdminCheckIns([]); setAdminExpenses([]);
        }
      } catch (error) {
        if (isMounted) setNotification({ message: error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.', type: 'error' });
      }
    };

    loadRestApiData();

    return () => { isMounted = false; };
  }, [authUser?.uid, userData?.role, userData?.companyCode, userData?.teamCode]);



  useEffect(() => { setGeneratedReport(activeTrip?.report || ''); }, [activeTrip?.id]);

  // Handlers & Logic
  const handleLogout = async () => {
    {
      try { await endSession(); } catch {
        setNotification({ message: '서버 로그아웃에 실패했습니다. 다시 시도해 주세요.', type: 'error' });
        return;
      }
    }
    localStorage.removeItem('is_local_guest');
    localStorage.removeItem('o1bo_current_user');
    setAuthUser(null);
    setUserData(null);
    setAllTrips([]);
    setCheckIns([]);
    setExpenses([]);
    setActiveTrip(null);
    setTeamTrips([]); setTeamMembers([]); setCompanyUsers({});
    setAdminTrips([]); setAdminCheckIns([]); setAdminExpenses([]);
    setGeneratedReport('');
    setView(ViewState.HOME);
  };

  // Nickname Save Handler
  const handleSaveNickname = async () => {
    if (!authUser || !userNameInput.trim()) return;
    const newName = userNameInput.trim();
    setLoading(true);

    try {
      {
        const saved = await updateProfile(newName);
        setUserData(saved);
      }

      setNotification({ message: `👤 닉네임이 [${newName}] (으)로 변경되었습니다.`, type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '닉네임 변경 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Team Code Generator & Join Handlers
  const handleGenerateTeamCode = async () => {
    if (!authUser) return;
    {
      try {
        const saved = await updateMembership('/teams');
        setUserData(saved);
        setNotification({ message: `팀 코드가 생성되었습니다: ${saved.teamCode}`, type: 'success' });
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : '팀 생성 실패', type: 'error' });
      }
    }
  };

  const handleManualCheckIn = async (itemId: string) => {
    if (!authUser || !activeTrip) return;
    const targetItem = activeTrip.itinerary.find(i => i.id === itemId);
    if (!targetItem) return;

    try {
      const coords = await getCurrentPosition();
      const dist = calculateDistance(coords, targetItem.coords);

      // REST API call: POST /api/check-ins
      const newRecord = await (createCheckIn({
        userId: authUser.uid,
        tripId: activeTrip.id,
        locationName: targetItem.locationName,
        lat: coords.latitude,
        lng: coords.longitude,
        typeVal: 'check-in',
        verified: dist <= 50,
        itineraryItemId: itemId,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'COMP01',
      }));

      const next = [newRecord, ...checkIns];
      setCheckIns(next);


      setNotification({
        message: dist <= 50 ? t.msg_checkin_ok.replace('{name}', targetItem.locationName) : t.msg_checkin_warn.replace('{name}', targetItem.locationName),
        type: 'success'
      });
    } catch (err: any) {
      setNotification({ message: err.message || '체크인 도중 오류가 발생했습니다.', type: 'error' });
    }
  };

  const handleManualCheckOut = async (itemId: string) => {
    if (!authUser || !activeTrip) return;
    const targetItem = activeTrip.itinerary.find(i => i.id === itemId);
    if (!targetItem) return;

    try {
      const coords = await getCurrentPosition();
      const newRecord = await (createCheckIn({
        userId: authUser.uid,
        tripId: activeTrip.id,
        locationName: targetItem.locationName,
        lat: coords.latitude,
        lng: coords.longitude,
        typeVal: 'check-out',
        verified: false,
        itineraryItemId: itemId,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'COMP01',
        nfcTagId: 'manual'
      }));

      const next = [newRecord, ...checkIns];
      setCheckIns(next);


      setNotification({ message: t.msg_checkout_ok.replace('{name}', targetItem.locationName), type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '수동 체크아웃 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  const handleCheckOut = (itemId: string) => {
    if (!activeTrip) return;
    const item = activeTrip.itinerary.find(i => i.id === itemId);
    if (!item) return;

    setNfcModal({
      show: true,
      itemId,
      item,
      distance: 0,
      isChecking: true,
      status: 'idle'
    });

    getCurrentPosition().then(pos => {
      const dist = calculateDistance(pos, item.coords);
      setNfcModal(prev => prev ? { ...prev, distance: Math.round(dist), isChecking: false } : null);
    }).catch(() => {
      setNfcModal(prev => prev ? { ...prev, distance: Infinity, isChecking: false, status: 'error', errorMsg: '현재 위치를 확인하지 못했습니다. 위치 권한을 확인한 뒤 다시 시도해 주세요.' } : null);
    });
  };

  const startNfcScanning = async () => {
    if (!nfcModal || !nfcModal.item || nfcModal.isChecking || nfcModal.distance > 50) return;

    if (!('NDEFReader' in window)) {
      setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: t.nfc_unsupported } : null);
      return;
    }

    try {
      setNfcModal(prev => prev ? { ...prev, status: 'scanning' } : null);
      const ndef = new (window as any).NDEFReader();
      nfcControllerRef.current?.abort();
      const controller = new AbortController();
      nfcControllerRef.current = controller;
      await ndef.scan({ signal: controller.signal });

      ndef.onreading = async (event: any) => {
        const serialNumber = event.serialNumber;
        if (!serialNumber) {
          setNfcModal(previous => previous ? { ...previous, status: 'error', errorMsg: 'NFC 태그 식별자를 읽지 못했습니다.' } : null);
          return;
        }
        controller.abort();
        await completeNfcCheckOut(serialNumber);
      };

      ndef.onreadingerror = () => {
        setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: t.nfc_error } : null);
      };
    } catch (err: any) {
      setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: err.message || t.nfc_error } : null);
    }
  };

  const completeNfcCheckOut = async (serialNumber: string) => {
    if (!nfcModal || !nfcModal.item || !authUser || !activeTrip) return;

    try {
      const coords = await getCurrentPosition();
      if (calculateDistance(coords, nfcModal.item.coords) > 50) throw new Error('현장에서 50m 이내일 때 체크아웃할 수 있습니다.');
      // Server must verify registered tags and recompute the distance.
      const newRecord = await (createCheckIn({
        userId: authUser.uid,
        tripId: activeTrip.id,
        locationName: nfcModal.item.locationName,
        lat: coords.latitude,
        lng: coords.longitude,
        typeVal: 'check-out',
        verified: false,
        itineraryItemId: nfcModal.itemId,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'COMP01',
        nfcTagId: serialNumber
      }));

      const next = [newRecord, ...checkIns];
      setCheckIns(next);


      setNfcModal(prev => prev ? { ...prev, status: 'success' } : null);
      setNotification({ message: t.msg_checkout_ok.replace('{name}', nfcModal.item!.locationName), type: 'success' });
      setTimeout(() => setNfcModal(null), 1500);
    } catch (err: any) {
      setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: err.message } : null);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!authUser || !activeTrip) {
      setNotification({ message: t.msg_no_trip_selected, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('10MB 이하 이미지를 선택해 주세요.');
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
        throw new Error('지원되는 영수증 이미지 파일을 선택해 주세요.');
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(t.msg_img_fail));
        reader.onabort = () => reject(new Error(t.msg_img_fail));
        reader.readAsDataURL(file);
      });
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) throw new Error(t.msg_img_fail);

      const analysis = await analyzeReceiptImage(base64Data, file.type);
      if (!analysis || !analysis.merchant || !Number.isFinite(analysis.amount) || analysis.amount < 0) {
        throw new Error(t.msg_receipt_fail);
      }
      if (analysis.currency !== 'JPY') throw new Error('현재 JPY 영수증만 지원합니다. 다른 통화를 엔화로 저장할 수 없습니다.');
      setExpenseDraft({ tripId: activeTrip.id, merchant: analysis.merchant, amount: String(analysis.amount), date: analysis.date || '', category: ['Meals', 'Transport', 'Hotel', 'Other'].includes(analysis.category) ? analysis.category : 'Other', currency: 'JPY', preview: dataUrl });
      setLoading(false);
    } catch (err: any) {
      setNotification({ message: err.message || t.msg_receipt_fail, type: 'error' });
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseDraft || !authUser || loading) return;
    setLoading(true);
    try {
      const trip = allTrips.find(item => item.id === expenseDraft.tripId);
      if (!trip) throw new Error('경비를 등록할 출장을 찾을 수 없습니다.');
      assertDate(expenseDraft.date);
      const amount = Number(expenseDraft.amount);
      if (!expenseDraft.merchant.trim() || !expenseDraft.amount.trim() || !Number.isSafeInteger(amount) || amount < 0) throw new Error('가맹점과 엔화 금액을 확인해 주세요.');
      const expense: Expense = { id: crypto.randomUUID(), userId: authUser.uid, tripId: trip.id, date: expenseDraft.date, merchant: expenseDraft.merchant.trim(), amount, category: expenseDraft.category, companyCode: trip.companyCode };
      const saved = await createExpense({ ...expense, expenseDate: expense.date });
      const next = [saved, ...expenses];

      setExpenses(next);
      setExpenseDraft(null);
      setNotification({ message: language === 'ja' ? '経費を保存しました。' : '경비를 저장했습니다.', type: 'success' });
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : '경비 저장 실패', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleDeleteExpense = async (id: string) => {
    if (loading || !window.confirm(language === 'ja' ? 'この経費を削除しますか？' : '이 경비를 삭제할까요?')) return;
    setLoading(true);
    try {
      if (!await deleteExpense(id)) throw new Error('경비 삭제 결과를 확인하지 못했습니다.');
      const next = expenses.filter(expense => expense.id !== id);

      setExpenses(next);
      setNotification({ message: language === 'ja' ? '経費を削除しました。' : '경비를 삭제했습니다.', type: 'success' });
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : '경비 삭제 실패', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleManualExpense = () => {
    if (!activeTrip) return;
    setExpenseDraft({ tripId: activeTrip.id, merchant: '', amount: '', date: new Date().toISOString().slice(0, 10), category: 'Other', currency: 'JPY' });
  };

  const handleGenerateReport = async (customPrompt?: string) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const report = await generateTripReport(checkIns.filter(record => record.tripId === activeTrip.id), expenses.filter(expense => expense.tripId === activeTrip.id), language, activeTrip.itinerary, customPrompt);
      setGeneratedReport(report);
      setView(ViewState.REPORT);
    } catch (err: any) {
      setNotification({ message: t.report_failed, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAiScheduleAction = async () => {
    if (!activeTrip || !reportPrompt.trim()) return;
    setLoading(true);
    try {
      const adjusted = await adjustTripItinerary(activeTrip.itinerary, reportPrompt, activeTrip.startDate, activeTrip.endDate, language);
      const adjustedItinerary = await normalizeItinerary(adjusted, activeTrip.startDate, activeTrip.endDate, geocodeAddress);
      if (adjustedItinerary && adjustedItinerary.length > 0) {
        const updatedTrip = { ...activeTrip, itinerary: adjustedItinerary };
        {
          const savedTrip = await updateTrip(updatedTrip);
          setAllTrips(previous => previous.map(trip => trip.id === savedTrip.id ? savedTrip : trip));
          setActiveTrip(savedTrip);
        }
        setNotification({ message: '🗓️ AI 일정이 새로 조정되어 반영되었습니다.', type: 'success' });
        setReportPrompt('');
      } else {
        setNotification({ message: '일정 조정을 완료하지 못했습니다.', type: 'error' });
      }
    } catch (err: any) {
      setNotification({ message: err.message || '일정 조정 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShareTrip = (trip: Trip) => {
    const text = formatTripForSharing(trip, language);
    const windowRef = window as any;

    if (windowRef.Kakao && windowRef.Kakao.isInitialized() && windowRef.Kakao.Share) {
      try {
        windowRef.Kakao.Share.sendDefault({
          objectType: 'text',
          text: text,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
          buttonTitle: language === 'ko' ? 'O1BO 앱에서 보기' : 'O1BOアプリで見る'
        });
        setNotification({ message: language === 'ko' ? '카카오톡으로 일정을 공유합니다.' : 'KakaoTalkで日程を共有します。', type: 'success' });
        return;
      } catch (_) { }
    }

    navigator.clipboard.writeText(text).then(() => {
      setNotification({ message: language === 'ko' ? '출장 일정이 클립보드에 복사되었습니다.' : '出張日程がクリップボードにコピーされました。', type: 'success' });
    }).catch(() => {
      alert(text);
    });
  };

  const navigateToCreateTrip = (sourceView: ViewState) => {
    setTripCreationSource(sourceView);
    setView(ViewState.CREATE_TRIP);
  };

  const handleSaveTrip = async () => {
    if (!newTripData.title || !newTripData.destination || !newTripData.startDate || !newTripData.endDate) {
      setNotification({ message: t.msg_fill_all, type: 'error' });
      return;
    }

    if (!authUser || loading) return;
    setLoading(true);

    try {
      assertTripDates(newTripData.startDate, newTripData.endDate);
      const coords = await geocodeAddress(newTripData.destination);
      const itineraryItems: ItineraryItem[] = [
        {
          id: `item_${Date.now()}_1`,
          title: `${newTripData.destination} 도착 및 수속`,
          locationName: `${newTripData.destination} 도착 및 수속`,
          address: newTripData.destination,
          scheduledTime: '10:00',
          coords: coords,
          date: newTripData.startDate
        }
      ];

      const tripObj: Omit<Trip, 'id'> = {
        userId: authUser.uid,
        userName: userData?.name || authUser.displayName || '사용자',
        userEmail: authUser.email || '',
        companyCode: userData?.companyCode || 'DEFAULT',
        teamCode: userData?.teamCode || '',
        isSharedWithTeam: newTripData.isSharedWithTeam ?? true,
        title: newTripData.title,
        destination: newTripData.destination,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate,
        purpose: newTripData.purpose,
        status: 'ongoing',
        itinerary: itineraryItems
      };

      // REST API call: POST /api/trips
      const createdTrip = await (createTrip({
        userId: authUser.uid,
        title: newTripData.title,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate,
        destination: newTripData.destination,
        purpose: newTripData.purpose,
        itineraryJson: itineraryItems,
        companyCode: userData?.companyCode || 'COMP01',
        teamCode: userData?.teamCode || 'TEAM01',
        isSharedWithTeam: newTripData.isSharedWithTeam,
        status: 'upcoming'
      }));

      const next = [createdTrip, ...allTrips];
      setAllTrips(next);
      setActiveTrip(createdTrip);


      if (userData?.role === 'admin' && createdTrip.userId !== authUser.uid) {
        setTeamTrips(prev => [createdTrip, ...prev]);
      }

      setNotification({ message: t.msg_trip_created, type: 'success' });
      setNewTripData({
        title: '',
        destination: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        purpose: '',
        isSharedWithTeam: true
      });

      setView(tripCreationSource || ViewState.HOME);
    } catch (err: any) {
      setNotification({ message: err.message || '출장 생성 도중 오류가 발생했습니다.', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!window.confirm(t.confirm_delete_trip)) return;

    try {
      {
        await deleteTrip(tripId);
        const remaining = allTrips.filter(t => t.id !== tripId);
        setAllTrips(remaining);
        if (activeTrip?.id === tripId) {
          setActiveTrip(remaining.length > 0 ? remaining[0] : null);
        }
      }
      const nextRecords = checkIns.filter(record => record.tripId !== tripId);
      const nextExpenses = expenses.filter(expense => expense.tripId !== tripId);

      setCheckIns(nextRecords); setExpenses(nextExpenses);
      setTeamTrips(previous => previous.filter(trip => trip.id !== tripId));
      setNotification({ message: t.msg_trip_deleted, type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '출장 삭제 오류가 발생했습니다.', type: 'error' });
    }
  };

  const handleDeleteItineraryItem = async (itemId: string) => {
    if (!activeTrip) return;
    if (!window.confirm(t.confirm_delete_itinerary)) return;

    try {
      const updatedItinerary = activeTrip.itinerary.filter(item => item.id !== itemId);
      const updatedTrip = { ...activeTrip, itinerary: updatedItinerary };

      {
        const savedTrip = await updateTrip(updatedTrip);
        setAllTrips(previous => previous.map(trip => trip.id === savedTrip.id ? savedTrip : trip));
        setActiveTrip(savedTrip);
      }
      setNotification({ message: t.msg_itinerary_deleted, type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '일정 삭제 실패', type: 'error' });
    }
  };

  const handleEditClick = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setEditItemData({
      locationName: item.locationName,
      address: item.address,
      scheduledTime: item.scheduledTime,
      date: item.date || activeTrip?.startDate || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!activeTrip || !editingItemId) return;

    try {
      const updatedItinerary = await Promise.all(activeTrip.itinerary.map(async (item) => {
        if (item.id === editingItemId) {
          let coords = item.coords;
          if (editItemData.address && editItemData.address !== item.address) {
            coords = await geocodeAddress(editItemData.address);
          }
          return {
            ...item,
            locationName: editItemData.locationName || item.locationName,
            address: editItemData.address || item.address,
            scheduledTime: editItemData.scheduledTime || item.scheduledTime,
            date: editItemData.date || item.date,
            coords
          };
        }
        return item;
      }));

      const validated = await normalizeItinerary(updatedItinerary, activeTrip.startDate, activeTrip.endDate, geocodeAddress);
      const updatedTrip = { ...activeTrip, itinerary: validated };

      {
        const savedTrip = await updateTrip(updatedTrip);
        setAllTrips(previous => previous.map(trip => trip.id === savedTrip.id ? savedTrip : trip));
        setActiveTrip(savedTrip);
      }

      setEditingItemId(null);
      setEditItemData({});
      setNotification({ message: language === 'ja' ? '日程を更新しました' : '일정을 수정했습니다', type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '일정 수정 실패', type: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditItemData({});
  };

  const handleJoinTeam = async () => {
    if (!userData || !teamCodeInput.trim()) return;
    {
      try {
        const saved = await updateMembership('/teams/join', teamCodeInput.trim().toUpperCase());
        setUserData(saved); setTeamCodeInput('');
        setNotification({ message: '팀에 참여했습니다.', type: 'success' });
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : '팀 참여 실패', type: 'error' });
      }
      return;
    }
  };

  const handleCopyTeamCode = async () => {
    if (!userData?.teamCode) return;
    try {
      await navigator.clipboard.writeText(userData.teamCode);
      setNotification({ message: '팀 코드를 복사했습니다.', type: 'success' });
    } catch {
      setNotification({ message: '팀 코드를 복사하지 못했습니다.', type: 'error' });
    }
  };

  const handleShareTeamCodeKakao = async () => {
    if (!userData?.teamCode) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'O1BO 팀 코드', text: userData.teamCode });
      } else {
        await handleCopyTeamCode();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setNotification({ message: '팀 코드를 공유하지 못했습니다.', type: 'error' });
    }
  };

  const handleExportToWord = () => {
    if (!generatedReport) return;
    const blob = new Blob([createReportDocx(generatedReport)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrip?.title || 'Trip'}_Report_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification({ message: language === 'ja' ? 'Word文書をダウンロードしました。' : 'Word 문서로 내보내기 완료되었습니다.', type: 'success' });
  };

  const handleShareReport = () => {
    if (!generatedReport || !activeTrip) return;
    const text = `[O1BO AI 출장일보]\n\n📌 출장명: ${activeTrip.title}\n📅 기간: ${activeTrip.startDate} ~ ${activeTrip.endDate}\n\n${generatedReport.slice(0, 300)}...`;
    handleShareTrip({ ...activeTrip, purpose: text });
  };

  const handleSendReport = async () => {
    if (!recipientEmail.trim()) {
      setNotification({ message: t.error_email_required, type: 'error' });
      return;
    }
    if (!activeTrip || !generatedReport || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      setNotification({ message: '보고서와 올바른 이메일 주소를 확인해 주세요.', type: 'error' });
      return;
    }

    setIsSending(true);
    try {
      await sendReportEmail(activeTrip.id, recipientEmail.trim(), generatedReport);
      setNotification({ message: t.msg_email_sent.replace('{email}', recipientEmail), type: 'success' });
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : '이메일 발송 실패', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveAndBack = async () => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const updated = { ...activeTrip, report: generatedReport };
      const saved = await updateTrip(updated);
      const next = allTrips.map(trip => trip.id === saved.id ? saved : trip);

      setAllTrips(next);
      setActiveTrip(saved);
      setView(ViewState.HOME);
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : '보고서 저장 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string): string => {
    if (!text) return '';
    let html = sanitizeString(text)
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-800 dark:text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-brand-orange mt-6 mb-3 border-b border-orange-100 pb-2">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-4">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n$/gim, '<br />');
    return html;
  };

  const renderExpenseChart = () => {
    if (expenses.length === 0) return null;
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-card-soft space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">{t.chart_title}</h3>
          <span className="text-xs font-bold text-brand-orange">
            {t.chart_total}: ¥{total.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          {expenses.map((ex) => {
            const percent = total > 0 ? Math.round((ex.amount / total) * 100) : 0;
            return (
              <div key={ex.id} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                  <span>{ex.merchant} ({ex.category})</span>
                  <span>¥{ex.amount.toLocaleString()} ({percent}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-orange h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Voice AI assistant & wake word handler
  const startListening = () => {
    const windowRef = window as any;
    const SpeechRecognition = windowRef.SpeechRecognition || windowRef.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { }
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.lang = language === 'ja' ? 'ja-JP' : 'ko-KR';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setAiChatInput(transcript);
    };

    rec.start();
  };

  const refreshAgentTrip = async (tripId?: string) => {
    const visible = await fetchTrips();
    setAllTrips(visible.filter(trip => trip.userId === authUser?.uid));
    if (userData?.role === 'admin') setAdminTrips(visible);
    if (tripId) {
      const selected = visible.find(trip => trip.id === tripId && trip.userId === authUser?.uid);
      if (selected) setActiveTrip(selected);
    }
  };

  if (!isAuthReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange dark:border-brand-orange"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className={`relative isolate min-h-screen overflow-hidden font-sans flex items-center justify-center p-4 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-slate-950 text-gray-100' : 'bg-slate-100 text-gray-900'}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-orange-300/45 blur-3xl dark:bg-orange-600/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-[-7rem] h-96 w-96 rounded-full bg-sky-300/45 blur-3xl dark:bg-indigo-500/20" />
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white/55 p-8 text-center space-y-8 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/30">
          <div className="flex justify-center mb-6">
            <div className="rounded-full border border-white/70 bg-white/50 p-4 shadow-lg shadow-orange-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-orange-950/30">
              <Icon1BLogo className="w-16 h-16 text-brand-orange" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">O1BO</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Business Trip Management</p>
          </div>

          <PasswordLogin language={language} onLogin={user => {
            setAuthUser({ uid: user.uid, email: user.email, displayName: user.name });
            setUserData(user); setView(ViewState.HOME);
          }} />
        </div>
      </div>
    );
  }

  if (userData && !userData.companyCode) return (
    <main className={`min-h-screen p-6 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">{language === 'ja' ? 'O1BOを始める' : 'O1BO 시작하기'}</h1>
        <CompanyMembership user={userData} language={language} onJoined={user => { setUserData(user); setView(ViewState.SETTINGS); }} />
        <button onClick={handleLogout}>{language === 'ja' ? 'ログアウト' : '로그아웃'}</button>
      </div>
    </main>
  );

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {expenseDraft && <ExpenseReview draft={expenseDraft} setDraft={setExpenseDraft} onSave={handleSaveExpense} onCancel={() => setExpenseDraft(null)} busy={loading} language={language} />}
      {/* Sticky Top Navbar */}
      <Navbar
        theme={theme}
        language={language}
        toggleLanguage={() => setLanguage(l => l === 'ja' ? 'ko' : 'ja')}
        setTheme={setTheme}
        setNotification={setNotification}
      />

      <main className="p-4 max-w-md mx-auto">
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* View Router */}
        {view === ViewState.HOME && (
          <HomeView
            t={t}
            language={language}
            activeTrip={activeTrip}
            teamTrips={teamTrips}
            checkIns={checkIns}
            expenses={expenses}
            fileInputRef={fileInputRef}
            setView={setView}
            setDurationFilter={setDurationFilter}
            setCustomFilterStart={setCustomFilterStart}
            setCustomFilterEnd={setCustomFilterEnd}
            navigateToCreateTrip={navigateToCreateTrip}
            handleManualCheckIn={handleManualCheckIn}
            handleGenerateReport={handleGenerateReport}
            renderExpenseChart={renderExpenseChart}
            setActiveTrip={setActiveTrip}
          />
        )}

        {view === ViewState.TRIP_DETAIL && (
          <ScheduleView
            t={t}
            language={language}
            theme={theme}
            activeTrip={activeTrip}
            allTrips={allTrips}
            teamTrips={teamTrips}
            checkIns={checkIns}
            isNfcCheckoutEnabled={isNfcCheckoutEnabled}
            showMap={showMap}
            setShowMap={setShowMap}
            showDateFilterMenu={showDateFilterMenu}
            setShowDateFilterMenu={setShowDateFilterMenu}
            durationFilter={durationFilter}
            setDurationFilter={setDurationFilter}
            customFilterStart={customFilterStart}
            setCustomFilterStart={setCustomFilterStart}
            customFilterEnd={customFilterEnd}
            setCustomFilterEnd={setCustomFilterEnd}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            calendarYear={calendarYear}
            setCalendarYear={setCalendarYear}
            editingItemId={editingItemId}
            editItemData={editItemData}
            setEditItemData={setEditItemData}
            setActiveTrip={setActiveTrip}
            setView={setView}
            navigateToCreateTrip={navigateToCreateTrip}
            handleShareTrip={handleShareTrip}
            handleDeleteTrip={handleDeleteTrip}
            handleManualCheckIn={handleManualCheckIn}
            handleManualCheckOut={handleManualCheckOut}
            handleCheckOut={handleCheckOut}
            handleEditClick={handleEditClick}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
            handleDeleteItineraryItem={handleDeleteItineraryItem}
            normalizeDateStr={normalizeDateStr}
            addDaysToDateString={addDaysToDateString}
          />
        )}

        {view === ViewState.REPORT && (
          <ReportView
            t={t}
            language={language}
            activeTrip={activeTrip}
            allTrips={allTrips}
            reportPrompt={reportPrompt}
            setReportPrompt={setReportPrompt}
            loading={loading}
            isSending={isSending}
            isEditingReport={isEditingReport}
            setIsEditingReport={setIsEditingReport}
            generatedReport={generatedReport}
            setGeneratedReport={setGeneratedReport}
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
            setActiveTrip={setActiveTrip}
            setView={setView}
            navigateToCreateTrip={navigateToCreateTrip}
            handleGenerateReport={handleGenerateReport}
            handleAiScheduleAction={handleAiScheduleAction}
            handleSaveAndBack={handleSaveAndBack}
            handleExportToWord={handleExportToWord}
            handleShareReport={handleShareReport}
            handleSendReport={handleSendReport}
            renderMarkdown={renderMarkdown}
            setNotification={setNotification}
          />
        )}

        {view === ViewState.SETTINGS && (
          <SettingsView
            t={t}
            language={language}
            theme={theme}
            setTheme={setTheme}
            isNfcCheckoutEnabled={isNfcCheckoutEnabled}
            setIsNfcCheckoutEnabled={setIsNfcCheckoutEnabled}
            kakaoAppKey={kakaoAppKey}
            setKakaoAppKey={setKakaoAppKey}
            userData={userData}
            userNameInput={userNameInput}
            setUserNameInput={setUserNameInput}
            teamCodeInput={teamCodeInput}
            setTeamCodeInput={setTeamCodeInput}
            teamMembers={teamMembers}
            loading={loading}
            setView={setView}
            setShowHelpModal={setShowHelpModal}
            onCompanyJoined={setUserData}
            handleSaveNickname={handleSaveNickname}
            handleGenerateTeamCode={handleGenerateTeamCode}
            handleJoinTeam={handleJoinTeam}
            handleCopyTeamCode={handleCopyTeamCode}
            handleShareTeamCodeKakao={handleShareTeamCodeKakao}
            handleLogout={handleLogout}
            setNotification={setNotification}
          />
        )}

        {view === ViewState.ADMIN_DASHBOARD && (
          <AdminView
            t={t}
            userData={userData}
            adminTrips={adminTrips}
            adminExpenses={adminExpenses}
            adminCheckIns={adminCheckIns}
            companyUsers={companyUsers}
            setView={setView}
          />
        )}

        {view === ViewState.SCANNER && (
          <ScannerView
            t={t}
            language={language}
            activeTrip={activeTrip}
            allTrips={allTrips}
            fileInputRef={fileInputRef}
            galleryInputRef={galleryInputRef}
            onManualExpense={handleManualExpense}
            expenses={expenses.filter(expense => expense.tripId === activeTrip?.id)}
            onDeleteExpense={handleDeleteExpense}
            busy={loading}
            setActiveTrip={setActiveTrip}
            navigateToCreateTrip={navigateToCreateTrip}
          />
        )}

        {view === ViewState.CREATE_TRIP && (
          <CreateTripView
            t={t}
            tripCreationSource={tripCreationSource}
            newTripData={newTripData}
            setNewTripData={setNewTripData}
            setView={setView}
            handleSaveTrip={handleSaveTrip}
            loading={loading}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        view={view}
        setView={setView}
        t={t}
        setDurationFilter={setDurationFilter}
        setCustomFilterStart={setCustomFilterStart}
        setCustomFilterEnd={setCustomFilterEnd}
        navigateToCreateTrip={navigateToCreateTrip}
        activeTrip={activeTrip}
        handleGenerateReport={handleGenerateReport}
      />

      {/* Hidden File Inputs for Camera & OCR */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Voice Wake-Word Controller */}
      <div className="fixed bottom-24 left-4 z-40 flex items-center space-x-2">
        {isListening && (
          <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {t.wake_word_listening}
          </div>
        )}
        <button
          onClick={() => setShowAIChat(true)}
          className={`p-3 rounded-full shadow-lg transition-colors ${isListening ? 'bg-orange-100 dark:bg-orange-950/30 text-brand-orange dark:text-brand-orange' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
          title="제로보 열기"
          aria-label="제로보 열기"
        >
          <span className="flex items-center gap-2"><IconBot className="w-5 h-5" />제로보</span>
        </button>
      </div>

      {/* AI Bot FAB & Chat Modal */}
      <AIChatModal
        key={authUser?.uid + ':' + userData?.companyCode}
        language={language}
        showAIChat={showAIChat}
        setShowAIChat={setShowAIChat}
        aiChatInput={aiChatInput}
        setAiChatInput={setAiChatInput}
        isListening={isListening}
        startListening={startListening}
        activeTripId={activeTrip?.id}
        onChanged={refreshAgentTrip}
      />

      {/* NFC Modal */}
      {nfcModal && nfcModal.show && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1">
                <IconZap className="w-4 h-4" />
                {t.nfc_title}
              </span>
              <button
                onClick={() => setNfcModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center relative">
                <IconZap className={`w-10 h-10 ${nfcModal.status === 'scanning' ? 'text-brand-orange animate-bounce' : 'text-brand-orange'}`} />
                {nfcModal.status === 'scanning' && (
                  <span className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                  {nfcModal.item?.locationName}
                </h4>
                <p className={`text-xs ${nfcModal.status === 'success' ? 'text-green-600 dark:text-green-400 font-bold' :
                  nfcModal.status === 'error' ? 'text-red-500 font-bold' :
                    nfcModal.status === 'scanning' ? 'text-brand-orange dark:text-brand-orange font-medium animate-pulse' :
                      'text-gray-500 dark:text-gray-400'
                  }`}>
                  {nfcModal.status === 'success' ? t.nfc_success :
                    nfcModal.status === 'error' ? (nfcModal.errorMsg || t.nfc_error) :
                      nfcModal.status === 'scanning' ? t.nfc_waiting :
                        `${t.nfc_waiting} (${nfcModal.isChecking ? '위치 확인 중' : nfcModal.distance <= 50 ? '현장 반경 내' : '현장 반경 밖'})`}
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {nfcModal.distance > 50 && nfcModal.status === 'idle' && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 text-left bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 rounded-xl leading-relaxed">
                      ⚠️ {t.nfc_gps_warning.replace('{dist}', String(nfcModal.distance))}
                    </p>

                  </div>
                )}

                {nfcModal.status === 'idle' && nfcModal.distance <= 50 && (
                  <button
                    onClick={startNfcScanning}
                    className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all text-sm"
                  >
                    📡 {language === 'ja' ? 'NFCスキャン開始' : 'NFC 스캔 시작하기'}
                  </button>
                )}

                {nfcModal.status === 'scanning' && (
                  <button
                    onClick={() => setNfcModal(prev => prev ? { ...prev, status: 'idle', isChecking: false } : null)}
                    className="w-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    {t.btn_cancel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <TutorialModal
          language={language}
          tutorialStep={tutorialStep}
          setTutorialStep={setTutorialStep}
          setShowTutorial={setShowTutorial}
        />
      )}

      {showHelpModal && (
        <HelpModal
          language={language}
          setShowHelpModal={setShowHelpModal}
          setShowTutorial={setShowTutorial}
          setTutorialStep={setTutorialStep}
        />
      )}
    </div>
  );
};

export default App;
