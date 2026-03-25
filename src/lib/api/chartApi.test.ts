/**
 * Chart API and data analysis tests.
 * Fetches real data from the server and validates structure + Whole Sign expectations.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { fetchChart } from "./chartApi";
import type { ChartApiParams } from "./chartApi";
import { chartFromApiResponse } from "../models/reading";
import type { ChartApiResponse } from "../models/reading";
import { analyzeChartApiResponse } from "../analysis/chartAnalysis";

const TEST_PARAMS: ChartApiParams = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  min: 30,
  city: "New York,NY",
  nation: "US",
  timezone: "America/New_York",
  house_system: "whole_sign",
};

describe("Chart API", () => {
  it("fetches chart data from the server", async () => {
    const chart = await fetchChart(TEST_PARAMS);
    expect(chart).toBeDefined();
    expect(chart.birthData).toBeDefined();
    expect(chart.planets).toBeDefined();
    expect(chart.houses).toBeDefined();
    expect(chart.ascendant).toBeDefined();
    expect(chart.midheaven).toBeDefined();
  });

  it("returns 12 houses when using Whole Sign", async () => {
    const chart = await fetchChart({ ...TEST_PARAMS, house_system: "whole_sign" });
    expect(chart.houses).toHaveLength(12);
  });

  it("returns 12 houses when using Placidus", async () => {
    const chart = await fetchChart({ ...TEST_PARAMS, house_system: "placidus" });
    expect(chart.houses).toHaveLength(12);
  });

  it("house 1 sign matches ascendant sign", async () => {
    const chart = await fetchChart(TEST_PARAMS);
    const house1 = chart.houses.find((h) => h.house === 1);
    expect(house1).toBeDefined();
    expect(house1!.sign).toBe(chart.ascendant.sign);
  });

  it("houses are ordered 1–12", async () => {
    const chart = await fetchChart(TEST_PARAMS);
    const numbers = chart.houses.map((h) => h.house).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("birth_datetime preserves requested minutes", async () => {
    const params = { ...TEST_PARAMS, hour: 14, min: 37 };
    const chart = await fetchChart(params);
    const timePart = chart.birthData.time;
    expect(timePart).toMatch(/^\d{1,2}:\d{2}$/);
    const mins = Number(timePart.split(":")[1]);
    expect(mins).toBe(37);
  });
});

describe("Chart API response analysis", () => {
  let apiResponse: ChartApiResponse;

  beforeAll(async () => {
    const search = new URLSearchParams({
      year: String(TEST_PARAMS.year),
      month: String(TEST_PARAMS.month),
      day: String(TEST_PARAMS.day),
      hour: String(TEST_PARAMS.hour),
      min: String(TEST_PARAMS.min),
      city: TEST_PARAMS.city ?? "",
      nation: TEST_PARAMS.nation ?? "",
      house_system: "whole_sign",
    });
    const res = await fetch(
      `https://sissyfoot-astrological-api.onrender.com/chart?${search}`
    );
    expect(res.ok).toBe(true);
    apiResponse = await res.json();
  });

  it("analyzes raw API response structure", () => {
    const report = analyzeChartApiResponse(apiResponse);

    expect(report.raw.houseCount).toBe(12);
    expect(report.raw.planetCount).toBeGreaterThanOrEqual(9);
    expect(report.raw.houseCusps).toHaveLength(12);
  });

  it("reports Whole Sign vs Placidus from house cusp degrees", () => {
    const report = analyzeChartApiResponse(apiResponse);
    expect(typeof report.wholeSign.isWholeSign).toBe("boolean");
    expect(Array.isArray(report.wholeSign.nonZeroCusps)).toBe(true);
  });

  it("reports planet-house consistency (valid for Whole Sign, may have inconsistencies for Placidus)", () => {
    const report = analyzeChartApiResponse(apiResponse);
    expect(typeof report.planetHouseConsistency.valid).toBe("boolean");
    expect(Array.isArray(report.planetHouseConsistency.inconsistencies)).toBe(true);
  });

  it("validates house sign order (zodiac sequence)", () => {
    const report = analyzeChartApiResponse(apiResponse);
    expect(report.signOrder.valid).toBe(true);
  });
});
