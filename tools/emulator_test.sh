#!/usr/bin/env bash
# Runs inside the emulator action: installs the APK, opens the Mushaf library screen, drives its WebView via DevTools.
mkdir -p /tmp/emu
exec > /tmp/emu/log.txt 2>&1
set -x
adb install -r /tmp/app.apk
adb root; sleep 3
adb shell pm grant com.quran.labs.androidquran android.permission.WRITE_EXTERNAL_STORAGE
adb logcat -c
adb shell pm list packages | grep -i quran
adb shell dumpsys package com.quran.labs.androidquran | grep -iE "versionName|MushafLibrary|Activity Resolver" | head -20
unzip -p /tmp/app.apk AndroidManifest.xml | strings -el | grep -iE "Mushaf|ZikrActivity" | head
for d in $(unzip -l /tmp/app.apk | grep -o 'classes[0-9]*\.dex'); do echo $d; unzip -p /tmp/app.apk $d | strings | grep -c MushafLibraryActivity; done
adb shell am start -n com.quran.labs.androidquran/.ui.MushafLibraryActivity
adb shell am start -n com.quran.labs.androidquran/.QuranDataActivity
sleep 10
adb exec-out screencap -p > /tmp/emu/01_launch.png
adb shell am start -n com.quran.labs.androidquran/.ui.MushafLibraryActivity
sleep 8
adb exec-out screencap -p > /tmp/emu/00_library.png
SOCK=$(adb shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*' | head -1)
echo "sock=$SOCK"
adb forward tcp:9222 localabstract:$SOCK
python3 tools/emulator_drive.py
adb logcat -d -s chromium:I AndroidRuntime:E 2>/dev/null | tail -80 > /tmp/emu/logcat.txt
adb exec-out screencap -p > /tmp/emu/99_end.png
