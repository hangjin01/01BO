package com.company.o1bo;
import org.junit.Test;
import static org.junit.Assert.*;
public class WakePhraseTest {
 @Test public void onlyExplicitWakeUtteranceMatches(){
  assertTrue(WakePhrase.matches("제로보"));
  assertTrue(WakePhrase.matches("제로 보"));
  assertTrue(WakePhrase.matches("제로 보!"));
  assertFalse(WakePhrase.matches(""));
  assertFalse(WakePhrase.matches(null));
  assertFalse(WakePhrase.matches("제로"));
  assertFalse(WakePhrase.matches("제로 보험"));
  assertFalse(WakePhrase.matches("제로보 호출 기능을 끄자"));
 }
}
