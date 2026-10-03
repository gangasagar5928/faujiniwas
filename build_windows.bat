@echo off
REM ============================================================
REM  FaujiNiwas Windows Build Script
REM  Builds: React Web App
REM ============================================================

echo ============================================================
echo 🪖  FaujiNiwas Windows Build — %date% %time%
echo ============================================================

REM --- React Web App ---
echo.
echo --- Building React Web App ---
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

echo.
echo ============================================================
echo 🎉  Build finished!
echo ============================================================
pause