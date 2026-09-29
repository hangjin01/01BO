import React, { useEffect, useRef, useState } from 'react';
import { Lang } from '../types';
import { apiFetch } from '../services/apiService';
import { IconBot, IconX, IconMic, IconSend } from './Icons';

type Result = { requestId: string; message: string; kind: string; changed?: boolean; tripId?: string; choices?: { name: string; address: string }[]; attribution?: string };
type Turn = { role: 'user' | 'assistant'; text: string; result?: Result };
type Request = { requestId: string; conversationId: string; message: string; language: Lang; activeTripId?: string; choice?: { requestId: string; index: number } };
interface Props {
  language: Lang; showAIChat: boolean; setShowAIChat: (v: boolean) => void;
  aiChatInput: string; setAiChatInput: (v: string) => void;
  isListening: boolean; startListening: () => void;
  activeTripId?: string; onChanged: (tripId?: string) => Promise<void>;
}
export const AIChatModal: React.FC<Props> = ({ language, showAIChat, setShowAIChat, aiChatInput, setAiChatInput, isListening, startListening, activeTripId, onChanged }) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ai:boolean;places:boolean;mail:boolean} | null>(null);
  const conversation = useRef(crypto.randomUUID());
  const pending = useRef<Request | null>(null);
  const running = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (showAIChat) apiFetch<{ai:boolean;places:boolean;mail:boolean}>('/agent/status').then(setStatus).catch(() => setStatus(null)); }, [showAIChat]);
  useEffect(() => { if (showAIChat) end.current?.scrollIntoView({behavior:'smooth'}); }, [turns, busy, showAIChat]);
  const send = async (choice?: Request['choice']) => {
    if (running.current) return;
    let request = pending.current;
    if (!request) {
      const message = choice ? '선택한 장소로 등록해 주세요.' : aiChatInput.trim();
      if (!message) return;
      request = {requestId:crypto.randomUUID(),conversationId:conversation.current,message,language,activeTripId,...(choice?{choice}:{})};
      pending.current = request;
      setTurns(prev => [...prev,{role:'user',text:message}]);
      setAiChatInput('');
    }
    running.current=true;setBusy(true);setError('');
    try {
      const result = await apiFetch<Result>('/agent/messages',{method:'POST',body:JSON.stringify(request)});
      pending.current=null;
      setTurns(prev=>[...prev,{role:'assistant',text:result.message,result}]);
      if(result.changed) {
        try { await onChanged(result.tripId); } catch { setError('작업은 저장됐지만 화면 갱신에 실패했습니다. 화면을 다시 열어 주세요.'); }
      }
    } catch (e) {
      setError((e instanceof Error?e.message:'요청에 실패했습니다.')+' 같은 요청 재시도로 처리 결과를 확인할 수 있습니다.');
    } finally { running.current=false;setBusy(false); }
  };
  const showReports = async () => {
    try {
      const {reports} = await apiFetch<{reports:{id:string;date:string;content:string}[]}>('/agent/reports');
      setTurns(prev=>[...prev,{role:'assistant',text:reports.length?'최근 저장된 일보 (최대 20건)\n\n'+reports.map(r=>r.content).join('\n\n────────\n\n'):'저장된 일보가 없습니다.'}]);
    } catch(e) { setError(e instanceof Error?e.message:'일보를 불러오지 못했습니다.'); }
  };
  if (!showAIChat) return null;
  const lastResult=[...turns].reverse().find(turn=>turn.result)?.result;
  return <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-3">
    <section role="dialog" aria-modal="true" aria-label="제로보" className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      <header className="bg-brand-orange p-4 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><IconBot className="w-6 h-6"/>제로보 · Zerobo</h3>
        <button aria-label="닫기" onClick={()=>setShowAIChat(false)}><IconX className="w-6 h-6"/></button>
      </header>
      <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50 dark:bg-gray-900/50" aria-live="polite">
        <p className="text-sm text-gray-600 dark:text-gray-300">{language==='ja'?'予定の確認・登録・変更、日報の作成をお手伝いします。':'일정 조회·등록·변경과 실제 기록을 이용한 일보 작성을 도와드려요.'}</p>
        <button onClick={showReports} disabled={busy||!!pending.current} className="text-xs underline text-brand-orange">저장된 일보 보기</button>
        {status && (!status.ai||!status.places||!status.mail) && <p className="text-xs p-3 rounded-lg bg-amber-50 text-amber-900">연결 대기: {[!status.ai&&'AI',!status.places&&'장소 검색',!status.mail&&'이메일'].filter(Boolean).join(' · ')}. 연결되지 않은 기능은 실행되지 않습니다.</p>}
        {turns.map((turn,index)=><div key={index} className={`p-3 rounded-xl text-sm whitespace-pre-wrap break-words ${turn.role==='user'?'bg-orange-100 text-gray-900 ml-6':'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 mr-2'}`}>
          <p className="font-bold text-xs mb-1">{turn.role==='user'?'나':'제로보'}</p>{turn.text}
          {turn.result===lastResult&&turn.result?.choices?.map((place,i)=><button key={i} disabled={busy||!!pending.current} onClick={()=>send({requestId:turn.result!.requestId,index:i})} className="block text-left border rounded-lg p-3 w-full mt-2 disabled:opacity-50"><strong>{place.name}</strong><br/><span className="text-xs">{place.address}</span></button>)}
          {turn.result?.attribution&&<a className="block text-xs underline mt-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">{turn.result.attribution}</a>}
        </div>)}
        {busy&&<p className="text-sm text-brand-orange">요청을 처리하고 있습니다. 창을 닫아도 진행 중인 작업은 취소되지 않습니다.</p>}
        {error&&<p role="alert" className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
        {pending.current&&!busy&&<button onClick={()=>send()} className="border rounded-lg px-3 py-2 text-sm">같은 요청 재시도</button>}
        {pending.current&&!busy&&<button onClick={()=>{pending.current=null;setError('');}} className="block text-xs underline">새 요청 입력 (앞선 작업을 취소하지 않습니다)</button>}
        <div ref={end}/>
      </div>
      <form onSubmit={e=>{e.preventDefault();void send();}} className="p-3 border-t dark:border-gray-700 flex items-end gap-2">
        <textarea aria-label="제로보에게 요청" value={aiChatInput} onChange={e=>setAiChatInput(e.target.value)} disabled={busy||!!pending.current} maxLength={1000} placeholder={language==='ja'?'明日の予定を教えて':'내일 일정 보여줘 / 오늘 일보 작성해줘'} className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl p-3 h-20 resize-none text-sm"/>
        <button type="button" aria-label="음성 입력" disabled={busy||isListening||!!pending.current} onClick={startListening} className="p-2 text-gray-500"><IconMic className="w-5 h-5"/></button>
        <button type="submit" aria-label="요청 보내기" disabled={busy||!!pending.current||!aiChatInput.trim()} className="p-3 bg-brand-orange text-white rounded-xl disabled:opacity-50"><IconSend className="w-5 h-5"/></button>
      </form>
    </section>
  </div>;
};
