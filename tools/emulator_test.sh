#!/usr/bin/env bash
# Runs inside the emulator action: installs the APK, opens the Mushaf library screen, drives its WebView via DevTools.
mkdir -p /tmp/emu
exec > /tmp/emu/log.txt 2>&1
set -x
adb install -r /tmp/app.apk
adb root; sleep 3
adb shell pm grant com.quran.labs.androidquran android.permission.WRITE_EXTERNAL_STORAGE
adb logcat -c
adb shell am start -n com.quran.labs.androidquran/.ui.MushafLibraryActivity
sleep 8
adb exec-out screencap -p > /tmp/emu/00_library.png
SOCK=$(adb shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*' | head -1)
echo "sock=$SOCK"
adb forward tcp:9222 localabstract:$SOCK
python3 tools/emulator_drive.py
adb logcat -d -s chromium:I AndroidRuntime:E 2>/dev/null | tail -80 > /tmp/emu/logcat.txt
adb exec-out screencap -p > /tmp/emu/99_end.png
