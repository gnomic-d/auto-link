# Auto Link

Car wash booking (at our bay or at your location), tow truck requests, a car parts shop and simulated card payment. Plain HTML, CSS and JavaScript. Installable as an app (PWA).

## 1. Run it in VS Code
Open this folder in VS Code, install the **Live Server** extension, right-click `index.html` and choose "Open with Live Server".

## 2. Maps (free, no key)
Maps use OpenStreetMap through Leaflet, so there is nothing to sign up for. Open `js/config.js` and set your wash bay name, address and coordinates (right-click your wash bay on Google Maps and copy the two numbers), and the 2-letter `COUNTRY` code for address search.

How maps are used: tap the map to place pickup (A) and drop-off (B) for a tow, or "Use my location". Distance is the straight-line distance between the pins x 1.3, a rough road estimate that can be edited. For mobile car washes, drop a pin where the team should come. Address search uses OpenStreetMap's free Nominatim service, which is meant for light use. If the app grows to many users, switch to a paid or self-hosted provider.

## Admin and customer
Two roles: **customer** (anyone who registers) and **admin**. The admin account is created automatically the first time the app opens, using `CONFIG.ADMIN` in `js/config.js` (default email `admin@autolink.com`, password `Admin@12345`). Change the password there before sharing the app. The admin sees a dashboard with orders (change each order's status), customers and plans, and products (edit prices, hide or show). Customers see their own orders and the new status. Only signed-in customers see the subscription plans.

Everything is saved on the phone it was created on, so the admin only sees orders made on that same phone. To have one admin see every customer's orders from different phones you need a backend (for example Firebase or Supabase).

## Accounts and plans
Sign in, register and the Silver, Gold and Platinum plans work with no setup. Accounts live in the phone's own storage, so they are not shared between devices, and passwords cannot be recovered. Plan payments use the same simulated card form and are not charged. For real accounts and real billing you need a backend, for example Firebase or Supabase for sign-in plus a payment provider.

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
