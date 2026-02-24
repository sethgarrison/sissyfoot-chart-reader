/**
 * Chart API client.
 * Fetches natal chart data from the sissyfoot-astrological-api.
 */

import { chartFromApiResponse, type ChartApiResponse, type NatalChart } from "../models/reading";

const API_BASE = "https://sissyfoot-astrological-api.onrender.com";

export interface ChartApiParams {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  city: string;  // "City,State" e.g. "Laurel,MS"
  nation: string; // "US"
}

/**
 * Fetch a natal chart from the API.
 */
export async function fetchChart(params: ChartApiParams): Promise<NatalChart> {
  const search = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    day: String(params.day),
    hour: String(params.hour),
    min: String(params.min),
    city: params.city,
    nation: params.nation,
  });
  const res = await fetch(`${API_BASE}/chart?${search}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chart API error ${res.status}: ${text}`);
  }
  const api: ChartApiResponse = await res.json();
  return chartFromApiResponse(api);
}
