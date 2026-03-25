/**
 * Analysis utilities for chart API responses.
 * Use these to verify data structure and validate drawing assumptions.
 */

import type { ChartAPIResponse } from "../types/data";
import { ZODIAC_SIGNS } from "../models/zodiac";

const SIGN_ORDER = ZODIAC_SIGNS.map((s) => s.name);

export interface ChartAnalysisReport {
  /** Raw API response summary */
  raw: {
    houseCount: number;
    planetCount: number;
    aspectCount: number;
    lunarNodeCount: number;
    houseCusps: Array<{ house: number; sign: string; degree: number; abs_degree: number }>;
    planets: Array<{ name: string; sign: string; house: number; degree: number }>;
  };
  /** Whole Sign house validation: in Whole Sign, each house cusp is at 0° of its sign */
  wholeSign: {
    isWholeSign: boolean;
    /** Houses not at 0° - indicates Placidus or other system */
    nonZeroCusps: Array<{ house: number; sign: string; degree: number }>;
    /** Expected house signs in Whole Sign (House 1 = rising sign, 2 = next, etc.) */
    expectedSignOrder: string[];
  };
  /** Planet-house consistency: planet's sign should fall within its house's sign in Whole Sign */
  planetHouseConsistency: {
    valid: boolean;
    inconsistencies: Array<{
      planet: string;
      planetSign: string;
      planetHouse: number;
      houseSign: string;
      message: string;
    }>;
  };
  /** Sign ordering check (House 1 sign should precede House 2 in zodiac order) */
  signOrder: {
    valid: boolean;
    issues: string[];
  };
}

/** Compute total ecliptic degrees for a sign + degree + minute. */
export function signTotalDegrees(sign: string, degrees: number, minutes: number): number {
  const signObj = ZODIAC_SIGNS.find((s) => s.name === sign);
  if (!signObj) return 0;
  return signObj.degreesStart + degrees + minutes / 60;
}

/** Analyze a raw API response and produce a report. */
export function analyzeChartApiResponse(api: ChartAPIResponse): ChartAnalysisReport {
  const data = api.chart_data;
  const houses = data.houses ?? [];
  const planets = data.planets ?? [];

  const raw = {
    houseCount: houses.length,
    planetCount: planets.length,
    aspectCount: (data.aspects ?? []).length,
    lunarNodeCount: (data.lunar_nodes ?? []).length,
    houseCusps: houses.map((h) => ({
      house: h.number,
      sign: h.sign,
      degree: h.degree,
      abs_degree: h.abs_degree,
    })),
    planets: planets.map((p) => ({
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
    })),
  };

  // Whole Sign: each house cusp should be at 0° of its sign
  const nonZeroCusps = houses
    .filter((h) => Math.abs(h.degree) > 0.5) // allow small float error
    .map((h) => ({ house: h.number, sign: h.sign, degree: h.degree }));

  const expectedSignOrder = wholeSignExpectedOrder(
    houses.find((h) => h.number === 1)?.sign ?? api.rising_sign ?? "Aries"
  );

  const isWholeSign = nonZeroCusps.length === 0;

  // Planet-house consistency for Whole Sign: planet in House N means planet's sign
  // should match the sign of House N (since each house = one full sign)
  const inconsistencies: ChartAnalysisReport["planetHouseConsistency"]["inconsistencies"] = [];
  for (const p of planets) {
    const houseCusp = houses.find((h) => h.number === p.house);
    if (!houseCusp) {
      inconsistencies.push({
        planet: p.name,
        planetSign: p.sign,
        planetHouse: p.house,
        houseSign: "?",
        message: `House ${p.house} cusp not found`,
      });
      continue;
    }
    if (p.sign !== houseCusp.sign) {
      inconsistencies.push({
        planet: p.name,
        planetSign: p.sign,
        planetHouse: p.house,
        houseSign: houseCusp.sign,
        message: `${p.name} in ${p.sign} but House ${p.house} is ${houseCusp.sign}`,
      });
    }
  }

  const planetHouseConsistency = {
    valid: inconsistencies.length === 0,
    inconsistencies,
  };

  // Sign order: House 2 sign should follow House 1 in zodiac order, etc.
  const signOrderIssues: string[] = [];
  for (let i = 1; i < houses.length; i++) {
    const curr = houses.find((h) => h.number === i);
    const next = houses.find((h) => h.number === i + 1);
    if (!curr || !next) continue;
    const currIdx = SIGN_ORDER.indexOf(curr.sign);
    const nextIdx = SIGN_ORDER.indexOf(next.sign);
    const expectedNextIdx = (currIdx + 1) % 12;
    if (nextIdx !== expectedNextIdx) {
      signOrderIssues.push(
        `House ${i} (${curr.sign}) -> House ${i + 1} (${next.sign}): expected ${SIGN_ORDER[expectedNextIdx]}`
      );
    }
  }

  return {
    raw,
    wholeSign: {
      isWholeSign,
      nonZeroCusps,
      expectedSignOrder,
    },
    planetHouseConsistency,
    signOrder: {
      valid: signOrderIssues.length === 0,
      issues: signOrderIssues,
    },
  };
}

/** In Whole Sign, house signs follow zodiac order starting from rising sign. */
function wholeSignExpectedOrder(risingSign: string): string[] {
  const idx = SIGN_ORDER.indexOf(risingSign);
  if (idx < 0) return SIGN_ORDER;
  return Array.from({ length: 12 }, (_, i) => SIGN_ORDER[(idx + i) % 12]);
}
