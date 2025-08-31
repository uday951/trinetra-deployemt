@echo off
echo Setting up ADB port forwarding for Android...
adb reverse tcp:5000 tcp:5000
echo Port forwarding setup complete!
echo Android device can now access localhost:5000
pause