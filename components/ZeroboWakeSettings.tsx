import React,{useEffect,useState} from 'react';
import {Lang} from '../types';
import {NativeWake,supportsWake,WakeStatus} from '../services/wakeService';

export function ZeroboWakeSettings({language}:{language:Lang}){
  const ja=language==='ja';
  const supported=supportsWake();
  const [status,setStatus]=useState<WakeStatus>({state:'off',error:''});
  const [busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!supported)return;
    let alive=true;
    const refresh=async()=>{try{const value=await NativeWake.status();if(alive){setStatus(value);setReady(true);}}catch{if(alive){setReady(false);setError(ja?'このAPKは呼び出し機能に対応していません。更新してください。':'이 APK는 호출 기능을 지원하지 않습니다. 업데이트해 주세요.');}}};
    void refresh();const timer=window.setInterval(refresh,1200);
    return()=>{alive=false;window.clearInterval(timer);};
  },[supported,ja]);
  const active=status.state!=='off';
  const toggle=async()=>{
    if(busy)return;setBusy(true);setError('');
    try{if(active)await NativeWake.stop();else await NativeWake.start();setStatus(await NativeWake.status());}
    catch(e){setError(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  };
  const stateLabel=status.state==='starting'?(ja?'準備中…':'준비 중…'):status.state==='listening'?(ja?'呼び出し待機中':'호출 대기 중'):(ja?'オフ':'꺼짐');
  const reasons:Record<string,string>={
    timeout:ja?'30分が経過して終了しました。':'30분이 지나 호출 대기를 종료했습니다.',
    model:ja?'音声モデルを準備できませんでした。空き容量を確認してください。':'음성 모델을 준비하지 못했습니다. 저장 공간을 확인해 주세요.',
    microphone:ja?'マイクを使用できず停止しました。権限や他のアプリを確認してください。':'마이크를 사용할 수 없어 종료했습니다. 권한과 다른 앱의 마이크 사용을 확인해 주세요.',
    start:ja?'呼び出し待機を開始できませんでした。':'호출 대기를 시작하지 못했습니다.'
  };
  return <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
    <div className="flex gap-3 items-center justify-between">
      <h3 className="font-bold min-w-0">{ja?'ゼロボのバックグラウンド呼び出し':'백그라운드 제로보 호출'} <span className="text-xs text-orange-600">{ja?'試験機能':'실험 기능'}</span></h3>
      <button type="button" role="switch" aria-checked={active} aria-label={ja?'ゼロボ呼び出し':'제로보 호출'} disabled={!supported||!ready||busy} onClick={toggle} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 ${active?'bg-orange-500 text-white':'bg-gray-200 text-gray-800'}`}>{active?'ON':'OFF'}</button>
    </div>
    <p role="status" className="text-sm">{busy?(ja?'処理中…':'처리 중…'):stateLabel}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{ja?'韓国語で「제로보」と呼ぶと通知音で応答します。バックグラウンドでは通知をタップして会話を続けます。':'“제로보”라고 부르고 잠시 기다리면 응답음이 납니다. 백그라운드에서는 알림을 눌러 대화를 이어가세요.'}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{ja?'音声は端末内で処理し、待機中の音声は保存・送信しません。マイクと通知の許可が必要です。最大30分で終了し、設定・通知からいつでも停止できます。バッテリーを消費します。':'대기 음성은 기기에서 처리하며 저장·전송하지 않습니다. 마이크·알림 권한이 필요하고 최대 30분 후 꺼집니다. 설정이나 알림에서 언제든 끌 수 있으며 배터리를 사용합니다.'}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{ja?'音声入力の開始・ログアウト・アプリの終了で待機を停止します。必要なときに再度オンにしてください。':'음성 입력 시작·로그아웃·앱 종료 시 대기를 끕니다. 필요할 때 다시 켜 주세요.'}</p>
    {!supported&&<p className="text-xs">{ja?'Android APKで利用できます。':'Android APK에서 사용할 수 있습니다.'}</p>}
    {(error||status.error)&&<p role="alert" className="text-xs text-red-600">{error||reasons[status.error]||(ja?'待機を終了しました。':'호출 대기를 종료했습니다.')}</p>}
  </section>;
}
