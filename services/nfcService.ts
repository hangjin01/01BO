import {Capacitor,registerPlugin} from '@capacitor/core';
import {apiFetch} from './apiService';
const native=registerPlugin<{status():Promise<{supported:boolean;enabled:boolean}>;read():Promise<{token:string}>;write(options:{token:string}):Promise<{token:string}>;cancel():Promise<void>}>('O1boNfc');
let controller:AbortController|null=null;
export function cancelNfc(){controller?.abort();controller=null;if(Capacitor.getPlatform()==='android')void native.cancel().catch(()=>{});}
export async function scanNfc(writeToken?:string):Promise<string>{
 if(Capacitor.getPlatform()==='android')return (await (writeToken?native.write({token:writeToken}):native.read())).token;
 const Reader=(window as any).NDEFReader;if(!Reader)throw new Error('NFC 지원 안드로이드 휴대폰에서 실행해 주세요.');
 const operation=new AbortController();controller=operation;const signal=operation.signal,reader=new Reader();
 const timer=setTimeout(()=>operation.abort(),45000);
 try{
  if(writeToken){await reader.write({records:[{recordType:'mime',mediaType:'application/vnd.o1bo.tag',data:new TextEncoder().encode(writeToken)}]},{signal});return writeToken;}
  return await new Promise<string>((resolve,reject)=>{
   signal.addEventListener('abort',()=>reject(new Error('NFC 작업이 취소되었거나 시간이 만료되었습니다.')),{once:true});
   reader.onreading=(event:any)=>{const record=Array.from(event.message.records as any[]).find((r:any)=>r.recordType==='mime'&&r.mediaType==='application/vnd.o1bo.tag');const token=record?new TextDecoder().decode(record.data):'';if(!/^o1bo:[a-f0-9]{64}$/.test(token))reject(new Error('등록된 O1BO 태그를 접촉해 주세요.'));else resolve(token);};
   reader.onreadingerror=()=>reject(new Error('NFC를 읽지 못했습니다. 다시 접촉해 주세요.'));
   reader.scan({signal}).catch(reject);
  });
 }finally{clearTimeout(timer);operation.abort();if(controller===operation)controller=null;}
}
export interface NfcPolicy {enabled:boolean;radiusMeters:number;tagCount:number;canManage:boolean}
export const fetchNfcPolicy=()=>apiFetch<NfcPolicy>('/nfc/policy');
export const nfcRequirement=(tripId:string,itemId:string)=>apiFetch<{required:boolean;registered:boolean}>('/nfc/requirement?'+new URLSearchParams({tripId,itemId}));

export async function nfcStatus():Promise<{supported:boolean;enabled:boolean}> {
 if(Capacitor.getPlatform()==='android')return native.status();
 return {supported:typeof (window as any).NDEFReader!=='undefined',enabled:typeof (window as any).NDEFReader!=='undefined'};
}
