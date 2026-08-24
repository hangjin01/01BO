import React, { useState, useEffect, useRef } from 'react';
import { Trip, ViewState, Coordinate, CheckInRecord, Expense, ItineraryItem, User } from './types';
import { getCurrentPosition, calculateDistance, geocodeAddress } from './services/locationService';
import { analyzeReceiptImage, generateTripReport, generateTripFromChat, adjustTripItinerary } from './services/geminiService';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
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
    recent_activity_title: "リアルタイム活動フィード",
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
    admin_company_code: "あなたの会社コード (招待用):",
    chart_title: "経費内訳",
    chart_total: "合計",
    ai_bot_title: "AIアシスタント",
    ai_bot_placeholder: "「明日から東京に出張します...」",
    ai_bot_listening: "音声入力中...",
    ai_bot_processing: "AIがスケジュールを作成しています...",
    ai_bot_success: "スケジュールを作成しました！",
    ai_bot_error: "スケジュールの作成に失敗しました。",
    wake_word_enable: "音声ウェイクアップ",
    wake_word_listening: "「하이 제로보」待機中",
    theme_title: "テーマ設定",
    theme_light: "ライトモード",
    theme_dark: "ダークモード",
    btn_guest_login: "テストアカウントでログイン (ローカル)",
    nfc_title: "NFC チェックアウト認証",
    nfc_waiting: "デバイスの背面をNFCタグに近づけてください。",
    nfc_success: "NFC認証が完了しました！",
    nfc_error: "NFCの読み取りに失敗しました。再試行してください。",
    nfc_mock_btn: "NFC模擬タグ接触 (シミュレーション)",
    nfc_gps_warning: "目的地から離れています（現在距離: {dist}m）。50m以内にいる必要があります。",
    nfc_gps_bypass: "位置制限をバイパス (テスト用)",
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
    recent_activity_title: "실시간 활동 피드",
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
    admin_company_code: "나의 회사 코드 (초대용):",
    chart_title: "경비 내역",
    chart_total: "합계",
    ai_bot_title: "AI 어시스턴트",
    ai_bot_placeholder: "「내일 도쿄로 2박 3일 출장갑니다...」",
    ai_bot_listening: "음성 입력 중...",
    ai_bot_processing: "AI가 일정을 작성하고 있습니다...",
    ai_bot_success: "일정이 작성되었습니다!",
    ai_bot_error: "일정 작성에 실패했습니다.",
    wake_word_enable: "음성 호출",
    wake_word_listening: "「하이 제로보」 대기 중",
    theme_title: "테마 설정",
    theme_light: "라이트 모드",
    theme_dark: "다크 모드",
    btn_guest_login: "테스트 계정으로 로그인 (로컬 모드)",
    nfc_title: "NFC 체크아웃 인증",
    nfc_waiting: "스마트폰 뒷면을 현장의 NFC 태그 스티커에 접촉해 주세요.",
    nfc_success: "NFC 물리 인증 성공!",
    nfc_error: "NFC 리딩 도중 오류가 발생했습니다. 다시 시도해 주세요.",
    nfc_mock_btn: "NFC 모의 태그 접촉 (시뮬레이션)",
    nfc_gps_warning: "목적지에서 너무 멀리 떨어져 있습니다. (현재 거리: {dist}m, 제한: 50m)",
    nfc_gps_bypass: "위치 제한 우회 (테스트용)",
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
    <div className={`fixed top-4 left-4 right-4 z-[9999] p-4 rounded-xl shadow-lg flex items-center space-x-3 transition-all transform translate-y-0 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
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
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLocalGuest, setIsLocalGuest] = useState<boolean>(false);

  // State
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [language, setLanguage] = useState<Lang>('ko');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  // Admin Dashboard States
  const [adminTrips, setAdminTrips] = useState<Trip[]>([]);
  const [adminCheckIns, setAdminCheckIns] = useState<CheckInRecord[]>([]);
  const [adminExpenses, setAdminExpenses] = useState<Expense[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Record<string, User>>({});

  // Form Inputs
  const [companyCodeInput, setCompanyCodeInput] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [generatedTripForShare, setGeneratedTripForShare] = useState<Trip | null>(null);

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
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Kakao Sharing App Key State
  const [kakaoAppKey, setKakaoAppKey] = useState(() => {
    return localStorage.getItem('o1bo_kakao_app_key') || 'd301db54bb88cfde9fba5ec2136e090f';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = TRANSLATIONS[language];

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
    } catch {}
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

  // Local Guest Data Handlers
  const saveLocalTrips = (trips: Trip[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_trips_${authUser.uid}`, JSON.stringify(trips));
    }
  };
  const saveLocalCheckIns = (records: CheckInRecord[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_checkins_${authUser.uid}`, JSON.stringify(records));
    }
  };
  const saveLocalExpenses = (expList: Expense[]) => {
    if (localStorage.getItem('is_local_guest') === 'true' && authUser) {
      localStorage.setItem(`local_expenses_${authUser.uid}`, JSON.stringify(expList));
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const isGuest = localStorage.getItem('is_local_guest') === 'true';
        setIsLocalGuest(isGuest);

        if (isGuest) {
          const savedUserStr = localStorage.getItem(`local_user_${user.uid}`);
          let guestUserObj: User = {
            uid: user.uid,
            email: user.email || 'guest@01bo.local',
            name: user.displayName || 'Test Account',
            role: 'admin',
            companyCode: 'O1BO01'
          };
          if (savedUserStr) {
            try { guestUserObj = JSON.parse(savedUserStr); } catch (_) {}
          }
          setUserData(guestUserObj);
          
          const savedTrips = localStorage.getItem(`local_trips_${user.uid}`);
          if (savedTrips) {
            try {
              const parsed = JSON.parse(savedTrips);
              setAllTrips(parsed);
              if (parsed.length > 0) setActiveTrip(parsed[0]);
            } catch (_) {}
          }
          const savedCheckIns = localStorage.getItem(`local_checkins_${user.uid}`);
          if (savedCheckIns) {
            try { setCheckIns(JSON.parse(savedCheckIns)); } catch (_) {}
          }
          const savedExpenses = localStorage.getItem(`local_expenses_${user.uid}`);
          if (savedExpenses) {
            try { setExpenses(JSON.parse(savedExpenses)); } catch (_) {}
          }
        } else {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newUser: User = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'User',
              role: 'employee',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setUserData(newUser);
          } else {
            setUserData(userDoc.data() as User);
          }
        }
      } else {
        setUserData(null);
        setAllTrips([]);
        setActiveTrip(null);
        setCheckIns([]);
        setExpenses([]);
        setIsLocalGuest(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
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
            } catch (_) {}
          }
        };
        document.head.appendChild(script);
      } else if (!windowRef.Kakao.isInitialized()) {
        try {
          windowRef.Kakao.init(kakaoAppKey);
        } catch (_) {}
      }
    }
  }, [kakaoAppKey]);

  // Firestore Realtime Listeners
  useEffect(() => {
    if (!authUser || isLocalGuest) return;

    const tripsQuery = query(collection(db, 'trips'), where('userId', '==', authUser.uid));
    const unsubTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripsList: Trip[] = [];
      snapshot.forEach((docSnap) => {
        tripsList.push({ id: docSnap.id, ...docSnap.data() } as Trip);
      });
      setAllTrips(tripsList);
      if (tripsList.length > 0 && !activeTrip) {
        setActiveTrip(tripsList[0]);
      }
    });

    const checkInsQuery = query(collection(db, 'checkIns'), where('userId', '==', authUser.uid));
    const unsubCheckIns = onSnapshot(checkInsQuery, (snapshot) => {
      const records: CheckInRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() } as CheckInRecord);
      });
      setCheckIns(records);
    });

    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', authUser.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expList: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expList.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      setExpenses(expList);
    });

    return () => {
      unsubTrips();
      unsubCheckIns();
      unsubExpenses();
    };
  }, [authUser, isLocalGuest]);

  // Team Trips & Members Firestore Realtime Listener
  useEffect(() => {
    if (!authUser || isLocalGuest || !userData?.teamCode) return;

    const teamTripsQuery = query(collection(db, 'trips'), where('teamCode', '==', userData.teamCode), where('isSharedWithTeam', '==', true));
    const unsubTeamTrips = onSnapshot(teamTripsQuery, (snapshot) => {
      const list: Trip[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Trip);
      });
      setTeamTrips(list);
    });

    const teamMembersQuery = query(collection(db, 'users'), where('teamCode', '==', userData.teamCode));
    const unsubTeamMembers = onSnapshot(teamMembersQuery, (snapshot) => {
      const members: User[] = [];
      snapshot.forEach((docSnap) => {
        members.push(docSnap.data() as User);
      });
      setTeamMembers(members);
    });

    return () => {
      unsubTeamTrips();
      unsubTeamMembers();
    };
  }, [authUser, userData?.teamCode, isLocalGuest]);

  // Admin Listeners
  useEffect(() => {
    if (!authUser || userData?.role !== 'admin' || !userData.companyCode || isLocalGuest) return;

    const usersQuery = query(collection(db, 'users'), where('companyCode', '==', userData.companyCode));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersMap: Record<string, User> = {};
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as User;
        usersMap[u.uid] = u;
      });
      setCompanyUsers(usersMap);
    });

    const adminCheckInsQuery = query(collection(db, 'checkIns'), where('companyCode', '==', userData.companyCode));
    const unsubAdminCheckIns = onSnapshot(adminCheckInsQuery, (snapshot) => {
      const records: CheckInRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() } as CheckInRecord);
      });
      setAdminCheckIns(records);
    });

    const adminTripsQuery = query(collection(db, 'trips'), where('companyCode', '==', userData.companyCode));
    const unsubAdminTrips = onSnapshot(adminTripsQuery, (snapshot) => {
      const tripsList: Trip[] = [];
      snapshot.forEach((docSnap) => {
        tripsList.push({ id: docSnap.id, ...docSnap.data() } as Trip);
      });
      setAdminTrips(tripsList);
    });

    const adminExpensesQuery = query(collection(db, 'expenses'), where('companyCode', '==', userData.companyCode));
    const unsubAdminExpenses = onSnapshot(adminExpensesQuery, (snapshot) => {
      const expList: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expList.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      setAdminExpenses(expList);
    });

    return () => {
      unsubUsers();
      unsubAdminCheckIns();
      unsubAdminTrips();
      unsubAdminExpenses();
    };
  }, [authUser, userData, isLocalGuest]);

  // Handlers & Logic
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      localStorage.removeItem('is_local_guest');
      setIsLocalGuest(false);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setNotification({ message: err.message || 'Google 로그인 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    setIsLoggingIn(true);
    try {
      localStorage.setItem('is_local_guest', 'true');
      setIsLocalGuest(true);
      
      const mockUid = 'guest_user_01bo';
      const mockUser: User = {
        uid: mockUid,
        email: 'guest@01bo.local',
        name: 'Test Account',
        role: 'admin',
        companyCode: 'O1BO01'
      };

      setAuthUser({
        uid: mockUid,
        email: 'guest@01bo.local',
        displayName: 'Test Account'
      } as any);

      setUserData(mockUser);

      const defaultTrips: Trip[] = [
        {
          id: 'trip_tokyo_demo',
          userId: mockUid,
          userName: 'Test Account',
          companyCode: 'O1BO01',
          title: '도쿄 비즈니스 미팅 및 현지 점검',
          destination: 'Tokyo, Japan',
          startDate: '2026-08-25',
          endDate: '2026-08-27',
          purpose: '파트너사 미팅 및 신규 거점 현장 점검',
          status: 'active',
          isSharedWithTeam: true,
          itinerary: [
            {
              id: 'item_1',
              locationName: '도쿄역 신칸센 승강장',
              address: '1 Chome-9 Marunouchi, Chiyoda City, Tokyo 100-0005',
              scheduledTime: '09:00',
              coords: { latitude: 35.6812, longitude: 139.7671 },
              date: '2026-08-25'
            },
            {
              id: 'item_2',
              locationName: '도쿄 팰리스 호텔 비즈니스 라운지',
              address: '1-1-1 Marunouchi, Chiyoda City, Tokyo 100-0005',
              scheduledTime: '11:30',
              coords: { latitude: 35.6842, longitude: 139.7628 },
              date: '2026-08-25'
            },
            {
              id: 'item_3',
              locationName: '시부야 스카이 오피스 타워',
              address: '2-24-12 Shibuya, Shibuya City, Tokyo 150-0002',
              scheduledTime: '15:00',
              coords: { latitude: 35.6585, longitude: 139.7013 },
              date: '2026-08-25'
            }
          ]
        }
      ];

      setAllTrips(defaultTrips);
      setActiveTrip(defaultTrips[0]);
      saveLocalTrips(defaultTrips);
      setNotification({ message: '테스트 계정으로 로그인되었습니다.', type: 'success' });
    } catch (_) {
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isLocalGuest) {
      localStorage.removeItem('is_local_guest');
      setIsLocalGuest(false);
      setAuthUser(null);
      setUserData(null);
    } else {
      await signOut(auth);
    }
  };

  // Nickname Save Handler
  const handleSaveNickname = async () => {
    if (!authUser || !userNameInput.trim()) return;
    const newName = userNameInput.trim();
    setLoading(true);

    try {
      const updatedUser: User = {
        ...userData!,
        name: newName
      };

      if (isLocalGuest) {
        setUserData(updatedUser);
        localStorage.setItem(`local_user_${authUser.uid}`, JSON.stringify(updatedUser));
        // Update local team members list with new name
        setTeamMembers(prev => prev.map(m => m.uid === authUser.uid ? updatedUser : m));
      } else {
        await updateDoc(doc(db, 'users', authUser.uid), { name: newName });
        setUserData(updatedUser);
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
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generatedCode = `TEAM-${randomStr}`;
    const updatedUser: User = {
      ...userData!,
      teamCode: generatedCode
    };

    if (isLocalGuest) {
      setUserData(updatedUser);
      localStorage.setItem(`local_user_${authUser.uid}`, JSON.stringify(updatedUser));
      const mockTeamTrips: Trip[] = [
        {
          id: 'trip_mock_osaka',
          userId: 'user_lee_osaka',
          userName: '이영희 과장',
          userEmail: 'lee@company.com',
          companyCode: userData?.companyCode || 'O1BO01',
          teamCode: generatedCode,
          title: '오사카 대리점 신제품 세미나 참석',
          destination: 'Osaka, Japan',
          startDate: '2026-08-26',
          endDate: '2026-08-28',
          purpose: '하반기 신제품 라인업 발표 및 대리점 계약 체결',
          status: 'active',
          isSharedWithTeam: true,
          itinerary: [
            {
              id: 'item_osaka_1',
              locationName: '신오사카역 신칸센 승강장',
              address: '5 Chome-16 Nishinakajima, Yodogawa Ward, Osaka, 532-0011',
              scheduledTime: '11:00',
              coords: { latitude: 34.7334, longitude: 135.5001 },
              date: '2026-08-26'
            },
            {
              id: 'item_osaka_2',
              locationName: '우메다 스카이 빌딩 컨벤션 홀',
              address: '1-1-88 Oyodonaka, Kita Ward, Osaka, 531-6023',
              scheduledTime: '14:00',
              coords: { latitude: 34.7052, longitude: 135.4896 },
              date: '2026-08-26'
            }
          ]
        },
        {
          id: 'trip_mock_fukuoka',
          userId: 'user_park_fukuoka',
          userName: '박민수 팀장',
          userEmail: 'park@company.com',
          companyCode: userData?.companyCode || 'O1BO01',
          teamCode: generatedCode,
          title: '후쿠오카 거점 물류 창고 현장 점검',
          destination: 'Fukuoka, Japan',
          startDate: '2026-08-27',
          endDate: '2026-08-29',
          purpose: '물류 센터 파트너십 협상 및 현장 재고 조사',
          status: 'upcoming',
          isSharedWithTeam: true,
          itinerary: [
            {
              id: 'item_fuk_1',
              locationName: '후쿠오카 공항 국제선 터미널',
              address: '739 Aoki, Hakata Ward, Fukuoka, 812-0851',
              scheduledTime: '09:30',
              coords: { latitude: 33.5859, longitude: 130.4507 },
              date: '2026-08-27'
            }
          ]
        }
      ];

      setTeamTrips(mockTeamTrips);
      setTeamMembers([
        updatedUser,
        { uid: 'user_lee_osaka', email: 'lee@company.com', name: '이영희 과장', role: 'employee', createdAt: '', teamCode: generatedCode },
        { uid: 'user_park_fukuoka', email: 'park@company.com', name: '박민수 팀장', role: 'employee', createdAt: '', teamCode: generatedCode }
      ]);
    } else {
      await updateDoc(doc(db, 'users', authUser.uid), { teamCode: generatedCode });
      setUserData(updatedUser);
    }

    setNotification({ message: `✨ 새로운 팀 코드가 생성되었습니다: ${generatedCode}`, type: 'success' });
  };

  const handleJoinTeam = async () => {
    if (!authUser || !teamCodeInput.trim()) return;
    const targetCode = teamCodeInput.trim().toUpperCase();
    setLoading(true);

    try {
      const updatedUser: User = {
        ...userData!,
        teamCode: targetCode
      };

      if (isLocalGuest) {
        setUserData(updatedUser);
        localStorage.setItem(`local_user_${authUser.uid}`, JSON.stringify(updatedUser));
        const mockTeamTrips: Trip[] = [
          {
            id: 'trip_mock_joined',
            userId: 'user_kim_partner',
            userName: '김철수 대리',
            userEmail: 'kim@company.com',
            companyCode: userData?.companyCode || 'O1BO01',
            teamCode: targetCode,
            title: '도쿄 IT 엑스포 박람회 참관',
            destination: 'Tokyo, Japan',
            startDate: '2026-08-28',
            endDate: '2026-08-30',
            purpose: '전시회 참관 및 신규 AI 기술 미팅',
            status: 'upcoming',
            isSharedWithTeam: true,
            itinerary: [
              {
                id: 'item_tokyo_expo',
                locationName: '도쿄 빅사이트 국제 전시장',
                address: '3-11-1 Ariake, Koto City, Tokyo 135-0063',
                scheduledTime: '10:00',
                coords: { latitude: 35.6298, longitude: 139.7942 },
                date: '2026-08-28'
              }
            ]
          }
        ];
        setTeamTrips(mockTeamTrips);
        setTeamMembers([
          updatedUser,
          { uid: 'user_kim_partner', email: 'kim@company.com', name: '김철수 대리', role: 'employee', createdAt: '', teamCode: targetCode }
        ]);
      } else {
        await updateDoc(doc(db, 'users', authUser.uid), { teamCode: targetCode });
        setUserData(updatedUser);
      }

      setNotification({ message: `👥 ${targetCode} 팀에 성공적으로 가입했습니다!`, type: 'success' });
      setTeamCodeInput('');
    } catch (err: any) {
      setNotification({ message: err.message || '팀 가입 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTeamCode = () => {
    if (!userData?.teamCode) return;
    navigator.clipboard.writeText(userData.teamCode).then(() => {
      setNotification({ message: '📋 팀 코드가 클립보드에 복사되었습니다.', type: 'success' });
    });
  };

  const handleShareTeamCodeKakao = () => {
    if (!userData?.teamCode) return;
    const senderName = userData.name || '동료';
    const text = `[O1BO 스마트 출장 관리 팀 초대]\n\n${senderName}님이 팀원 출장 일정 공유를 위해 초대를 보냈습니다.\n\n🔑 팀 코드: ${userData.teamCode}\n\nO1BO 앱 > 설정 > 팀 코드에 위 코드를 입력하면 실시간으로 출장 일정을 함께 공유할 수 있습니다.`;
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
          buttonTitle: '팀 참가하기'
        });
        setNotification({ message: '카카오톡으로 팀 초대를 공유합니다.', type: 'success' });
        return;
      } catch (_) {}
    }

    navigator.clipboard.writeText(text).then(() => {
      setNotification({ message: '팀 초대 메시지가 복사되었습니다.', type: 'success' });
    });
  };

  const handleManualCheckIn = async (itemId: string) => {
    if (!authUser || !activeTrip) return;
    const targetItem = activeTrip.itinerary.find(i => i.id === itemId);
    if (!targetItem) return;

    try {
      const pos = await getCurrentPosition().catch(() => null);
      const coords = pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude } : targetItem.coords;
      const dist = calculateDistance(coords.latitude, coords.longitude, targetItem.coords.latitude, targetItem.coords.longitude);

      const recordData: Omit<CheckInRecord, 'id'> = {
        userId: authUser.uid,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'DEFAULT',
        tripId: activeTrip.id,
        itineraryItemId: itemId,
        locationName: targetItem.locationName,
        timestamp: Date.now(),
        type: 'check-in',
        userCoords: coords,
        targetCoords: targetItem.coords,
        distanceMeters: Math.round(dist)
      };

      if (isLocalGuest) {
        const newRecord: CheckInRecord = { id: `ci_${Date.now()}`, ...recordData };
        const next = [newRecord, ...checkIns];
        setCheckIns(next);
        saveLocalCheckIns(next);
      } else {
        await addDoc(collection(db, 'checkIns'), recordData);
      }

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
      const recordData: Omit<CheckInRecord, 'id'> = {
        userId: authUser.uid,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'DEFAULT',
        tripId: activeTrip.id,
        itineraryItemId: itemId,
        locationName: targetItem.locationName,
        timestamp: Date.now(),
        type: 'check-out',
        userCoords: targetItem.coords,
        targetCoords: targetItem.coords,
        distanceMeters: 0,
        nfcTagId: 'manual'
      };

      if (isLocalGuest) {
        const newRecord: CheckInRecord = { id: `co_${Date.now()}`, ...recordData };
        const next = [newRecord, ...checkIns];
        setCheckIns(next);
        saveLocalCheckIns(next);
      } else {
        await addDoc(collection(db, 'checkIns'), recordData);
      }

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
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, item.coords.latitude, item.coords.longitude);
      setNfcModal(prev => prev ? { ...prev, distance: Math.round(dist), isChecking: false } : null);
    }).catch(() => {
      setNfcModal(prev => prev ? { ...prev, distance: 0, isChecking: false } : null);
    });
  };

  const startNfcScanning = async () => {
    if (!nfcModal || !nfcModal.item) return;

    if (!('NDEFReader' in window)) {
      setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: t.nfc_unsupported } : null);
      return;
    }

    try {
      setNfcModal(prev => prev ? { ...prev, status: 'scanning' } : null);
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = async (event: any) => {
        const serialNumber = event.serialNumber || 'NFC_VERIFIED_TAG';
        await completeNfcCheckOut(serialNumber);
      };

      ndef.onreadingerror = () => {
        setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: t.nfc_error } : null);
      };
    } catch (err: any) {
      setNfcModal(prev => prev ? { ...prev, status: 'error', errorMsg: err.message || t.nfc_error } : null);
    }
  };

  const simulateNfcScan = async () => {
    const mockSerialNumber = `MOCK_NFC_${Math.floor(1000 + Math.random() * 9000)}`;
    await completeNfcCheckOut(mockSerialNumber);
  };

  const completeNfcCheckOut = async (serialNumber: string) => {
    if (!nfcModal || !nfcModal.item || !authUser || !activeTrip) return;

    try {
      const recordData: Omit<CheckInRecord, 'id'> = {
        userId: authUser.uid,
        companyCode: userData?.companyCode || activeTrip.companyCode || 'DEFAULT',
        tripId: activeTrip.id,
        itineraryItemId: nfcModal.itemId,
        locationName: nfcModal.item.locationName,
        timestamp: Date.now(),
        type: 'check-out',
        userCoords: nfcModal.item.coords,
        targetCoords: nfcModal.item.coords,
        distanceMeters: nfcModal.distance,
        nfcTagId: serialNumber
      };

      if (isLocalGuest) {
        const newRecord: CheckInRecord = { id: `co_nfc_${Date.now()}`, ...recordData };
        const next = [newRecord, ...checkIns];
        setCheckIns(next);
        saveLocalCheckIns(next);
      } else {
        await addDoc(collection(db, 'checkIns'), recordData);
      }

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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        if (!base64Data) {
          setNotification({ message: t.msg_img_fail, type: 'error' });
          setLoading(false);
          return;
        }

        const analysis = await analyzeReceiptImage(base64Data, language);
        if (analysis) {
          const newExpData: Omit<Expense, 'id'> = {
            userId: authUser.uid,
            companyCode: userData?.companyCode || activeTrip.companyCode || 'DEFAULT',
            tripId: activeTrip.id,
            amount: analysis.amount,
            merchant: analysis.merchant,
            category: analysis.category,
            date: analysis.date || new Date().toISOString().split('T')[0]
          };

          if (isLocalGuest) {
            const newExp: Expense = { id: `exp_${Date.now()}`, ...newExpData };
            const next = [newExp, ...expenses];
            setExpenses(next);
            saveLocalExpenses(next);
          } else {
            await addDoc(collection(db, 'expenses'), newExpData);
          }

          setNotification({ message: `🧾 ${analysis.merchant} - ¥${analysis.amount.toLocaleString()} ${language === 'ja' ? '登録完了' : '등록 완료'}`, type: 'success' });
        } else {
          setNotification({ message: t.msg_receipt_fail, type: 'error' });
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setNotification({ message: err.message || t.msg_receipt_fail, type: 'error' });
      setLoading(false);
    }
  };

  const handleGenerateReport = async (customPrompt?: string) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const report = await generateTripReport(activeTrip, checkIns, expenses, language, customPrompt);
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
      const adjustedItinerary = await adjustTripItinerary(activeTrip, reportPrompt, language);
      if (adjustedItinerary && adjustedItinerary.length > 0) {
        const updatedTrip = { ...activeTrip, itinerary: adjustedItinerary };
        if (isLocalGuest) {
          const next = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
          setAllTrips(next);
          setActiveTrip(updatedTrip);
          saveLocalTrips(next);
        } else {
          await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: adjustedItinerary });
          setActiveTrip(updatedTrip);
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
      } catch (_) {}
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

    if (!authUser) return;

    try {
      const coords = await geocodeAddress(newTripData.destination);
      const itineraryItems: ItineraryItem[] = [
        {
          id: `item_${Date.now()}_1`,
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
        status: 'active',
        itinerary: itineraryItems
      };

      if (isLocalGuest) {
        const createdTrip: Trip = { id: `trip_${Date.now()}`, ...tripObj };
        const next = [createdTrip, ...allTrips];
        setAllTrips(next);
        setActiveTrip(createdTrip);
        saveLocalTrips(next);

        if (tripObj.isSharedWithTeam && tripObj.teamCode) {
          setTeamTrips(prev => [createdTrip, ...prev]);
        }
      } else {
        const docRef = await addDoc(collection(db, 'trips'), tripObj);
        const createdTrip = { id: docRef.id, ...tripObj };
        setActiveTrip(createdTrip);
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
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!window.confirm(t.confirm_delete_trip)) return;

    try {
      if (isLocalGuest) {
        const next = allTrips.filter(t => t.id !== tripId);
        setAllTrips(next);
        setTeamTrips(prev => prev.filter(t => t.id !== tripId));
        if (activeTrip?.id === tripId) {
          setActiveTrip(next.length > 0 ? next[0] : null);
        }
        saveLocalTrips(next);
      } else {
        await deleteDoc(doc(db, 'trips', tripId));
        if (activeTrip?.id === tripId) {
          const remaining = allTrips.filter(t => t.id !== tripId);
          setActiveTrip(remaining.length > 0 ? remaining[0] : null);
        }
      }
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

      if (isLocalGuest) {
        const nextTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
        setAllTrips(nextTrips);
        setActiveTrip(updatedTrip);
        saveLocalTrips(nextTrips);
      } else {
        await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: updatedItinerary });
        setActiveTrip(updatedTrip);
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

      const updatedTrip = { ...activeTrip, itinerary: updatedItinerary };

      if (isLocalGuest) {
        const nextTrips = allTrips.map(t => t.id === activeTrip.id ? updatedTrip : t);
        setAllTrips(nextTrips);
        setActiveTrip(updatedTrip);
        saveLocalTrips(nextTrips);
      } else {
        await updateDoc(doc(db, 'trips', activeTrip.id), { itinerary: updatedItinerary });
        setActiveTrip(updatedTrip);
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

  const handleJoinCompany = async () => {
    if (!authUser || !companyCodeInput.trim()) return;
    setLoading(true);
    try {
      const updatedUser: User = {
        ...userData!,
        companyCode: companyCodeInput.trim().toUpperCase()
      };
      if (!isLocalGuest) {
        await updateDoc(doc(db, 'users', authUser.uid), { companyCode: companyCodeInput.trim().toUpperCase() });
      }
      setUserData(updatedUser);
      setNotification({ message: t.msg_company_joined, type: 'success' });
      setCompanyCodeInput('');
    } catch (err: any) {
      setNotification({ message: err.message || '회사 참여 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cleanDecemberRecords = async (confirmClean: boolean) => {
    if (!confirmClean) return;
    setLoading(true);
    try {
      if (isLocalGuest) {
        setAllTrips([]);
        setActiveTrip(null);
        setCheckIns([]);
        setExpenses([]);
        setTeamTrips([]);
        localStorage.removeItem(`local_trips_${authUser?.uid}`);
        localStorage.removeItem(`local_checkins_${authUser?.uid}`);
        localStorage.removeItem(`local_expenses_${authUser?.uid}`);
      } else {
        const tripsSnap = await getDocs(query(collection(db, 'trips'), where('companyCode', '==', userData?.companyCode)));
        tripsSnap.forEach(d => deleteDoc(d.ref));
        const checkInsSnap = await getDocs(query(collection(db, 'checkIns'), where('companyCode', '==', userData?.companyCode)));
        checkInsSnap.forEach(d => deleteDoc(d.ref));
        const expSnap = await getDocs(query(collection(db, 'expenses'), where('companyCode', '==', userData?.companyCode)));
        expSnap.forEach(d => deleteDoc(d.ref));
      }
      setNotification({ message: '데이터가 강제 정리되었습니다.', type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || '데이터 정리 실패', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToWord = () => {
    if (!generatedReport) return;
    const blob = new Blob(['\ufeff' + generatedReport], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrip?.title || 'Trip'}_Report_${new Date().toISOString().split('T')[0]}.doc`;
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
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setNotification({ message: t.msg_email_sent.replace('{email}', recipientEmail), type: 'success' });
    }, 1200);
  };

  const handleSaveAndBack = () => {
    setView(ViewState.HOME);
  };

  const renderMarkdown = (text: string): string => {
    if (!text) return '';
    let html = text
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
      try { recognitionRef.current.stop(); } catch (_) {}
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

  const handleAiChatSubmit = async () => {
    if (!aiChatInput.trim() || !authUser) return;
    setIsAiProcessing(true);

    try {
      const generated = await generateTripFromChat(aiChatInput, language);
      if (generated && generated.title && generated.destination) {
        const coords = await geocodeAddress(generated.destination);
        const itineraryWithCoords: ItineraryItem[] = (generated.itinerary || []).map((item: any, idx: number) => ({
          id: `item_ai_${Date.now()}_${idx}`,
          locationName: item.locationName || generated.destination,
          address: item.address || generated.destination,
          scheduledTime: item.scheduledTime || '10:00',
          coords: coords,
          date: generated.startDate
        }));

        const newTripObj: Omit<Trip, 'id'> = {
          userId: authUser.uid,
          userName: userData?.name || authUser.displayName || '사용자',
          userEmail: authUser.email || '',
          companyCode: userData?.companyCode || 'DEFAULT',
          teamCode: userData?.teamCode || '',
          isSharedWithTeam: true,
          title: generated.title,
          destination: generated.destination,
          startDate: generated.startDate || new Date().toISOString().split('T')[0],
          endDate: generated.endDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          purpose: generated.purpose || aiChatInput,
          status: 'active',
          itinerary: itineraryWithCoords.length > 0 ? itineraryWithCoords : [
            {
              id: `item_ai_default_${Date.now()}`,
              locationName: `${generated.destination} 도착`,
              address: generated.destination,
              scheduledTime: '10:00',
              coords: coords,
              date: generated.startDate
            }
          ]
        };

        let fullCreatedTrip: Trip;
        if (isLocalGuest) {
          fullCreatedTrip = { id: `trip_ai_${Date.now()}`, ...newTripObj };
          const next = [fullCreatedTrip, ...allTrips];
          setAllTrips(next);
          setActiveTrip(fullCreatedTrip);
          saveLocalTrips(next);

          if (fullCreatedTrip.teamCode) {
            setTeamTrips(prev => [fullCreatedTrip, ...prev]);
          }
        } else {
          const docRef = await addDoc(collection(db, 'trips'), newTripObj);
          fullCreatedTrip = { id: docRef.id, ...newTripObj };
          setActiveTrip(fullCreatedTrip);
        }

        setGeneratedTripForShare(fullCreatedTrip);
        setAiChatInput('');
      } else {
        setNotification({ message: t.ai_bot_error, type: 'error' });
      }
    } catch (err: any) {
      setNotification({ message: err.message || t.ai_bot_error, type: 'error' });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCancelAiProcessing = () => {
    setIsAiProcessing(false);
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
      <div className={`min-h-screen font-sans flex items-center justify-center p-4 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center space-y-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-full">
              <Icon1BLogo className="w-16 h-16 text-brand-orange" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">O1BO</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Business Trip Management</p>
          </div>
          
          <div className="space-y-5 text-left">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-orange"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {isLoggingIn ? '로그인 처리 중...' : 'Google 계정으로 로그인'}
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={isLoggingIn}
              className={`w-full bg-gradient-to-r from-orange-500 to-brand-orange hover:from-brand-orange hover:to-orange-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <IconZap className="w-5 h-5 text-orange-100" />
              {t.btn_guest_login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
            companyCodeInput={companyCodeInput}
            setCompanyCodeInput={setCompanyCodeInput}
            teamCodeInput={teamCodeInput}
            setTeamCodeInput={setTeamCodeInput}
            teamMembers={teamMembers}
            loading={loading}
            setView={setView}
            setShowHelpModal={setShowHelpModal}
            handleSaveNickname={handleSaveNickname}
            handleJoinCompany={handleJoinCompany}
            handleGenerateTeamCode={handleGenerateTeamCode}
            handleJoinTeam={handleJoinTeam}
            handleCopyTeamCode={handleCopyTeamCode}
            handleShareTeamCodeKakao={handleShareTeamCodeKakao}
            handleLogout={handleLogout}
            cleanDecemberRecords={cleanDecemberRecords}
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
          }
        }}
      />

      {/* Voice Wake-Word Controller */}
      <div className="fixed bottom-24 left-4 z-40 flex items-center space-x-2">
        {isWakeWordEnabled && (
          <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {t.wake_word_listening}
          </div>
        )}
        <button
          onClick={() => setIsWakeWordEnabled(!isWakeWordEnabled)}
          className={`p-3 rounded-full shadow-lg transition-colors ${isWakeWordEnabled ? 'bg-orange-100 dark:bg-orange-950/30 text-brand-orange dark:text-brand-orange' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
          title={t.wake_word_enable}
        >
          <IconMic className="w-5 h-5" />
        </button>
      </div>

      {/* AI Bot FAB & Chat Modal */}
      <AIChatModal
        t={t}
        language={language}
        showAIChat={showAIChat}
        setShowAIChat={setShowAIChat}
        generatedTripForShare={generatedTripForShare}
        setGeneratedTripForShare={setGeneratedTripForShare}
        isAiProcessing={isAiProcessing}
        aiChatInput={aiChatInput}
        setAiChatInput={setAiChatInput}
        isListening={isListening}
        startListening={startListening}
        handleShareTrip={handleShareTrip}
        handleCancelAiProcessing={handleCancelAiProcessing}
        handleAiChatSubmit={handleAiChatSubmit}
        setView={setView}
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
                <p className={`text-xs ${
                  nfcModal.status === 'success' ? 'text-green-600 dark:text-green-400 font-bold' :
                  nfcModal.status === 'error' ? 'text-red-500 font-bold' :
                  nfcModal.status === 'scanning' ? 'text-brand-orange dark:text-brand-orange font-medium animate-pulse' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {nfcModal.status === 'success' ? t.nfc_success :
                   nfcModal.status === 'error' ? (nfcModal.errorMsg || t.nfc_error) :
                   nfcModal.status === 'scanning' ? t.nfc_waiting :
                   `${t.nfc_waiting} (GPS 검증 완료)`}
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {nfcModal.distance > 50 && nfcModal.status === 'idle' && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 text-left bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 rounded-xl leading-relaxed">
                      ⚠️ {t.nfc_gps_warning.replace('{dist}', String(nfcModal.distance))}
                    </p>
                    <button
                      onClick={() => setNfcModal(prev => prev ? { ...prev, distance: 45 } : null)}
                      className="w-full text-xs font-bold py-2 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl transition-all"
                    >
                      🔓 {t.nfc_gps_bypass}
                    </button>
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

                {nfcModal.status !== 'success' && (
                  <button
                    onClick={simulateNfcScan}
                    disabled={nfcModal.status === 'scanning'}
                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl transition-all text-xs border border-gray-200/40 dark:border-gray-650"
                  >
                    🛠️ {t.nfc_mock_btn}
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