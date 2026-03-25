/**
 * Chart model and mapping tests.
 */

import { describe, it, expect } from "vitest";
import {
  chartFromApiResponse,
  getAspectInterpretation,
  aspectCategoryToServerKey,
  getAspectCategory,
  normalizeChartHouse,
  parseHouseInterpretation,
  SAMPLE_CHART,
} from "./reading";
import { signTotalDegrees } from "../analysis/chartAnalysis";
import { ZODIAC_SIGNS } from "./zodiac";
import type { ChartAPIResponse } from "../types/data";
import { emptyChartData } from "../types/data";

function wrapChartData(
  base: Omit<ChartAPIResponse, "chart_data"> & {
    planets: ChartAPIResponse["chart_data"]["planets"];
    houses: ChartAPIResponse["chart_data"]["houses"];
    aspects?: ChartAPIResponse["chart_data"]["aspects"];
  }
): ChartAPIResponse {
  return {
    name: base.name,
    birth_datetime: base.birth_datetime,
    latitude: base.latitude,
    longitude: base.longitude,
    sun_sign: base.sun_sign,
    moon_sign: base.moon_sign,
    rising_sign: base.rising_sign,
    chart_data: {
      ...emptyChartData(),
      planets: base.planets,
      houses: base.houses,
      aspects: base.aspects ?? [],
    },
  };
}

describe("chartFromApiResponse", () => {
  it("maps API response to NatalChart", () => {
    const api = wrapChartData({
      name: "Test",
      birth_datetime: "1990-06-15T14:30",
      latitude: 40.7128,
      longitude: -74.006,
      sun_sign: "Gemini",
      moon_sign: "Pisces",
      rising_sign: "Libra",
      planets: [
        { name: "Sun", sign: "Gemini", sign_num: 3, degree: 24.2, abs_degree: 84.2, house: 9, retrograde: false, speed: 1 },
      ],
      houses: [
        { number: 1, sign: "Libra", degree: 0, abs_degree: 180 },
        { number: 2, sign: "Scorpio", degree: 0, abs_degree: 210 },
        { number: 3, sign: "Sagittarius", degree: 0, abs_degree: 240 },
        { number: 4, sign: "Capricorn", degree: 0, abs_degree: 270 },
        { number: 5, sign: "Aquarius", degree: 0, abs_degree: 300 },
        { number: 6, sign: "Pisces", degree: 0, abs_degree: 330 },
        { number: 7, sign: "Aries", degree: 0, abs_degree: 0 },
        { number: 8, sign: "Taurus", degree: 0, abs_degree: 30 },
        { number: 9, sign: "Gemini", degree: 0, abs_degree: 60 },
        { number: 10, sign: "Cancer", degree: 0, abs_degree: 90 },
        { number: 11, sign: "Leo", degree: 0, abs_degree: 120 },
        { number: 12, sign: "Virgo", degree: 0, abs_degree: 150 },
      ],
      aspects: [],
    });

    const chart = chartFromApiResponse(api);

    expect(chart.houses).toHaveLength(12);
    expect(chart.ascendant.sign).toBe("Libra");
    expect(chart.houses.find((h) => h.house === 1)?.sign).toBe("Libra");
    expect(chart.planets).toHaveLength(1);
    expect(chart.planets[0].planet).toBe("Sun");
    expect(chart.planets[0].house).toBe(9);
    expect(chart.planets[0].sign).toBe("Gemini");
  });

  it("extracts ascendant from house 1 when available", () => {
    const signOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const api = wrapChartData({
      name: null,
      birth_datetime: "2000-01-01T12:00",
      latitude: 0,
      longitude: 0,
      sun_sign: "Capricorn",
      moon_sign: "Capricorn",
      rising_sign: "Aries",
      planets: [],
      houses: signOrder.map((sign, i) => ({
        number: i + 1,
        sign,
        degree: i === 0 ? 15.5 : 0,
        abs_degree: i === 0 ? 15.5 : i * 30,
      })),
      aspects: [],
    });

    const chart = chartFromApiResponse(api);
    expect(chart.ascendant.sign).toBe("Aries");
    expect(chart.ascendant.degrees).toBe(15);
    expect(chart.ascendant.minutes).toBe(30); // 0.5 * 60
  });

  it("includes Chiron when present in API", () => {
    const api = wrapChartData({
      name: null,
      birth_datetime: "1990-06-15T00:00",
      latitude: 0,
      longitude: 0,
      sun_sign: "Gemini",
      moon_sign: "Cancer",
      rising_sign: "Libra",
      planets: [
        { name: "Sun", sign: "Gemini", sign_num: 3, degree: 24, abs_degree: 84, house: 9, retrograde: false, speed: 1 },
        { name: "Chiron", sign: "Capricorn", sign_num: 10, degree: 14, abs_degree: 284, house: 3, retrograde: true, speed: -0.5 },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: "Aries",
        degree: 0,
        abs_degree: i * 30,
      })),
      aspects: [],
    });

    const chart = chartFromApiResponse(api);
    expect(chart.planets.map((p) => p.planet)).toContain("Sun");
    expect(chart.planets.map((p) => p.planet)).toContain("Chiron");
  });
});

describe("normalizeChartHouse", () => {
  it("accepts integers 1–12", () => {
    expect(normalizeChartHouse(1)).toBe(1);
    expect(normalizeChartHouse(12)).toBe(12);
    expect(normalizeChartHouse(0)).toBeNull();
    expect(normalizeChartHouse(13)).toBeNull();
  });

  it("accepts numeric strings", () => {
    expect(normalizeChartHouse("7")).toBe(7);
    expect(normalizeChartHouse(" 12 ")).toBe(12);
    expect(normalizeChartHouse("foo")).toBeNull();
  });
});

describe("parseHouseInterpretation", () => {
  it("parses string house indices in per_house", () => {
    const hi = {
      per_house: [{ house: "9", sign_on_cusp: "Gemini", planets: ["Sun"], planet_interpretations: {} }],
    };
    const { perHouse } = parseHouseInterpretation(hi);
    expect(perHouse).toHaveLength(1);
    expect(perHouse[0].house).toBe(9);
  });

  it("drops per_house rows with invalid house", () => {
    const hi = {
      per_house: [{ house: "0", sign_on_cusp: "Aries", planets: [], planet_interpretations: {} }],
    };
    expect(parseHouseInterpretation(hi).perHouse).toHaveLength(0);
  });
});

describe("SAMPLE_CHART", () => {
  it("has 12 houses with valid signs", () => {
    expect(SAMPLE_CHART.houses).toHaveLength(12);
    const validSigns = new Set(ZODIAC_SIGNS.map((s) => s.name));
    for (const h of SAMPLE_CHART.houses) {
      expect(validSigns.has(h.sign)).toBe(true);
    }
  });

  it("house 1 matches ascendant", () => {
    const h1 = SAMPLE_CHART.houses.find((h) => h.house === 1);
    expect(h1?.sign).toBe(SAMPLE_CHART.ascendant.sign);
  });
});

describe("signTotalDegrees", () => {
  it("converts Aries 0° to 0", () => {
    expect(signTotalDegrees("Aries", 0, 0)).toBe(0);
  });

  it("converts Libra 15°23' to ~195.38", () => {
    const result = signTotalDegrees("Libra", 15, 23);
    expect(result).toBeCloseTo(180 + 15 + 23 / 60, 2);
  });

  it("converts Pisces 29°59' to ~359.98", () => {
    const result = signTotalDegrees("Pisces", 29, 59);
    expect(result).toBeCloseTo(330 + 29 + 59 / 60, 2);
  });

  it("returns 0 for unknown sign", () => {
    expect(signTotalDegrees("Unknown", 10, 0)).toBe(0);
  });
});

describe("getAspectInterpretation", () => {
  it("returns aspect.interpretation when present (API sends per-aspect)", () => {
    const aspect = {
      planet1: "Sun",
      planet2: "Moon",
      type: "square" as const,
      interpretation: "Tension between ego and emotions.",
    };
    expect(getAspectInterpretation(aspect, undefined)).toBe(aspect.interpretation);
  });

  it("returns undefined when aspect has no interpretation text", () => {
    expect(getAspectInterpretation({ planet1: "Sun", planet2: "Moon", type: "square" }, undefined)).toBeUndefined();
  });
});

describe("aspectCategoryToServerKey", () => {
  it("maps categories to server type_key", () => {
    expect(aspectCategoryToServerKey("conjunction")).toBe("conjunction");
    expect(aspectCategoryToServerKey("easy_flowing")).toBe("easy-flowing");
    expect(aspectCategoryToServerKey("stressful")).toBe("stressful");
    expect(aspectCategoryToServerKey("adjustment")).toBe("stressful");
  });
});
