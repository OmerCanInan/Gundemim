const fs = require('fs');
const path = require('path');

console.log('[PostInstall] Capacitor plugin patch\'leri uygulanıyor...\n');

// ─── PATCH 1: Gradle ProGuard düzeltmesi ───────────────────────────────────
const gradlePlugins = [
  'node_modules/@capacitor-community/text-to-speech/android/build.gradle',
  'node_modules/@capacitor-mlkit/translation/android/build.gradle'
];

gradlePlugins.forEach(relativePath => {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Bulunamadı: ${relativePath}`);
    return;
  }
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('proguard-android.txt')) {
      content = content.replace(/proguard-android\.txt/g, 'proguard-android-optimize.txt');
      fs.writeFileSync(filePath, content);
      console.log(`✅ Gradle ProGuard düzeltildi: ${relativePath}`);
    } else {
      console.log(`ℹ️  Gradle zaten düzgün: ${relativePath}`);
    }
  } catch (err) {
    console.error(`❌ Hata (${relativePath}):`, err.message);
  }
});

// ─── PATCH 2: ML Kit WiFi kısıtı kaldırma ──────────────────────────────────
// Translation.java dosyasını bul ve requireWifi() kısıtlarını kaldır
const javaFiles = [
    'node_modules/@capacitor-mlkit/translation/android/src/main/java/io/capawesome/capacitorjs/plugins/mlkit/translation/Translation.java'
];

javaFiles.forEach(relativePath => {
    const filePath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Dosya bulunamadı: ${relativePath}`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // requireWifi() çağrılarını kaldır
        if (content.includes('.requireWifi()')) {
            const updated = content.replace(/\.requireWifi\(\)/g, '');
            fs.writeFileSync(filePath, updated);
            console.log(`✅ WiFi kısıtı kaldırıldı: ${relativePath}`);
        } else {
            console.log(`ℹ️  WiFi kısıtı zaten yok: ${relativePath}`);
        }
    } catch (err) {
        console.error(`❌ Hata (${relativePath}):`, err.message);
    }
});

console.log('\n[PostInstall] Tüm patch\'ler tamamlandı.');
