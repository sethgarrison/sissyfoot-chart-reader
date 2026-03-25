/**
 * TypeScript types for Natal Chart API data tables.
 * Matches GET response shapes and PATCH request bodies from /data/* endpoints.
 */

import type { InterpretationsSummary } from "../models/interpretationsSummary";

// --- Reference tables ---

export interface Planet {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  keywords: string | null;
}

export interface PlanetUpdate {
  symbol?: string | null;
  description?: string | null;
  keywords?: string | null;
}

export interface Sign {
  id: number;
  name: string;
  element: string | null;
  modality: string | null;
  archetypes_balanced: string | null;
  archetypes_unbalanced: string | null;
  journey: string | null;
  gifts: string | null;
  challenges: string | null;
  interpretation: string | null;
}

export interface SignUpdate {
  element?: string | null;
  modality?: string | null;
  archetypes_balanced?: string | null;
  archetypes_unbalanced?: string | null;
  journey?: string | null;
  gifts?: string | null;
  challenges?: string | null;
  interpretation?: string | null;
}

export interface House {
  id: number;
  number: number;
  type: string | null;
  description: string | null;
  subtitle: string | null;
  keywords: string | null;
}

export interface HouseUpdate {
  type?: string | null;
  description?: string | null;
  subtitle?: string | null;
  keywords?: string | null;
}

export interface Aspect {
  id: number;
  name: string;
  angle_degrees: number | null;
  symbol: string | null;
  type: string | null;
}

export interface AspectUpdate {
  angle_degrees?: number | null;
  symbol?: string | null;
  type?: string | null;
}

// --- Big Three: Moon / Ascendant in sign (Sun merged into Signs) ---

export interface MoonSignInterpretation {
  id: number;
  sign: string;
  sign_id: number;
  nature: string | null;
  sources_of_contentment: string | null;
  keywords: string | null;
  interpretation: string | null;
}

export interface MoonSignInterpretationUpdate {
  nature?: string | null;
  sources_of_contentment?: string | null;
  keywords?: string | null;
  interpretation?: string | null;
}

export interface AscendantSignInterpretation {
  id: number;
  sign: string;
  sign_id: number;
  impression: string | null;
  appearance: string | null;
  childhood: string | null;
  balance: string | null;
  interpretation: string | null;
}

export interface AscendantSignInterpretationUpdate {
  impression?: string | null;
  appearance?: string | null;
  childhood?: string | null;
  balance?: string | null;
  interpretation?: string | null;
}

// --- Interpretation tables ---

export interface PlanetSignInterpretation {
  id: number;
  planet: string;
  sign: string;
  interpretation_text: string;
  interpretation_long: string | null;
  interpretation_short: string | null;
  keywords: string | null;
  retrograde_interpretation: string | null;
}

export interface PlanetSignInterpretationUpdate {
  interpretation_text?: string | null;
  interpretation_long?: string | null;
  interpretation_short?: string | null;
  keywords?: string | null;
  retrograde_interpretation?: string | null;
}

export interface PlanetHouseInterpretation {
  id: number;
  planet: string;
  house: number;
  interpretation_text: string;
  short_interpretation: string | null;
  retrograde_interpretation: string | null;
}

export interface PlanetHouseInterpretationUpdate {
  interpretation_text?: string | null;
  short_interpretation?: string | null;
  retrograde_interpretation?: string | null;
}

export interface AspectTypeInterpretation {
  id: number;
  type_key: string;
  interpretation_text: string;
}

export interface AspectTypeInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface AspectInterpretation {
  id: number;
  aspect: string;
  interpretation_text: string;
}

export interface AspectInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface PlanetAspectInterpretation {
  id: number;
  planet_1: string;
  planet_2: string;
  aspect: string;
  interpretation_text: string;
}

export interface PlanetAspectInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface SignHouseInterpretation {
  id: number;
  house: number;
  sign: string;
  interpretation_text: string;
}

export interface SignHouseInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface ChartShapeInterpretation {
  id: number;
  shape_key: string;
  interpretation_text: string;
}

export interface ChartShapeInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface ChartDistributionInterpretation {
  id: number;
  distribution_key: string;
  interpretation_text: string;
}

export interface ChartDistributionInterpretationUpdate {
  interpretation_text?: string | null;
}

export interface ModalityElementDistributionInterpretation {
  id: number;
  distribution_key: string;
  interpretation_text: string;
}

export interface ModalityElementDistributionInterpretationUpdate {
  interpretation_text?: string | null;
}

// --- API path helpers ---

export const DATA_ENDPOINTS = {
  planets: "/data/planets",
  signs: "/data/signs",
  houses: "/data/houses",
  aspects: "/data/aspects",
  moon: "/data/moon",
  ascendant: "/data/ascendant",
  planetSign: "/data/planet-sign",
  planetHouse: "/data/planet-house",
  aspectType: "/data/aspect-type",
  aspectGeneric: "/data/aspect-generic",
  planetAspect: "/data/planet-aspect",
  signHouse: "/data/sign-house",
  chartShape: "/data/chart-shape",
  chartDistribution: "/data/chart-distribution",
  modalityElement: "/data/modality-element",
} as const;


/**
 * There are two big buckets of data in the chart API response.
 * 
 * One is the raw chart data, which is the data that is used to generate the chart.
 * The other is the interpretation data, which is the data that is used to interpret the chart.
 * 
 * The chart_data should only be used for calculating and drawing the chart. it should NOT
 * be referenced for interpretation..
 */

/**
 * CHART DATA TYPES
 */

/** One planet row in `chart_data.planets` (GET /chart). */
export interface ChartApiPlanet {
  name: string;
  sign: string;
  sign_num: number;
  degree: number;
  abs_degree: number;
  house: number;
  retrograde: boolean;
  speed: number;
}

/** One lunar node row in `chart_data.lunar_nodes`. */
export interface ChartApiLunarNode {
  node: string;
  sign: string;
  sign_num: number;
  degree: number;
  abs_degree: number;
  house: number;
}

/** One house cusp row in `chart_data.houses`. */
export interface ChartApiHouse {
  number: number;
  sign: string;
  degree: number;
  abs_degree: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  aspect_degrees: number;
  orbit: number;
  movement: string;
  type?: string | null;
  interpretation?: string | null;
  source?: string | null;
  is_placeholder?: boolean;
}

export interface ChartDataDistributionBucket {
  count: number;
  signs: string[];
  planets: string[];
  interpretation?: string;
}

export interface QualityDistributionData {
  cardinal: ChartDataDistributionBucket;
  fixed: ChartDataDistributionBucket;
  mutable: ChartDataDistributionBucket;
}

export interface ElementDistributionData {
  fire: ChartDataDistributionBucket;
  earth: ChartDataDistributionBucket;
  air: ChartDataDistributionBucket;
  water: ChartDataDistributionBucket;
}

export interface LunarPhaseData {
  degrees_between: number;
  phase_name: string;
  emoji: string;
}

export interface ChartData {
  aspects: AspectData[];
  planets: ChartApiPlanet[];
  lunar_nodes: ChartApiLunarNode[];
  houses: ChartApiHouse[];
  by_quality: QualityDistributionData;
  by_element: ElementDistributionData;
  lunar_phase: LunarPhaseData;
}

/**
 * INTERPRETATION TYPES
 */
export interface SunInterpretation {
  sign: string;
  archetypes_balanced: string;
  archetypes_unbalanced: string;
  journey: string;
  gifts: string;
  challenges: string;
  interpretation: string;
}

export interface MoonInterpretation {
  sign: string;
  nature: string;
  sources_of_contentment: string;
  keywords: string | null;
  interpretation: string;
}

export interface RisingInterpretation {
  sign: string;
  impression: string;
  appearance: string;
  childhood: string;
  balance: string;
  interpretation: string;
}

export interface ChartInterpretationsBigThree {
  sun: SunInterpretation;
  moon: MoonInterpretation;
  ascendant: RisingInterpretation;
}

export interface ChartInterpretationsShape {
  key: string;
  interpretation: string;
}

export interface QualityDistributionInterpretation {
  key: string;
  interpretation: string;
}

export interface ModalityDistributionInterpretation {
  key: string;
  interpretation: string;
}

export interface SpatialDistributionInterpretation {
  key: string;
  interpretation: string;
}

export interface ContextInterpretation {
  shape: ChartInterpretationsShape;
  spatial_distribution: SpatialDistributionInterpretation;
  quality_distribution: QualityDistributionInterpretation;
  modality_distribution: ModalityDistributionInterpretation;
}

export interface HouseGroupInterpretationText {
  house_in_sign: string;
}
 
export interface AspectInterpretation {
  aspect: string;
  aspect_type: string | null;
  aspect_keyphrase: string | null;
  other_body: string;
  other_sign: string;
  other_planet_keyword: string | null;
  other_sign_adverb: string | null;
  synthesis: string;
  interpretation: string | null;
  is_placeholder?: boolean;
}

export interface PlanetInterpretationText {
  planet_in_sign: string;
  planet_in_house: string;
}

export interface PlanetInterpretation {
  body: string;
  sign: string;
  sign_adverb: string;
  planet_keyword: string;
  synthesis: string;
  retrograde: boolean;
  aspects: AspectInterpretation[];
  interpretation?: PlanetInterpretationText;
}

export interface HouseInterpretation {
  house: number;
  house_keyword: string;
  sign_on_cusp: string;
  interpretation?: HouseGroupInterpretationText;
  planets: PlanetInterpretation[];
}

export interface ChartInterpretation {
  big_three: ChartInterpretationsBigThree;
  context: ContextInterpretation;
  house_groups: HouseInterpretation[];
  retrograde_planets: string[];
  retrograde_interpretations: unknown;
}

/** Empty buckets for tests and placeholders. */
export function emptyChartDataDistributionBucket(): ChartDataDistributionBucket {
  return { count: 0, signs: [], planets: [] };
}

export function emptyChartData(): ChartData {
  const b = emptyChartDataDistributionBucket;
  return {
    aspects: [],
    planets: [],
    lunar_nodes: [],
    houses: [],
    by_quality: { cardinal: b(), fixed: b(), mutable: b() },
    by_element: { fire: b(), earth: b(), air: b(), water: b() },
    lunar_phase: { degrees_between: 0, phase_name: "", emoji: "" },
  };
}

/**
 * TOP LEVEL RESPONSE
 */
export interface ChartAPIResponse {
  name: string | null;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  house_system?: string;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  chart_data: ChartData;
  interpretation?: ChartInterpretation;
  /** Legacy parallel summary payload; prefer `interpretation` when present. */
  interpretations_summary?: InterpretationsSummary;
}

/** @deprecated Use ChartAPIResponse */
export type ChartApiResponse = ChartAPIResponse;
