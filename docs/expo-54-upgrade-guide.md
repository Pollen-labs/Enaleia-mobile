# Expo SDK 54 Upgrade Guide

## Overview

This document details the challenges encountered and solutions implemented when upgrading from Expo SDK 52 to Expo SDK 54.

## Initial Error

### Error Message
```
[runtime not ready]: ReferenceError: Property 'require' doesn't exist

anonymous
&platform=ios&dev=true&hot=false&lazy=true&transform.routerRoot=app:1304:24
global
&platform=ios&dev=true&hot=false&lazy=true&transform.routerRoot=app:4071:2
```

### Root Cause
The error was caused by a combination of:
1. Improper Metro configuration that was overriding Expo's default settings
2. Incorrect Babel configuration for NativeWind v2
3. Outdated package versions incompatible with React 19 and Expo SDK 54

## Solutions Implemented

### 1. Metro Configuration Fix

**File:** `metro.config.js`

**Problem:** The original configuration was destructuring and replacing the entire resolver object, which was "clobbering" critical Expo defaults.

**Before:**
```javascript
const { resolver } = config;

config.resolver = {
  ...resolver,
  sourceExts: [...resolver.sourceExts, "svg"],
  // ... other configs
};
```

**After:**
```javascript
config.resolver.sourceExts.push("svg");

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Custom resolution logic
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

**Key Change:** Modified the resolver incrementally instead of replacing it entirely, preserving Expo's default Metro configuration.

### 2. Babel Configuration Fix

**File:** `babel.config.js`

**Problem:** Multiple issues with Babel configuration:
- Initial attempt to use `jsxImportSource: "nativewind"` which is only for NativeWind v4+, not v2
- NativeWind preset placed incorrectly
- Incompatible `@babel/plugin-transform-export-namespace-from` plugin

**Evolution of Fixes:**

**Attempt 1 (Failed):**
```javascript
presets: [
  ["babel-preset-expo", { jsxImportSource: "nativewind" }]
],
plugins: [
  "nativewind/babel",
  // ...
]
```
**Error:** `Unable to resolve module nativewind/jsx-dev-runtime`

**Attempt 2 (Failed):**
```javascript
presets: [
  "babel-preset-expo",
  "nativewind/babel"
],
plugins: [
  "@babel/plugin-transform-export-namespace-from",
  // ...
]
```
**Error:** `Unknown option: .visitor`

**Final Working Configuration:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo"
    ],
    plugins: [
      "@lingui/babel-plugin-lingui-macro",
      "nativewind/babel",
      "react-native-reanimated/plugin"
    ],
  };
};
```

**Key Changes:**
- Removed `jsxImportSource: "nativewind"` option (only for NativeWind v4+)
- Moved `nativewind/babel` from presets to plugins array
- Removed `@babel/plugin-transform-export-namespace-from` (not needed with modern babel-preset-expo)
- Removed `@babel/plugin-transform-runtime` (can conflict with Expo defaults)

### 3. Package Updates

Updated critical packages for React 19 and Expo SDK 54 compatibility:

```bash
pnpm update react-native-reanimated react-native-worklets @expo/metro-runtime react-native-screens react-native-gesture-handler
```

**Key Updates:**
- `react-native-reanimated`: 4.1.1 → 4.1.5
- `react-native-worklets`: 0.5.1 → 0.6.1
- `@expo/metro-runtime`: Updated to ~6.1.2

## Technical Details

### NativeWind v2 Compatibility

For NativeWind v2.0.11 with Expo SDK 50+:
- Use `babel-preset-expo` as the only preset
- Add `nativewind/babel` as a **plugin** (not a preset)
- Do NOT use `jsxImportSource` option (that's for NativeWind v4+)

### React Native Reanimated

- Must be the **last** plugin in the Babel plugins array
- In Expo SDK 54, `react-native-worklets` must be explicitly installed even though it's bundled internally

### Metro Bundler

- As of SDK 53+, using Expo CLI for bundling is mandatory when working with expo-updates
- Custom Metro configurations should modify the default config incrementally, not replace it

## Troubleshooting Steps Used

1. **Simplify Metro Configuration**
   - Changed from replacing resolver object to modifying it incrementally

2. **Clear All Caches**
   ```bash
   npx expo start --clear
   rm -rf /tmp/metro-* /tmp/haste-* /tmp/react-*
   rm -rf node_modules/.cache
   watchman watch-del-all  # if watchman is installed
   ```

3. **Update Dependencies**
   ```bash
   pnpm update [critical-packages]
   ```

4. **Iterative Babel Configuration Testing**
   - Started with recommended config
   - Removed incompatible options one by one
   - Tested after each change

## Final Configuration

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo"
    ],
    plugins: [
      "@lingui/babel-plugin-lingui-macro",
      "nativewind/babel",
      "react-native-reanimated/plugin"  // Must be last
    ],
  };
};
```

### metro.config.js
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// IMPORTANT: Configure Lingui transformer first
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("@lingui/metro-transformer/expo"),
};

config.resolver.sourceExts.push("svg");

config.resolver.extraNodeModules = {
  "@noble/hashes": path.resolve(__dirname, "node_modules/@noble/hashes"),
  crypto: path.resolve(__dirname, "node_modules/@noble/hashes/crypto"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@noble/hashes/crypto.js" || moduleName === "@noble/hashes/crypto") {
    return {
      filePath: path.resolve(__dirname, "node_modules/@noble/hashes/crypto.js"),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

**Critical Note:** The Lingui transformer configuration must be included in `metro.config.js`. Without it, you'll encounter `nullthrows` errors from Metro bundler during module resolution.

## Key Takeaways

1. **Don't override Expo defaults**: Always modify Metro config incrementally
2. **NativeWind v2 vs v4**: Check documentation for your specific version
3. **Babel plugin order matters**: Reanimated plugin must always be last
4. **Clear caches frequently**: Many issues resolve with a clean cache
5. **Update dependencies**: Ensure all packages are compatible with React 19 and Expo SDK 54

## References

- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [NativeWind v2 Installation Guide](https://v2.nativewind.dev/getting-started/installation)
- [Expo Issue #36635: runtime not ready ReferenceError](https://github.com/expo/expo/issues/36635)
- [Expo Issue #38108: expo-updates ReferenceError](https://github.com/expo/expo/issues/38108)
- [NativeWind Issue #1570: Babel plugin error with Expo 54](https://github.com/nativewind/nativewind/issues/1570)

## Android Build Issues

### Error: Reanimated Requires New Architecture

**Error Message:**
```
[Reanimated] Reanimated requires new architecture to be enabled.
Please enable it by setting `newArchEnabled` to `true` in `gradle.properties`.
```

**Root Cause:**
React Native Reanimated v4+ requires the New Architecture to be enabled. There was a mismatch between:
- `app.json` had `"newArchEnabled": false`
- `android/gradle.properties` had `newArchEnabled=true`

**Solution:**
Enable New Architecture consistently across both configuration files.

**File:** `app.json`
```json
{
  "expo": {
    "newArchEnabled": true,
    // ... rest of config
  }
}
```

**File:** `android/gradle.properties`
```properties
# Already set to true
newArchEnabled=true
```

### Important Notes About New Architecture

1. **Expo SDK 54 Compatibility**: Expo SDK 54 with React Native 0.81 fully supports New Architecture
2. **Reanimated v4 Requirement**: Reanimated 4.1.1+ (bundled with Expo SDK 54) requires New Architecture
3. **No Downgrading**: Do not downgrade Reanimated to v3 as it may cause other compatibility issues
4. **iOS Configuration**: For iOS, you may need to run `pod install` after enabling New Architecture

### After Enabling New Architecture

If you encounter issues after enabling New Architecture:

**For Android:**
```bash
cd android
./gradlew clean
cd ..
eas build --platform android
```

**For iOS:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
eas build --platform ios
```

## React Navigation Issues

### Error: Couldn't find a LinkingContext context

**Error Message:**
```
ERROR [Error: Couldn't find a LinkingContext context.]

Code: LinkingContext.js
  5 | export const LinkingContext = /*#__PURE__*/React.createContext({
  6 |   get options() {
>  7 |     throw new Error(MISSING_CONTEXT_ERROR);
     |                    ^
  8 |   }
  9 | });
 10 | LinkingContext.displayName = 'LinkingContext';
```

**Root Cause:**
This error occurs due to version mismatches between `@react-navigation` packages. When `expo-router` is updated, it may pull in newer versions of `@react-navigation/bottom-tabs` that require matching versions of `@react-navigation/native`.

**Symptoms:**
- Multiple instances of `@react-navigation/native` in the dependency tree (not deduped)
- Different versions between root dependencies and expo-router's nested dependencies
- LinkingContext not being properly provided to the tab bar component

**Solution:**

1. **Incorrect Import Path:**

   **File:** `app/(tabs)/_layout.tsx`

   Change from:
   ```typescript
   import { Tabs } from "expo-router/tabs";
   ```

   To:
   ```typescript
   import { Tabs } from "expo-router";
   ```

2. **Version Alignment:**

   Check dependency tree:
   ```bash
   npm ls @react-navigation/native
   ```

   If you see multiple versions (not all showing `deduped`), fix by reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

   Verify all packages now use the same version:
   ```bash
   npm ls @react-navigation/native
   # Should show all packages deduped to the same version
   ```

3. **Manual Version Update (if needed):**

   If the issue persists, check what version `expo-router` expects:
   ```bash
   npm ls expo-router
   ```

   Then install matching versions in your `package.json`:
   ```bash
   npm install @react-navigation/native@7.1.22 @react-navigation/native-stack@7.8.2
   ```

**Verification:**
After fixing, run `npm ls @react-navigation/native` and ensure output shows:
```
enaleia@1.0.0
+-- @react-navigation/native-stack@7.x.x
| `-- @react-navigation/native@7.1.x deduped
+-- @react-navigation/native@7.1.x
`-- expo-router@6.0.x
  +-- @react-navigation/bottom-tabs@7.x.x
  | `-- @react-navigation/native@7.1.x deduped
  `-- @react-navigation/native@7.1.x deduped
```

All instances should show `deduped`, indicating they share the same package instance.

## QR Scanner Component Issues

### Missing useCallback Dependencies

**File:** `components/features/scanning/QRTextInput.tsx`

**Issue:**
The `handleQRScan` callback was missing `setScanner` and `setError` from its dependency array, causing stale closures.

**Before:**
```typescript
const handleQRScan = useCallback(
  (scannedData: unknown) => {
    // ... uses setScanner(false) and setError(null)
  },
  [id, onChangeText, onScanComplete]  // Missing setScanner, setError
);
```

**After:**
```typescript
const handleQRScan = useCallback(
  (scannedData: unknown) => {
    // ... uses setScanner(false) and setError(null)
  },
  [id, onChangeText, onScanComplete, setScanner, setError]  // Fixed
);
```

**Symptoms:**
- QR scanner modal doesn't close after successful scan
- Scanner appears to hang after scanning a code
- State updates don't reflect properly

## Metro Bundler Errors

### Error: Got unexpected undefined (nullthrows)

**Error Message:**
```
ERROR Error: Got unexpected undefined
  at nullthrows (node_modules/nullthrows/nullthrows.js:7:15)
  at Graph._recursivelyCommitModule (node_modules/metro/src/DeltaBundler/Graph.js:203:51)
```

**Root Cause:**
Missing Lingui transformer configuration in `metro.config.js`. The Metro bundler cannot properly transform Lingui macro imports without the custom transformer.

**Solution:**
Ensure `metro.config.js` includes the Lingui transformer configuration at the top:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// CRITICAL: Must include Lingui transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("@lingui/metro-transformer/expo"),
};

// ... rest of configuration
```

**Important Notes:**
- The transformer must be configured before other Metro customizations
- Without this, any file using Lingui macros (`@lingui/macro`) will fail to bundle
- This is required even though Lingui babel plugin is in `babel.config.js`

## Dates
- Initial Upgrade: December 1, 2025
- Additional Issues Fixed: January 6, 2026
