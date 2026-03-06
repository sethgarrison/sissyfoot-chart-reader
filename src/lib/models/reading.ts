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
 * Lunar node position — North Node or South Node.
 * Nodes are not planets; they have no retrograde or speed.
 */
export interface LunarNodePosition {
  node: string; // "North Node" | "South Node"
  sign: string;
  house: number;
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
 * Chart interpretations from the API.
 */
export interface ChartInterpretations {
  planet_in_sign?: Record<string, string>;
  planet_in_house?: Record<string, string>;
  aspects?: Record<string, string>;
  chart_shape?: {
    primary?: string;
    interpretation?: string;
    distribution?: Record<string, string>;
  };
}

/**
 * A complete natal chart reading.
 */
export interface NatalChart {
  birthData: BirthData;
  planets: PlanetPlacement[];
  lunarNodes?: LunarNodePosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: { sign: string; degrees: number; minutes: number };
  midheaven: { sign: string; degrees: number; minutes: number };
  interpretations?: ChartInterpretations;
}

/**
 * Response shape from the astrological chart API.
 * @see https://sissyfoot-astrological-api.onrender.com/chart
 */
export interface ChartApiResponse {
  name: string | null;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  lunar_phase?: {
    degrees_between: number;
    phase_name: string;
    emoji: string;
  };
  planets: Array<{
    name: string;
    sign: string;
    sign_num: number;
    degree: number;
    abs_degree: number;
    house: number;
    retrograde: boolean;
    speed: number;
  }>;
  lunar_nodes?: Array<{
    node: string;
    sign: string;
    sign_num: number;
    degree: number;
    abs_degree: number;
    house: number;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    degree: number;
    abs_degree: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    aspect_degrees: number;
    orbit: number;
    movement: string;
  }>;
  interpretations?: {
    planet_in_sign?: Record<string, string>;
    planet_in_house?: Record<string, string>;
    aspects?: Record<string, string>;
    chart_shape?: {
      primary?: string;
      interpretation?: string;
      distribution?: Record<string, string>;
    };
  };
}

/** Convert decimal degrees to degrees + minutes. */
function degToDegMin(deg: number): { degrees: number; minutes: number } {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return { degrees: d, minutes: m };
}

/** Map API response to our NatalChart format. House system is determined by the API. */
export function chartFromApiResponse(api: ChartApiResponse): NatalChart {
  const [datePart, timePart] = api.birth_datetime.split("T");
  const time = timePart?.slice(0, 5) ?? "00:00";

  const birthData: BirthData = {
    name: api.name ?? "Chart",
    date: datePart ?? "",
    time,
    latitude: api.latitude,
    longitude: api.longitude,
    timezone: "UTC",
  };

  const supportedPlanets = new Set(["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Pluto"]);
  const planets: PlanetPlacement[] = api.planets
    .filter((p) => supportedPlanets.has(p.name))
    .map((p) => {
      const { degrees, minutes } = degToDegMin(p.degree);
      return {
        planet: p.name,
        sign: p.sign,
        house: p.house,
        degrees,
        minutes,
        retrograde: p.retrograde,
      };
    });

  const houses: HouseCusp[] = api.houses.map((h) => {
    const { degrees, minutes } = degToDegMin(h.degree);
    return { house: h.number, sign: h.sign, degrees, minutes };
  });

  const supportedAspects = new Set(["conjunction", "opposition", "trine", "square", "sextile"]);
  const aspects: Aspect[] = api.aspects
    .filter((a) => supportedAspects.has(a.aspect))
    .filter((a) => supportedPlanets.has(a.planet1) && supportedPlanets.has(a.planet2))
    .map((a) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.aspect as Aspect["type"],
      orb: Math.round(a.orbit * 10) / 10,
    }));

  const lunarNodes: LunarNodePosition[] = (api.lunar_nodes ?? []).map((n) => {
    const { degrees, minutes } = degToDegMin(n.degree);
    return {
      node: n.node,
      sign: n.sign,
      house: n.house,
      degrees,
      minutes,
    };
  });

  const house1 = api.houses?.find((h) => h.number === 1);
  const house10 = api.houses?.find((h) => h.number === 10);

  return {
    birthData,
    planets,
    lunarNodes: lunarNodes.length > 0 ? lunarNodes : undefined,
    houses,
    aspects,
    ascendant: house1
      ? { ...degToDegMin(house1.degree), sign: house1.sign }
      : { sign: api.rising_sign, degrees: 0, minutes: 0 },
    midheaven: house10
      ? { ...degToDegMin(house10.degree), sign: house10.sign }
      : { sign: "Aries", degrees: 0, minutes: 0 },
    interpretations: api.interpretations,
  };
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
