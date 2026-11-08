/* Auto Link settings. Maps use OpenStreetMap, which is free and needs no key. */
const CONFIG = {
  // Demo admin account, created automatically on first run. CHANGE THIS PASSWORD before sharing the app.
  // (It is stored in plain text here, so this is for demos only. Real admin sign-in needs a backend.)
  ADMIN: { name: 'Auto Link Admin', email: 'admin@autolink.com', password: 'Admin@12345' },
  COUNTRY: 'zw',                                   // limit address search to Zimbabwe (use another 2-letter code if needed)
  DEFAULT_CENTER: { lat: -17.8292, lng: 31.0522 }, // Harare
  WASH_BAY: {
    name: 'Auto Link Wash Bay',
    address: 'Replace this with your wash bay address',
    lat: -17.8292, lng: 31.0522                    // replace with your real coordinates
  }
};
