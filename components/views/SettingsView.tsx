import React from 'react';
import { ViewState, User, Lang } from '../../types';
import { IconSun, IconMoon, IconZap, IconBriefcase, IconFileText, IconUserCheck, IconUser, IconEdit } from '../Icons';

interface SettingsViewProps {
  t: any;
  language: Lang;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isNfcCheckoutEnabled: boolean;
  setIsNfcCheckoutEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  kakaoAppKey: string;
  setKakaoAppKey: (key: string) => void;
  userData: User | null;
  userNameInput: string;
  setUserNameInput: (name: string) => void;
  companyCodeInput: string;
  setCompanyCodeInput: (code: string) => void;
  teamCodeInput: string;
  setTeamCodeInput: (code: string) => void;
  teamMembers: User[];
  loading: boolean;
  setView: (view: ViewState) => void;
  setShowHelpModal: (show: boolean) => void;
  handleSaveNickname: () => void;
  handleJoinCompany: () => void;
  handleGenerateTeamCode: () => void;
  handleJoinTeam: () => void;
  handleCopyTeamCode: () => void;
  handleShareTeamCodeKakao: () => void;
  handleLogout: () => void;
  cleanDecemberRecords: (confirm: boolean) => void;
  setNotification: (notif: { message: string; type: 'success' | 'error' } | null) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  t,
  language,
  theme,
  setTheme,
  isNfcCheckoutEnabled,
  setIsNfcCheckoutEnabled,
  kakaoAppKey,
  setKakaoAppKey,
  userData,
  userNameInput,
  setUserNameInput,
  companyCodeInput,
  setCompanyCodeInput,
  teamCodeInput,
  setTeamCodeInput,
  teamMembers,
  loading,
  setView,
  setShowHelpModal,
  handleSaveNickname,
  handleJoinCompany,
  handleGenerateTeamCode,
  handleJoinTeam,
  handleCopyTeamCode,
  handleShareTeamCodeKakao,
  handleLogout,
  cleanDecemberRecords,
  setNotification,
}) => {
  return (
    <div className="space-y-6">
      {/* Profile & Nickname Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-brand-orange dark:text-brand-orange">
            <IconUser className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">
              {language === 'ko' ? '👤 내 프로필 및 닉네임 설정' : '👤 プロフィール・ニックネーム設定'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ko' ? '팀원들에게 표시될 이름과 닉네임을 변경할 수 있습니다.' : 'チーム員に表示される名前とニックネームを変更します。'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={userNameInput}
            onChange={(e) => setUserNameInput(e.target.value)}
            placeholder={language === 'ko' ? "이름 / 직급 (예: 홍길동 과장)" : "名前 / 役職"}
            className="flex-1 text-xs p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none font-bold"
          />
          <button
            onClick={handleSaveNickname}
            disabled={!userNameInput.trim() || loading}
            className="px-4 py-2 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm"
          >
            <IconEdit className="w-3.5 h-3.5" />
            <span>{language === 'ko' ? '변경' : '変更'}</span>
          </button>
        </div>
      </div>

      {/* Team Trip Sharing Card */}
      <div className="bg-gradient-to-br from-orange-500 to-brand-orange text-white p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <IconUserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'ko' ? '👥 팀원 출장 일정 실시간 공유' : '👥 チーム員出張日程リアルタイム共有'}
              </h3>
              <p className="text-[11px] text-orange-100 font-medium">
                {language === 'ko' ? '팀 코드를 통해 팀원들과 서로의 출장 정보를 실시간으로 공유하세요.' : 'チームコードを通じてチーム員とお互いの出張情報をリアルタイム共有します。'}
              </p>
            </div>
          </div>
        </div>

        {userData?.teamCode ? (
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-3.5 space-y-3 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                {language === 'ko' ? '나의 팀 공유 코드' : 'マイチーム共有コード'}
              </span>
              <span className="text-xs font-black tracking-widest bg-white text-brand-orange px-3 py-1 rounded-lg shadow-sm">
                {userData.teamCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyTeamCode}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 rounded-xl text-xs backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>📋</span> {language === 'ko' ? '코드 복사' : 'コードコピー'}
              </button>
              <button
                onClick={handleShareTeamCodeKakao}
                className="w-full bg-[#FEE500] hover:bg-[#FDD100] text-[#191919] font-black py-2 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.531-.777 2.947-.118.503.193.497.402.357.164-.109 2.62-1.78 3.674-2.499.462.083.939.126 1.431.126 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                {language === 'ko' ? '카톡으로 초대' : 'カカオで招待'}
              </button>
            </div>

            {/* Team Members */}
            {teamMembers.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <p className="text-[10px] font-bold text-orange-100 uppercase">
                  {language === 'ko' ? `참여 중인 팀원 (${teamMembers.length}명)` : `参加中のチーム員 (${teamMembers.length}名)`}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {teamMembers.map(m => (
                    <span key={m.uid} className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      👤 {m.name || m.email.split('@')[0]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleGenerateTeamCode}
              className="w-full bg-white text-brand-orange font-black py-3 rounded-xl shadow-md hover:bg-orange-50 transition-all text-xs active:scale-95"
            >
              ✨ {language === 'ko' ? '새로운 팀 코드 생성하기' : '新しいチームコードを作成'}
            </button>
            
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="flex-shrink mx-2 text-[10px] text-orange-100 font-bold uppercase">{language === 'ko' ? '또는 기존 코드 참가' : 'または既存コードで参加'}</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamCodeInput}
                onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. TEAM-7K9A2P"
                className="flex-1 text-xs p-2.5 rounded-xl bg-white/20 text-white placeholder-orange-200 outline-none border border-white/30 font-mono font-bold"
              />
              <button
                onClick={handleJoinTeam}
                disabled={!teamCodeInput.trim() || loading}
                className="px-4 py-2 bg-white text-brand-orange font-black rounded-xl text-xs hover:bg-orange-50 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
              >
                {language === 'ko' ? '참여' : '参加'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.theme_title}</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-brand-orange dark:text-brand-orange">
              {theme === 'light' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{theme === 'light' ? t.theme_light : t.theme_dark}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-orange' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* NFC Check-out Toggle */}
        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-brand-orange dark:text-brand-orange">
              <IconZap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">
                {language === 'ja' ? 'NFCチェックアウト必須' : 'NFC 체크아웃 필수'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ja' ? 'チェックアウト時にNFCタグの読み取りを必須にします' : '체크아웃 시 NFC 태그 인식을 필수 단계로 지정합니다'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNfcCheckoutEnabled(prev => {
              const newVal = !prev;
              localStorage.setItem('o1bo_nfc_checkout_enabled', newVal ? 'true' : 'false');
              return newVal;
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isNfcCheckoutEnabled ? 'bg-brand-orange' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNfcCheckoutEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Kakao Sharing Configuration */}
        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-yellow-600 dark:text-yellow-450">
              <svg className="w-5 h-5 fill-current text-brand-orange dark:text-brand-orange" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.531-.777 2.947-.118.503.193.497.402.357.164-.109 2.62-1.78 3.674-2.499.462.083.939.126 1.431.126 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 dark:text-white">
                {language === 'ko' ? '카카오톡 공유 API 키' : 'KakaoTalk共有APIキー'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ko' ? '카카오 디벨로퍼스 JavaScript 키를 등록해 카드 형태 메시지를 보냅니다.' : 'Kakao Developers JavaScriptキーを登録してカード形式のメッセージを送信します。'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={kakaoAppKey}
              onChange={(e) => setKakaoAppKey(e.target.value)}
              placeholder="JavaScript App Key"
              className="flex-1 text-xs p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/30 outline-none"
            />
            <button
              onClick={() => {
                localStorage.setItem('o1bo_kakao_app_key', kakaoAppKey);
                setNotification({ message: language === 'ko' ? '카카오 API 키가 저장되었습니다. 적용을 위해 새로고침합니다.' : 'Kakao APIキーが保存されました。適用のために再読み込みします。', type: 'success' });
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
              className="px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
            >
              {language === 'ko' ? '저장' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {userData?.role === 'employee' && !userData.companyCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 shadow-sm mt-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
              <IconBriefcase className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">{t.company_code_title}</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">{t.company_code_desc}</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={companyCodeInput}
                  onChange={(e) => setCompanyCodeInput(e.target.value)}
                  placeholder="e.g. ABCDEF"
                  className="flex-1 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleJoinCompany}
                  disabled={!companyCodeInput.trim() || loading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {t.btn_join_company}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userData?.role === 'admin' && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Tools</h2>
          <button
            onClick={() => setView(ViewState.ADMIN_DASHBOARD)}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <IconFileText className="w-5 h-5" />
            Admin Dashboard
          </button>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">데이터베이스 유지 관리</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              파이어베이스에 생성 및 누적된 출장 계획, 체크인 기록, 영수증 정산 데이터를 깨끗하게 비웁니다.
            </p>
            <button
              onClick={() => cleanDecemberRecords(true)}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              {loading ? '데이터 정리 중...' : '데이터 강제 정리'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-brand-orange dark:text-brand-orange p-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
        >
          <span>❓</span> {language === 'ko' ? '도움말 및 기능 안내 (Help)' : 'ヘルプと機能ガイド (Help)'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 p-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
