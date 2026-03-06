/**
 * Chart API client.
 * Fetches natal chart data from the sissyfoot-astrological-api.
 */

import { chartFromApiResponse, type ChartApiResponse, type NatalChart } from "../models/reading";

const API_BASE = "https://sissyfoot-astrological-api.onrender.com";

export interface ChartApiParams {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  city: string;  // "City,State" e.g. "Laurel,MS"
  nation: string; // "US"
  /** IANA timezone e.g. "America/Chicago" — required for accurate chart vs astro.com */
  timezone?: string;
  /** House system: "whole_sign" (default) or "placidus" */
  house_system?: "whole_sign" | "placidus";
}

/**
 * Fetch a natal chart from the API.
 * Uses `time` (HH:MM) for birth time—overrides hour/minute and ensures minutes are preserved.
 * Sends `tz_str` for timezone per API spec.
 */
export async function fetchChart(params: ChartApiParams): Promise<NatalChart> {
  const search = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    day: String(params.day),
    time: `${String(params.hour).padStart(2, "0")}:${String(params.min).padStart(2, "0")}`,
    city: params.city,
    nation: params.nation,
  });
  if (params.name?.trim()) {
    search.set("name", params.name.trim());
  }
  if (params.house_system) {
    search.set("house_system", params.house_system);
  }
  if (params.timezone?.trim()) {
    search.set("tz_str", params.timezone.trim());
  }
  const res = await fetch(`${API_BASE}/chart?${search}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chart API error ${res.status}: ${text}`);
  }
  const api: ChartApiResponse = await res.json();
  return chartFromApiResponse(api);
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
  const api: ChartApiResponse = await res.json();
  return chartFromApiResponse(api);
}
