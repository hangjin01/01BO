const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = 'onClick={() => setIsWakeWordEnabled(!isWakeWordEnabled)}';
const startIdx = content.indexOf(targetStr);

if (startIdx !== -1) {
  const btnStart = content.lastIndexOf('<button', startIdx);
  const nextClosingTag = content.indexOf('>', startIdx);
  if (btnStart !== -1 && nextClosingTag !== -1) {
    const replacement = `<button
            onClick={async () => {
              if (!isWakeWordEnabled) {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  stream.getTracks().forEach(track => track.stop());
                } catch (e) {
                  alert(language === 'ja' ? '마이크의 권한을 허용해주세요.' : '마이크 권한을 허용해주세요.');
                  return;
                }
              }
              setIsWakeWordEnabled(!isWakeWordEnabled);
            }}
            className={\`p-3 rounded-full shadow-lg transition-colors \${isWakeWordEnabled ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-gray-800 text-gray-450 dark:text-gray-500'}\`}`;
    content = content.substring(0, btnStart) + replacement + content.substring(nextClosingTag);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Wake Word toggle updated successfully!");
  } else {
    console.log("Could not find button element boundaries");
  }
} else {
  console.log("Could not find target onClick string");
}
