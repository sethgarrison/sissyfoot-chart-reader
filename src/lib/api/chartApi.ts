/**
 * Chart API client.
 * Fetches natal chart data from the sissyfoot-astrological-api.
 */

import { chartFromApiResponse, type NatalChart } from "../models/reading";
import type { ChartAPIResponse } from "../types/data";

const API_BASE = "https://sissyfoot-astrological-api.onrender.com";

/** Location result from /locations search. Use lat/lng + timezone for chart requests when available. */
export interface LocationResult {
  display: string;
  city?: string;
  nation?: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

export interface ChartApiParams {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  /** Use city + nation when lat/lng not set (legacy). */
  city?: string;
  nation?: string;
  /** Use lat + lng + timezone when available (recommended — avoids geocoding ambiguity). */
  lat?: number;
  lng?: number;
  /** IANA timezone (e.g. "America/Chicago"). Required when using lat/lng. */
  timezone?: string;
  /** House system: "whole_sign" (default) or "placidus" */
  house_system?: "whole_sign" | "placidus";
}

/** Build URL search params for chart API. Exported for debugging. */
export function buildChartSearchParams(params: ChartApiParams): URLSearchParams {
  const search = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    day: String(params.day),
    time: `${String(params.hour).padStart(2, "0")}:${String(params.min).padStart(2, "0")}`,
  });
  const useCoords = params.lat != null && params.lng != null && params.timezone?.trim();
  if (useCoords) {
    search.set("lat", String(params.lat));
    search.set("lng", String(params.lng));
    search.set("tz_str", params.timezone!.trim());
  } else if (params.city && params.nation) {
    search.set("city", params.city);
    search.set("nation", params.nation);
    if (params.timezone?.trim()) search.set("tz_str", params.timezone.trim());
  } else {
    throw new Error("Provide either (lat, lng, timezone) or (city, nation) for location");
  }
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.house_system) search.set("house_system", params.house_system);
  return search;
}

/**
 * Search for locations by query. Used for autocomplete.
 */
export async function fetchLocations(q: string, limit = 10): Promise<LocationResult[]> {
  const query = q.trim();
  if (!query) return [];
  const search = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE}/locations?${search}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Locations API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch a natal chart from the API.
 * Uses lat/lng + timezone when available; otherwise city + nation.
 */
export async function fetchChart(params: ChartApiParams): Promise<NatalChart> {
  const search = buildChartSearchParams(params);
  const res = await fetch(`${API_BASE}/chart?${search}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chart API error ${res.status}: ${text}`);
  }
  const api = (await res.json()) as ChartAPIResponse;
  return chartFromApiResponse(api);
}

/**
 * Fetch raw chart JSON from the API (no transformation).
 * Useful for debugging and inspecting server response structure.
 */
export async function fetchChartRaw(params: ChartApiParams): Promise<ChartAPIResponse> {
  const search = buildChartSearchParams(params);
  const res = await fetch(`${API_BASE}/chart?${search}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chart API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch raw reading JSON by identifier (no transformation).
 */
export async function fetchReadingByIdRaw(identifier: string): Promise<ChartAPIResponse> {
  const encoded = encodeURIComponent(identifier);
  const res = await fetch(`${API_BASE}/readings/${encoded}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Readings API error ${res.status}: ${text}`);
  }
  return res.json();
}

/** Summary of a saved reading from the readings list. */
export interface ReadingSummary {
  identifier: string;
  name: string;
  birth_datetime: string;
  created_at: string;
}

/**
 * Fetch the list of saved readings.
 */
export async function fetchReadings(): Promise<ReadingSummary[]> {
  const res = await fetch(`${API_BASE}/readings`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Readings API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch a single reading by its identifier.
 * Identifier format: name__birthdatetime__lat__lng (e.g. Jane__1990-06-15T12:00__40.7128__-74.006)
 */
export async function fetchReadingById(identifier: string): Promise<NatalChart> {
  const encoded = encodeURIComponent(identifier);
  const res = await fetch(`${API_BASE}/readings/${encoded}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Readings API error ${res.status}: ${text}`);
  }
  const api = (await res.json()) as ChartAPIResponse;
  return chartFromApiResponse(api);
}
