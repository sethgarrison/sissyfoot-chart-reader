import { describe, it, expect } from "vitest";
import type { ChartApiParams } from "../api/chartApi";
import {
  chartParamsToSearchParams,
  parseChartParamsFromSearchParams,
} from "./chartShareUrl";

function roundtrip(p: ChartApiParams): ChartApiParams | null {
  return parseChartParamsFromSearchParams(chartParamsToSearchParams(p));
}

describe("chartShareUrl", () => {
  it("roundtrips coordinate-based params", () => {
    const p: ChartApiParams = {
      year: 1982,
      month: 2,
      day: 10,
      hour: 11,
      min: 36,
      lat: 31.6941,
      lng: -89.1306,
      timezone: "America/Chicago",
      name: "Seth",
      house_system: "whole_sign",
    };
    expect(roundtrip(p)).toEqual(p);
  });

  it("roundtrips placidus and omits default whole_sign from query", () => {
    const p: ChartApiParams = {
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      min: 30,
      lat: 40.7128,
      lng: -74.006,
      timezone: "America/New_York",
      house_system: "placidus",
    };
    const sp = chartParamsToSearchParams(p);
    expect(sp.get("house_system")).toBe("placidus");
    expect(roundtrip(p)).toEqual(p);
  });

  it("roundtrips city + nation params", () => {
    const p: ChartApiParams = {
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      min: 0,
      city: "New York,NY",
      nation: "US",
      timezone: "America/New_York",
      house_system: "whole_sign",
    };
    expect(roundtrip(p)).toEqual(p);
  });

  it("returns null when required date parts are missing", () => {
    const sp = new URLSearchParams("year=1990&month=6&lat=1&lng=2&tz=UTC");
    expect(parseChartParamsFromSearchParams(sp)).toBeNull();
  });

  it("returns null when location is missing", () => {
    const sp = new URLSearchParams(
      "year=1990&month=6&day=15&hour=12&min=0"
    );
    expect(parseChartParamsFromSearchParams(sp)).toBeNull();
  });

  it("accepts timezone alias key", () => {
    const sp = new URLSearchParams(
      "year=2000&month=1&day=1&hour=0&min=0&lat=0&lng=0&timezone=UTC"
    );
    const p = parseChartParamsFromSearchParams(sp);
    expect(p?.timezone).toBe("UTC");
  });
});
