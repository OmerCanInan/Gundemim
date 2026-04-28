// src/services/translationCacheService.js
// Çeviri sonuçlarını IndexedDB'de kalıcı olarak saklar.
// Aynı metin tekrar çevrilmek istendiğinde anında (0ms) cache'ten döner.

const DB_NAME = 'gundemim_translations';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const MAX_CACHE_DAYS = 30; // 30 gün saklansın

let db = null;

const openDB = () => new Promise((resolve, reject) => {
  if (db) return resolve(db);
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = (e) => {
    const database = e.target.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      store.createIndex('timestamp', 'timestamp');
    }
  };
  req.onsuccess = (e) => { db = e.target.result; resolve(db); };
  req.onerror = () => reject(req.error);
});

/**
 * Metni cache'ten getirir. Yoksa null döner.
 */
export const getCachedTranslation = async (text) => {
  try {
    const database = await openDB();
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const key = text.trim().toLowerCase().substring(0, 200); // İlk 200 karakter key
    const result = await new Promise((res) => {
      const req = store.get(key);
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(null);
    });
    if (!result) return null;

    // Süresi dolmuş mu kontrol et
    const expiry = new Date(result.timestamp).getTime() + (MAX_CACHE_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiry) {
      // Arka planda sil, null dön
      deleteCachedTranslation(key);
      return null;
    }
    return result.translated;
  } catch {
    return null;
  }
};

/**
 * Çeviriyi cache'e kaydeder.
 */
export const setCachedTranslation = async (text, translated) => {
  try {
    const database = await openDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = text.trim().toLowerCase().substring(0, 200);
    store.put({ key, translated, timestamp: new Date().toISOString() });
  } catch (e) {
    console.warn('[TranslationCache] Save failed:', e);
  }
};

const deleteCachedTranslation = async (key) => {
  try {
    const database = await openDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  } catch { /* sessizce geç */ }
};

/**
 * Eski kayıtları temizler (30+ gün).
 */
export const pruneTranslationCache = async () => {
  try {
    const database = await openDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const cutoff = new Date(Date.now() - MAX_CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(cutoff);
    const req = index.openCursor(range);
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { cursor.delete(); cursor.continue(); }
    };
  } catch { /* sessizce geç */ }
};
