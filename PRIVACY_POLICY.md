# Gündemim — Gizlilik Politikası (Privacy Policy)

**Son güncelleme / Last updated:** 20 Nisan 2026

---

## Türkçe

### Hangi verileri topluyoruz?

**Gündemim hiçbir kişisel veri toplamaz ve sunucumuza göndermez.**

| Veri Türü | Nerede saklanır | Sunucuya gider mi? |
|-----------|-----------------|-------------------|
| RSS kaynakları (URL listesi) | Cihaz (localStorage) | ❌ Hayır |
| Haber önbelleği | Cihaz (IndexedDB) | ❌ Hayır |
| Kelime filtreleri ve tercihler | Cihaz (localStorage) | ❌ Hayır |
| Groq API anahtarı | Android Keystore / iOS Keychain / Electron native store | ❌ Hayır |

### Üçüncü Taraf Servisler

- **RSS Kaynakları:** Seçtiğiniz haber sitelerinin RSS beslemelerine doğrudan bağlanılır. Bu sitelerin kendi gizlilik politikaları geçerlidir.
- **Groq API (isteğe bağlı):** Yapay zeka özeti özelliğini kullanırsanız, seçtiğiniz haber başlık ve açıklamaları Groq'un API'sine anonim olarak gönderilir. Kişisel bilgi gönderilmez.
- **LibreTranslate (isteğe bağlı):** Çeviri özelliğini kullanırsanız, çevirilecek metin açık kaynaklı LibreTranslate sunucularına gönderilir. Kişisel bilgi gönderilmez.

### Veri Güvenliği

- Uygulama yedekleme (Android Backup) **devre dışı** bırakılmıştır (`allowBackup="false"`).
- API anahtarları platform güvenli deposunda (Android Keystore / iOS Keychain) saklanır.

### İletişim

Sorularınız için: [GitHub Issues](https://github.com/OmerCanInan/Gundemim/issues)

---

## English

### What data do we collect?

**Gündemim collects no personal data and sends nothing to our servers.**

| Data Type | Stored where | Sent to server? |
|-----------|-------------|-----------------|
| RSS source URLs | Device (localStorage) | ❌ No |
| News cache | Device (IndexedDB) | ❌ No |
| Word filters & preferences | Device (localStorage) | ❌ No |
| Groq API key | Android Keystore / iOS Keychain / Electron native store | ❌ No |

### Third-Party Services

- **RSS Sources:** The app connects directly to the RSS feeds of news sites you choose. Their own privacy policies apply.
- **Groq API (optional):** If you use the AI summary feature, selected news titles and descriptions are sent anonymously to Groq's API. No personal information is transmitted.
- **LibreTranslate (optional):** If you use the translation feature, the text to be translated is sent to open-source LibreTranslate servers. No personal information is transmitted.

### Data Security

- Android Backup is **disabled** (`allowBackup="false"`).
- API keys are stored in platform secure storage (Android Keystore / iOS Keychain).

### Contact

For questions: [GitHub Issues](https://github.com/OmerCanInan/Gundemim/issues)
