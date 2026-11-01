package com.company.o1bo;

import android.app.*;
import android.content.*;
import android.content.pm.ServiceInfo;
import android.media.*;
import android.os.*;
import androidx.core.app.NotificationCompat;
import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;

/** Experimental local Korean wake phrase detection. Never sends or stores audio/text. */
public class WakeService extends Service implements RecognitionListener {
    static final String STOP="com.company.o1bo.WAKE_STOP";
    static final String CHANNEL="zerobo_wake";
    static final int NOTIFICATION=7301;
    static volatile String state="off", error="";
    static volatile long wakeAt=0;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private boolean destroyed;
    private Model model;
    private Recognizer recognizer;
    private SpeechService speech;
    private ToneGenerator tone;
    private PowerManager.WakeLock lock;
    private AudioManager audio;
    private AudioManager.AudioRecordingCallback recordingCallback;
    private long lastWake;

    @Override public android.os.IBinder onBind(Intent intent){return null;}
    @Override public int onStartCommand(Intent intent,int flags,int id){
        if(intent!=null && STOP.equals(intent.getAction())) {wakeAt=0;stopSelf();return START_NOT_STICKY;}
        if(!"off".equals(state))return START_NOT_STICKY;
        state="starting";error="";
        try {
            NotificationManager manager=getSystemService(NotificationManager.class);
            if(Build.VERSION.SDK_INT>=26)manager.createNotificationChannel(new NotificationChannel(CHANNEL,"제로보 호출 대기",NotificationManager.IMPORTANCE_LOW));
            if(Build.VERSION.SDK_INT>=29)startForeground(NOTIFICATION,notification("호출 감지 준비 중"),ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
            else startForeground(NOTIFICATION,notification("호출 감지 준비 중"));
            // Bounded session, no automatic boot/restart activation.
            lock=((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"O1BO:WakeSession");
            lock.acquire(30*60*1000L);
            handler.postDelayed(()->{error="timeout";stopSelf();},30*60*1000L);
            StorageService.unpack(this,"wake-ko","wake-ko",loaded->{
                if(destroyed){loaded.close();return;}
                model=loaded;
                try {
                    recognizer=new Recognizer(model,16000.0f,"[\"제로 보\", \"<UNK>\"]");
                    recognizer.setWords(true);
                    speech=new SpeechService(recognizer,16000.0f);
                    if(!speech.startListening(this))throw new IllegalStateException();
                    state="listening";
                    manager.notify(NOTIFICATION,notification("‘제로보’라고 부르세요 · 최대 30분"));
                    watchMicrophone();
                }catch(Exception ex){fail("microphone");}
            },failure->fail("model"));
        }catch(Exception ex){fail("start");}
        return START_NOT_STICKY;
    }
    private Notification notification(String message){
        Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content=PendingIntent.getActivity(this,7301,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop=PendingIntent.getService(this,7302,new Intent(this,WakeService.class).setAction(STOP),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this,CHANNEL).setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentTitle("제로보 호출").setContentText(message).setContentIntent(content)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel,"끄기",stop)
            .setOngoing(true).setOnlyAlertOnce(true).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).build();
    }
    private void watchMicrophone(){
        if(Build.VERSION.SDK_INT<29)return;
        audio=(AudioManager)getSystemService(AUDIO_SERVICE);
        recordingCallback=new AudioManager.AudioRecordingCallback(){
            @Override public void onRecordingConfigChanged(java.util.List<AudioRecordingConfiguration> configs){
                for(AudioRecordingConfiguration config:configs){
                    if(speech!=null && config.getClientAudioSource()==MediaRecorder.AudioSource.VOICE_RECOGNITION && config.isClientSilenced())fail("microphone");
                }
            }
        };
        audio.registerAudioRecordingCallback(recordingCallback,handler);
    }
    private void fail(String reason){if(destroyed)return;error=reason;stopSelf();}
    @Override public void onResult(String result){
        if(destroyed || !"listening".equals(state))return;
        try {
            JSONObject decoded=new JSONObject(result);
            if(!WakePhrase.matches(decoded.optString("text")))return;
            org.json.JSONArray words=decoded.optJSONArray("result");
            if(words==null || words.length()==0)return;
            for(int i=0;i<words.length();i++)if(words.getJSONObject(i).optDouble("conf",0)<0.8)return;
            long now=SystemClock.elapsedRealtime();
            if(lastWake!=0 && now-lastWake<10000)return;
            lastWake=now;wakeAt=now;
            getSystemService(NotificationManager.class).notify(NOTIFICATION,notification("들었어요. 알림을 눌러 제로보와 대화하세요."));
            if(tone==null)tone=new ToneGenerator(AudioManager.STREAM_NOTIFICATION,70);
            tone.startTone(ToneGenerator.TONE_PROP_ACK,180);
        }catch(Exception ignored){ /* Do not log private recognition results. */ }
    }
    @Override public void onPartialResult(String result){}
    @Override public void onFinalResult(String result){}
    @Override public void onError(Exception exception){fail("microphone");}
    @Override public void onTimeout(){fail("timeout");}
    @Override public void onTaskRemoved(Intent intent){wakeAt=0;stopSelf();}
    @Override public void onDestroy(){
        destroyed=true;handler.removeCallbacksAndMessages(null);
        if(audio!=null && recordingCallback!=null)audio.unregisterAudioRecordingCallback(recordingCallback);
        if(speech!=null){speech.cancel();speech.shutdown();speech=null;}
        if(recognizer!=null){recognizer.close();recognizer=null;}
        if(model!=null){model.close();model=null;}
        if(tone!=null)tone.release();
        if(lock!=null && lock.isHeld())lock.release();
        state="off";stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();
    }
}
