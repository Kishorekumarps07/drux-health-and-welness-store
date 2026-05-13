/**
 * Reverse-geocode a coordinate pair into a human-readable Indian locality string.
 *
 * Strategy (in priority order):
 *  1. BigDataCloud free API – returns structured locality / city / postcode fields
 *     that work very well for Indian addresses.
 *  2. Nominatim (OpenStreetMap) fallback – used if BigDataCloud fails or is
 *     unreachable.
 *
 * Returns { city, pincode } where:
 *   city    – e.g. "Koramangala, Bengaluru" or "Bandra West, Mumbai"
 *   pincode – 6-digit string, or "" if unavailable
 */

export interface GeoLocation {
  city: string;
  pincode: string;
}

/** ── Helpers ──────────────────────────────────────────────────────────── */

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildLabel(area: string | undefined, city: string | undefined, state: string | undefined): string {
  const a = area?.trim();
  const c = city?.trim();
  const s = state?.trim();

  if (a && c && a.toLowerCase() !== c.toLowerCase()) return `${toTitleCase(a)}, ${toTitleCase(c)}`;
  if (c && s && c.toLowerCase() !== s.toLowerCase()) return `${toTitleCase(c)}, ${toTitleCase(s)}`;
  return toTitleCase(c || a || s || "Your Location");
}

/** ── BigDataCloud (primary) ───────────────────────────────────────────── */

async function fromBigDataCloud(lat: number, lon: number): Promise<GeoLocation | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const d = await res.json();

    // `locality`  → neighbourhood / ward / suburb  (most granular)
    // `city`      → city / town
    // `principalSubdivision` → state
    // `postcode`  → 6-digit for India

    const locality = d.locality?.trim();
    const city     = d.city?.trim() || d.countryName;
    const state    = d.principalSubdivision?.trim();
    const pincode  = (d.postcode || "").trim();

    const label = buildLabel(locality, city, state);
    return { city: label, pincode };
  } catch {
    return null;
  }
}

/** ── Nominatim fallback ───────────────────────────────────────────────── */

async function fromNominatim(lat: number, lon: number): Promise<GeoLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1&accept-language=en`;
    const res  = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.address) return null;

    const addr    = d.address;
    const area    = addr.suburb || addr.neighbourhood || addr.residential
                    || addr.city_district || addr.quarter || addr.road;
    const city    = addr.city || addr.town || addr.municipality
                    || addr.village || addr.county;
    const state   = addr.state;
    const pincode = (addr.postcode || "").trim();

    const label = buildLabel(area, city, state);
    return { city: label, pincode };
  } catch {
    return null;
  }
}

/** ── Public API ───────────────────────────────────────────────────────── */

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  // Try BigDataCloud first – better structured data for India
  const primary = await fromBigDataCloud(lat, lon);
  if (primary && primary.city) return primary;

  // Fall back to Nominatim
  const fallback = await fromNominatim(lat, lon);
  if (fallback && fallback.city) return fallback;

  return { city: "Your Location", pincode: "" };
}
