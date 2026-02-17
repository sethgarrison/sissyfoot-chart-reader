/**
 * A planetary placement within a chart — which sign and house
 * a celestial body occupies, and its exact ecliptic longitude.
 */
export interface PlanetPlacement {
  planet: string;
  sign: string;
  house: number;
  degrees: number;
  minutes: number;
  retrograde: boolean;
}

/**
 * An aspect is a geometric relationship between two planets.
 */
export interface Aspect {
  planet1: string;
  planet2: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  orb: number;
}

/**
 * House cusp positions — the degree at which each house begins.
 */
export interface HouseCusp {
  house: number;
  sign: string;
  degrees: number;
  minutes: number;
}

/**
 * Birth data used to compute a natal chart.
 */
export interface BirthData {
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * A complete natal chart reading.
 */
export interface NatalChart {
  birthData: BirthData;
  planets: PlanetPlacement[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: { sign: string; degrees: number; minutes: number };
  midheaven: { sign: string; degrees: number; minutes: number };
}

/**
 * Placeholder sample chart for development / rendering tests.
 */
export const SAMPLE_CHART: NatalChart = {
  birthData: {
    name: "Sample",
    date: "1990-06-15",
    time: "14:30",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  },
  ascendant: { sign: "Libra", degrees: 15, minutes: 23 },
  midheaven: { sign: "Cancer", degrees: 20, minutes: 45 },
  planets: [
    { planet: "Sun", sign: "Gemini", house: 9, degrees: 24, minutes: 12, retrograde: false },
    { planet: "Moon", sign: "Pisces", house: 5, degrees: 8, minutes: 45, retrograde: false },
    { planet: "Mercury", sign: "Cancer", house: 9, degrees: 2, minutes: 33, retrograde: false },
    { planet: "Venus", sign: "Taurus", house: 7, degrees: 18, minutes: 5, retrograde: false },
    { planet: "Mars", sign: "Aries", house: 6, degrees: 11, minutes: 50, retrograde: false },
    { planet: "Jupiter", sign: "Cancer", house: 10, degrees: 27, minutes: 14, retrograde: false },
    { planet: "Saturn", sign: "Capricorn", house: 3, degrees: 22, minutes: 8, retrograde: true },
    { planet: "Uranus", sign: "Capricorn", house: 3, degrees: 9, minutes: 30, retrograde: true },
    { planet: "Neptune", sign: "Capricorn", house: 3, degrees: 14, minutes: 18, retrograde: true },
    { planet: "Pluto", sign: "Scorpio", house: 1, degrees: 16, minutes: 42, retrograde: true },
  ],
  houses: [
    { house: 1, sign: "Libra", degrees: 15, minutes: 23 },
    { house: 2, sign: "Scorpio", degrees: 12, minutes: 10 },
    { house: 3, sign: "Sagittarius", degrees: 14, minutes: 55 },
    { house: 4, sign: "Capricorn", degrees: 20, minutes: 45 },
    { house: 5, sign: "Aquarius", degrees: 23, minutes: 30 },
    { house: 6, sign: "Pisces", degrees: 21, minutes: 15 },
    { house: 7, sign: "Aries", degrees: 15, minutes: 23 },
    { house: 8, sign: "Taurus", degrees: 12, minutes: 10 },
    { house: 9, sign: "Gemini", degrees: 14, minutes: 55 },
    { house: 10, sign: "Cancer", degrees: 20, minutes: 45 },
    { house: 11, sign: "Leo", degrees: 23, minutes: 30 },
    { house: 12, sign: "Virgo", degrees: 21, minutes: 15 },
  ],
  aspects: [
    { planet1: "Sun", planet2: "Moon", type: "square", orb: 2.5 },
    { planet1: "Venus", planet2: "Mars", type: "sextile", orb: 1.2 },
    { planet1: "Jupiter", planet2: "Saturn", type: "opposition", orb: 3.1 },
    { planet1: "Sun", planet2: "Jupiter", type: "conjunction", orb: 0.8 },
  ],
};
