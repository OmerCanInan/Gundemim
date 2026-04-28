// src/services/mlKitService.js
// ML Kit çeviri modelini uygulama açılışında sessizce indirir.
// Model indirildikten sonra arka planda haberleri çevirir ve cache'e yazar.

import { getCachedTranslation, setCachedTranslation, pruneTranslationCache } from './translationCacheService';

let modelReady = false;
let downloadPromise = null;

/**
 * ML Kit en-tr modelini indirir (eğer henüz indirilmemişse).
 * İkinci çağrıda mevcut Promise'i döner — paralel indirme olmaz.
 */
export const ensureMLKitModelReady = async () => {
  if (modelReady) return true;
  if (downloadPromise) return downloadPromise;

  downloadPromise = (async () => {
    try {
      if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
        modelReady = false;
        return false;
      }

      const { Translation, Language } = await import('@capacitor-mlkit/translation');

      // Mevcut modelleri kontrol et
      const { models } = await Translation.getDownloadedModels();
      const hasEnglish = models.some(m => m.language === Language.English || m.language === 'en');
      const hasTurkish = models.some(m => m.language === Language.Turkish || m.language === 'tr');

      if (!hasEnglish) {
        console.log('[MLKit] İngilizce modeli indiriliyor...');
        await Translation.downloadModel({ language: Language.English });
      }
      if (!hasTurkish) {
        console.log('[MLKit] Türkçe modeli indiriliyor...');
        await Translation.downloadModel({ language: Language.Turkish });
      }

      modelReady = true;
      console.log('[MLKit] Çeviri modeli hazır ✓');
      return true;
    } catch (err) {
      console.warn('[MLKit] Model indirme başarısız:', err);
      modelReady = false;
      return false;
    }
  })();

  return downloadPromise;
};

/**
 * Haberleri arka planda sessizce çevirir ve cache'e yazar.
 * @param {Array} newsItems - { title, description } objelerinden oluşan dizi
 */
export const backgroundTranslateNews = async (newsItems) => {
  if (!newsItems || newsItems.length === 0) return;

  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
  if (!isNative) return; // Sadece mobilde çalış

  // Önce eski cache'i temizle
  pruneTranslationCache();

  // Model hazır değilse indirmeyi bekle
  const ready = await ensureMLKitModelReady();
  if (!ready) return;

  console.log(`[MLKit] ${newsItems.length} haber arka planda çevriliyor...`);

  try {
    const { Translation, Language } = await import('@capacitor-mlkit/translation');

    // Türkçe karakter tespiti — Türkçe başlıkları atla
    const turkishPattern = /[çÇğĞışİöÖşŞüÜ]|(\b(ve|bir|bu|ile|için|de|da|den|dan|ile)\b)/i;

    for (const item of newsItems) {
      // Uygulama kapatıldıysa dur (flag kontrolü)
      if (!window.__mlKitBgRunning) break;

      const title = item.title?.trim();
      if (!title || turkishPattern.test(title)) continue;

      // Cache'te varsa atla
      const cached = await getCachedTranslation(title);
      if (cached) continue;

      try {
        const result = await Translation.translate({
          text: title,
          sourceLanguage: Language.English,
          targetLanguage: Language.Turkish,
        });
        if (result?.text && result.text !== title) {
          await setCachedTranslation(title, result.text);
        }
        // Her çeviriden sonra kısa nefes (batarya koruması)
        await new Promise(r => setTimeout(r, 50));
      } catch {
        /* Bu haber atla, devam et */
      }
    }
    console.log('[MLKit] Arka plan çevirisi tamamlandı ✓');
  } catch (err) {
    console.warn('[MLKit] Arka plan çevirisi başarısız:', err);
  }
};
