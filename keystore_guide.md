## Keystore Oluşturma Adımları

### Adım 1: Şifre Girişi
Terminalde açık olan `keytool` komutu sizden şifre istiyor.
- Keystore şifresi: en az 6 karakter, güçlü bir şifre girin
- Key şifresi: aynı şifreyi tekrar girin (Enter'a da basabilirsiniz)

### Adım 2: key.properties Oluşturma
Şifre belirlendikten sonra `android/key.properties` yerine proje kökünde `key.properties` dosyası oluşturun:

```
storePassword=SIFRENIZ
keyPassword=SIFRENIZ
keyAlias=gundemim
storeFile=../android/gundemim-release.jks
```

> ⚠️ Bu dosyayı asla GitHub'a yüklemeyin! .gitignore'a eklendi.

### Adım 3: .jks Dosyasını Güvenli Yere Kopyalayın
`android/gundemim-release.jks` dosyasını:
- Google Drive / OneDrive gibi bulut depoya yükleyin
- Şifreyle birlikte güvenli bir yerde saklayın
- Bu dosyayı kaybederseniz uygulamanızı bir daha güncelleyemezsiniz!

### Adım 4: Play Console Upload Key
Play Console > App signing > "Upload key certificate" bölümüne:
- `gundemim-release.jks` dosyasını yükleyin
- Alias: `gundemim`
- Şifrelerinizi girin

### Adım 5: Release Build
```bash
npm run build
npx cap sync android
# Android Studio'da: Build > Generate Signed Bundle/APK > Android App Bundle
```
