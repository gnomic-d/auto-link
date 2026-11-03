/* Auto Link - car wash booking, tow truck request, accessories shop, simulated payment */

// ---------- Data (edit names, prices and image files here) ----------
const WASHES = [
  { id: 'express', name: 'Express wash', price: 5, img: 'images/carwash-express.jpg', desc: 'Pressure rinse and hand dry. About 20 min.' },
  { id: 'foam', name: 'Foam wash', price: 8, img: 'images/carwash-foam.jpg', desc: 'Snow-foam pre-wash and hand wash. About 30 min.' },
  { id: 'full', name: 'Full wash', price: 10, img: 'images/carwash-full.jpg', desc: 'Exterior, interior wipe-down and vacuum. About 40 min.' },
  { id: 'premium', name: 'Premium detail', price: 20, img: 'images/carwash-premium.jpg', desc: 'Full wash plus machine polish and wax. About 90 min.' }
];
const PRODUCTS = [
  { id: 'p1', name: 'Brake discs (pair)', price: 70, img: 'images/part-brake-discs.jpg' },
  { id: 'p2', name: 'Oil filter', price: 6, img: 'images/part-oil-filter.jpg' },
  { id: 'p3', name: 'Air filter', price: 9, img: 'images/part-air-filter.jpg' },
  { id: 'p4', name: 'Spark plugs (set of 4)', price: 18, img: 'images/part-spark-plugs.jpg' },
  { id: 'p5', name: 'Car battery 12V', price: 85, img: 'images/part-battery.jpg' },
  { id: 'p6', name: 'Engine oil 5L', price: 30, img: 'images/part-engine-oil.jpg' },
  { id: 'p7', name: 'Headlight bulbs (pair)', price: 14, img: 'images/part-headlight-bulbs.jpg' },
  { id: 'p8', name: 'Halo LED headlights', price: 55, img: 'images/part-halo-headlights.jpg' },
  { id: 'p9', name: 'Alloy wheel (each)', price: 120, img: 'images/part-alloy-wheel.jpg' }
];
const MOBILE_FEE = 5;
const TOW_BASE = 25, TOW_PER_KM = 1.5;
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

// ---------- Helpers ----------
const $ = s => document.querySelector(s);
const money = n => '$' + n.toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const img = (src, cls = 'thumb') => `<img class="${cls}" src="${src}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
const today = () => new Date().toISOString().slice(0, 10);

let cart = load('al_cart', []);
let orders = load('al_orders', []);
let svc = 'wash';

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function persist() {
  save('al_cart', cart);
  save('al_orders', orders);
  const n = cart.reduce((s, i) => s + i.qty, 0);
  $('#badge').textContent = n;
  $('#badge').hidden = n === 0;
}
const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

// ---------- Views ----------
const productCard = p => `
  <div class="card">${img(p.img)}
    <div class="pad"><h3>${p.name}</h3><span class="price">${money(p.price)}</span>
    <button class="btn small" data-act="add" data-id="${p.id}" style="margin-top:auto">Add to cart</button></div>
  </div>`;

const views = {
  home: () => `
    <section class="hero">${img('images/hero-banner.jpg', '')}
      <div><h2>Wash it. Tow it. Fit it.</h2><p>Car wash, tow truck and car parts in one app.</p></div>
    </section>
    <div class="row">
      <a class="btn" href="#services" data-svc="wash">Book a car wash</a>
      <a class="btn alt" href="#services" data-svc="tow">Request a tow</a>
    </div>
    <h2>Popular car parts</h2>
    <div class="grid">${PRODUCTS.slice(0, 4).map(productCard).join('')}</div>
    <div class="row"><a class="btn alt" href="#shop">See all car parts</a></div>`,

  services: () => `
    <div class="seg" role="group" aria-label="Choose a service">
      <button data-act="svc" data-v="wash" aria-pressed="${svc === 'wash'}">Car wash</button>
      <button data-act="svc" data-v="tow" aria-pressed="${svc === 'tow'}">Tow truck</button>
    </div>
    ${svc === 'wash' ? washForm() : towForm()}`,

  shop: () => `<h2>Car parts</h2><div class="grid">${PRODUCTS.map(productCard).join('')}</div>`,

  cart: () => {
    if (!cart.length) return `<div class="empty"><h2>Your cart is empty</h2><p>Add a car wash, tow request or car part to get started.</p><div class="row"><a class="btn" href="#shop">Browse the shop</a></div></div>`;
    return `<h2>Your cart</h2>
      <div class="card">${cart.map(i => `
        <div class="line"><div><strong>${esc(i.name)}</strong>${i.details ? `<div class="muted">${esc(i.details)}</div>` : ''}<div class="price">${money(i.price)}</div></div>
        ${i.type === 'product'
          ? `<div class="qty"><button data-act="dec" data-key="${i.key}" aria-label="Remove one">−</button><span>${i.qty}</span><button data-act="inc" data-key="${i.key}" aria-label="Add one">+</button></div>`
          : `<button class="btn alt small" data-act="del" data-key="${i.key}">Remove</button>`}
        </div>`).join('')}
        <div class="total"><span>Total</span><span>${money(cartTotal())}</span></div>
      </div>
      <h2>Pay</h2>
      <div class="note">Demo payment only. No real money is charged. Use any test number such as 4242 4242 4242 4242. A number ending in 0000 simulates a declined card.</div>
      <form id="payForm" novalidate>
        <label for="cn">Name on card</label><input id="cn" autocomplete="cc-name">
        <label for="cc">Card number</label><input id="cc" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19">
        <div class="two"><div><label for="ce">Expiry (MM/YY)</label><input id="ce" inputmode="numeric" placeholder="MM/YY" maxlength="5"></div>
        <div><label for="cv">CVV</label><input id="cv" inputmode="numeric" placeholder="123" maxlength="3"></div></div>
        <p class="err" id="payErr"></p>
        <div class="row"><button class="btn" id="payBtn" type="submit">Pay ${money(cartTotal())}</button></div>
      </form>`;
  },

  orders: () => !orders.length
    ? `<div class="empty"><h2>No orders yet</h2><p>Your bookings and purchases will appear here.</p></div>`
    : `<h2>Your orders</h2>${orders.map(o => `
      <div class="card"><div class="pad">
        <div class="line" style="padding:0 0 8px"><strong>${o.id}</strong><span class="tag">${o.status}</span></div>
        <div class="muted">${new Date(o.date).toLocaleString()}</div>
        ${o.items.map(i => `<div style="margin-top:6px">${i.qty > 1 ? i.qty + ' × ' : ''}${esc(i.name)}${i.details ? `<div class="muted">${esc(i.details)}</div>` : ''}${i.mapLink ? `<a href="${esc(i.mapLink)}" target="_blank" rel="noopener">Open in Google Maps</a>` : ''}</div>`).join('')}
        <div class="price" style="margin-top:8px">Paid ${money(o.total)}</div>
      </div></div>`).join('')}`
};

function washForm() {
  const bay = CONFIG.WASH_BAY;
  return `<h2>Book a car wash</h2>
    <div class="card"><div id="bayMap" class="map small"></div><div class="pad"><h3>${esc(bay.name)}</h3><p class="muted">${esc(bay.address)}</p>
      <a class="btn small" href="${MapsKit.dirUrl('', bay)}" target="_blank" rel="noopener" style="margin-top:8px">Get directions</a></div></div>
    ${WASHES.map(w => `<div class="card">${img(w.img)}<div class="pad"><h3>${w.name} · ${money(w.price)}</h3><p class="muted">${w.desc}</p></div></div>`).join('')}
    <div class="card">${img('images/carwash-mobile.jpg')}<div class="pad"><h3>We come to you</h3><p class="muted">Choose "Come to my location" below and our team washes your car at home or work for ${money(MOBILE_FEE)} extra.</p></div></div>
    <form id="washForm">
      <label for="wp">Package</label>
      <select id="wp">${WASHES.map(w => `<option value="${w.id}">${w.name} (${money(w.price)})</option>`).join('')}</select>
      <div class="two"><div><label for="wd">Date</label><input id="wd" type="date" min="${today()}" required></div>
      <div><label for="wt">Time</label><select id="wt">${TIMES.map(t => `<option>${t}</option>`).join('')}</select></div></div>
      <label for="wl">Where should we wash it?</label>
      <select id="wl"><option value="shop">I will bring the car to the wash bay</option><option value="mobile">Come to my location (+${money(MOBILE_FEE)})</option></select>
      <div id="waddrWrap" hidden><label for="wa">Your address</label><input id="wa" placeholder="Street, suburb, landmark">
        <div id="wmap" class="map small" style="margin-top:10px"></div>
        <div class="row"><button type="button" class="btn alt small" data-act="wlocate">Use my location</button></div>
        <p class="muted">Tap the map to drop a pin where we should come.</p></div>
      <label for="wn">Number plate</label><input id="wn" required placeholder="e.g. AEB 1234">
      <label for="wph">Phone</label><input id="wph" type="tel" required placeholder="e.g. 0771 234 567">
      <div class="row"><button class="btn" type="submit">Add booking to cart</button></div>
    </form>`;
}
function towForm() {
  return `<h2>Request a tow truck</h2>
    <div class="card">${img('images/tow-truck.jpg')}<div class="pad"><p class="muted">Call-out fee ${money(TOW_BASE)} plus ${money(TOW_PER_KM)} per km.</p></div></div>
    <div class="seg tight" role="group" aria-label="Which pin to place">
      <button type="button" data-act="step" data-v="0" aria-pressed="${tow.active === 0}">Set pickup (A)</button>
      <button type="button" data-act="step" data-v="1" aria-pressed="${tow.active === 1}">Set drop-off (B)</button>
    </div>
    <div id="map" class="map" role="application" aria-label="Map for choosing pickup and drop-off"></div>
    <div class="row"><button type="button" class="btn alt small" data-act="locate">Use my location as pickup</button></div>
    <form id="towForm">
      <label for="tf">Pickup location</label>
      <input id="tf" required value="${esc(tow.addr[0])}" placeholder="Tap the map, or type an address">
      <div class="row"><button type="button" class="btn alt small" data-act="find" data-v="0">Find on map</button></div>
      <label for="tt">Drop-off location</label>
      <input id="tt" required value="${esc(tow.addr[1])}" placeholder="Tap the map, or type an address">
      <div class="row"><button type="button" class="btn alt small" data-act="find" data-v="1">Find on map</button></div>
      <div class="two"><div><label for="tk">Distance (km)</label><input id="tk" type="number" min="1" max="500" value="10" required></div>
      <div><label for="tv">Vehicle</label><select id="tv"><option>Car</option><option>SUV / Pickup</option><option>Minibus</option></select></div></div>
      <p class="muted">Distance is estimated from the two pins. You can edit it.</p>
      <label for="tp">Phone</label><input id="tp" type="tel" required placeholder="e.g. 0771 234 567">
      <p class="price" id="towEst" style="margin-top:12px"></p>
      <div class="row"><button class="btn" type="submit">Add tow request to cart</button></div>
    </form>`;
}

// ---------- Router ----------
function render() {
  const name = (location.hash.slice(1) in views) ? location.hash.slice(1) : 'home';
  $('#view').innerHTML = views[name]();
  document.querySelectorAll('[data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === name));
  M = null;
  if (name === 'services') { if (svc === 'tow') { updateEstimate(); initTowMap(); } else initBayMap(); }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

// ---------- Actions ----------
function addItem(item) {
  const ex = item.type === 'product' && cart.find(i => i.key === item.key);
  if (ex) ex.qty++; else cart.push(item);
  persist();
}
function updateEstimate() {
  const km = Math.max(0, parseFloat($('#tk')?.value) || 0);
  if ($('#towEst')) $('#towEst').textContent = 'Estimated price: ' + money(TOW_BASE + TOW_PER_KM * km);
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-svc]');
  if (link) svc = link.dataset.svc;
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const { act, id, key, v } = b.dataset;
  if (act === 'svc') { svc = v; render(); }
  if (act === 'step') setStep(+v);
  if (act === 'locate') locateTow();
  if (act === 'find') findTow(+v);
  if (act === 'wlocate') locateWash();
  if (act === 'add') {
    const p = PRODUCTS.find(x => x.id === id);
    addItem({ key: p.id, type: 'product', name: p.name, price: p.price, qty: 1 });
    toast(p.name + ' added to cart');
  }
  if (['inc', 'dec', 'del'].includes(act)) {
    const i = cart.find(x => x.key === key);
    if (act === 'inc') i.qty++;
    if (act === 'dec') i.qty--;
    if (act === 'del' || i.qty <= 0) cart = cart.filter(x => x.key !== key);
    persist(); render();
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'wl') {
    const mobile = e.target.value === 'mobile';
    $('#waddrWrap').hidden = !mobile;
    if (mobile) initWashMap();
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'tk') updateEstimate();
  if (e.target.id === 'cc') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  if (e.target.id === 'cv') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  if (e.target.id === 'ce') {
    let d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }
});

document.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target.id;

  if (f === 'washForm') {
    const w = WASHES.find(x => x.id === $('#wp').value);
    const mobile = $('#wl').value === 'mobile', addr = $('#wa').value.trim();
    if (mobile && !addr) return toast('Enter the address where we should come');
    const date = $('#wd').value, plate = $('#wn').value.trim(), phone = $('#wph').value.trim();
    if (!date || date < today()) return toast('Pick today or a future date');
    if (!plate || !phone) return toast('Enter your number plate and phone');
    addItem({ key: 'wash-' + Date.now(), type: 'wash', name: w.name + (mobile ? ' (mobile)' : ''), price: w.price + (mobile ? MOBILE_FEE : 0), qty: 1, details: `${mobile ? 'At your location: ' + addr : 'At the wash bay'} · ${date} at ${$('#wt').value} · ${plate.toUpperCase()} · ${phone}`, mapLink: mobile && washPos ? MapsKit.pinUrl(washPos) : '' });
    washPos = null; toast('Booking added to cart'); location.hash = '#cart';
  }

  if (f === 'towForm') {
    const from = $('#tf').value.trim(), to = $('#tt').value.trim(), phone = $('#tp').value.trim();
    const km = parseFloat($('#tk').value);
    if (!from || !to || !phone || !(km > 0)) return toast('Fill in every field');
    addItem({ key: 'tow-' + Date.now(), type: 'tow', name: 'Tow truck', price: TOW_BASE + TOW_PER_KM * km, qty: 1, details: `${from} to ${to} · ${km} km · ${$('#tv').value} · ${phone}`, mapLink: MapsKit.dirUrl(tow.pts[0] || from, tow.pts[1] || to) });
    tow.pts = [null, null]; tow.addr = ['', '']; tow.active = 0; toast('Tow request added to cart'); location.hash = '#cart';
  }

  if (f === 'payForm') await pay();
});

// ---------- Simulated payment ----------
async function pay() {
  const err = $('#payErr'), btn = $('#payBtn');
  const name = $('#cn').value.trim(), num = $('#cc').value.replace(/\s/g, ''), exp = $('#ce').value, cvv = $('#cv').value;
  const [mm, yy] = exp.split('/').map(Number);
  const now = new Date();
  const expired = !mm || mm < 1 || mm > 12 || (2000 + yy) * 12 + mm < now.getFullYear() * 12 + now.getMonth() + 1;
  if (!name) return err.textContent = 'Enter the name on the card.';
  if (num.length !== 16) return err.textContent = 'Card number must have 16 digits.';
  if (expired) return err.textContent = 'Enter a valid expiry date in MM/YY format.';
  if (cvv.length !== 3) return err.textContent = 'CVV must have 3 digits.';
  err.textContent = '';
  btn.disabled = true; btn.textContent = 'Processing…';
  await new Promise(r => setTimeout(r, 1500));
  if (num.endsWith('0000')) {
    btn.disabled = false; btn.textContent = 'Pay ' + money(cartTotal());
    return err.textContent = 'Card declined. Try a different test card.';
  }
  orders.unshift({ id: 'AL-' + Math.random().toString(36).slice(2, 8).toUpperCase(), date: new Date().toISOString(), items: cart, total: cartTotal(), status: 'Paid' });
  cart = [];
  persist();
  toast('Payment successful');
  location.hash = '#orders';
}

// ---------- Google Maps ----------
const tow = { pts: [null, null], addr: ['', ''], active: 0 };
let washPos = null;
let M = null; // map for the current page: { map, markers, line }

const noMapMsg = e => e.message === 'no-key'
  ? 'Map preview needs a Google Maps key. Add it in js/config.js (see README). You can still type addresses.'
  : 'The map could not load. Check your key, billing and internet connection. You can still type addresses.';

async function openMap(id, center, zoom, onPick) {
  const el = $('#' + id);
  if (!el) return null;
  try { await MapsKit.ready(); } catch (e) { el.innerHTML = `<div class="mapmsg">${noMapMsg(e)}</div>`; return null; }
  if (!document.body.contains(el)) return null;
  const map = MapsKit.create(el, center, zoom);
  if (onPick) map.addListener('click', ev => onPick({ lat: ev.latLng.lat(), lng: ev.latLng.lng() }));
  return { map, markers: [], line: null };
}
async function nameOf(p) {
  try { return (await MapsKit.geocode({ location: p })).address; }
  catch { return `Pinned location (${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})`; }
}
const clearMarkers = () => { M.markers.forEach(m => { m.map = null; }); M.markers = []; };

// Tow truck
async function initTowMap() {
  const m = await openMap('map', tow.pts[0] || tow.pts[1] || CONFIG.DEFAULT_CENTER, 12, p => setTowPoint(tow.active, p));
  if (!m) return;
  M = m; drawTow();
}
function drawTow() {
  if (!M) return;
  clearMarkers();
  M.line?.setMap(null); M.line = null;
  tow.pts.forEach((p, i) => p && M.markers.push(MapsKit.marker(M.map, p, 'AB'[i])));
  const set = tow.pts.filter(Boolean);
  if (set.length === 2) M.line = MapsKit.line(M.map, set);
  else if (set.length === 1) M.map.panTo(set[0]);
}
function setStep(i) {
  tow.active = i;
  document.querySelectorAll('[data-act="step"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === i)));
}
async function setTowPoint(i, p) {
  tow.pts[i] = p; drawTow();
  tow.addr[i] = await nameOf(p);
  const input = $(i ? '#tt' : '#tf');
  if (input) input.value = tow.addr[i];
  const [a, b] = tow.pts;
  if (a && b && $('#tk')) { $('#tk').value = Math.max(1, Math.round(MapsKit.km(a, b))); updateEstimate(); }
  else if (i === 0 && !b) setStep(1);
}
async function findTow(i) {
  const q = $(i ? '#tt' : '#tf').value.trim();
  if (!q) return toast('Type an address first');
  try { const r = await MapsKit.geocode({ address: q }); await setTowPoint(i, { lat: r.lat, lng: r.lng }); }
  catch (e) { toast(e.message === 'no-key' ? 'Add a Google Maps key to search the map' : 'Address not found'); }
}
async function locateTow() {
  try { const p = await MapsKit.locate(); await setTowPoint(0, p); M?.map.setZoom(15); }
  catch { toast('Could not get your location. Allow location access or tap the map.'); }
}

// Mobile car wash pin
async function initWashMap() {
  const m = await openMap('wmap', washPos || CONFIG.DEFAULT_CENTER, 13, setWashPoint);
  if (!m) return;
  M = m; drawWash();
}
function drawWash() {
  if (!M) return;
  clearMarkers();
  if (washPos) M.markers.push(MapsKit.marker(M.map, washPos, '•'));
}
async function setWashPoint(p) {
  washPos = p; drawWash();
  const a = await nameOf(p);
  if ($('#wa')) $('#wa').value = a;
}
async function locateWash() {
  try { const p = await MapsKit.locate(); await setWashPoint(p); M?.map.panTo(p); M?.map.setZoom(15); }
  catch { toast('Could not get your location. Allow location access or tap the map.'); }
}

// Wash bay
async function initBayMap() {
  const m = await openMap('bayMap', CONFIG.WASH_BAY, 14);
  if (m) MapsKit.marker(m.map, CONFIG.WASH_BAY, 'W');
}

// ---------- Installable app (PWA) ----------
let installEvt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#installBtn').hidden = false; });
window.addEventListener('appinstalled', () => { $('#installBtn').hidden = true; });
$('#installBtn').addEventListener('click', async () => {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice;
  installEvt = null; $('#installBtn').hidden = true;
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

persist();
render();
