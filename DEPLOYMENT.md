# Trinetra Security - Deployment Guide

## 📋 Prerequisites
- Expo CLI installed: `npm install -g @expo/eas-cli`
- Expo account created
- Backend deployed on Render

## 🚀 Deployment Steps

### 1. Backend Setup (Your Part)
```bash
# Deploy trinetra-backend to Render
# Get your production URL: https://your-app.onrender.com
```

### 2. Update Production Config
```bash
# Update .env.production with your Render URL
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com
```

### 3. Build Setup
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Initialize project
eas build:configure
```

### 4. Build APK
```bash
# Development build (for testing)
eas build --platform android --profile preview

# Production build (for Play Store)
eas build --platform android --profile production
```

### 5. Download & Test
- Download APK from Expo dashboard
- Install on Android device
- Test all features with production backend

### 6. Play Store Release
1. Create Google Play Developer account ($25)
2. Upload AAB file to Play Console
3. Add screenshots, description, privacy policy
4. Submit for review
5. Publish app

## 📱 Build Commands

```bash
# Quick APK for testing
eas build --platform android --profile preview

# Production AAB for Play Store  
eas build --platform android --profile production

# Check build status
eas build:list
```

## 🔧 Configuration Files
- `app.json` - App metadata and permissions
- `eas.json` - Build configurations
- `.env.production` - Production environment variables

## 📋 Checklist Before Release
- [ ] Backend deployed and working
- [ ] Production URLs updated
- [ ] App tested on real device
- [ ] All features working
- [ ] Privacy policy added
- [ ] App icons and splash screen ready
- [ ] Play Store listing prepared

## 🎯 Next Steps After You Deploy Backend
1. Share your Render URL
2. I'll update the production config
3. Build and test APK
4. Prepare for Play Store submission