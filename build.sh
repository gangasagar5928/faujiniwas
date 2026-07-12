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
echo "--- [2/2] Building Android APK ---"
if [ -d "$FLUTTER_DIR" ]; then
    cd "$FLUTTER_DIR"
    echo "📍 Working in: $FLUTTER_DIR"
    echo "⏳ Compiling APK..."
    flutter build apk --release
    echo "✅ Android APK build completed."
else
    echo "⚠️  Flutter directory not found at $FLUTTER_DIR. Skipping..."
fi

echo ""
echo "============================================================"
echo "🎉  Build finished! Deploy with: ./deploy.sh"
echo "============================================================"
