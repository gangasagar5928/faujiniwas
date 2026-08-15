#!/bin/bash
# ============================================================
#  FaujiNiwas Unified Build Script
#  Builds: React Web App + Android APK (signed, release)
#  Optimized for memory efficiency to prevent freezing.
# ============================================================

set -e

# ── Configuration ─────────────────────────────────────────
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$BASE_DIR/fauji-niwas-app"
FLUTTER_DIR="$BASE_DIR/fauji-niwas_app"

# Setup environment if not already in PATH
if [ -z "$JAVA_HOME" ] && [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
    export PATH="$JAVA_HOME/bin:$PATH"
fi

if ! command -v flutter &> /dev/null && [ -d "$HOME/development/flutter/bin" ]; then
    export PATH="$HOME/development/flutter/bin:$PATH"
fi

echo "============================================================"
echo "🪖  FaujiNiwas Unified Build — $(date '+%d %b %Y %H:%M')"
if command -v java &> /dev/null; then
    echo "📍  Java: $(java -version 2>&1 | head -n 1)"
fi
if command -v flutter &> /dev/null; then
    echo "📍  Flutter: $(flutter --version 2>&1 | head -n 1)"
fi
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
    cd "$BASE_DIR"
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
    echo "📦 APK: $FLUTTER_DIR/build/app/outputs/flutter-apk/app-release.apk"
    cd "$BASE_DIR"
else
    echo "⚠️  Flutter directory not found at $FLUTTER_DIR. Skipping..."
fi

echo ""
echo "============================================================"
echo "🎉  Build finished! Deploy with: ./deploy.sh"
echo "============================================================"
