// src/services/translationService.js
// LibreTranslate tabanlı çeviri servisi — açık kaynak, KVKK uyumlu, ücretsiz.
// Gayriresmi Google Translate API'sinden (translate.googleapis.com) göç edildi.
// Hizmet veren public instance'lar: libretranslate.com, translate.argosopentech.com

const LIBRE_ENDPOINTS = [
  'https://libretranslate.com/translate',
  'https://translate.argosopentech.com/translate',
  'https://translate.fedilab.app/translate',
];

/**
 * Verilen metni LibreTranslate kullanarak Türkçe'ye çevirir.
 * Tüm public instance'lar denenilir, ilk başarılı cevap döner.
 * @param {string} text - Çevrilecek orijinal metin
 * @returns {Promise<string>} Çevrilmiş metin (hata durumunda orijinal metin)
 */
export const translateTextToTurkish = async (text) => {
  if (!text || text.trim() === '') return text;

  const body = JSON.stringify({
    q: text,
    source: 'auto',
    target: 'tr',
    format: 'text',
    api_key: '', // Public instance'larda key gerekmez
  });

  for (const endpoint of LIBRE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(8000), // 8 sn timeout
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data?.translatedText) {
        return data.translatedText;
      }
    } catch {
      // Bu endpoint başarısız; sıradakini dene
      continue;
    }
  }

  // Hiçbir instance yanıt vermediyse orijinal metni döndür
  console.warn('LibreTranslate: Tüm instance\'lar yanıt vermedi, orijinal metin döndürülüyor.');
  return text;
};
