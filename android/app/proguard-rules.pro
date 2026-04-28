# ── ML Kit Translation ──────────────────────────────────────────────
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit_translate.** { *; }
-keep class com.google.android.gms.internal.mlkit_common.** { *; }
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.internal.mlkit_translate.**

# ── Capacitor WebView JS Bridge ──────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Capacitor Core ───────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# ── Stack trace için satır numaralarını koru ──────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
