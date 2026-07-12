@echo off
REM ============================================================
REM  FaujiNiwas Windows Build Script
REM  Builds: React Web App + Android APK (release)
REM ============================================================

echo ============================================================
echo 🪖  FaujiNiwas Windows Build — %date% %time%
echo ============================================================

REM --- [1/2] React Web App ---
echo.
echo --- [1/2] Building React Web App ---
if exist "fauji-niwas-app" (
    cd fauji-niwas-app
    echo Working in: %cd%
    set NODE_OPTIONS=--max-old-space-size=1536
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ React build failed.
        cd ..
        exit /b 1
    )
    echo ✅ React build completed.
    echo Dist: fauji-niwas-app\dist
    cd ..
) else (
    echo ⚠️  React directory not found. Skipping...
)

REM --- [2/2] Android APK ---
echo.
echo --- [2/2] Building Android APK ---
if exist "fauji-niwas_app" (
    cd fauji-niwas_app
    echo Working in: %cd%
    echo Compiling APK...
    flutter build apk --release
    if %errorlevel% neq 0 (
        echo ❌ Flutter build failed.
        cd ..
        exit /b 1
    )
    echo ✅ Android APK build completed.
    cd ..
) else (
    echo ⚠️  Flutter directory not found. Skipping...
)

echo.
echo ============================================================
echo 🎉  Build finished!
echo ============================================================
pause