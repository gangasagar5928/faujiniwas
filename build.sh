#!/bin/bash
# ============================================================
#  FaujiNiwas Unified Build Script
#  Builds: React Web App + Android APK (signed, release)
#  Optimized for lower-end systems to prevent freezes.
# ============================================================

set -e

# ── Configuration ─────────────────────────────────────────
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$BASE_DIR/fauji-niwas-app"
FLUTTER_DIR="$BASE_DIR/fauji-niwas_app"

# Java 17 required for Gradle 8.3 compatibility
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
export FLUTTER_BIN="/home/petronski/development/flutter/bin"
export PATH="$JAVA_HOME/bin:$FLUTTER_BIN:$PATH"

echo "============================================================"
echo "🪖  FaujiNiwas Unified Build — $(date '+%d %b %Y %H:%M')"
echo "📍  Java: $(java -version 2>&1 | head -n 1)"
echo "============================================================"

# ── [1/2] React Web App ────────────────────────────────────
echo ""
echo "--- [1/2] Building React Web App ---"
if [ -d "$REACT_DIR" ]; then
    cd "$REACT_DIR"
    echo "📍 Working in: $REACT_DIR"
    # Limit Node memory to 1.5 GB to prevent system freeze
    NODE_OPTIONS="--max-old-space-size=1536" npm run build
    echo "✅ React build completed."
    echo "📦 Dist: $REACT_DIR/dist"
else
    echo "⚠️  React directory not found at $REACT_DIR. Skipping..."
fi

# ── [2/2] Android APK (signed release) ────────────────────
echo ""
echo "--- [2/2] Building Android APK (signed) ---"
if [ -d "$FLUTTER_DIR" ]; then
    cd "$FLUTTER_DIR"
    echo "📍 Working in: $FLUTTER_DIR"

    # Verify keystore exists
    KEYSTORE="$FLUTTER_DIR/android/app/faujiadda-release.jks"
    KEY_PROPS="$FLUTTER_DIR/android/key.properties"
    if [ -f "$KEYSTORE" ] && [ -f "$KEY_PROPS" ]; then
        echo "🔑 Production keystore found — building signed release APK."
    else
        echo "⚠️  Keystore not found — APK will use debug signing."
    fi

    # Memory-safe Gradle configuration
    mkdir -p android
    cat > android/gradle.properties << 'GRADLE'
org.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC -Dfile.encoding=UTF-8
org.gradle.parallel=false
org.gradle.daemon=false
android.useAndroidX=true
android.enableJetifier=false
GRADLE
    echo "✅ Gradle memory limits configured."

    # Resolve pub packages first
    echo "⏳ Fetching Flutter dependencies..."
    nice -n 19 ionice -c 3 flutter pub get

    # Build with low OS priority to prevent UI freezes
    echo "⏳ Compiling APK (this may take a few minutes)..."
    nice -n 19 ionice -c 3 flutter build apk --release --target-platform android-arm64
    echo "⏳ Compiling App Bundle (.aab) for Play Store..."
    nice -n 19 ionice -c 3 flutter build appbundle --release

    APK_PATH="$FLUTTER_DIR/build/app/outputs/flutter-apk/app-release.apk"
    AAB_PATH="$FLUTTER_DIR/build/app/outputs/bundle/release/app-release.aab"
    APK_SIZE=$(du -sh "$APK_PATH" 2>/dev/null | cut -f1)
    AAB_SIZE=$(du -sh "$AAB_PATH" 2>/dev/null | cut -f1)
    echo ""
    echo "✅ Android artifacts completed!"
    echo "📍 APK (Testing)    : $APK_PATH ($APK_SIZE)"
    echo "📍 AAB (Play Store) : $AAB_PATH ($AAB_SIZE)"
else
    echo "⚠️  Flutter directory not found at $FLUTTER_DIR. Skipping..."
fi

echo ""
echo "============================================================"
echo "🎉  Build finished! Deploy with: ./deploy.sh"
echo "============================================================"
