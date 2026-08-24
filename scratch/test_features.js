import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log("==================================================");
  console.log("Running automated validation for O1BO features...");
  console.log("==================================================");

  // 1. Launch headless Chromium browser using Playwright
  console.log("1. Launching Playwright Chromium...");
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Create browser context
  const context = await browser.newContext({
    viewport: { width: 600, height: 950 },
    permissions: ['geolocation'],
  });

  const page = await context.newPage();

  // Pipe browser console logs to Node stdout
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser PageError]: ${err.toString()}`));
  
  // Inject mock geolocation and override alert/confirm
  await page.addInitScript(() => {
    window.alert = (msg) => console.log(`[JS Alert]: ${msg}`);
    window.confirm = (msg) => {
      console.log(`[JS Confirm]: ${msg}`);
      return true;
    };

    const mockGeo = {
      getCurrentPosition: (success) => {
        setTimeout(() => {
          success({
            coords: { latitude: 35.6895, longitude: 139.6917, accuracy: 10 },
            timestamp: Date.now()
          });
        }, 50);
      },
      watchPosition: (success) => {
        setTimeout(() => {
          success({
            coords: { latitude: 35.6895, longitude: 139.6917, accuracy: 10 },
            timestamp: Date.now()
          });
        }, 50);
        return 1;
      },
      clearWatch: () => {}
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeo,
      writable: true,
      configurable: true
    });
  });

  try {
    // Navigate to the local server
    console.log("2. Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000');
    await sleep(2500);

    // 2. Click guest login
    console.log("3. Logging in as local guest...");
    const guestBtn = await page.$('button:has-text("テストアカウントでログイン"), button:has-text("테스트 계정으로 로그인"), button:nth-child(2)');
    if (guestBtn) {
      await guestBtn.click();
    } else {
      await page.click('text=테스트 계정으로 로그인 (로컬 모드)');
    }
    await sleep(3000);

    // Close initial tutorial if visible
    const skipBtn = await page.$('button:has-text("スキップ"), button:has-text("건너뛰기")');
    if (skipBtn) {
      await skipBtn.click();
      await sleep(1000);
      console.log("Closed initial tutorial overlay.");
    }

    // 3. Switch language to Korean
    console.log("4. Toggling language to Korean...");
    const langBtn = await page.$('button:has-text("🇯🇵 日本語"), button:has-text("🇯🇵")');
    if (langBtn) {
      await langBtn.click();
      await sleep(1500);
    }

    // 4. Test AI chatbot schedule generation and sharing
    console.log("5. Testing AI Chatbot Schedule Generation...");
    // Click bot FAB
    await page.click('.fixed.bottom-24');
    await sleep(1500);
    
    // Fill text
    await page.fill('textarea[placeholder*="출장"]', '내일 부산 1박 2일 출장 일정 짜줘');
    await sleep(1000);
    // Click send
    await page.click('button:has(.lucide-send), button:has-text("Send")');
    console.log("Sent prompt. Waiting for AI generation...");
    
    // Wait for the preview title to appear
    let previewTitleFound = false;
    for (let i = 0; i < 60; i++) {
      await sleep(1000);
      const text = await page.textContent('body');
      if (text.includes('AI 출장 일정이 생성되었습니다!')) {
        previewTitleFound = true;
        break;
      }
    }
    
    if (previewTitleFound) {
      console.log("✔ AI Schedule preview successfully rendered!");
      // Click share
      console.log("Sharing generated schedule via KakaoTalk button...");
      await page.click('text=카카오톡으로 일정 공유');
      await sleep(1500);
      
      // Close chatbot preview
      await page.click('text=닫기');
      await sleep(1500);
    } else {
      throw new Error("AI schedule generation preview did not render within timeout.");
    }

    // 5. Test Trip Detail Kakao Share
    console.log("6. Testing Trip Detail Kakao Share...");
    await page.click('text=일정');
    await sleep(2000);
    
    // Select the first trip if not already in detail view
    const shareBtnInitial = await page.$('button[title*="공유"], button:has(svg:has(path[d*="M12 3c-4.97"]))');
    if (!shareBtnInitial) {
      await page.click('.truncate >> nth=0');
      await sleep(2000);
    }
    
    // Verify Kakao Share icon exists and click it
    const shareBtn = await page.$('button[title*="공유"], button:has(svg:has(path[d*="M12 3c-4.97"]))');
    if (shareBtn) {
      await shareBtn.click();
      console.log("✔ Kakao Share button in Trip Detail header clicked!");
      await sleep(1500);
    } else {
      console.log("Warning: Share button in detail header not found by selector.");
    }

    // Go back
    await page.click('text=Back');
    await sleep(1500);

    // 6. Test NFC 2-Step Checkout
    console.log("7. Testing NFC 2-Step Checkout Flow...");
    // Go to settings to ensure NFC checkout is required
    await page.click('text=설정');
    await sleep(1500);
    
    // Verify toggle state or text
    const nfcToggleText = await page.textContent('body');
    if (nfcToggleText.includes('NFC 체크아웃 필수')) {
      console.log("✔ NFC Checkout Required setting verified.");
    }

    // Go back to Schedule
    await page.click('text=일정');
    await sleep(2000);
    
    // Open trip if not already in detail view
    const hasCheckin = await page.$('text=수동 체크인');
    const hasCheckout = await page.$('text=수동 체크아웃');
    const hasNfc = await page.$('text=NFC 체크아웃');
    if (!hasCheckin && !hasCheckout && !hasNfc) {
      await page.click('.truncate >> nth=0');
      await sleep(1500);
    }
    
    // Manual Check-in
    console.log("Performing manual check-in...");
    await page.click('text=수동 체크인');
    await sleep(2000);
    
    // Verify manual check-out and NFC check-out buttons exist
    const pageText = await page.textContent('body');
    if (pageText.includes('수동 체크아웃') && pageText.includes('NFC 체크아웃')) {
      console.log("✔ Both Manual and NFC checkout buttons are visible (2-step setup verified).");
    } else {
      throw new Error("2-step checkout buttons not visible after check-in.");
    }
    
    // Perform manual check-out
    console.log("Performing manual check-out...");
    await page.click('text=수동 체크아웃');
    await sleep(2000);
    
    // Perform NFC check-out
    console.log("Performing NFC check-out...");
    await page.click('text=NFC 체크아웃');
    await sleep(2000);
    
    // Bypass GPS if needed (modal should show button)
    const modalText = await page.textContent('body');
    if (modalText.includes('위치 제한 우회')) {
      console.log("Bypassing geofencing limit in simulation...");
      await page.click('text=위치 제한 우회');
      await sleep(1000);
    }
    
    // Trigger Mock NFC Scan
    console.log("Triggering simulated NFC scan...");
    await page.click('text=NFC 모의 태그 접촉');
    await sleep(2000);
    
    // Verify double checkout complete
    const postCheckoutText = await page.textContent('body');
    if (postCheckoutText.includes('체크아웃 완료 (2중 검증)')) {
      console.log("✔ Double checkout successfully completed and verified!");
    } else {
      throw new Error("Double checkout status was not updated correctly.");
    }

    // 7. Verify Admin logs
    console.log("8. Verifying Admin Dashboard attendance log...");
    await page.click('text=설정');
    await sleep(1500);
    
    await page.click('text=Admin Dashboard');
    await sleep(3000);
    
    const adminDashboardText = await page.textContent('body');
    if (adminDashboardText.includes('Check-in') && 
        adminDashboardText.includes('Check-out (Manual)') && 
        adminDashboardText.includes('Check-out (NFC)')) {
      console.log("✔ Admin Dashboard timeline entries verified: Check-in, Check-out (Manual), Check-out (NFC) are all present!");
    } else {
      throw new Error("Admin Dashboard timeline entries were missing or incorrect.");
    }
    
    if (adminDashboardText.includes('NFC Verified') && adminDashboardText.includes('SN: 17:A2:CA:3F')) {
      console.log("✔ NFC Verification Badge and Tag Serial Number verified in Admin logs!");
    } else {
      throw new Error("NFC Verified tag serial number not displayed in Admin dashboard.");
    }

    // 8. Test Help Guidelines and Tutorial Replay
    console.log("9. Testing Help screen and Tutorial replay...");
    await page.click('text=Back'); // Go back to settings from admin dashboard
    await sleep(1500);
    
    await page.click('text=도움말 및 기능 안내');
    await sleep(1500);
    
    const helpText = await page.textContent('body');
    if (helpText.includes('AI 출장 일정 비서') && helpText.includes('NFC & GPS 2중 체크아웃')) {
      console.log("✔ Help guidelines modal verified.");
    } else {
      throw new Error("Help guidelines modal did not render correctly.");
    }
    
    // Click replay tutorial
    await page.click('text=전체 튜토리얼 가이드 다시보기');
    await sleep(1500);
    
    // Step through the tutorial slides
    for (let slideIdx = 0; slideIdx < 4; slideIdx++) {
      const isLast = slideIdx === 3;
      const btnText = isLast ? '시작하기' : '다음';
      await page.click(`text=${btnText}`);
      await sleep(1000);
    }
    console.log("✔ Interactive onboarding tutorial successfully replayed and completed!");

    // 9. Test Report Kakao Sharing
    console.log("10. Testing AI Daily Report Kakao Sharing...");
    await page.click('text=일보');
    await sleep(2500);
    
    // Click Kakao Share button inside Report view
    const reportShareBtn = await page.$('button:has-text("카카오톡 공유")');
    if (reportShareBtn) {
      await reportShareBtn.click();
      console.log("✔ Report KakaoTalk Share button clicked!");
      await sleep(1500);
    } else {
      throw new Error("Report KakaoTalk Share button not found.");
    }

    console.log("==================================================");
    console.log("ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ✔");
    console.log("==================================================");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    try {
      const artifactDir = "C:/Users/User/.gemini/antigravity-ide/brain/85adff85-0791-4fa7-9dcf-478f8a7ef4f9";
      const screenshotPath = path.join(artifactDir, "test_failure.png");
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved failure screenshot to: ${screenshotPath}`);
    } catch (screenshotError) {
      console.error("Failed to capture screenshot:", screenshotError.message);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
