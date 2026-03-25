import type { InterpretationsSummary } from "./interpretationsSummary";
import type { ChartAPIResponse, ChartData, ChartInterpretation } from "../types/data";
import { emptyChartData } from "../types/data";

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

/** Supported aspect types (matches API Aspect table) */
export type AspectType =
  | "conjunction"
  | "opposition"
  | "trine"
  | "square"
  | "sextile"
  | "quincunx";

/**
 * Aspect category for interpretation lookup and display grouping.
 * Used when API provides fallback text by category (conjunction, easy-flowing, stressful, adjustment).
 */
export type AspectCategory = "conjunction" | "easy_flowing" | "stressful" | "adjustment";

/** Map aspect type to category (conjunction, easy-flowing, stressful, adjustment). */
export function getAspectCategory(type: AspectType): AspectCategory {
  switch (type) {
    case "conjunction":
      return "conjunction";
    case "trine":
    case "sextile":
      return "easy_flowing";
    case "square":
    case "opposition":
      return "stressful";
    case "quincunx":
      return "adjustment";
    default:
      return "easy_flowing";
  }
}

/**
 * Map our AspectCategory to server type_key for aspects_by_category lookup.
 * Server uses: conjunction, stressful, easy-flowing (no adjustment; quincunx → stressful fallback).
 */
export function aspectCategoryToServerKey(category: AspectCategory): string {
  switch (category) {
    case "conjunction":
      return "conjunction";
    case "easy_flowing":
      return "easy-flowing";
    case "stressful":
      return "stressful";
    case "adjustment":
      return "stressful"; // quincunx fallback when server has no adjustment type
    default:
      return "easy-flowing";
  }
}

/**
 * Big Three interpretation (Sun/Moon/Ascendant in sign) — from dedicated DB tables.
 * Keyed by sign; use chart's sun_sign, moon_sign, rising_sign to look up.
 */
export interface BigThreeEntry {
  interpretation?: string;
  archetypes_balanced?: string;
  archetypes_unbalanced?: string;
  journey?: string;
  gifts?: string;
  challenges?: string;
  nature?: string;
  sources_of_contentment?: string;
  keywords?: string;
  impression?: string;
  appearance?: string;
  childhood?: string;
  balance?: string;
  source?: "database";
  is_placeholder?: boolean;
}

/**
 * An aspect is a geometric relationship between two planets.
 */
export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  /** Pre-resolved interpretation when API sends it per-aspect */
  interpretation?: string;
  source?: "database" | "default";
  is_placeholder?: boolean;
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

/** Element/quality count + signs from API. Interpretation added when available. */
export interface ElementOrModalityEntry {
  count: number;
  signs: string[];
  interpretation?: string;
}

/** Supporting data: element/modality counts + signs (legacy / derived views). */
export interface SignPlacementOverview {
  signs_with_planets?: string[];
  by_element?: Record<string, ElementOrModalityEntry & { planets?: string[] }>;
  by_quality?: Record<string, ElementOrModalityEntry & { planets?: string[] }>;
}

/**
 * A complete natal chart reading (client model after {@link chartFromApiResponse}).
 */
export interface NatalChart {
  birthData: BirthData;
  planets: PlanetPlacement[];
  lunarNodes?: LunarNodePosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: { sign: string; degrees: number; minutes: number };
  midheaven: { sign: string; degrees: number; minutes: number };
  /** Raw geometry + aggregates from API `chart_data` (for drawing / counts only). */
  chartData: ChartData;
  /** Structured interpretations from API `interpretation`. */
  interpretation?: ChartInterpretation;
  /** Optional legacy summary payload from API. */
  interpretations_summary?: InterpretationsSummary;
}

export type {
  ChartAPIResponse,
  ChartApiResponse,
  ChartApiPlanet,
  ChartApiLunarNode,
  ChartApiHouse,
} from "../types/data";

/** Per-house entry from house_interpretation.per_house. Replaces flat planet_in_house. */
export interface PerHouseInterpretationEntry {
  house: number;
  sign_on_cusp: string;
  planets: string[];
  planet_interpretations: Record<string, string>;
  sign_interpretation?: string | null;
}

/** Parsed house_interpretation: per_house (structured) + other keys (shape, quadrant, hemisphere). */
export interface ParsedHouseInterpretation {
  perHouse: PerHouseInterpretationEntry[];
  other: Array<{ label: string; text: string }>;
}

/**
 * Extract displayable text from house_interpretation value.
 * API may send string or object (interpretation_text, interpretation, text, etc.).
 */
export function formatHouseInterpretationValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const o = val as Record<string, unknown>;
    const text =
      (o.interpretation_text as string) ??
      (o.interpretation as string) ??
      (o.text as string) ??
      (o.content as string) ??
      (o.description as string) ??
      (o.value as string) ??
      (o.summary as string);
    if (typeof text === "string" && text.length > 0) return text;
    // Fallback: first string value in object (handles arbitrary API shapes)
    for (const v of Object.values(o)) {
      if (typeof v === "string" && v.length > 0) return v;
    }
  }
  return "";
}

/**
 * Coerce house index from chart or interpretation payloads to 1–12.
 * JSON sometimes sends numeric houses as strings; without this, Set lookups against chart placements miss.
 */
export function normalizeChartHouse(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 12) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  }
  return null;
}

function parsePerHouseItem(item: unknown): PerHouseInterpretationEntry | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const o = item as Record<string, unknown>;
  const house = normalizeChartHouse(o.house);
  if (house == null) return null;
  const sign_on_cusp = typeof o.sign_on_cusp === "string" ? o.sign_on_cusp : "";
  const planets = Array.isArray(o.planets)
    ? (o.planets.filter((p): p is string => typeof p === "string"))
    : [];
  const planet_interpretations =
    o.planet_interpretations && typeof o.planet_interpretations === "object" && !Array.isArray(o.planet_interpretations)
      ? (o.planet_interpretations as Record<string, string>)
      : {};
  const sign_interpretation =
    o.sign_interpretation != null && typeof o.sign_interpretation === "string" ? o.sign_interpretation : null;
  return { house, sign_on_cusp, planets, planet_interpretations, sign_interpretation };
}

/**
 * Parse house_interpretation into structured per_house and flat other (shape, quadrant, hemisphere).
 */
export function parseHouseInterpretation(
  hi: Record<string, unknown> | undefined
): ParsedHouseInterpretation {
  const perHouse: PerHouseInterpretationEntry[] = [];
  const other: Array<{ label: string; text: string }> = [];

  if (!hi || typeof hi !== "object") return { perHouse, other };

  const perHouseVal = hi.per_house;
  if (Array.isArray(perHouseVal)) {
    for (const item of perHouseVal) {
      const parsed = parsePerHouseItem(item);
      if (parsed) perHouse.push(parsed);
    }
  } else if (perHouseVal && typeof perHouseVal === "object" && !Array.isArray(perHouseVal)) {
    const entries = Object.entries(perHouseVal as Record<string, unknown>).sort(
      ([a], [b]) => Number(a) - Number(b)
    );
    for (const [, item] of entries) {
      const parsed = parsePerHouseItem(item);
      if (parsed) perHouse.push(parsed);
    }
  }

  for (const [key, val] of Object.entries(hi)) {
    if (key === "per_house") continue;
    const text = formatHouseInterpretationValue(val);
    if (text) other.push({ label: key.replace(/_/g, " "), text });
  }

  return { perHouse, other };
}

/** Planet-in-house blurb from structured `interpretation.house_groups`. */
export function getPlanetInHouseInterpretation(
  planet: string,
  house: number,
  interpretation: ChartInterpretation | undefined
): string | undefined {
  if (!interpretation) return undefined;
  for (const hg of interpretation.house_groups) {
    if (hg.house !== house) continue;
    for (const pl of hg.planets) {
      if (pl.body === planet) return pl.interpretation?.planet_in_house;
    }
  }
  return undefined;
}

/** Planet-in-sign blurb from structured `interpretation.house_groups`. */
export function getPlanetInSignInterpretation(
  planet: string,
  sign: string,
  interpretation: ChartInterpretation | undefined
): string | undefined {
  if (!interpretation) return undefined;
  for (const hg of interpretation.house_groups) {
    for (const pl of hg.planets) {
      if (pl.body === planet && pl.sign === sign) return pl.interpretation?.planet_in_sign;
    }
  }
  return undefined;
}

/**
 * @deprecated Use parseHouseInterpretation for per_house; flattenHouseInterpretations for legacy flat display.
 */
export function flattenHouseInterpretations(
  hi: Record<string, unknown> | undefined
): Array<{ label: string; text: string }> {
  const { perHouse, other } = parseHouseInterpretation(hi);
  if (perHouse.length === 0) return other;
  const out: Array<{ label: string; text: string }> = [];
  for (const h of perHouse) {
    if (h.sign_interpretation) {
      out.push({ label: `House ${h.house} (${h.sign_on_cusp})`, text: h.sign_interpretation });
    }
    for (const [key, text] of Object.entries(h.planet_interpretations)) {
      out.push({ label: key, text });
    }
  }
  return [...out, ...other];
}

/** Build aspect interpretation key to match API format "Planet1 Aspect Planet2" */
export function aspectInterpretationKey(a: { planet1: string; planet2: string; type: string }): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return `${a.planet1} ${cap(a.type)} ${a.planet2}`;
}

/**
 * Aspect blurb from resolved chart aspects (API attaches copy on each geometric aspect row).
 */
export function getAspectInterpretation(
  aspect: { planet1: string; planet2: string; type: AspectType; interpretation?: string },
  _interpretation?: ChartInterpretation | undefined
): string | undefined {
  return aspect.interpretation ?? undefined;
}

/** Convert decimal degrees to degrees + minutes. */
function degToDegMin(deg: number): { degrees: number; minutes: number } {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return { degrees: d, minutes: m };
}

/** Map API response to our NatalChart format. House system is determined by the API. */
export function chartFromApiResponse(api: ChartAPIResponse): NatalChart {
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

  const data = api.chart_data;

  const supportedPlanets = new Set(["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"]);
  const planets: PlanetPlacement[] = data.planets
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

  const houses: HouseCusp[] = data.houses.map((h) => {
    const { degrees, minutes } = degToDegMin(h.degree);
    return { house: h.number, sign: h.sign, degrees, minutes };
  });

  const supportedAspects = new Set(["conjunction", "opposition", "trine", "square", "sextile", "quincunx"]);
  const aspects: Aspect[] = data.aspects
    .filter((a) => supportedAspects.has((a.aspect || "").toLowerCase()))
    .filter((a) => supportedPlanets.has(a.planet1) && supportedPlanets.has(a.planet2))
    .map((a) => {
      const type = (a.aspect || "").toLowerCase() as Aspect["type"];
      return {
        planet1: a.planet1,
        planet2: a.planet2,
        type,
        orb: Math.round(a.orbit * 10) / 10,
        ...(a.interpretation && { interpretation: a.interpretation }),
        ...(a.source && { source: a.source as Aspect["source"] }),
        ...(a.is_placeholder !== undefined && { is_placeholder: a.is_placeholder }),
      };
    });

  const lunarNodes: LunarNodePosition[] = (data.lunar_nodes ?? []).map((n) => {
    const { degrees, minutes } = degToDegMin(n.degree);
    return {
      node: n.node,
      sign: n.sign,
      house: n.house,
      degrees,
      minutes,
    };
  });

  const house1 = data.houses?.find((h) => h.number === 1);
  const house10 = data.houses?.find((h) => h.number === 10);

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
    chartData: data,
    interpretation: api.interpretation,
    interpretations_summary: api.interpretations_summary,
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
  chartData: emptyChartData(),
};
