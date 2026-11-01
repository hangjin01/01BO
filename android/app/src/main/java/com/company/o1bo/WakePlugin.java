package com.company.o1bo;

import android.Manifest;
import android.app.KeyguardManager;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(name="O1boWake",permissions={
    @Permission(alias="microphone",strings={Manifest.permission.RECORD_AUDIO}),
    @Permission(alias="notifications",strings={Manifest.permission.POST_NOTIFICATIONS})
})
public class WakePlugin extends Plugin {

    private volatile int generation;


    @PluginMethod public void status(PluginCall call){
        JSObject result=new JSObject();result.put("state",WakeService.state);result.put("error",WakeService.error);call.resolve(result);
    }
    @PluginMethod public void start(PluginCall call){
        call.getData().put("generation",generation);
        if(getPermissionState("microphone")!=PermissionState.GRANTED){requestPermissionForAlias("microphone",call,"microphoneResult");return;}
        requestNotifications(call);
    }
    @PermissionCallback private void microphoneResult(PluginCall call){
        if(getPermissionState("microphone")!=PermissionState.GRANTED){call.reject("마이크 권한이 필요합니다. / マイクの許可が必要です。");return;}
        requestNotifications(call);
    }
    private void requestNotifications(PluginCall call){
        if(Build.VERSION.SDK_INT>=33 && getPermissionState("notifications")!=PermissionState.GRANTED){requestPermissionForAlias("notifications",call,"notificationsResult");return;}
        activate(call);
    }
    @PermissionCallback private void notificationsResult(PluginCall call){activate(call);}
    private void activate(PluginCall call){
        getActivity().runOnUiThread(()->{
            if(call.getInt("generation",-1)!=generation){call.reject("호출 대기가 취소되었습니다.");return;}
            if(!getBridge().getApp().isActive() || getActivity().isFinishing()){call.reject("앱을 연 상태에서 켜 주세요. / アプリを開いて有効にしてください。");return;}
            if(!NotificationManagerCompat.from(getContext()).areNotificationsEnabled()) {call.reject("끄기 버튼을 표시하려면 알림을 허용해 주세요. / 通知を許可してください。");return;}
            try {ContextCompat.startForegroundService(getContext(),new Intent(getContext(),WakeService.class));call.resolve();}
            catch(Exception exception){call.reject("호출 대기를 시작하지 못했습니다. / 起動できませんでした。");}
        });
    }
    @PluginMethod public void stop(PluginCall call){
        generation++;WakeService.wakeAt=0;
        getContext().stopService(new Intent(getContext(),WakeService.class));
        awaitStopped(call,0);
    }
    private void awaitStopped(PluginCall call,int attempt){
        if("off".equals(WakeService.state)){call.resolve();return;}
        if(attempt>=100){call.reject("호출 대기 종료를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");return;}
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(()->awaitStopped(call,attempt+1),50);
    }
    @PluginMethod public void consumeWake(PluginCall call){
        KeyguardManager keyguard=(KeyguardManager)getContext().getSystemService(android.content.Context.KEYGUARD_SERVICE);
        long at=WakeService.wakeAt;
        boolean detected=getBridge().getApp().isActive() && !keyguard.isKeyguardLocked() && at>0 && SystemClock.elapsedRealtime()-at<60000;
        if(detected || (at>0 && SystemClock.elapsedRealtime()-at>=60000))WakeService.wakeAt=0;
        JSObject value=new JSObject();value.put("detected",detected);call.resolve(value);
    }
}
