let _weatherMap = null;
let _weatherMapMarker = null;

export function initLeafletMap() {
  if (_weatherMap) return;
  const el = document.getElementById("weather-map");
  if (!el || typeof L === "undefined") return;
  _weatherMap = L.map("weather-map", {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
  });
  _weatherMap.setView([20, 0], 2);
  const primaryUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const fallbackUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const layer = L.tileLayer(primaryUrl, { maxZoom: 19 }).addTo(_weatherMap);
  layer.on("tileerror", () => {
    if (!_weatherMap.__esriFallback) {
      _weatherMap.__esriFallback = true;
      L.tileLayer(fallbackUrl, { maxZoom: 19 }).addTo(_weatherMap);
    }
  });
  setTimeout(() => { try { _weatherMap.invalidateSize(false); } catch (e) {} }, 50);
}

export function updateMapView(lat, lon, cityLabel) {
  try {
    initLeafletMap();
    if (!_weatherMap) return;
    const target = [lat, lon];
    if (!_weatherMapMarker) {
      _weatherMapMarker = L.marker(target).addTo(_weatherMap);
    } else {
      _weatherMapMarker.setLatLng(target);
    }
    _weatherMap.flyTo(target, 13, { duration: 1.15 });
    const labelEl = document.getElementById("map-city-label");
    if (labelEl) labelEl.textContent = cityLabel || "";
  } catch (e) {
    console.error("Map update error:", e);
  }
}

export function getWeatherMap() { return _weatherMap; }
