import { GmailConnect } from './GmailConnect';
import React,{useEffect,useRef,useState} from 'react';
import {apiFetch,apiDownload} from '../services/apiService';
type Report={id:string;date:string;content:string;tripId:string};
type Trip={id:string;title:string;startDate:string;endDate:string};
export type EmailDraft={id:string;recipient:string;subject:string;content:string;status:string;reportId:string};
export function EmailPreview({draft,onSent}:{key?:string;draft:EmailDraft;onSent?:()=>void}){
 const [state,setState]=useState(draft.status),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[confirming,setConfirming]=useState(false);
 const sending=useRef(false);
 async function send(){if(!confirming||sending.current||state!=='draft')return;sending.current=true;setBusy(true);try{const result=await apiFetch<{status:string;message:string}>('/agent/emails/'+encodeURIComponent(draft.id)+'/send',{method:'POST',body:JSON.stringify({confirm:true})});setState(result.status);setMessage(result.message);setConfirming(false);onSent?.();}catch(e){setMessage(e instanceof Error?e.message:'발송 실패');}finally{sending.current=false;setBusy(false);}}
 return <div className="border rounded-lg p-3 space-y-2 text-sm"><p>받는 사람: <strong>{draft.recipient}</strong></p><p>제목: {draft.subject}</p><p>첨부: O1BO_Report.docx</p><details><summary>발송할 일보 내용</summary><pre className="whitespace-pre-wrap font-sans max-h-64 overflow-auto">{draft.content}</pre></details><p>상태: {state==='sent'?'메일 서버 접수':state==='draft'?'발송 전':state==='sending'?'발송 중 또는 결과 확인 필요':'결과 확인 필요'}</p>{state==='draft'&&!confirming&&<button type="button" onClick={()=>setConfirming(true)} className="bg-brand-orange text-white p-2 rounded-lg">이 내용으로 이메일 발송</button>}{state==='draft'&&confirming&&<div role="group" aria-label="이메일 발송 확인" className="p-3 border-2 border-orange-400 rounded-lg space-y-2"><p className="font-bold">정말 보내겠습니까?</p><p className="break-all">{draft.recipient}</p><p>{draft.subject} · Word 일보 첨부</p><button type="button" disabled={busy} onClick={send} className="bg-brand-orange text-white p-2 rounded-lg">{busy?'발송 중…':'네, 발송합니다'}</button><button type="button" disabled={busy} onClick={()=>setConfirming(false)} className="ml-3 underline">취소</button></div>}{message&&<p role="status">{message}</p>}</div>;
}
export function DailyReportTools({activeTripId}:{activeTripId?:string}){
 const [trips,setTrips]=useState<Trip[]>([]),[reports,setReports]=useState<Report[]>([]),[emails,setEmails]=useState<EmailDraft[]>([]),[tripId,setTripId]=useState(''),[date,setDate]=useState(''),[recipient,setRecipient]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const pending=useRef<{signature:string;id:string}|null>(null);
 const refresh=async()=>{const [r,e]=await Promise.all([apiFetch<{reports:Report[]}>('/agent/reports'),apiFetch<{emails:EmailDraft[]}>('/agent/emails')]);setReports(r.reports);setEmails(e.emails);};
 useEffect(()=>{let active=true;apiFetch<{trips:Trip[]}>('/agent/report-options').then(r=>{if(!active)return;setTrips(r.trips);const t=r.trips.find(t=>t.id===activeTripId)||r.trips[0];if(t){setTripId(t.id);setDate(t.startDate);}}).catch(e=>setError(e.message));void refresh().catch(e=>setError(e.message));return()=>{active=false};},[]);
 async function create(){setBusy(true);setError('');const signature=tripId+'|'+date;if(pending.current?.signature!==signature)pending.current={signature,id:crypto.randomUUID()};try{await apiFetch('/agent/reports',{method:'POST',body:JSON.stringify({tripId,date,requestId:pending.current.id})});pending.current=null;await refresh();}catch(e){setError(e instanceof Error?e.message:'일보 작성 실패');}finally{setBusy(false);}}
 async function preview(report:Report){setBusy(true);setError('');try{const draft=await apiFetch<EmailDraft>('/agent/reports/'+encodeURIComponent(report.id)+'/email-preview',{method:'POST',body:JSON.stringify({recipient})});setEmails(e=>[draft,...e]);}catch(e){setError(e instanceof Error?e.message:'미리보기 실패');}finally{setBusy(false);}}
 const trip=trips.find(t=>t.id===tripId);
 return <div className="p-3 border rounded-xl space-y-3 text-sm">
  <h4 className="font-bold">일보 · Word · 이메일</h4>
  <GmailConnect />
  <select aria-label="일보 출장" className="w-full p-2 border rounded-lg dark:bg-gray-700" value={tripId} disabled={busy} onChange={e=>{setTripId(e.target.value);setDate(trips.find(t=>t.id===e.target.value)?.startDate||'');}}>{trips.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select>
  <input aria-label="일보 날짜" type="date" min={trip?.startDate} max={trip?.endDate} value={date} disabled={busy} onChange={e=>setDate(e.target.value)} className="p-2 border rounded-lg dark:bg-gray-700"/>
  <button type="button" disabled={busy||!tripId||!date} onClick={create} className="p-2 bg-brand-orange text-white rounded-lg">실제 기록으로 일보 작성</button>
  <input type="email" aria-label="일보 수신 이메일" placeholder="받는 사람 이메일" value={recipient} onChange={e=>setRecipient(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700"/>
  {error&&<p role="alert" className="text-red-600">{error}</p>}
  {!reports.length&&<p>저장된 일보가 없습니다.</p>}
  {reports.map(r=><div key={r.id} className="border rounded-lg p-2 space-y-2"><details><summary>{r.date} 일보 보기</summary><pre className="whitespace-pre-wrap font-sans max-h-64 overflow-auto">{r.content}</pre></details><button type="button" onClick={()=>apiDownload('/agent/reports/'+encodeURIComponent(r.id)+'/docx','O1BO_Report_'+r.date+'.docx').catch(e=>setError(e.message))} className="underline mr-3">Word 다운로드</button><button type="button" disabled={busy||!recipient.trim()} onClick={()=>preview(r)} className="underline">이메일 미리보기</button></div>)}
  {emails.map(e=><EmailPreview key={e.id} draft={e}/>)}
 </div>;
}
