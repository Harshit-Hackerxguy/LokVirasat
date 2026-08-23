/**
 * geo.ts — Geographic utility functions for location verification
 */

export interface GeoCoord {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param coord1 - First coordinate (latitude, longitude in decimal degrees)
 * @param coord2 - Second coordinate (latitude, longitude in decimal degrees)
 * @returns Distance in meters (always >= 0)
 *
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function calculateHaversineDistance(
  coord1: GeoCoord,
  coord2: GeoCoord,
): number {
  if (
    !Number.isFinite(coord1.latitude) ||
    !Number.isFinite(coord1.longitude) ||
    !Number.isFinite(coord2.latitude) ||
    !Number.isFinite(coord2.longitude)
  ) {
    throw new RangeError(
      'All coordinate values must be finite numbers. ' +
        `Received: (${coord1.latitude}, ${coord1.longitude}), (${coord2.latitude}, ${coord2.longitude})`,
    );
  }

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/** Maximum allowed distance (meters) between EXIF and browser GPS */
export const VERIFICATION_RADIUS_METERS = 500;
