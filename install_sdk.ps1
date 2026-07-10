$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$javaUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip"
$cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

$javaZip = "d:\java.zip"
$cmdlineZip = "d:\cmdline.zip"
$javaDir = "d:\java"
$androidSdkDir = "d:\android_sdk"

if (-not (Test-Path $javaZip)) {
    Write-Host "Downloading Java 17..."
    Invoke-WebRequest -Uri $javaUrl -OutFile $javaZip
} else {
    Write-Host "Java zip already downloaded."
}

if (-not (Test-Path $cmdlineZip)) {
    Write-Host "Downloading Android Commandline Tools..."
    Invoke-WebRequest -Uri $cmdlineUrl -OutFile $cmdlineZip
} else {
    Write-Host "Android Commandline Tools zip already downloaded."
}

Write-Host "Extracting Java..."
Expand-Archive -Path $javaZip -DestinationPath $javaDir -Force

$jdkExtractedFolder = Get-ChildItem -Path $javaDir -Directory | Select-Object -First 1
$javaHome = $jdkExtractedFolder.FullName

Write-Host "Extracting Android Commandline Tools..."
$cmdlineExtractTemp = "d:\cmdline_temp"
Expand-Archive -Path $cmdlineZip -DestinationPath $cmdlineExtractTemp -Force

$latestDir = "$androidSdkDir\cmdline-tools\latest"
New-Item -ItemType Directory -Force -Path $latestDir | Out-Null
Copy-Item -Path "$cmdlineExtractTemp\cmdline-tools\*" -Destination $latestDir -Recurse -Force

Write-Host "Setting Environment Variables..."
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkDir, "User")

$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -notmatch [regex]::Escape("$javaHome\bin")) {
    $oldPath += ";$javaHome\bin"
}
if ($oldPath -notmatch [regex]::Escape("$latestDir\bin")) {
    $oldPath += ";$latestDir\bin"
}
[Environment]::SetEnvironmentVariable("Path", $oldPath, "User")

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidSdkDir
$env:Path = $oldPath

Write-Host "Accepting SDKManager licenses and installing components..."
$sdkmanager = "$latestDir\bin\sdkmanager.bat"

Write-Host "Installing platform-tools, platforms;android-34, build-tools;34.0.0..."
cmd /c "echo y | `"$sdkmanager`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""

Write-Host "Configuring Flutter..."
d:\flutter\bin\flutter.bat config --android-sdk $androidSdkDir

Write-Host "Accepting Android Licenses for Flutter..."
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"
cmd /c "echo y | d:\flutter\bin\flutter.bat doctor --android-licenses"

Write-Host "Running final flutter doctor..."
d:\flutter\bin\flutter.bat doctor

Write-Host "Setup Complete!"
