import { spawn } from 'child_process';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
  console.log("--------------------------------------------------");
  console.log("O1BO Automated Screen Recording Script Initializing...");
  console.log("--------------------------------------------------");

  // 1. Start Vite Preview server in the background
  console.log("1. Starting Vite preview server...");
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    cwd: __dirname
  });

  previewProcess.stdout.on('data', (data) => {
    console.log(`[Vite Server]: ${data.toString().trim()}`);
  });

  previewProcess.stderr.on('data', (data) => {
    console.error(`[Vite Server Error]: ${data.toString().trim()}`);
  });

  // Wait for the server to spin up
  await sleep(4000);
  console.log("Vite server successfully initialized.");

  // 2. Launch headless Chromium browser using Playwright
  console.log("2. Launching Playwright Chromium...");
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const videosDir = path.join(__dirname, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
  }

  // Create browser context
  const context = await browser.newContext({
    viewport: { width: 600, height: 950 },
    deviceScaleFactor: 2,
    permissions: ['geolocation'],
    recordVideo: {
      dir: videosDir,
      size: { width: 600, height: 950 }
    }
  });

  const page = await context.newPage();

  // Pipe browser console logs and errors directly to Node stdout for absolute visibility
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser PageError]: ${err.toString()}`));
  
  // Inject mock geolocation and override window.alert to prevent thread blocks
  await page.addInitScript(() => {
    // Override window.alert and window.confirm to be non-blocking
    window.alert = (msg) => {
      console.log(`[JS Mocked Alert]: ${msg}`);
    };
    window.confirm = (msg) => {
      console.log(`[JS Mocked Confirm]: ${msg}`);
      return true;
    };

    const mockGeoObject = {
      getCurrentPosition: (success, error, options) => {
        console.log("[JS Mocked GPS] getCurrentPosition called. Returning Tokyo coordinates.");
        setTimeout(() => {
          success({
            coords: {
              latitude: 35.6895,
              longitude: 139.6917,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          });
        }, 50);
      },
      watchPosition: (success, error, options) => {
        console.log("[JS Mocked GPS] watchPosition called.");
        setTimeout(() => {
          success({
            coords: {
              latitude: 35.6895,
              longitude: 139.6917,
              accuracy: 10
            },
            timestamp: Date.now()
          });
        }, 50);
        return 1;
      },
      clearWatch: (id) => {}
    };

    // If geolocation doesn't exist (e.g. non-secure sandbox), define it from scratch
    if (!navigator.geolocation) {
      console.log("[JS Mocked GPS] Geolocation undefined in browser. Creating mock geolocation object.");
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeoObject,
        writable: true,
        configurable: true
      });
    } else {
      console.log("[JS Mocked GPS] Patching existing browser geolocation methods.");
      navigator.geolocation.getCurrentPosition = mockGeoObject.getCurrentPosition;
      navigator.geolocation.watchPosition = mockGeoObject.watchPosition;
      navigator.geolocation.clearWatch = mockGeoObject.clearWatch;
    }
  });

  // Keep playwright dialog listener as a fallback
  page.on('dialog', async (dialog) => {
    console.log(`[Playwright Dialog Intercepted]: type=${dialog.type()} message="${dialog.message()}"`);
    await dialog.accept();
  });
  
  console.log("Failsafe mocks, JS overrides, and console pipes successfully configured.");

  try {
    // 3. Navigate to the application
    console.log("3. Navigating to O1BO application...");
    await page.goto('http://localhost:4173');
    await sleep(4000); // Wait for loading spinner to clear

    // 4. Click '테스트용 게스트로 로그인'
    console.log("4. Simulating guest authentication...");
    await page.click('text=테스트용 게스트로 로그인');
    await sleep(4000); // Wait for guest session to bootstrap and toast to fade

    // 5. Toggle language from Japanese ('🇯🇵 日本語') to Korean
    console.log("5. Toggling language pack to Korean for standard reporting...");
    await page.click('text=🇯🇵 日本語');
    await sleep(2500); // Wait for language state to toggle and UI to render

    // 6. Navigate to Schedule Tab to find Itinerary cards
    console.log("6. Navigating to Schedule (일정) view to access itinerary check-in buttons...");
    await page.click('text=일정');
    await sleep(3000); // View interactive schedule calendar and map

    // 7. Perform manual check-in on the preloaded mock trip
    console.log("7. Performing manual check-in on Tokyo preloaded mock trip...");
    await page.click('text=수동 체크인');
    await sleep(4000); // Wait for check-in action and state change

    // 8. Perform manual checkout on the preloaded mock trip
    console.log("8. Performing manual check-out...");
    await page.click('text=체크아웃'); // The button text is "체크아웃" after check-in!
    await sleep(4000); // Wait for check-out action and state change

    // 9. Navigate to Settings (설정)
    console.log("9. Navigating to Settings (설정)...");
    await page.click('text=설정');
    await sleep(2000);

    // 10. Open Admin Dashboard to audit the check-in/out timeline
    console.log("10. Opening Admin Dashboard to audit attendance timeline...");
    await page.click('text=Admin Dashboard');
    await sleep(5000); // Shows the real-time timeline matching employee actions

    // Return to Settings
    console.log("Returning to Settings...");
    await page.click('text=Back');
    await sleep(2000);

    // 11. Return to Home to show Trip Creation
    console.log("11. Returning to Home to show business trip planner form...");
    await page.click('text=홈');
    await sleep(2000);

    console.log("Opening new business trip planner form...");
    await page.click('text=새로 만들기');
    await sleep(2000);

    console.log("Filling out trip planning parameters...");
    await page.fill('input[placeholder*="Tokyo"]', '2026 하반기 일본 비즈니스 파트너십 출장');
    await page.fill('input[placeholder*="Japan"]', '도쿄, 일본');
    await page.fill('input[type="date"] >> nth=0', '2026-06-10');
    await page.fill('input[type="date"] >> nth=1', '2026-06-16');
    await page.fill('textarea[placeholder*="..."]', '일본 현지 IT 파트너들과의 비즈니스 제휴 계약 미팅 진행 및 지오펜싱 출장 자동 근태 확인 시스템 최종 성능 테스트.');
    await sleep(2000);

    // Click '일정 작성완료'
    console.log("Saving trip details (triggers ViewState return)...");
    await page.click('text=일정 작성완료');
    await sleep(3000); // Wait for saving transition

    // 12. Navigate to Report Tab (일보) & Auto generate markdown report
    console.log("12. Navigating to Report (일보) view & generating AI report...");
    await page.click('text=일보');
    await sleep(6000); // Wait for markdown generation and loading spinner

    // Click 'Word로 내보내기' which also saves to Firestore in background
    console.log("Exporting AI Report to Word (triggers auto-save & Home redirect)...");
    await page.click('text=Word로 내보내기');
    await sleep(4000); // Wait for download trigger and redirection back to Home

    console.log("--------------------------------------------------");
    console.log("Automated walkthrough completed successfully!");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Error occurred during automated recording session:", err);
  } finally {
    // 13. Shutdown browser and save video
    console.log("13. Closing browser context to write video file...");
    await context.close();
    await browser.close();

    // 14. Stop Vite server
    console.log("14. Stopping Vite preview server...");
    previewProcess.kill();

    // Find the recorded video and copy it to the 개발내역 directory
    await sleep(2500); // wait a brief moment for file release
    const files = fs.readdirSync(videosDir);
    const videoFile = files.find(file => file.endsWith('.webm'));
    if (videoFile) {
      const srcPath = path.join(videosDir, videoFile);
      const outDir = path.join(__dirname, '개발내역');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }
      
      const destPath1 = path.join(outDir, '앱_시연_동작_영상.webm');
      const destPath2 = path.join(outDir, '앱 시연 동작 영상.webm');
      
      fs.copyFileSync(srcPath, destPath1);
      fs.copyFileSync(srcPath, destPath2);
      
      console.log(`Demo video successfully written to: ${destPath1}`);
      console.log("All procedures finished.");
      process.exit(0);
    } else {
      console.error("Error: Could not locate recorded webm video file.");
      process.exit(1);
    }
  }
}

runDemo();
