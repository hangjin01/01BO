package com.company.o1bo;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.speech.RecognizerIntent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.*;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;

@CapacitorPlugin(name="O1boSpeech")
public class SpeechPlugin extends Plugin {
 private boolean listening=false;
 @PluginMethod public void listen(PluginCall call) {
  getActivity().runOnUiThread(()->{
   if(listening){call.reject("이미 음성을 듣고 있습니다.");return;}
   String language="ja".equals(call.getString("language"))?"ja-JP":"ko-KR";
   Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
   intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
   intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,language);
   intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS,1);
   intent.putExtra(RecognizerIntent.EXTRA_PROMPT,"ja-JP".equals(language)?"ゼロボに話してください":"제로보에게 말해 주세요");
   try {listening=true;startActivityForResult(call,intent,"speechResult");}
   catch(ActivityNotFoundException e){listening=false;call.reject("음성 인식 앱이 없습니다. Google 앱을 설치·활성화하거나 글자로 입력해 주세요.");}
   catch(Exception e){listening=false;call.reject("음성 입력을 시작하지 못했습니다. 휴대폰의 음성 인식 설정을 확인해 주세요.");}
  });
 }
 @ActivityCallback private void speechResult(PluginCall call,ActivityResult result){
  listening=false;if(call==null)return;
  JSObject value=new JSObject();
  if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null){value.put("text","");value.put("cancelled",true);call.resolve(value);return;}
  ArrayList<String> matches=result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
  value.put("text",matches==null||matches.isEmpty()?"":matches.get(0));value.put("cancelled",false);call.resolve(value);
 }
}
