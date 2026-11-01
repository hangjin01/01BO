import React, { useEffect, useRef, useState } from 'react';
import { Lang } from '../types';
import { apiFetch } from '../services/apiService';
import { DailyReportTools, EmailPreview, EmailDraft } from './DailyReportTools';
import { IconBot, IconX, IconMic, IconSend } from './Icons';

type Result = { email?:EmailDraft; reportId?:string; requestId: string; message: string; kind: string; changed?: boolean; tripId?: string; choices?: { name: string; address: string }[]; attribution?: string };
type Turn = { role: 'user' | 'assistant'; text: string; result?: Result };
type Request = { requestId: string; conversationId: string; message: string; language: Lang; activeTripId?: string; choice?: { requestId: string; index: number } };
interface Props {
  accountScope: string;
  language: Lang; showAIChat: boolean; setShowAIChat: (v: boolean) => void;
  aiChatInput: string; setAiChatInput: (v: string) => void;
  isListening: boolean; startListening: () => void;
  activeTripId?: string; onChanged: (tripId?: string) => Promise<void>;
}
export const AIChatModal: React.FC<Props> = ({ accountScope, language, showAIChat, setShowAIChat, aiChatInput, setAiChatInput, isListening, startListening, activeTripId, onChanged }) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [restoring,setRestoring]=useState(true);
  const [restoreFailed,setRestoreFailed]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const storageKey='o1bo_agent_pending:'+accountScope;
  const remember=(value:Request|null)=>{try{if(value)sessionStorage.setItem(storageKey,JSON.stringify(value));else sessionStorage.removeItem(storageKey);}catch{/* Server dedupe remains authoritative. */}};
  const [showTools,setShowTools]=useState(false);
  const [status, setStatus] = useState<{ai:boolean;places:boolean;mail:boolean} | null>(null);
  const conversation = useRef(crypto.randomUUID());
  const pending = useRef<Request | null>(null);
  const running = useRef(false);
  const restoreVersion=useRef(0);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (showAIChat) apiFetch<{ai:boolean;places:boolean;mail:boolean}>('/agent/status').then(setStatus).catch(() => setStatus(null)); }, [showAIChat]);
  useEffect(() => { if (showAIChat) end.current?.scrollIntoView({behavior:'smooth'}); }, [turns, busy, showAIChat]);
  const restore = async () => {
    if(running.current)return;
    const version=++restoreVersion.current;
    setRestoring(true);setRestoreFailed(false);
    try {
      let saved:Request|null=pending.current;
      if(!saved)try{const value=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(value&&typeof value.message==='string'&&typeof value.requestId==='string'&&typeof value.conversationId==='string'&&['ko','ja'].includes(value.language))saved=value;}catch{}
      const history=await apiFetch<{conversationId:string|null;messages:{requestId:string;message:string;result:Result}[]}>('/agent/history'+(saved?'?conversationId='+encodeURIComponent(saved.conversationId):''));
      if(version!==restoreVersion.current)return;
      conversation.current=saved?.conversationId||history.conversationId||crypto.randomUUID();
      const restored:Turn[]=history.messages.flatMap(m=>[{role:'user' as const,text:m.message},{role:'assistant' as const,text:m.result.message,result:m.result}]);
      if(saved&&!history.messages.some(m=>m.requestId===saved!.requestId)){
        pending.current=saved;restored.push({role:'user',text:saved.message});
        setError('이전 요청의 완료 여부를 확인해 주세요. 같은 요청 재시도는 중복 저장을 방지합니다.');
      }else{pending.current=null;remember(null);setError('');}
      setTurns(restored);
    }catch(e){if(version===restoreVersion.current){setRestoreFailed(true);setError(e instanceof Error?e.message:'대화를 복원하지 못했습니다.');}}
    finally{if(version===restoreVersion.current)setRestoring(false);}
  };
  useEffect(()=>{void restore();return()=>{restoreVersion.current++;};},[]);
  useEffect(()=>{if(!busy){setElapsed(0);return;}const started=Date.now();const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-started)/1000)),1000);return()=>clearInterval(timer);},[busy]);
  const send = async (choice?: Request['choice']) => {
    if (running.current || restoring || restoreFailed) return;
    let request = pending.current;
    if (!request) {
      const message = choice ? '선택한 장소로 등록해 주세요.' : aiChatInput.trim();
      if (!message) return;
      request = {requestId:crypto.randomUUID(),conversationId:conversation.current,message,language,activeTripId,...(choice?{choice}:{})};
      pending.current = request;
      remember(request);
      setTurns(prev => [...prev,{role:'user',text:message}]);
      setAiChatInput('');
    }
    running.current=true;setBusy(true);setError('');
    try {
      const result = await apiFetch<Result>('/agent/messages',{method:'POST',body:JSON.stringify(request)});
      pending.current=null;remember(null);
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
    <section role="dialog" aria-modal="true" aria-label="제로보" className="sheet-enter bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      <header className="bg-brand-orange p-4 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><IconBot className="w-6 h-6"/>제로보 · Zerobo</h3>
        <button aria-label="닫기" onClick={()=>setShowAIChat(false)}><IconX className="w-6 h-6"/></button>
      </header>
      <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50 dark:bg-gray-900/50" aria-live="polite">
        <p className="text-sm text-gray-600 dark:text-gray-300">{language==='ja'?'予定の確認・登録・変更、日報の作成をお手伝いします。':'일정 조회·등록·변경, 일보 작성과 이메일 발송을 도와드려요. 이메일은 받는 사람과 내용을 확인하고 발송을 승인해야 보내집니다.'}</p>
        <div className="flex flex-wrap gap-2">{(language==='ja'?['明日10時に東京駅で打ち合わせを登録して','今日の日報を作成して','今日の日報をメールで送りたい']:['내일 오전 10시 도쿄역 미팅 등록해줘','오늘 일보 작성해줘','오늘 일보 이메일로 보내줘']).map(text=><button type="button" key={text} disabled={busy||restoring||restoreFailed||!!pending.current} onClick={()=>setAiChatInput(text)} className="text-xs border rounded-lg px-2 py-1 disabled:opacity-50">{text}</button>)}</div>
        <button onClick={()=>setShowTools(v=>!v)} type="button" className="text-xs underline text-brand-orange mr-3">일보 · Word · 이메일</button>
        {showTools&&<DailyReportTools activeTripId={activeTripId}/>}
        <button onClick={showReports} disabled={restoring||restoreFailed||busy||!!pending.current} className="text-xs underline text-brand-orange">저장된 일보 보기</button>
        {status && (!status.ai||!status.places||!status.mail) && <p className="text-xs p-3 rounded-lg bg-amber-50 text-amber-900">연결 대기: {[!status.ai&&'AI',!status.places&&'장소 검색',!status.mail&&'이메일'].filter(Boolean).join(' · ')}. 연결되지 않은 기능은 실행되지 않습니다.</p>}
        {turns.map((turn,index)=><div key={index} className={`p-3 rounded-xl text-sm whitespace-pre-wrap break-words ${turn.role==='user'?'bg-orange-100 text-gray-900 ml-6':'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 mr-2'}`}>
          <p className="font-bold text-xs mb-1">{turn.role==='user'?'나':'제로보'}</p>{turn.text}
          {turn.result===lastResult&&turn.result?.choices?.map((place,i)=><button key={i} disabled={restoring||restoreFailed||busy||!!pending.current} onClick={()=>send({requestId:turn.result!.requestId,index:i})} className="block text-left border rounded-lg p-3 w-full mt-2 disabled:opacity-50"><strong>{place.name}</strong><br/><span className="text-xs">{place.address}</span></button>)}
          {turn.result?.email&&<EmailPreview draft={turn.result.email}/>}
          {turn.result?.attribution&&<a className="block text-xs underline mt-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">{turn.result.attribution}</a>}
        </div>)}
        {restoring&&<p role="status">이전 대화를 불러오고 있습니다.</p>}
        {restoreFailed&&<button onClick={()=>void restore()} className="underline">대화 복원 다시 시도</button>}
        {busy&&<p className="text-sm text-brand-orange">요청을 처리하고 있습니다. {elapsed}초 경과.  창을 닫아도 진행 중인 작업은 취소되지 않습니다.</p>}
        {error&&<p role="alert" className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
        {pending.current&&!busy&&!restoring&&!restoreFailed&&<button onClick={()=>send()} className="border rounded-lg px-3 py-2 text-sm">같은 요청 재시도</button>}
        {pending.current&&!busy&&!restoring&&!restoreFailed&&<button onClick={()=>{pending.current=null;remember(null);setError('');}} className="block text-xs underline">새 요청 입력 (앞선 작업을 취소하지 않습니다)</button>}
        <div ref={end}/>
      </div>
      <form onSubmit={e=>{e.preventDefault();void send();}} className="p-3 border-t dark:border-gray-700 flex items-end gap-2">
        <textarea aria-label="제로보에게 요청" value={aiChatInput} onChange={e=>setAiChatInput(e.target.value)} disabled={restoring||restoreFailed||busy||!!pending.current} maxLength={1000} placeholder={language==='ja'?'明日の予定を教えて':'내일 일정 보여줘 / 오늘 일보 작성해줘'} className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl p-3 h-20 resize-none text-sm"/>
        <button type="button" aria-label="음성 입력" disabled={restoring||restoreFailed||busy||isListening||!!pending.current} onClick={startListening} className="p-2 text-gray-500"><IconMic className="w-5 h-5"/></button>
        <button type="submit" aria-label="요청 보내기" disabled={restoring||restoreFailed||busy||!!pending.current||!aiChatInput.trim()} className="p-3 bg-brand-orange text-white rounded-xl disabled:opacity-50"><IconSend className="w-5 h-5"/></button>
      </form>
    </section>
  </div>;
};
