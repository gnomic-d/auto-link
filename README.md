# Auto Link

Car wash booking (at our bay or at your location), tow truck requests, a car parts shop and simulated card payment. Plain HTML, CSS and JavaScript. Installable as an app (PWA).

## 1. Run it in VS Code
Open this folder in VS Code, install the **Live Server** extension, right-click `index.html` and choose "Open with Live Server".

## 2. Turn on Google Maps
1. Go to https://console.cloud.google.com and create a project.
2. Set up billing for the project (Google requires it for Maps, and gives a monthly free usage credit; check current pricing).
3. Enable these APIs: **Maps JavaScript API** and **Geocoding API**.
4. Create an API key (APIs and Services > Credentials).
5. Restrict the key: under "Application restrictions" choose HTTP referrers and add `http://localhost:*` and your website address (for example `https://your-site.netlify.app/*`). Under "API restrictions" allow only the two APIs above.
6. Open `js/config.js`, paste the key into `GOOGLE_MAPS_API_KEY`, and set your wash bay name, address and coordinates in `WASH_BAY`.

Without a key everything still works. Maps show a notice and "Get directions" / "Open in Google Maps" links still open Google Maps.

How maps are used: tap the map to place pickup (A) and drop-off (B) for a tow, or "Use my location". Distance is the straight-line distance between the pins x 1.3, as a rough road estimate, and can be edited. For mobile car washes, drop a pin where the team should come.

## 3. Install it on a phone
Phones only install web apps from **https** addresses (localhost works on your computer only).
1. Put the folder online for free, for example drag the whole folder onto https://app.netlify.com/drop, or use GitHub Pages or Vercel.
2. Open the https address on the phone.
   - Android (Chrome): tap "Install app" in the header, or menu > Install app.
   - iPhone (Safari): Share > Add to Home Screen.
3. It now opens full screen with its own icon, like a normal app.

## 4. Make a real Android app (APK) with Capacitor (optional)
Needs Node.js and Android Studio.
```
mkdir www            (copy index.html, css, js, images, icons, manifest.webmanifest, sw.js into www)
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Auto Link" com.autolink.app --web-dir=www
npx cap add android
npx cap sync
npx cap open android
```
In Android Studio add `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />` to `AndroidManifest.xml`, then Build > Build APK. Add your app's package name to the Google key restrictions if you restrict by app.

## Notes
- Payment is simulated. A card ending in `0000` is declined, any other valid-looking card succeeds. No real money moves.
- Orders and the cart are stored in the phone's browser storage only. A real backend and database are needed before accepting real orders.
- After changing files, bump `CACHE` in `sw.js` (for example `auto-link-v2`) so installed copies update.
