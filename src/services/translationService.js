// src/services/translationService.js
// Çeviri zinciri: Cache → Electron IPC → ML Kit → MyMemory (ücretsiz, API key gerektirmez)
//
// LibreTranslate public instance'ları (libretranslate.de) 403 döndürebiliyor.
// MyMemory API: https://mymemory.translated.net — günde 5000 kelime ücretsiz, key gerekmez.

import { getCachedTranslation, setCachedTranslation } from './translationCacheService';

// MyMemory — ücretsiz, API key gerektirmez, CORS sorunu yok (CapacitorHttp ile)
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/**
 * ML Kit ile çeviri (Native only) — 8 saniyelik timeout
 */
const translateWithMLKit = async (text) => {
  try {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return null;
    const { Translation } = await import('@capacitor-mlkit/translation');

    const result = await Promise.race([
      Translation.translate({ text, sourceLanguage: 'en', targetLanguage: 'tr' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('ML Kit timeout')), 8000))
    ]);
    return result?.text || null;
  } catch (err) {
    console.warn('[MLKit] Çeviri başarısız:', err?.message);
    return null;
  }
};

/**
 * MyMemory API ile çeviri — CapacitorHttp veya fetch
 */
const translateWithMyMemory = async (text) => {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|tr`;

  try {
    // Mobil: CapacitorHttp (CORS bypass)
    if (window.Capacitor?.Plugins?.CapacitorHttp) {
      const response = await window.Capacitor.Plugins.CapacitorHttp.get({
        url,
        connectTimeout: 6000,
        readTimeout: 6000,
      });
      if (response.status === 200) {
        const translated = response.data?.responseData?.translatedText;
        if (translated && response.data?.responseStatus === 200) return translated;
      }
      return null;
    }

    // Web/Electron: normal fetch
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.responseStatus === 200) return data?.responseData?.translatedText || null;
    return null;
  } catch (err) {
    console.warn('[MyMemory] Çeviri başarısız:', err?.message);
    return null;
  }
};

/**
 * Ana çeviri fonksiyonu
 * Sıra: Cache → Electron IPC → ML Kit → MyMemory
 */
export const translateTextToTurkish = async (text) => {
  if (!text || text.trim() === '') return text;

  // 1. Cache — Anında döner
  const cached = await getCachedTranslation(text);
  if (cached) return cached;

  let result = null;

  // 2. Electron IPC (masaüstü)
  if (window.electronAPI && typeof window.electronAPI.translateText === 'function') {
    try {
      const t = await window.electronAPI.translateText(text, 'tr');
      if (t) result = t;
    } catch (err) {
      console.warn('[DesktopTranslate] IPC başarısız:', err);
    }
  }

  // 3. Mobile Native: ML Kit
  if (!result && window.Capacitor && window.Capacitor.isNativePlatform()) {
    result = await translateWithMLKit(text);
  }

  // 4. MyMemory fallback (tüm platformlar)
  if (!result) {
    result = await translateWithMyMemory(text);
  }

  // Başarılıysa cache'e kaydet
  if (result && result !== text) {
    await setCachedTranslation(text, result);
    return result;
  }

  return text; // Hepsi başarısız → orijinal metin
};
