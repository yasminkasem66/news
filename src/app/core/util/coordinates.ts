export interface Coordinates {
  lat: number;
  lng: number;
}

/** Parses the CMS `mapCoordinates` value (`"lat,lng"`); null when absent or invalid. */
export function parseCoordinates(value: string | null | undefined): Coordinates | null {
  const parts = value?.split(',').map((part) => part.trim()) ?? [];
  if (parts.length !== 2 || parts.some((part) => part === '')) {
    return null;
  }
  const [lat, lng] = parts.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
}

/** Map link that needs no API key. */
export function osmLink({ lat, lng }: Coordinates): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}
