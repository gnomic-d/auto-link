# Build the Auto Link APK

An APK is a file you can copy to an Android phone and install. It has to be built with Google's Android tools, which need a computer with Android Studio OR a free GitHub account. Pick one route.

## Route A: GitHub builds it for you (nothing to install)
1. Create a free account at github.com and make a new repository (private is fine).
2. Upload everything in this folder to it (including the hidden `.github` folder). Easiest: install GitHub Desktop, add this folder, publish.
3. Open the repository > **Actions** tab > **Build Android APK** > **Run workflow**. (It also runs on every push.)
4. Wait about 5 to 10 minutes for a green tick. Open the run and download **auto-link-apk** from "Artifacts". Unzip it to get `app-debug.apk`.

## Route B: on your own computer
Install Node.js (version 22 or newer), Android Studio and JDK 21, then in this folder:
```
npm install
npm run android:add
```
Add these two lines inside `<manifest>` (above `<application`) in `android/app/src/main/AndroidManifest.xml`:
```
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```
Then:
```
npx @capacitor/assets generate --android
npm run android:sync
npm run android:open
```
In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**. The file is `android/app/build/outputs/apk/debug/app-debug.apk`.
After any change to the web files run `npm run android:sync` and build again.

## Install the APK on the phone
1. Copy `app-debug.apk` to the phone (USB, WhatsApp to yourself, email, Google Drive).
2. Tap the file. When Android asks, allow **Install unknown apps** for the app you opened it from (for example Chrome, Files or WhatsApp).
3. Tap Install. If Play Protect warns about an unrecognised app, choose "Install anyway". This appears because the app is not from the Play Store.

## Later: Google Play Store
The debug APK is fine for your own phones and testers. Publishing on Play needs a signed release bundle (AAB) and a Play Console account (one-time fee).
