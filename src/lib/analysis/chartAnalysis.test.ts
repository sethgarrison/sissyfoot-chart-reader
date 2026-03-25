/**
 * Chart analysis and geometry tests.
 */

import { describe, it, expect } from "vitest";
import { analyzeChartApiResponse } from "./chartAnalysis";
import type { ChartAPIResponse } from "../types/data";
import { emptyChartData } from "../types/data";

function chartApiFixture(
  partial: Pick<ChartAPIResponse, "name" | "birth_datetime" | "latitude" | "longitude" | "sun_sign" | "moon_sign" | "rising_sign"> & {
    planets: ChartAPIResponse["chart_data"]["planets"];
    houses: ChartAPIResponse["chart_data"]["houses"];
    aspects?: ChartAPIResponse["chart_data"]["aspects"];
  }
): ChartAPIResponse {
  return {
    name: partial.name,
    birth_datetime: partial.birth_datetime,
    latitude: partial.latitude,
    longitude: partial.longitude,
    sun_sign: partial.sun_sign,
    moon_sign: partial.moon_sign,
    rising_sign: partial.rising_sign,
    chart_data: {
      ...emptyChartData(),
      planets: partial.planets,
      houses: partial.houses,
      aspects: partial.aspects ?? [],
    },
  };
}

describe("analyzeChartApiResponse", () => {
  it("identifies Whole Sign when all cusps at 0°", () => {
    const api = chartApiFixture({
      name: null,
      birth_datetime: "1990-06-15T12:00",
      latitude: 0,
      longitude: 0,
      sun_sign: "Gemini",
      moon_sign: "Pisces",
      rising_sign: "Libra",
      planets: [
        { name: "Sun", sign: "Gemini", sign_num: 3, degree: 24, abs_degree: 84, house: 9, retrograde: false, speed: 1 },
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

    const report = analyzeChartApiResponse(api);
    expect(report.wholeSign.isWholeSign).toBe(true);
    expect(report.wholeSign.nonZeroCusps).toHaveLength(0);
    expect(report.signOrder.valid).toBe(true);
    expect(report.planetHouseConsistency.valid).toBe(true);
  });

  it("identifies Placidus when cusps have non-zero degrees", () => {
    const api = chartApiFixture({
      name: null,
      birth_datetime: "1990-06-15T12:00",
      latitude: 40,
      longitude: -74,
      sun_sign: "Gemini",
      moon_sign: "Pisces",
      rising_sign: "Libra",
      planets: [],
      houses: [
        { number: 1, sign: "Libra", degree: 15.5, abs_degree: 195.5 },
        { number: 2, sign: "Scorpio", degree: 18.2, abs_degree: 228.2 },
        { number: 3, sign: "Sagittarius", degree: 21, abs_degree: 261 },
        { number: 4, sign: "Capricorn", degree: 20, abs_degree: 290 },
        { number: 5, sign: "Aquarius", degree: 18, abs_degree: 318 },
        { number: 6, sign: "Pisces", degree: 15, abs_degree: 345 },
        { number: 7, sign: "Aries", degree: 15.5, abs_degree: 15.5 },
        { number: 8, sign: "Taurus", degree: 18.2, abs_degree: 48.2 },
        { number: 9, sign: "Gemini", degree: 21, abs_degree: 81 },
        { number: 10, sign: "Cancer", degree: 20, abs_degree: 110 },
        { number: 11, sign: "Leo", degree: 18, abs_degree: 138 },
        { number: 12, sign: "Virgo", degree: 15, abs_degree: 165 },
      ],
      aspects: [],
    });

    const report = analyzeChartApiResponse(api);
    expect(report.wholeSign.isWholeSign).toBe(false);
    expect(report.wholeSign.nonZeroCusps.length).toBe(12);
  });

  it("flags planet-house inconsistency when planet sign ≠ house sign in Whole Sign", () => {
    const api = chartApiFixture({
      name: null,
      birth_datetime: "1990-06-15T12:00",
      latitude: 0,
      longitude: 0,
      sun_sign: "Gemini",
      moon_sign: "Pisces",
      rising_sign: "Libra",
      planets: [
        { name: "Sun", sign: "Gemini", sign_num: 3, degree: 24, abs_degree: 84, house: 7, retrograde: false, speed: 1 },
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

    const report = analyzeChartApiResponse(api);
    expect(report.planetHouseConsistency.valid).toBe(false);
    expect(report.planetHouseConsistency.inconsistencies).toHaveLength(1);
    expect(report.planetHouseConsistency.inconsistencies[0].planet).toBe("Sun");
    expect(report.planetHouseConsistency.inconsistencies[0].planetSign).toBe("Gemini");
    expect(report.planetHouseConsistency.inconsistencies[0].houseSign).toBe("Aries");
  });
});
