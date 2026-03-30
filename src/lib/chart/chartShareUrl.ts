/**
 * Serialize / deserialize birth data in the page query string for shareable chart links.
 *
 * Query keys: year, month, day, hour, min, plus either (lat, lng, tz) or (city, nation),
 * optional name, optional house_system (whole_sign | placidus).
 */

import type { ChartApiParams } from "../api/chartApi";

function parseIntStrict(s: string | null): number | null {
  if (s == null || s === "") return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function parseChartParamsFromSearchParams(search: URLSearchParams): ChartApiParams | null {
  const year = parseIntStrict(search.get("year"));
  const month = parseIntStrict(search.get("month"));
  const day = parseIntStrict(search.get("day"));
  const hour = parseIntStrict(search.get("hour"));
  const min = parseIntStrict(search.get("min"));
  if (year == null || month == null || day == null || hour == null || min == null) return null;
  if (year < 1800 || year > 2200) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || min < 0 || min > 59) return null;

  const latRaw = search.get("lat");
  const lngRaw = search.get("lng");
  const tzRaw = (search.get("tz") ?? search.get("timezone") ?? "").trim();
  const city = (search.get("city") ?? "").trim();
  const nation = (search.get("nation") ?? "").trim();

  const hasCoords =
    latRaw != null &&
    latRaw !== "" &&
    lngRaw != null &&
    lngRaw !== "" &&
    tzRaw.length > 0;
  const hasCity = city.length > 0 && nation.length > 0;

  if (!hasCoords && !hasCity) return null;

  const nameRaw = search.get("name")?.trim();
  const name: string | undefined = nameRaw && nameRaw.length > 0 ? nameRaw : undefined;

  const hsRaw = search.get("house_system");
  let house_system: ChartApiParams["house_system"] = "whole_sign";
  if (hsRaw === "placidus" || hsRaw === "whole_sign") house_system = hsRaw;

  const optionalName = name !== undefined ? { name } : {};

  if (hasCoords) {
    const lat = Number.parseFloat(latRaw!);
    const lng = Number.parseFloat(lngRaw!);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return {
      year,
      month,
      day,
      hour,
      min,
      lat,
      lng,
      timezone: tzRaw,
      house_system,
      ...optionalName,
    };
  }

  const tzOpt = tzRaw.length > 0 ? tzRaw : undefined;
  return {
    year,
    month,
    day,
    hour,
    min,
    city,
    nation,
    house_system,
    ...(tzOpt !== undefined ? { timezone: tzOpt } : {}),
    ...optionalName,
  };
}

/** Build query params for a shareable URL (not the API — uses `tz` for timezone). */
export function chartParamsToSearchParams(params: ChartApiParams): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("year", String(params.year));
  sp.set("month", String(params.month));
  sp.set("day", String(params.day));
  sp.set("hour", String(params.hour));
  sp.set("min", String(params.min));

  const useCoords = params.lat != null && params.lng != null && (params.timezone?.trim() ?? "").length > 0;
  if (useCoords) {
    sp.set("lat", String(params.lat));
    sp.set("lng", String(params.lng));
    sp.set("tz", params.timezone!.trim());
  } else if (params.city && params.nation) {
    sp.set("city", params.city);
    sp.set("nation", params.nation);
    if (params.timezone?.trim()) sp.set("tz", params.timezone.trim());
  }

  if (params.name?.trim()) sp.set("name", params.name.trim());
  if (params.house_system === "placidus") sp.set("house_system", "placidus");
  return sp;
}

export function replaceUrlWithChartParams(params: ChartApiParams): void {
  if (typeof window === "undefined") return;
  const sp = chartParamsToSearchParams(params);
  const url = new URL(window.location.href);
  url.search = sp.toString();
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function clearChartShareFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = "";
  history.replaceState(null, "", `${url.pathname}${url.hash}`);
}

/** Absolute share URL for the current origin and path (preserves hash e.g. #admin). */
export function getChartShareUrl(params: ChartApiParams): string {
  const sp = chartParamsToSearchParams(params);
  if (typeof window === "undefined") return `?${sp.toString()}`;
  const url = new URL(window.location.href);
  url.search = sp.toString();
  return url.toString();
}
