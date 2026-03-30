/**
 * Derived reading data computed from a NatalChart.
 * Used to populate interactive reading slides.
 */
import { ZODIAC_SIGNS } from "../models/zodiac";
import type { NatalChart, PlanetPlacement } from "../models";
import type { BigThreeEntrySummary } from "../models/interpretationsSummary";
import type { MoonInterpretation, RisingInterpretation, SunInterpretation } from "../types/data";

function sunInterpretationToReading(s: SunInterpretation): BigThreeEntrySummary {
  return {
    interpretation: s.interpretation,
    archetypes_balanced: s.archetypes_balanced,
    archetypes_unbalanced: s.archetypes_unbalanced,
    journey: s.journey,
    gifts: s.gifts,
    challenges: s.challenges,
  };
}

function moonInterpretationToReading(m: MoonInterpretation): BigThreeEntrySummary {
  return {
    interpretation: m.interpretation,
    nature: m.nature,
    sources_of_contentment: m.sources_of_contentment,
    keywords: m.keywords ?? undefined,
  };
}

function ascendantInterpretationToReading(a: RisingInterpretation): BigThreeEntrySummary {
  return {
    interpretation: a.interpretation,
    impression: a.impression,
    appearance: a.appearance,
    childhood: a.childhood,
    balance: a.balance,
  };
}

/** Geometry + {@link BigThreeEntrySummary} from `NatalChart.interpretation.big_three`. */
export interface BigThreeSun {
  placement: PlanetPlacement | undefined;
  reading: BigThreeEntrySummary | undefined;
}

export interface BigThreeMoon {
  placement: PlanetPlacement | undefined;
  reading: BigThreeEntrySummary | undefined;
}

export interface BigThreeAscendant {
  placement: { sign: string; degrees: number; minutes: number };
  reading: BigThreeEntrySummary | undefined;
}

export interface BigThree {
  sun: BigThreeSun;
  moon: BigThreeMoon;
  ascendant: BigThreeAscendant;
}

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

/** Hemisphere: eastern (1–6) vs western (7–12), or northern (10–3) vs southern (4–9). */
export interface HemisphereDistribution {
  eastern: PlanetPlacement[];
  western: PlanetPlacement[];
  northern: PlanetPlacement[];
  southern: PlanetPlacement[];
}

/** Quarters: 1st (1–3), 2nd (4–6), 3rd (7–9), 4th (10–12). */
export interface QuarterDistribution {
  first: PlanetPlacement[];
  second: PlanetPlacement[];
  third: PlanetPlacement[];
  fourth: PlanetPlacement[];
}

/** Count of planets per element. */
export type ElementCounts = Record<Element, number>;

/** Count of planets per modality. */
export type ModalityCounts = Record<Modality, number>;

/** Planets grouped by house. */
export type PlanetsByHouse = Map<number, PlanetPlacement[]>;

/** Get element for a sign name. */
export function elementForSign(sign: string): Element | undefined {
  return ZODIAC_SIGNS.find((s) => s.name === sign)?.element;
}

/** Get modality for a sign name. */
export function modalityForSign(sign: string): Modality | undefined {
  return ZODIAC_SIGNS.find((s) => s.name === sign)?.modality;
}

/** Compute element counts from chart planets. */
export function computeElementCounts(chart: NatalChart): ElementCounts {
  const counts: ElementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of chart.planets) {
    const el = elementForSign(p.sign);
    if (el) counts[el]++;
  }
  return counts;
}

/** Compute modality counts from chart planets. */
export function computeModalityCounts(chart: NatalChart): ModalityCounts {
  const counts: ModalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of chart.planets) {
    const mod = modalityForSign(p.sign);
    if (mod) counts[mod]++;
  }
  return counts;
}

/** Compute hemisphere distribution (houses 1–6 east, 7–12 west; 10–3 north, 4–9 south). */
export function computeHemispheres(chart: NatalChart): HemisphereDistribution {
  const eastern: PlanetPlacement[] = [];
  const western: PlanetPlacement[] = [];
  const northern: PlanetPlacement[] = [];
  const southern: PlanetPlacement[] = [];

  for (const p of chart.planets) {
    if (p.house >= 1 && p.house <= 6) eastern.push(p);
    else western.push(p);

    if (p.house >= 10 || p.house <= 3) northern.push(p);
    else southern.push(p);
  }

  return { eastern, western, northern, southern };
}

/** Compute quarter distribution. */
export function computeQuarters(chart: NatalChart): QuarterDistribution {
  const first: PlanetPlacement[] = [];
  const second: PlanetPlacement[] = [];
  const third: PlanetPlacement[] = [];
  const fourth: PlanetPlacement[] = [];

  for (const p of chart.planets) {
    if (p.house >= 1 && p.house <= 3) first.push(p);
    else if (p.house >= 4 && p.house <= 6) second.push(p);
    else if (p.house >= 7 && p.house <= 9) third.push(p);
    else fourth.push(p);
  }

  return { first, second, third, fourth };
}

/** Group planets by house. */
export function computePlanetsByHouse(chart: NatalChart): PlanetsByHouse {
  const map = new Map<number, PlanetPlacement[]>();
  for (let h = 1; h <= 12; h++) map.set(h, []);
  for (const p of chart.planets) {
    const list = map.get(p.house) ?? [];
    list.push(p);
    map.set(p.house, list);
  }
  return map;
}

import type { ReadingSlide } from "./slideTypes";
import { SLIDE_LABELS } from "./slideTypes";

/** Build the ordered list of slides for a chart. Planets-in-houses get one slide each. */
export function buildReadingSlides(chart: NatalChart): ReadingSlide[] {
  const slides: ReadingSlide[] = [];
  let idx = 0;

  // 1. Overview
  slides.push({ kind: "overview", title: SLIDE_LABELS.overview, index: idx++ });

  // 2. Chart type
  slides.push({ kind: "chart_type", title: SLIDE_LABELS.chart_type, index: idx++ });

  // 3. House overview
  slides.push({ kind: "house_overview", title: SLIDE_LABELS.house_overview, index: idx++ });

  // 4. Planets in houses (one per planet)
  for (const p of chart.planets) {
    slides.push({
      kind: "planets_in_houses",
      title: SLIDE_LABELS.planets_in_houses,
      subtitle: `${p.planet} in House ${p.house}`,
      index: idx,
      planetInHouse: { planet: p.planet, house: p.house },
    });
    idx++;
  }

  // 5. Retrograde (only if any retrograde planets)
  const retrogradePlanets =
    chart.interpretation?.retrograde_planets ?? chart.planets.filter((p) => p.retrograde).map((p) => p.planet);
  if (retrogradePlanets.length > 0) {
    slides.push({ kind: "retrograde", title: SLIDE_LABELS.retrograde, index: idx++ });
  }

  // 6. Element overview
  slides.push({ kind: "element_overview", title: SLIDE_LABELS.element_overview, index: idx++ });

  // 7. Modality overview
  slides.push({ kind: "modality_overview", title: SLIDE_LABELS.modality_overview, index: idx++ });

  // 8. Aspects
  slides.push({ kind: "aspects", title: SLIDE_LABELS.aspects, index: idx++ });

  // 9. Interesting findings
  slides.push({ kind: "interesting_findings", title: SLIDE_LABELS.interesting_findings, index: idx++ });

  return slides;
}

/** Sun / Moon / Ascendant placements plus `interpretation.big_three` copy as {@link BigThreeEntrySummary}. */
export function getBigThree(chart: NatalChart): BigThree {
  const bt = chart.interpretation?.big_three;
  const sunPlacement = chart.planets.find((p) => p.planet === "Sun");
  const moonPlacement = chart.planets.find((p) => p.planet === "Moon");
  const placementAsc = chart.ascendant;

  return {
    sun: {
      placement: sunPlacement,
      reading: bt?.sun ? sunInterpretationToReading(bt.sun) : undefined,
    },
    moon: {
      placement: moonPlacement,
      reading: bt?.moon ? moonInterpretationToReading(bt.moon) : undefined,
    },
    ascendant: {
      placement: placementAsc,
      reading: bt?.ascendant ? ascendantInterpretationToReading(bt.ascendant) : undefined,
    },
  };
}
