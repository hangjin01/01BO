import React, { useState } from 'react';
import { User, Lang } from '../types';
import { passwordAuth } from '../services/apiService';
export function PasswordLogin({ language, onLogin }: { language: Lang; onLogin: (user: User) => void }) {
  const ja = language === 'ja';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const register = mode === 'register';
  const inputClass = 'mt-1 w-full rounded-2xl border border-white/70 bg-white/45 p-3 text-gray-900 shadow-inner shadow-white/30 outline-none transition-all placeholder:text-gray-400 focus:border-orange-400/80 focus:bg-white/70 focus:ring-4 focus:ring-orange-400/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/25 dark:text-white dark:shadow-black/10 dark:focus:border-orange-400/70 dark:focus:bg-slate-950/40';
  return <div className="space-y-4 text-left">
    <div className="flex gap-1.5 rounded-2xl border border-white/60 bg-white/35 p-1.5 shadow-inner shadow-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/25" aria-label={ja ? 'ログイン方法' : '로그인 메뉴'}>
      {(['login','register'] as const).map(value => <button key={value} disabled={busy} aria-pressed={mode === value} className={`flex-1 rounded-xl p-3 font-bold transition-all duration-200 disabled:cursor-not-allowed ${mode === value ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-gray-600 hover:bg-white/55 dark:text-gray-300 dark:hover:bg-white/10'}`} onClick={() => { setMode(value); setPassword(''); setConfirm(''); setError(''); }}>{value === 'login' ? (ja ? 'ログイン' : '로그인') : (ja ? '新規登録' : '회원가입')}</button>)}
    </div>
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); if (busy) return;
      if (register && password !== confirm) { setError(ja ? 'パスワードが一致しません。' : '비밀번호가 일치하지 않습니다.'); return; }
      setBusy(true); setError('');
      try { const user = await passwordAuth(mode, email.trim(), password, name.trim()); setPassword(''); setConfirm(''); onLogin(user); }
      catch (error) { setError(error instanceof Error ? error.message : '로그인 실패'); }
      finally { setBusy(false); }
    }}>
      {register && <label className="block text-sm">{ja ? '名前' : '이름'}<input className={inputClass} autoComplete="name" required maxLength={30} disabled={busy} value={name} onChange={event => setName(event.target.value)} /></label>}
      <label className="block text-sm">{ja ? 'メールアドレス（ID）' : '이메일 아이디'}<input type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={255} disabled={busy} className={inputClass} value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label className="block text-sm">{ja ? 'パスワード' : '비밀번호'}<input type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={15} maxLength={128} disabled={busy} className={inputClass} value={password} onChange={event => setPassword(event.target.value)} /></label>
      {register && <>
        <p className="text-xs text-gray-500">{ja ? '15〜128文字。長いフレーズも使用できます。' : '15~128자. 기억하기 쉬운 긴 문장도 사용할 수 있습니다.'}</p>
        <label className="block text-sm">{ja ? 'パスワード確認' : '비밀번호 확인'}<input type="password" autoComplete="new-password" required minLength={15} maxLength={128} disabled={busy} className={inputClass} value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
        <p className="text-xs text-gray-500">{ja ? '登録後、会社の作成または招待コードでの参加を選択します。' : '가입 후 회사 만들기 또는 초대 코드로 참여를 선택합니다.'}</p>
      </>}
      {error && <p role="alert" className="rounded-xl border border-red-200/70 bg-red-50/65 p-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-2xl border border-orange-300/60 bg-gradient-to-b from-orange-400 to-orange-600 p-4 font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:from-orange-400 hover:to-orange-500 hover:shadow-xl hover:shadow-orange-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">{busy ? (ja ? '処理中…' : '처리 중…') : register ? (ja ? '登録して始める' : '가입하고 시작하기') : (ja ? 'ログイン' : '로그인하기')}</button>
    </form>
  </div>;
}
