const fs = require('fs');
const path = require('path');

// Words forbidden in UI (unless in specific variables/files)
const FORBIDDEN = [
  'Login', 'Register', 'Dashboard', 'Submit', 'Next', 'Back', 
  'Settings', 'Admin', 'Profile', 'Lessons', 'Quiz', 'Start', 'Continue'
];

const ALLOWED_FILES = [
  'check-lang.js',
  'i18n.ts',
  'README.md',
  'package.json',
  'next.config.js'
];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  let hasError = false;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        if (scanDir(fullPath)) hasError = true;
      }
    } else {
      if (ALLOWED_FILES.includes(file)) continue;
      // Skip binary/images
      if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      
      FORBIDDEN.forEach(word => {
        // Look for word appearing between > and < (JSX text) or in "title=" or placeholder attributes
        // This is a basic heuristic
        const regex = new RegExp(`(>\\s*${word}\\s*<|placeholder="${word}"|label="${word}"|title="${word}")`, 'g');
        if (content.match(regex)) {
          // Exception: We allow English in the specifically named EN panels component (we will check logic later)
          // For now, strict fail.
          console.error(`❌ ГРЕШКА: Намерена забранена дума "${word}" във файл: ${fullPath}`);
          hasError = true;
        }
      });
    }
  }
  return hasError;
}

console.log("🔍 Проверка за английски думи в интерфейса...");
const rootDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(rootDir)) {
  if (scanDir(rootDir)) {
    console.error("⛔ Проверката не премина! Използвай src/lib/i18n.ts за всички текстове.");
    process.exit(1);
  } else {
    console.log("✅ Всичко изглежда наред! Само български език.");
  }
} else {
  console.log("⚠️  Директория src не е намерена.");
}
