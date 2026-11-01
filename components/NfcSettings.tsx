import React,{useEffect,useState} from 'react';
import {apiFetch,fetchTrips} from '../services/apiService';
import {cancelNfc,fetchNfcPolicy,NfcPolicy,scanNfc,nfcStatus} from '../services/nfcService';
import {Trip} from '../types';
export function NfcSettings({companyCode,onChanged}:{companyCode:string;onChanged:(enabled:boolean)=>void}){
 const [policy,setPolicy]=useState<NfcPolicy|null>(null),[trips,setTrips]=useState<Trip[]>([]),[tripId,setTripId]=useState(''),[itemId,setItemId]=useState(''),[tags,setTags]=useState<any[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [device,setDevice]=useState<{supported:boolean;enabled:boolean}|null>(null);
 async function refresh(){setDevice(await nfcStatus().catch(()=>null));const p=await fetchNfcPolicy();setPolicy(p);onChanged(p.enabled);if(p.canManage){const [t,r]=await Promise.all([fetchTrips(),apiFetch<{tags:any[]}>('/nfc/tags')]);setTrips(t);setTags(r.tags);}}
 useEffect(()=>{void refresh().catch(e=>setMessage(e.message));return cancelNfc;},[companyCode]);
 async function run(fn:()=>Promise<void>){setBusy(true);setMessage('');try{await fn();await refresh();}catch(e){setMessage(e instanceof Error?e.message:'처리에 실패했습니다.');}finally{setBusy(false);}}
 const trip=trips.find(t=>t.id===tripId);
 return <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
  <div className="flex justify-between items-center gap-3"><div><h3 className="font-bold">NFC 이중 확인</h3><p className="text-xs text-gray-500">등록된 현장에서 NFC와 GPS로 체크인·체크아웃을 확인합니다.</p></div>
  <button role="switch" aria-checked={policy?.enabled||false} aria-label="NFC 이중 확인" disabled={busy||!policy?.canManage} className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 ${policy?.enabled ? 'bg-orange-500 border-orange-500 text-white' : 'bg-transparent border-gray-400 text-gray-700 dark:border-gray-500 dark:text-gray-200'}`} onClick={()=>void run(async()=>{await apiFetch('/nfc/policy',{method:'PUT',body:JSON.stringify({enabled:!policy?.enabled})});})}>{policy?policy.enabled?'켜짐':'꺼짐':'확인 중'}</button></div>
  <p className="text-xs text-gray-500">회사 사장만 설정을 변경합니다. 태그가 없는 일정은 GPS 확인을 사용합니다. 위치는 체크인·체크아웃할 때만 전송됩니다.</p>
  <p className="text-sm">{!device?'기기 NFC 상태 확인 중':!device.supported?'이 기기는 NFC를 지원하지 않습니다. 안드로이드 NFC 지원 기기를 사용해 주세요.':!device.enabled?'휴대폰 설정에서 NFC를 켠 뒤 다시 확인하세요.':'휴대폰 NFC 사용 가능'}</p>
  <button disabled={busy} className="text-sm underline" onClick={()=>void refresh().catch(e=>setMessage(e.message))}>NFC 상태 다시 확인</button>
  {policy?.canManage&&<><h4 className="font-bold text-sm">현장 스티커 등록</h4>
  <select disabled={busy} aria-label="NFC 출장 선택" className="w-full border rounded-lg p-2 dark:bg-gray-900" value={tripId} onChange={e=>{setTripId(e.target.value);setItemId('');}}><option value="">출장 선택</option>{trips.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select>
  <select disabled={busy} aria-label="NFC 일정 선택" className="w-full border rounded-lg p-2 dark:bg-gray-900" value={itemId} onChange={e=>setItemId(e.target.value)}><option value="">방문 일정 선택</option>{trip?.itinerary.map(i=><option key={i.id} value={i.id}>{i.date} {i.locationName}</option>)}</select>
  <p className="text-xs text-gray-500">빈 NDEF 스티커를 준비해 현장에 고정하세요. 기록 버튼은 기존 내용을 덮어씁니다. 같은 스티커를 여러 일정에 재등록하지 마세요.</p>
  <button disabled={busy||!tripId||!itemId||!device?.enabled} className="bg-orange-500 text-white rounded-lg p-2 disabled:opacity-50" onClick={()=>void run(async()=>{const token='o1bo:'+Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');setMessage('휴대폰 뒷면을 빈 스티커에 접촉해 주세요.');await scanNfc(token);try{await apiFetch('/nfc/tags',{method:'POST',body:JSON.stringify({tripId,itemId,tagId:token})});}catch{throw new Error('스티커 기록은 완료했지만 서버 등록에 실패했습니다. 등록을 다시 시도해 주세요.');}setMessage('현장 태그가 등록되었습니다. 회사 NFC 설정을 켤 수 있습니다.');})}>스티커 기록·등록</button>
  <button disabled={busy||!tripId||!itemId||!device?.enabled} className="border rounded-lg p-2 disabled:opacity-50" onClick={()=>void run(async()=>{setMessage('이미 기록한 O1BO 스티커를 접촉해 주세요.');const token=await scanNfc();await apiFetch('/nfc/tags',{method:'POST',body:JSON.stringify({tripId,itemId,tagId:token})});setMessage('스티커 서버 등록을 완료했습니다.');})}>기록한 스티커 서버 등록 재시도</button>
  <p className="text-xs text-gray-500">스티커에 기록했지만 서버 등록만 실패한 경우 재시도를 사용하세요. 체크인은 선택한 방문 장소에서 50m 이내여야 합니다.</p>
  {tags.filter(t=>t.ENABLED===1).map(t=><div key={t.TAG_HASH} className="text-sm border-t pt-2 flex justify-between gap-2"><span>{trips.find(x=>x.id===t.TRIP_ID)?.itinerary.find(i=>i.id===t.ITEM_ID)?.locationName||'등록된 현장'}</span><button disabled={busy||policy.enabled} onClick={()=>void run(async()=>{await apiFetch('/nfc/tags/'+t.TAG_HASH,{method:'DELETE'});})}>등록 해제</button></div>)}
  </>}
  {busy&&<button onClick={cancelNfc} className="text-sm underline">NFC 대기 취소</button>}
  {message&&<p role="status" className="text-sm">{message}</p>}
 </section>;
}
