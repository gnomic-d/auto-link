/* Free maps: Leaflet + OpenStreetMap tiles, Nominatim for address search. No API key needed. */
const MapsKit = (() => {
  const ready = () => window.L ? Promise.resolve() : Promise.reject(new Error('load'));

  const create = (el, center, zoom) => {
    el._map?.remove();
    el.innerHTML = '';
    const map = L.map(el).setView([center.lat, center.lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    el._map = map;
    setTimeout(() => map.invalidateSize(), 250);
    return map;
  };

  const marker = (map, p, glyph) => L.marker([p.lat, p.lng], {
    icon: L.divIcon({ className: 'pin', html: '<span>' + glyph + '</span>', iconSize: [30, 30], iconAnchor: [15, 15] })
  }).addTo(map);

  const line = (map, pts) => {
    const ll = pts.map(p => [p.lat, p.lng]);
    map.fitBounds(ll, { padding: [40, 40] });
    return L.polyline(ll, { color: '#0E2A2F', weight: 4 }).addTo(map);
  };

  // Address search and reverse lookup (OpenStreetMap Nominatim). Light use only: one request per tap.
  const geocode = async req => {
    const base = 'https://nominatim.openstreetmap.org';
    const url = req.address
      ? base + '/search?format=jsonv2&limit=1&accept-language=en&countrycodes=' + CONFIG.COUNTRY + '&q=' + encodeURIComponent(req.address)
      : base + '/reverse?format=jsonv2&accept-language=en&lat=' + req.location.lat + '&lon=' + req.location.lng;
    const res = await fetch(url);
    if (!res.ok) throw new Error('geocode');
    const d = await res.json();
    const r = Array.isArray(d) ? d[0] : d;
    if (!r || r.error) throw new Error('none');
    return { lat: +r.lat, lng: +r.lon, address: r.display_name };
  };

  const locate = () => new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), rej, { enableHighAccuracy: true, timeout: 10000 });
  });

  // Straight-line distance x1.3 as a rough road estimate (km)
  const km = (a, b) => {
    const r = x => x * Math.PI / 180, R = 6371;
    const d = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(d)) * 1.3;
  };

  // Links that open the phone's maps app (free)
  const f = p => typeof p === 'string' ? p : p.lat + ',' + p.lng;
  const dirUrl = (a, b) => 'https://www.google.com/maps/dir/?api=1' + (a ? '&origin=' + encodeURIComponent(f(a)) : '') + '&destination=' + encodeURIComponent(f(b));
  const pinUrl = p => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f(p));

  return { ready, create, marker, line, geocode, locate, km, dirUrl, pinUrl };
})();
