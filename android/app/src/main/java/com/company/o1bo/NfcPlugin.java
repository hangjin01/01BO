package com.company.o1bo;

import android.nfc.NfcAdapter;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.tech.Ndef;
import android.nfc.tech.NdefFormatable;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@CapacitorPlugin(name="O1boNfc")
public class NfcPlugin extends Plugin {
 private final Handler handler=new Handler(Looper.getMainLooper());
 private volatile PluginCall pending;
 private NfcAdapter adapter;
 private final Runnable timeout=()->finish(null,"NFC 대기 시간이 끝났습니다. 다시 시도해 주세요.");
 @PluginMethod public void status(PluginCall call){
  NfcAdapter a=NfcAdapter.getDefaultAdapter(getContext());
  JSObject result=new JSObject();result.put("supported",a!=null);result.put("enabled",a!=null&&a.isEnabled());call.resolve(result);
 }
 @PluginMethod public void read(PluginCall call){start(call,null);}
 @PluginMethod public void write(PluginCall call){
  String token=call.getString("token");
  if(token==null||!token.matches("o1bo:[a-f0-9]{64}")){call.reject("Invalid tag token");return;}
  start(call,token);
 }
 private void start(PluginCall call,String token){getActivity().runOnUiThread(()->{
  if(pending!=null){call.reject("이미 NFC 작업 중입니다.");return;}
  adapter=NfcAdapter.getDefaultAdapter(getContext());
  if(adapter==null||!adapter.isEnabled()){call.reject("휴대폰 NFC를 켜 주세요. NFC 지원 기기가 필요합니다.");return;}
  pending=call;
  try {
   adapter.enableReaderMode(getActivity(),tag->{
    if(pending!=call)return;
    Ndef ndef=Ndef.get(tag);
    if(ndef==null){
     NdefFormatable blank=NdefFormatable.get(tag);
     if(token!=null&&blank!=null){
      try{blank.connect();blank.format(new NdefMessage(new NdefRecord[]{NdefRecord.createMime("application/vnd.o1bo.tag",token.getBytes(StandardCharsets.UTF_8))}));
       JSObject result=new JSObject();result.put("token",token);finish(call,result,null);
      }catch(Exception e){finish(call,null,"빈 스티커 기록에 실패했습니다. 휴대폰을 태그에 밀착하고 다시 시도해 주세요.");}
      finally{try{blank.close();}catch(Exception ignored){}}
     }else finish(call,null,"NDEF 형식의 NFC 스티커가 필요합니다.");
     return;
    }
    try {
     ndef.connect();
     if(token!=null){
      NdefMessage message=new NdefMessage(new NdefRecord[]{NdefRecord.createMime("application/vnd.o1bo.tag",token.getBytes(StandardCharsets.UTF_8))});
      if(!ndef.isWritable()){finish(call,null,"읽기 전용 스티커입니다. 새 NFC 스티커를 사용해 주세요.");return;}
      if(ndef.getMaxSize()<message.toByteArray().length){finish(call,null,"스티커 저장 공간이 부족합니다. 더 큰 NDEF 태그를 사용해 주세요.");return;}
      ndef.writeNdefMessage(message);
     }
     NdefMessage message=ndef.getNdefMessage();String value=null;
     if(message!=null)for(NdefRecord record:message.getRecords()){
      if(record.getTnf()==NdefRecord.TNF_MIME_MEDIA&&Arrays.equals(record.getType(),"application/vnd.o1bo.tag".getBytes(StandardCharsets.US_ASCII)))value=new String(record.getPayload(),StandardCharsets.UTF_8);
     }
     if(value==null||!value.matches("o1bo:[a-f0-9]{64}")||(token!=null&&!token.equals(value)))throw new Exception("등록된 O1BO 현장 태그를 접촉해 주세요.");
     JSObject result=new JSObject();result.put("token",value);finish(call,result,null);
    }catch(Exception e){finish(call,null,"NFC 읽기·쓰기에 실패했습니다. 스티커를 다시 접촉해 주세요.");}
    finally{try{ndef.close();}catch(Exception ignored){}}
   },NfcAdapter.FLAG_READER_NFC_A|NfcAdapter.FLAG_READER_NFC_B|NfcAdapter.FLAG_READER_NFC_F|NfcAdapter.FLAG_READER_NFC_V,null);
   handler.postDelayed(timeout,45000);
  }catch(Exception e){finish(null,"NFC를 시작하지 못했습니다.");}
 });}
 private void finish(JSObject result,String error){finish(pending,result,error);}
 private void finish(PluginCall expected,JSObject result,String error){handler.post(()->{
  if(pending==null||pending!=expected)return;PluginCall call=pending;pending=null;handler.removeCallbacks(timeout);
  try{if(adapter!=null)adapter.disableReaderMode(getActivity());}catch(Exception ignored){}
  if(error!=null)call.reject(error);else call.resolve(result);
 });}
 @PluginMethod public void cancel(PluginCall call){finish(null,"NFC 작업을 취소했습니다.");call.resolve();}
 @Override protected void handleOnPause(){finish(null,"앱을 다시 열어 NFC를 재시도해 주세요.");}
}
