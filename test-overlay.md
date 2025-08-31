# System Overlay Testing Guide

## Steps to Test System Overlay:

### 1. **Grant Overlay Permission**
   - Open the Trinetra app
   - Go to "Spam Calls" tab
   - Tap "Test System Overlay" button
   - When prompted, tap "Open Settings"
   - Enable "Display over other apps" permission for Trinetra
   - Return to the app

### 2. **Test Overlay Display**
   - Tap "Test System Overlay" button again
   - You should see a red overlay popup appear on screen
   - The overlay should show:
     - "🚨 SPAM CALL DETECTED"
     - Phone number: +1234567890
     - Risk: HIGH
     - Message: Test spam call overlay
   - Three buttons: Block, Allow, Close

### 3. **Test Real Call Detection**
   - Tap "Start Monitoring" to enable call detection
   - Use another phone to call your test device
   - The overlay should appear automatically for incoming calls

### 4. **Troubleshooting**
   If overlay doesn't appear:
   - Check Android Settings > Apps > Trinetra > Permissions
   - Ensure "Display over other apps" is enabled
   - Check notification panel for fallback notifications
   - Look for logs in Android Studio logcat

### 5. **Expected Behavior**
   - ✅ Overlay appears on top of all apps
   - ✅ Overlay auto-dismisses after 10 seconds
   - ✅ Buttons work (Block/Allow/Close)
   - ✅ Works even when app is in background
   - ✅ Falls back to notifications if overlay permission denied

## Key Features Fixed:
- ✅ Proper foreground service implementation
- ✅ Notification channel creation
- ✅ Permission checking and requesting
- ✅ Fallback to notifications when overlay fails
- ✅ Proper service lifecycle management
- ✅ Enhanced logging for debugging