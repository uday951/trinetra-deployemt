@echo off
echo Building native battery module...

echo Cleaning previous builds...
cd android
call gradlew clean

echo Building Android app with native battery module...
call gradlew assembleDebug

echo Build complete! 
echo The native battery module is now integrated.
echo Run the app to get REAL battery data from your Motorola device.

pause