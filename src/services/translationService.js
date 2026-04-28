// src/services/translationService.js
// Çeviri servisi: Cache → ML Kit → LibreTranslate zinciri
// ML Kit modeli uygulama açılışında önceden indirilir (mlKitService.js tarafından).

import { getCachedTranslation, setCachedTranslation } from './translationCacheService';

const LIBRE_ENDPOINTS = [
  'https://libretranslate.de/translate',
  'https://de.libretranslate.com/translate',
  'https://translate.terraprint.co/translate'
];

/**
 * ML Kit ile çeviri (Native only) — 8 saniyelik timeout ile
 */
const translateWithMLKit = async (text) => {
  try {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return null;
    const { Translation, Language } = await import('@capacitor-mlkit/translation');

    // Timeout: Model hazır değilse sonsuza kadar beklemeyelim
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('ML Kit timeout')), 8000)
    );
    const translatePromise = Translation.translate({
      text,
      sourceLanguage: Language.English,
      targetLanguage: Language.Turkish,
    });

    const result = await Promise.race([translatePromise, timeoutPromise]);
    return result?.text || null;
  } catch (err) {
    console.warn('[MLKit] Translation failed/timeout:', err?.message || err);
    return null;
  }
};

/**
 * CapacitorHttp ile LibreTranslate çağrısı
 */
const fetchWithCapacitor = async (endpoint, text) => {
  try {
    const { CapacitorHttp } = window.Capacitor.Plugins;
    const response = await CapacitorHttp.post({
      url: endpoint,
      headers: { 'Content-Type': 'application/json' },
      data: { q: text, source: 'auto', target: 'tr', format: 'text' },
      connectTimeout: 5000,
      readTimeout: 5000,
    });
    if (response.status === 200 && response.data?.translatedText) {
      return response.data.translatedText;
    }
  } catch (err) {
    console.warn(`[CapacitorHttp] Failed for ${endpoint}:`, err);
  }
  return null;
};

/**
 * Ana çeviri fonksiyonu.
 * Sıra: Cache → Desktop IPC → ML Kit → LibreTranslate
 * @param {string} text
 * @returns {Promise<string>}
 */
export const translateTextToTurkish = async (text) => {
  if (!text || text.trim() === '') return text;

  // 1. CACHE — Anında döner
  const cached = await getCachedTranslation(text);
  if (cached) return cached;

  let result = null;

  // 2. Desktop (Electron) IPC
  if (window.electronAPI && typeof window.electronAPI.translateText === 'function') {
    try {
      const translated = await window.electronAPI.translateText(text, 'tr');
      if (translated) result = translated;
    } catch (err) {
      console.warn('[DesktopTranslate] IPC Bridge failed:', err);
    }
  }

  // 3. Mobile Native: ML Kit
  if (!result && window.Capacitor && window.Capacitor.isNativePlatform()) {
    result = await translateWithMLKit(text);
  }

  // 4. Fallback: LibreTranslate (sadece 1 endpoint, 5sn timeout)
  if (!result) {
    const endpoint = LIBRE_ENDPOINTS[0];
    if (window.Capacitor?.Plugins?.CapacitorHttp) {
      result = await fetchWithCapacitor(endpoint, text);
    } else {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, source: 'auto', target: 'tr', format: 'text' }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          result = data?.translatedText || null;
        }
      } catch { /* sessizce geç */ }
    }
  }

  // Başarılıysa cache'e kaydet
  if (result && result !== text) {
    await setCachedTranslation(text, result);
    return result;
  }

  return text; // Hepsi başarısız → orijinal metin
};
