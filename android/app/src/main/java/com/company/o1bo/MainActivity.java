package com.company.o1bo;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
 @Override public void onCreate(android.os.Bundle savedInstanceState) {
  registerPlugin(NfcPlugin.class);
  registerPlugin(SpeechPlugin.class);
  registerPlugin(WakePlugin.class);
  super.onCreate(savedInstanceState);
 }
}
