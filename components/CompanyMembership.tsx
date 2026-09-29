import React, { useEffect, useState } from 'react';
import { User, Lang } from '../types';
import { apiFetch, updateMembership, createCompany } from '../services/apiService';

type Company = { COMPANY_CODE: string; COMPANY_NAME: string };
type Invite = { id: string; expiresAt: number };
export function CompanyMembership({ user, language, onJoined }: { user: User; language: Lang; onJoined: (user: User) => void }) {
  const ja = language === 'ja';
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState(user.name || '');
  const [company, setCompany] = useState<Company | null>(null);
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<Company | null>(null);
  const [issued, setIssued] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const admin = user.role === 'admin' && !!user.companyCode;
  const base = `/companies/${encodeURIComponent(user.companyCode || '')}/invites`;
  const refreshInvites = async () => {
    const result = await apiFetch<{ data: Invite[] }>(base);
    setInvites(result.data);
  };
  useEffect(() => {
    let cancelled = false;
    setCompany(null); setPreview(null); setCode(''); setIssued(''); setInvites([]);
    if (user.companyCode) apiFetch<{ data: Company[] }>('/companies').then(result => {
      if (!cancelled) setCompany(result.data[0] || null);
    }).catch(error => { if (!cancelled) setError(error.message); });
    if (admin) apiFetch<{ data: Invite[] }>(base).then(result => {
      if (!cancelled) setInvites(result.data);
    }).catch(error => { if (!cancelled) setError(error.message); });
    return () => { cancelled = true; };
  }, [user.companyCode, user.role]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (error) { setError(error instanceof Error ? error.message : '요청 실패'); }
    finally { setBusy(false); }
  };
  const button = 'rounded-xl bg-orange-600 px-4 py-2 text-white font-bold disabled:opacity-50';
  return <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
    <p className="text-sm text-gray-500">{ja ? '他の社員の出張状況は社長のみ閲覧できます。' : '회사 전체 출장 현황은 사장만 볼 수 있습니다. 직원은 본인 출장만 확인합니다.'}</p>
    <h2 className="font-bold text-lg">{ja ? '所属管理' : '소속 관리'}</h2>
    {user.companyCode ? <>
      <dl className="space-y-2 text-sm">
        <div><dt className="text-gray-500">{ja ? '会社' : '현재 회사'}</dt><dd className="font-bold">{company?.COMPANY_NAME || user.companyCode}</dd></div>
        <div><dt className="text-gray-500">{ja ? '会社識別コード（招待用ではありません）' : '회사 식별 코드 (초대용 아님)'}</dt><dd>{user.companyCode}</dd></div>
        <div><dt className="text-gray-500">{ja ? '権限 / チーム' : '역할 / 팀'}</dt><dd>{({ admin: ja ? '社長' : '사장', manager: ja ? '社員' : '직원', employee: ja ? 'メンバー' : '직원' })[user.role]} / {user.teamCode || (ja ? '未参加' : '미참여')}</dd></div>
      </dl>
      <p className="text-sm text-gray-500">{ja ? '会社の変更は管理者にお問い合わせください。以前の出張・経費は元の会社に残ります。' : '회사 변경은 관리자에게 문의해 주세요. 이전 출장·경비 기록은 원래 회사에 유지됩니다.'}</p>
    </> : <>
      {mode === 'choose' && <div className="grid gap-3">
        <p className="text-sm text-gray-500">{ja ? '利用方法を選択してください。' : '어떤 방식으로 시작하시겠어요?'}</p>
        <button className="rounded-xl border border-orange-300 p-5 text-left hover:bg-orange-50 dark:hover:bg-gray-900" onClick={() => { setMode('create'); setError(''); }}>
          <strong className="block">{ja ? '会社を作成 · 社長' : '회사 만들기 · 사장'}</strong>
          <span className="text-sm text-gray-500">{ja ? '新しい会社を作成して社員を招待します。' : '새 회사를 만들고 직원들을 초대합니다.'}</span>
        </button>
        <button className="rounded-xl border p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-900" onClick={() => { setMode('join'); setError(''); }}>
          <strong className="block">{ja ? '招待コードで参加 · 社員' : '초대 코드로 참여 · 직원'}</strong>
          <span className="text-sm text-gray-500">{ja ? '招待された会社に社員として参加します。' : '초대받은 회사에 직원으로 참여합니다.'}</span>
        </button>
      </div>}
      {mode !== 'choose' && <button className="text-sm text-orange-600" disabled={busy} onClick={() => { setMode('choose'); setPreview(null); setError(''); }}>{ja ? '← 選択に戻る' : '← 선택으로 돌아가기'}</button>}
      {mode === 'create' && <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (busy) return; void run(async () => {
        const saved = await createCompany(companyName.trim(), ownerName.trim());
        onJoined(saved);
      }); }}>
        <label className="block text-sm">{ja ? '会社名' : '회사명'}
          <input required maxLength={100} value={companyName} disabled={busy} onChange={event => setCompanyName(event.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-transparent" autoComplete="organization" />
        </label>
        <label className="block text-sm">{ja ? 'お名前' : '사장님 이름'}
          <input required maxLength={100} value={ownerName} disabled={busy} onChange={event => setOwnerName(event.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-transparent" autoComplete="name" />
        </label>
        <p className="text-sm text-gray-500">{ja ? '作成した会社の社長権限が設定されます。同名の既存会社には接続されません。' : '새로 만든 회사의 사장 권한으로 등록됩니다. 같은 이름의 기존 회사에 연결되지는 않습니다.'}</p>
        <button className={button} type="submit" disabled={busy || !companyName.trim() || !ownerName.trim()}>{ja ? '会社を作成して始める' : '회사 만들고 시작하기'}</button>
      </form>}
      {mode === 'join' && <>
      <p className="text-sm text-gray-500">{ja ? '管理者から受け取った招待コードで会社に参加してください。参加するまで会社のデータは表示されません。' : '관리자에게 받은 초대 코드로 회사에 참여하세요. 참여 전에는 회사 데이터가 표시되지 않습니다.'}</p>
      <label className="block text-sm">{ja ? '会社招待コード' : '회사 초대 코드'}
        <input className="mt-2 w-full rounded-xl border p-3 bg-transparent" value={code} autoComplete="off" disabled={busy} onChange={event => { setCode(event.target.value); setPreview(null); }} />
      </label>
      <button className={button} disabled={busy || !code.trim()} onClick={() => run(async () => {
        const result = await apiFetch<{ data: Company }>('/companies/invites/preview', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
        setPreview(result.data);
      })}>{ja ? '会社を確認' : '회사 확인'}</button>
      {preview && <div className="rounded-xl bg-orange-50 dark:bg-gray-900 p-4 space-y-3">
        <p className="font-bold">{preview.COMPANY_NAME}</p>
        <p className="text-sm">{ja ? 'メンバーとして参加します。' : '직원 권한으로 참여합니다.'}</p>
        <button className={button} disabled={busy} onClick={() => run(async () => {
          const saved = await updateMembership('/companies/join', code.trim());
          setCode(''); setPreview(null); onJoined(saved);
        })}>{ja ? 'この会社に参加' : '이 회사에 참여하기'}</button>
      </div>}
      </>}
    </>}
    {admin && <div className="border-t pt-4 space-y-3">
      <h3 className="font-bold">{ja ? '社員の招待' : '직원 초대'}</h3>
      <p className="text-sm text-gray-500">{ja ? '24時間有効、1人につき1回の招待コードです。新規メンバーは社員権限で参加します。' : '24시간 동안 한 사람이 한 번만 사용할 수 있습니다. 참여자는 직원 권한으로 등록됩니다.'}</p>
      <button className={button} disabled={busy} onClick={() => run(async () => {
        const result = await apiFetch<{ code: string }>(base, { method: 'POST', body: '{}' });
        setIssued(result.code); await refreshInvites();
      })}>{ja ? '招待コードを発行' : '초대 코드 발급'}</button>
      {issued && <div className="space-y-2">
        <label className="block text-sm">{ja ? '発行されたコード（この画面でのみ表示）' : '발급된 코드 (이 화면에서만 표시)'}<input className="block w-full mt-1 border rounded-lg p-2 bg-transparent" readOnly value={issued} /></label>
        <button className={button} disabled={busy} onClick={() => run(async () => { await navigator.clipboard.writeText(issued); setMessage(ja ? 'コピーしました。' : '복사했습니다.'); })}>{ja ? 'コピー' : '코드 복사'}</button>
      </div>}
      {invites.length > 0 && <ul className="space-y-2">{invites.map(invite => <li key={invite.id} className="flex justify-between items-center gap-2 text-sm">
        <span>{ja ? '有効期限' : '만료'}: {new Date(invite.expiresAt).toLocaleString(ja ? 'ja-JP' : 'ko-KR')}</span>
        <button className="text-red-600 disabled:opacity-50" disabled={busy} onClick={() => run(async () => {
          await apiFetch(`${base}/${encodeURIComponent(invite.id)}`, { method: 'DELETE' });
          setIssued(''); await refreshInvites(); setMessage(ja ? '招待を取り消しました。' : '초대를 취소했습니다.');
        })}>{ja ? '取り消す' : '초대 취소'}</button>
      </li>)}</ul>}
    </div>}
    {busy && <p role="status">{ja ? '処理中…' : '처리 중…'}</p>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {message && <p role="status" className="text-sm text-green-600">{message}</p>}
  </section>;
}
