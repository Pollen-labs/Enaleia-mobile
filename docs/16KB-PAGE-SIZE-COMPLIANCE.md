# 16 KB Page Size Compliance Checklist

## Overview
Starting November 1st, 2025, Google Play requires all new apps and updates targeting Android 15+ (API 35+) to support 16 KB page sizes on 64-bit devices.

## Current Configuration Status

### ✅ Completed
- [x] Added `targetSdkVersion: 35` to `app.json`
- [x] Added `compileSdkVersion: 35` to `app.json`
- [x] Updated `eas.json` with `"image": "latest"` for production builds

### ⚠️ Critical Issues

#### 1. Expo SDK Version
- **Current**: Expo SDK 52 (`~52.0.46`)
- **Issue**: Expo SDK 52 may not fully support Android 15 (API 35) and 16 KB page sizes
- **Recommendation**: Upgrade to Expo SDK 54 or later for full Android 15 support
- **Action Required**: Verify Expo SDK 52 compatibility or plan upgrade

#### 2. Build Tools Verification
- **AGP Version**: Need AGP 8.5.1+ (should be included in latest EAS build image)
- **NDK Version**: Need NDK r28+ (should be included in latest EAS build image)
- **Action Required**: Verify EAS build image includes these versions

## Native Dependencies Checklist

All native modules must support 16 KB page sizes. Below is a comprehensive list of native dependencies in this project:

### Expo Modules (Native Code)
- [ ] `expo` (~52.0.46) - Core Expo SDK
- [ ] `expo-background-fetch` (~13.0.6)
- [ ] `expo-battery` (~9.0.2)
- [ ] `expo-camera` (~16.0.18) - **Critical**: Camera functionality
- [ ] `expo-clipboard` (~7.0.1)
- [ ] `expo-constants` (~17.0.8)
- [ ] `expo-font` (~13.0.4)
- [ ] `expo-haptics` (~14.0.1)
- [ ] `expo-linking` (~7.0.5)
- [ ] `expo-localization` (~16.0.1)
- [ ] `expo-location` (~18.0.10) - **Critical**: Location services
- [ ] `expo-mail-composer` (~14.0.2)
- [ ] `expo-router` (~4.0.21)
- [ ] `expo-secure-store` (~14.0.1) - **Critical**: Secure storage
- [ ] `expo-sharing` (~13.0.1)
- [ ] `expo-splash-screen` (~0.29.24)
- [ ] `expo-status-bar` (~2.0.1)
- [ ] `expo-system-ui` (~4.0.9)
- [ ] `expo-task-manager` (~12.0.6)
- [ ] `expo-web-browser` (~14.0.2)
- [ ] `expo-dev-client` (~5.0.19) - Dev dependencies

### React Native Modules (Native Code)
- [ ] `react-native` (0.76.9) - Core React Native
- [ ] `react-native-gesture-handler` (~2.20.2) - **Critical**: Gesture handling
- [ ] `react-native-get-random-values` (^1.11.0)
- [ ] `react-native-reanimated` (~3.16.7) - **Critical**: Animations (uses native code)
- [ ] `react-native-safe-area-context` (4.12.0)
- [ ] `react-native-screens` (4.4.0) - **Critical**: Navigation screens
- [ ] `react-native-svg` (15.8.0)
- [ ] `react-native-uuid` (^2.0.3)
- [ ] `@react-native-async-storage/async-storage` (1.23.1)
- [ ] `@react-native-community/netinfo` (11.4.1)
- [ ] `@react-native-picker/picker` (2.9.0)

### Build Tools
- [ ] `@react-native/gradle-plugin` (^0.78.2)
- [ ] `@react-native-community/cli` (latest)

## Verification Steps

### 1. Verify Expo SDK Compatibility
```bash
# Check Expo SDK 52 release notes for Android 15 support
# Visit: https://docs.expo.dev/versions/v52.0.0/
```

### 2. Test Build Configuration
```bash
# Run a test build with EAS
eas build --platform android --profile production
```

### 3. Verify APK Alignment
After building, verify 16 KB alignment:
```bash
zipalign -c -P 16 -v 4 your-app.apk
```

### 4. Test in 16 KB Environment
- Set up Android Emulator with 16 KB system image
- Or use physical device with 16 KB support (Pixel 8+ with Android 15 QPR1+)
- Verify page size: `adb shell getconf PAGE_SIZE` (should return `16384`)

## Action Items

### Immediate Actions
1. [ ] Verify if Expo SDK 52 supports Android 15 (API 35)
2. [ ] If not, plan upgrade to Expo SDK 54+
3. [ ] Test EAS build with current configuration
4. [ ] Verify all Expo modules are compatible with SDK version

### Before Production Release
1. [ ] Test app in 16 KB emulator environment
2. [ ] Verify APK is 16 KB aligned
3. [ ] Test all native module functionality
4. [ ] Check for any hardcoded page size assumptions in custom native code

### Long-term Maintenance
1. [ ] Monitor Expo SDK updates for 16 KB support
2. [ ] Keep all native dependencies updated
3. [ ] Include 16 KB testing in CI/CD pipeline

## Resources
- [Android 16 KB Page Size Guide](https://developer.android.com/guide/practices/page-sizes)
- [Expo SDK Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## Notes
- The requirement applies to apps targeting Android 15+ (API 35+)
- Deadline: November 1st, 2025
- Apps using NDK libraries must be rebuilt for 16 KB support
- Most modern build tools (AGP 8.5.1+, NDK r28+) handle 16 KB alignment automatically

