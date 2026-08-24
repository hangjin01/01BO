import React from 'react';
import { Lang } from '../types';
import { Icon1BLogo, IconBot, IconZap, IconFileText, IconX } from './Icons';

interface TutorialModalProps {
  language: Lang;
  tutorialStep: number;
  setTutorialStep: React.Dispatch<React.SetStateAction<number>>;
  setShowTutorial: (show: boolean) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  language,
  tutorialStep,
  setTutorialStep,
  setShowTutorial,
}) => {
  const slides = [
    {
      title: language === 'ko' ? "O1BO 스마트 출장 관리" : "O1BO スマート出張管理",
      desc: language === 'ko' 
        ? "O1BO는 출장 계획, GPS/NFC 체크아웃 2중 검증, 영수증 OCR 분석 및 AI 일보 생성을 통합 제공하는 프리미엄 출장 관리 솔루션입니다." 
        : "O1BOは出張計画、GPS/NFCチェックアウト2重検証、領収書OCR分析およびAI日報作成を統合提供するプレミアム出張管理ソリューションです。",
      icon: <Icon1BLogo className="w-16 h-16 text-brand-orange" />
    },
    {
      title: language === 'ko' ? "AI 일정 비서 & 카카오톡 공유" : "AI日程助手 & KakaoTalk共有",
      desc: language === 'ko' 
        ? "AI 어시스턴트에게 말로 하거나 타이핑하면 자동으로 일정을 작성해 줍니다. 작성 후 터치 한 번으로 동료에게 카카오톡 메시지로 즉시 전송할 수 있습니다." 
        : "AIアシスタントに話すかタイピングすると自動で日程を作成します。作成後、タッチ一度で同僚にKakaoTalkメッセージで即座に送信できます。",
      icon: <IconBot className="w-16 h-16 text-brand-orange" />
    },
    {
      title: language === 'ko' ? "2중 체크아웃 검증 시스템" : "2重チェックアウト検証システム",
      desc: language === 'ko' 
        ? "단순 위치 체크인을 넘어, 현장에 부착된 실물 NFC 태그 접촉과 GPS 신뢰성 검증을 병행하는 안전한 2단계 체크아웃을 수행합니다. 인증 내역은 관리자 화면에 자동 기록됩니다." 
        : "単純な位置チェックインを超え、現場に付着された実物NFCタグ接触とGPS信頼性検証を並行する安全な2段階チェックアウトを行います。検証履歴は管理者画面に自動記録されます。",
      icon: <IconZap className="w-16 h-16 text-brand-orange animate-pulse" />
    },
    {
      title: language === 'ko' ? "OCR 영수증 스캔 & AI 일보" : "OCR領収書スキャン & AI日報",
      desc: language === 'ko' 
        ? "카메라로 영수증을 찍으면 AI가 경비를 자동 분석/입력합니다. 출장 종료 후 일보를 클릭 한 번으로 자동 작성하여 Word 파일 저장, 메일 발송, 카카오톡 전달을 완료해 보세요." 
        : "カメラで領収書を撮るとAIが経費を自動分析/入力します。出張終了後に日報をワンクリックで自動作成し、Wordファイル保存、メール送信、KakaoTalk転送を完了してみましょう。",
      icon: <IconFileText className="w-16 h-16 text-brand-orange" />
    }
  ];

  const currentSlide = slides[tutorialStep];

  const handleNext = () => {
    if (tutorialStep < slides.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const handlePrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const handleCloseTutorial = () => {
    localStorage.setItem('o1bo_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 p-6 flex flex-col items-center text-center space-y-6 transform scale-100 transition-all duration-300">
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] bg-orange-50 dark:bg-orange-950 text-brand-orange dark:text-brand-orange font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Guide {tutorialStep + 1} / {slides.length}
          </span>
          <button 
            onClick={handleCloseTutorial}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors font-bold text-xs"
          >
            {language === 'ko' ? '건너뛰기' : 'スキップ'}
          </button>
        </div>

        <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-full shrink-0">
          {currentSlide.icon}
        </div>

        <div className="space-y-2.5">
          <h4 className="text-lg font-black text-gray-900 dark:text-white leading-snug">
            {currentSlide.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center px-2">
            {currentSlide.desc}
          </p>
        </div>

        {/* Dot Indicators */}
        <div className="flex space-x-2.5 justify-center py-2 shrink-0">
          {slides.map((_, idx) => (
            <span 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === tutorialStep ? 'w-5 bg-brand-orange' : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full pt-1 shrink-0">
          {tutorialStep > 0 && (
            <button 
              onClick={handlePrev}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-[0.98] transition-all"
            >
              {language === 'ko' ? '이전' : '戻る'}
            </button>
          )}
          <button 
            onClick={handleNext}
            className="flex-1 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-100 dark:shadow-none active:scale-[0.98] transition-all"
          >
            {tutorialStep === slides.length - 1 
              ? (language === 'ko' ? '시작하기' : 'スタート') 
              : (language === 'ko' ? '다음' : '次へ')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface HelpModalProps {
  language: Lang;
  setShowHelpModal: (show: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  setTutorialStep: (step: number) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  language,
  setShowHelpModal,
  setShowTutorial,
  setTutorialStep,
}) => {
  const guides = [
    {
      title: language === 'ko' ? "🤖 AI 출장 일정 비서" : "🤖 AI出張日程助手",
      desc: language === 'ko' 
        ? "AI 챗봇 버튼을 눌러 말이나 글씨로 '내일 도쿄 2박 3일 출장' 등을 입력하면 일정을 바로 생성합니다. 설정에서 '음성 호출' 활성화 시 '하이 제로보'로 보이스 제어도 가능합니다." 
        : "AIチャットボットボタンを押し、言葉や文字で「明日東京2泊3日出張」などを入力すれば日程をすぐ作成します。設定で「音声呼び出し」活性化時に「ハイゼロボ」でボイス制御も可能です。"
    },
    {
      title: language === 'ko' ? "💬 카카오톡 여정 공유" : "💬 KakaoTalk旅程共有",
      desc: language === 'ko' 
        ? "일정 상세 화면의 '공유' 버튼이나 AI 채팅 완료 화면의 '카카오톡 공유' 버튼을 누르면 동료에게 메세지로 내보낼 수 있습니다. API 키 미설정 시에는 클립보드에 자동 복사됩니다." 
        : "日程詳細画面の「共有」ボタンやAIチャット完了画面の「KakaoTalk共有」ボタンを押すと、同僚にメッセージでエクスポートできます。APIキー未設定時にはクリップボードに自動コピーされます。"
    },
    {
      title: language === 'ko' ? "📡 NFC & GPS 2중 체크아웃" : "📡 NFC & GPS 2重チェックアウト",
      desc: language === 'ko' 
        ? "설정에서 'NFC 체크아웃 필수'를 켜면 수동 체크인 후에 수동 체크아웃과 NFC 물리 인증을 모두 거쳐야 합니다. GPS가 범위(50m) 외에 있는 경우 체크아웃이 제한될 수 있습니다." 
        : "設定で「NFCチェックアウト必須」をオンにすると、手動チェックイン後に手動チェックアウトとNFC物理認証の両方を経る必要があります。GPSが範囲(50m)外にある場合、チェックアウトが制限されることがあります。"
    },
    {
      title: language === 'ko' ? "📄 영수증 자동 입력 & AI 일보" : "📄 領収書自動入力 & AI日報",
      desc: language === 'ko' 
        ? "법인 영수증 이미지를 업로드하면 AI가 분석해 자동으로 지출을 기록합니다. 여정 종료 후 일보 미리보기에서 AI 보고서를 Word(.doc)로 내보내거나 메일 전송 및 카카오톡 공유할 수 있습니다." 
        : "法人領収書画像をアップロードするとAIが分析して自動的に支出を記録します。旅程終了後に日報プレビューでAI報告書をWord(.doc)で出力するか、メール送信およびKakaoTalk共有が可能です。"
    }
  ];

  const handleReplayTutorial = () => {
    localStorage.removeItem('o1bo_tutorial_completed');
    setShowHelpModal(false);
    setShowTutorial(true);
    setTutorialStep(0);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 p-6 flex flex-col max-h-[85vh] transform scale-100 transition-all duration-300">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
            ❓ {language === 'ko' ? '도움말 및 기능 안내' : 'ヘルプと機能ガイド'}
          </h3>
          <button 
            onClick={() => setShowHelpModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 leading-relaxed">
          {guides.map((g, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-1">
              <h5 className="font-bold text-xs text-brand-orange dark:text-brand-orange">
                {g.title}
              </h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                {g.desc}
              </p>
            </div>
          ))}

          <div className="pt-2">
            <button 
              onClick={handleReplayTutorial}
              className="w-full py-3 bg-orange-50 dark:bg-orange-950 text-brand-orange dark:text-brand-orange hover:bg-orange-100 dark:hover:bg-orange-900/50 font-bold rounded-xl text-xs transition-colors active:scale-[0.98] border border-orange-100 dark:border-orange-900/40"
            >
              🔄 {language === 'ko' ? '전체 튜토리얼 가이드 다시보기' : '全体チュートリアルガイド再表示'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button 
            onClick={() => setShowHelpModal(false)}
            className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs active:scale-[0.98] transition-all"
          >
            {language === 'ko' ? '확인' : '確認'}
          </button>
        </div>
      </div>
    </div>
  );
};
