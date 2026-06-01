#!/bin/bash
# FaujiNiwas Automated Build & Deploy Script
# Safe execution without crashing the local system

echo "=========================================================="
echo "🚀 FaujiNiwas Zero-Downtime Build & Deploy"
echo "=========================================================="

echo "[1/4] Preparing Environment..."
cd "/run/media/petronski/Local Disk D/fauji-niwas"
echo "✅ Environment ready."

echo "[2/4] Building React App (Production Mode)..."
cd fauji-niwas-app
# limit node memory usage to prevent system freezing on lower-ram machines
NODE_OPTIONS="--max-old-space-size=1024" npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi
echo "✅ Build completed successfully."

echo "[3/4] Preparing Deployment Files..."
cd ../
# Add a safety check to ensure dist exists
if [ ! -d "fauji-niwas-app/dist" ]; then
  echo "❌ Dist folder not found! Aborting deploy."
  exit 1
fi

echo "[4/4] Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
  echo "=========================================================="
  echo "🎉 SUCCESS: Deploy completed!"
  echo "🌐 App is live at: https://faujiniwas.web.app"
  echo "=========================================================="
else
  echo "❌ Firebase deployment failed."
  exit 1
fi
