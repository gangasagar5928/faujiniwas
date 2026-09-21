# Fauji Niwas — release ProGuard rules
# Firebase SDK keeps references via consumer rules, but keep the model/mappers explicit.
-keep class com.faujiniwas.app.data.** { *; }

# Coil / OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-dontwarn kotlinx.coroutines.**

# Keep annotations for tooling
-keepattributes *Annotation*