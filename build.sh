#!/bin/bash
# ============================================================
#  FaujiNiwas Build Script
#  Builds: React Web App
#  Optimized for memory efficiency to prevent freezing.
# ============================================================

set -e

# ── Configuration ─────────────────────────────────────────
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REACT_DIR="$BASE_DIR/fauji-niwas-app"

echo "============================================================"
echo "🪖  FaujiNiwas Build — $(date '+%d %b %Y %H:%M')"
echo "============================================================"

# ── React Web App ─────────────────────────────────────────
echo ""
echo "--- Building React Web App ---"
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

echo ""
echo "============================================================"
echo "🎉  Build finished! Deploy with: ./deploy.sh"
echo "============================================================"