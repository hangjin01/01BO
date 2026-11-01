import React, { useEffect, useState } from 'react';
import { Browser } from '@capacitor/browser';
import { isNativeApp } from '../services/nativeSession';
import { apiFetch } from '../services/apiService';

type Connection = { configured: boolean; connected: boolean; email: string | null };
export function GmailConnect() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function refresh() {
    try { setConnection(await apiFetch<Connection>('/gmail/status')); setMessage(''); }
    catch (e) { setMessage(e instanceof Error ? e.message : '연결 상태 확인 실패'); }
  }
  useEffect(() => {
    void refresh();
    const focus = () => { void refresh(); };
    const visible = () => { if(document.visibilityState==='visible')void refresh(); };
    const listener = isNativeApp() ? Browser.addListener('browserFinished', focus) : null;
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange',visible);
    return () => {window.removeEventListener('focus', focus);document.removeEventListener('visibilitychange',visible);void listener?.then(handle=>handle.remove());};
  }, []);
  async function connect() {
    setBusy(true); setMessage('');
    try {
      const result = await apiFetch<{ url: string }>('/gmail/connect', { method: 'POST', body: '{}' });
      const url = new URL(result.url);
      if (url.pathname !== '/api/gmail/launch' || url.username || url.password ||
        (url.protocol !== 'https:' && !(url.protocol === 'http:' && !isNativeApp() && url.origin === window.location.origin))) {
        throw new Error('Gmail 모바일 연결 주소가 준비되지 않았습니다. 서버의 HTTPS 연결 설정이 필요합니다.');
      }
      if (isNativeApp()) {await Browser.open({ url: url.href });setMessage('Google 연결을 마친 뒤 이 앱으로 돌아와 주세요.');}
      else window.location.assign(url.href);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Gmail 연결 실패'); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true);
    try {
      const result = await apiFetch<{ message: string }>('/gmail/connection', { method: 'DELETE' });
      await refresh(); setMessage(result.message);
    } catch (e) { setMessage(e instanceof Error ? e.message : '연결 해제 실패'); }
    finally { setBusy(false); }
  }
  return <section className="p-4 border rounded-xl bg-white dark:bg-gray-800 space-y-2 text-sm">
    <h3 className="font-bold">Gmail 연결</h3>
    <p>{connection?.connected ? `${connection.email} 연결됨` : '본인 Google 계정을 연결하면 일보를 이메일로 보낼 수 있습니다.'}</p>
    {connection && !connection.configured && <p>Gmail 연결 기능을 준비 중입니다.</p>}
    {connection?.connected
      ? <button disabled={busy} onClick={disconnect} className="underline">연결 해제</button>
      : <button disabled={busy || !connection?.configured} onClick={connect} className="bg-brand-orange text-white rounded-lg p-2 disabled:opacity-50">{busy?'Google 연결 여는 중…':'Google 계정으로 Gmail 연결'}</button>}
    <button disabled={busy} onClick={refresh} className="underline ml-3">연결 상태 새로고침</button>
    <p className="text-xs text-gray-500">메일 발송 권한만 요청합니다. 받은편지함은 읽지 않습니다.</p>
    {message && <p role="status" aria-live="polite" className="p-3 rounded-lg bg-orange-50 text-orange-900 break-words">{message}</p>}
  </section>;
}
