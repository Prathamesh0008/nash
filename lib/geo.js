export function isValidLatitude(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= -90 && num <= 90;
}

export function isValidLongitude(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= -180 && num <= 180;
}

export function isValidLatLng(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

export function toGeoPoint(lat, lng) {
  if (!isValidLatLng(lat, lng)) return null;
  return {
    type: "Point",
    coordinates: [Number(lng), Number(lat)],
  };
}

export function pickLatLngFromValue(value = {}) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (isValidLatLng(lat, lng)) {
    return { lat, lng };
  }

  const coords = Array.isArray(value?.location?.coordinates) ? value.location.coordinates : [];
  if (coords.length >= 2) {
    const fromLocation = { lat: Number(coords[1]), lng: Number(coords[0]) };
    if (isValidLatLng(fromLocation.lat, fromLocation.lng)) {
      return fromLocation;
    }
  }
  return null;
}

export function normalizeAddressInput(address = {}) {
  const latLng = pickLatLngFromValue(address);
  return {
    ...address,
    lat: latLng ? latLng.lat : null,
    lng: latLng ? latLng.lng : null,
    location: latLng ? toGeoPoint(latLng.lat, latLng.lng) : undefined,
  };
}

export function normalizeServiceAreaInput(area = {}) {
  const latLng = pickLatLngFromValue(area);
  return {
    ...area,
    lat: latLng ? latLng.lat : null,
    lng: latLng ? latLng.lng : null,
    location: latLng ? toGeoPoint(latLng.lat, latLng.lng) : undefined,
  };
}

export function normalizeAddressList(addresses = []) {
  if (!Array.isArray(addresses)) return [];
  return addresses.map((address) => normalizeAddressInput(address));
}

export function normalizeServiceAreaList(areas = []) {
  if (!Array.isArray(areas)) return [];
  return areas.map((area) => normalizeServiceAreaInput(area));
}

export function haversineKm(a, b) {
  const p1 = pickLatLngFromValue(a);
  const p2 = pickLatLngFromValue(b);
  if (!p1 || !p2) return null;

  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const x = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * y;
}
