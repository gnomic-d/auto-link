/* Sign in, register and subscription plans.
   DEMO: accounts are stored in this phone's browser storage only (passwords are hashed with PBKDF2).
   For real accounts shared across devices, replace this file with a server or Firebase/Supabase. */
const Auth = (() => {
  const USERS = 'al_users', SESSION = 'al_session';

  const PLANS = [
    { id: 'silver',   name: 'Silver',   price: 9,  washes: 2, washMax: 8,  washLabel: 'Express or Foam wash', partsOff: 5,  towOff: 0 },
    { id: 'gold',     name: 'Gold',     price: 19, washes: 4, washMax: 10, washLabel: 'Full wash',            partsOff: 10, towOff: 50 },
    { id: 'platinum', name: 'Platinum', price: 39, washes: 6, washMax: 20, washLabel: 'Premium detail',       partsOff: 15, towOff: 100 }
  ];

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { throw new Error('Could not save. Browser storage is blocked or full.'); } };
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const norm = e => String(e || '').trim().toLowerCase();
  const month = () => new Date().toISOString().slice(0, 7);

  async function hash(pw, salt) {
    if (!window.crypto?.subtle) throw new Error('Secure sign-in needs an https connection.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
    return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256));
  }

  const current = () => { const e = read(SESSION, null); return e ? (read(USERS, {})[e] || null) : null; };
  const save = u => { const all = read(USERS, {}); all[u.email] = u; write(USERS, all); };

  async function register({ name, email, phone, password, confirm }) {
    email = norm(email); name = String(name || '').trim(); password = String(password || '');
    if (!name) throw new Error('Enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (password !== confirm) throw new Error('The two passwords do not match.');
    if (read(USERS, {})[email]) throw new Error('An account with this email already exists. Try signing in.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    save({ name, email, phone: String(phone || '').trim(), salt: b64(salt), hash: await hash(password, salt),
           created: Date.now(), role: 'customer', plan: null, planUntil: 0, credits: { month: month(), used: 0 } });
    write(SESSION, email);
  }

  async function login(email, password) {
    const u = read(USERS, {})[norm(email)];
    const ok = u && (await hash(String(password || ''), unb64(u.salt))) === u.hash;
    if (!ok) throw new Error('Email or password is incorrect.');
    write(SESSION, u.email);
  }

  // Creates the demo admin once (see CONFIG.ADMIN)
  async function seedAdmin() {
    const cfg = typeof CONFIG !== 'undefined' && CONFIG.ADMIN;
    if (!cfg) return;
    const users = read(USERS, {}), email = norm(cfg.email);
    if (Object.values(users).some(u => u.role === 'admin') || users[email]) return;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    save({ name: cfg.name, email, phone: '', salt: b64(salt), hash: await hash(String(cfg.password), salt),
           created: Date.now(), role: 'admin', plan: null, planUntil: 0, credits: { month: month(), used: 0 } });
  }
  const allUsers = () => Object.values(read(USERS, {})).map(({ salt, hash, ...u }) => ({ ...u, role: u.role || 'customer' }));

  const logout = () => { try { localStorage.removeItem(SESSION); } catch { /* ignore */ } };

  const activePlan = u => { const p = u && PLANS.find(x => x.id === u.plan); return p && u.planUntil > Date.now() ? p : null; };
  const creditsUsed = u => (u.credits && u.credits.month === month()) ? u.credits.used : 0;

  function useCredits(n) {
    const u = current();
    if (!u || !n) return;
    if (!u.credits || u.credits.month !== month()) u.credits = { month: month(), used: 0 };
    u.credits.used += n;
    save(u);
  }
  function activatePlan(id) {
    const u = current();
    if (!u) return;
    const start = (u.plan === id && u.planUntil > Date.now()) ? u.planUntil : Date.now();
    u.plan = id; u.planUntil = start + 30 * 864e5;
    save(u);
  }

  return { PLANS, seedAdmin, allUsers, current, register, login, logout, activePlan, creditsUsed, useCredits, activatePlan };
})();
