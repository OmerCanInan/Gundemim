// src/services/mlKitService.js
// Strateji: downloadModel() YOK.
// Önce direkt çeviri dene (Play Services zaten modeli arka planda yönetir).
// Başarısızsa web fallback'e bırak — asla takılma.

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
let modelChecked = false; // Bir kez kontrol et, tekrar deneme

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout_${ms}ms`)), ms)
    )
  ]);

/**
 * ML Kit modelinin çalışıp çalışmadığını kontrol et.
 * downloadModel() ÇAĞIRMAZ — sadece translate() dener.
 * Play Services modeli arka planda zaten yönetir.
 */
export const ensureMLKitModelReady = async () => {
  if (modelReady) return true;
  if (modelChecked) return false; // Zaten denendi ve başarısız

  modelChecked = true;

  try {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
      mlKitStatus.set('error', 'Sadece mobilde çalışır');
      return false;
    }

    const { Translation } = await import('@capacitor-mlkit/translation');
    mlKitStatus.set('downloading', 'Çeviri motoru test ediliyor...');

    // 6 saniye içinde çevirirse model hazır
    const result = await withTimeout(
      Translation.translate({ text: 'Hello', sourceLanguage: 'en', targetLanguage: 'tr' }),
      6000
    );

    if (result?.text && result.text !== 'Hello') {
      modelReady = true;
      mlKitStatus.set('ready', `Hazır ✓ (${result.text})`);
      return true;
    } else {
      mlKitStatus.set('error', 'Model henüz hazır değil (Play Services indiriyor)');
      return false;
    }
  } catch (err) {
    // Model indirilmemiş — Play Services arka planda halleder
    mlKitStatus.set('error', 'Model henüz hazır değil — web çeviri kullanılıyor');
    console.warn('[MLKit] Model not ready:', err?.message);
    return false;
  }
};

/**
 * Haberleri arka planda sessizce çevirir.
 * Sadece model hazırsa çalışır.
 */
export const backgroundTranslateNews = async (newsItems) => {
  if (!newsItems || newsItems.length === 0) return;
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;

  pruneTranslationCache();

  const ready = await ensureMLKitModelReady();
  if (!ready) return; // Model yoksa geç — translationService fallback halleder

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
          5000
        );
        if (result?.text && result.text !== title) {
          await setCachedTranslation(title, result.text);
        }
        await new Promise(r => setTimeout(r, 30));
      } catch { /* bu haberi atla */ }
    }
  } catch (err) {
    console.warn('[MLKit] Arka plan çevirisi başarısız:', err);
  }
};
