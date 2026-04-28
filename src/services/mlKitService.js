// src/services/mlKitService.js
// Robust ML Kit çeviri motoru: timeout + fallback + direkt çeviri dene

import { getCachedTranslation, setCachedTranslation, pruneTranslationCache } from './translationCacheService';

export const mlKitStatus = {
  state: 'idle',
  message: '',
  listeners: new Set(),
  set(newState, newMessage = '') {
    this.state = newState;
    this.message = newMessage;
    this.listeners.forEach(fn => fn({ state: newState, message: newMessage }));
  },
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
};

let modelReady = false;
let downloadPromise = null;

// Timeout wrapper — herhangi bir Promise için
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)
    )
  ]);

/**
 * Önce direkt çeviri dene. Başarılıysa model zaten hazır.
 * Değilse model indirmeyi başlat.
 */
export const ensureMLKitModelReady = async () => {
  if (modelReady) return true;
  if (downloadPromise) return downloadPromise;

  downloadPromise = (async () => {
    try {
      if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
        mlKitStatus.set('error', 'Sadece mobilde çalışır');
        return false;
      }

      const { Translation } = await import('@capacitor-mlkit/translation');

      // translate() içinde zaten downloadModelIfNeeded() var.
      // Ayrıca downloadModel() çağırmaya gerek yok — o da hata verebiliyor.
      // İlk çeviri çağrısında ML Kit modeli otomatik indirir (~30MB, 45sn limit).
      mlKitStatus.set('downloading', 'Çeviri modeli indiriliyor (~30 MB)...');

      const result = await withTimeout(
        Translation.translate({ text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'tr' }),
        45000,  // İlk indirme uzun sürebilir
        'initial-translate-with-download'
      );

      if (result?.text && result.text !== 'Hello world') {
        modelReady = true;
        mlKitStatus.set('ready', `Hazır ✓ (${result.text})`);
        return true;
      } else {
        mlKitStatus.set('error', 'Model yüklendi ama çeviri başarısız');
        return false;
      }

    } catch (err) {
      console.error('[MLKit] Kritik hata:', err?.message || err);
      mlKitStatus.set('error', `Hata: ${err?.message || err}`);
      return false;
    }
  })();

  return downloadPromise;
};


/**
 * Haberleri arka planda sessizce çevirir ve cache'e yazar.
 */
export const backgroundTranslateNews = async (newsItems) => {
  if (!newsItems || newsItems.length === 0) return;
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;

  pruneTranslationCache();

  const ready = await ensureMLKitModelReady();
  if (!ready) return;

  try {
    const { Translation } = await import('@capacitor-mlkit/translation');
    const turkishPattern = /[çÇğĞışİöÖşŞüÜ]|(\b(ve|bir|bu|ile|için|de|da|den|dan)\b)/i;

    for (const item of newsItems) {
      if (!window.__mlKitBgRunning) break;
      const title = item.title?.trim();
      if (!title || turkishPattern.test(title)) continue;
      const cached = await getCachedTranslation(title);
      if (cached) continue;

      try {
        const result = await withTimeout(
          Translation.translate({ text: title, sourceLanguage: 'en', targetLanguage: 'tr' }),
          8000,
          'bg-translate'
        );
        if (result?.text && result.text !== title) {
          await setCachedTranslation(title, result.text);
        }
        await new Promise(r => setTimeout(r, 50));
      } catch { /* bu haberi atla */ }
    }
  } catch (err) {
    console.warn('[MLKit] Arka plan çevirisi başarısız:', err);
  }
};
