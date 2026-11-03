/* Google Maps helpers. Without a valid key the app still works; maps show a notice. */
const MapsKit = (() => {
  const hasKey = () => /^AIza/.test(CONFIG.GOOGLE_MAPS_API_KEY || '');
  let loader, geocoder;

  const ready = () => {
    if (!hasKey()) return Promise.reject(new Error('no-key'));
    loader ??= new Promise((resolve, reject) => {
      window.gm_authFailure = () => reject(new Error('auth'));
      window.__mapsReady = async () => {
        try {
          await Promise.all(['maps', 'marker', 'geocoding'].map(l => google.maps.importLibrary(l)));
          resolve();
        } catch (e) { reject(e); }
      };
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(CONFIG.GOOGLE_MAPS_API_KEY) + '&callback=__mapsReady&loading=async&v=weekly';
      s.async = true;
      s.onerror = () => reject(new Error('load'));
      document.head.appendChild(s);
    });
    return loader;
  };

  const create = (el, center, zoom) => {
    el.innerHTML = '';
    return new google.maps.Map(el, { center, zoom, mapId: 'DEMO_MAP_ID', streetViewControl: false, mapTypeControl: false });
  };

  const marker = (map, position, glyph) => {
    const pin = new google.maps.marker.PinElement({ glyphText: glyph, background: '#FFC21A', borderColor: '#0E2A2F', glyphColor: '#0E2A2F' });
    return new google.maps.marker.AdvancedMarkerElement({ map, position, content: pin.element });
  };

  const line = (map, pts) => {
    const bounds = new google.maps.LatLngBounds();
    pts.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 48);
    return new google.maps.Polyline({ map, path: pts, strokeColor: '#0E2A2F', strokeWeight: 4 });
  };

  const geocode = async req => {
    await ready();
    geocoder ??= new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ ...req, region: CONFIG.REGION });
    const r = results[0];
    if (!r) throw new Error('none');
    return { lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), address: r.formatted_address };
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

  const f = p => typeof p === 'string' ? p : p.lat + ',' + p.lng;
  const dirUrl = (a, b) => 'https://www.google.com/maps/dir/?api=1' + (a ? '&origin=' + encodeURIComponent(f(a)) : '') + '&destination=' + encodeURIComponent(f(b));
  const pinUrl = p => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f(p));

  return { hasKey, ready, create, marker, line, geocode, locate, km, dirUrl, pinUrl };
})();
