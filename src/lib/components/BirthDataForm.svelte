<script lang="ts">
  import {
    fetchChart,
    type ChartApiParams,
    type LocationResult,
  } from "../api/chartApi";
  import LocationInput from "./LocationInput.svelte";
  import type { NatalChart } from "../models";

  interface Props {
    onChartFetched: (chart: NatalChart, requestParams?: ChartApiParams) => void;
  }
  let { onChartFetched }: Props = $props();

  /** Form fields before coercion into `ChartApiParams`. */
  type BirthFormState = {
    name: string;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    min?: number;
    city?: string;
    nation?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
    house_system: "whole_sign" | "placidus";
  };

  let form = $state<BirthFormState>({
    name: "",
    house_system: "whole_sign",
  });
  let locationDisplay = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  function buildChartApiParams(f: BirthFormState): ChartApiParams | null {
    if (
      f.year == null ||
      f.month == null ||
      f.day == null ||
      f.hour == null ||
      f.min == null ||
      !Number.isFinite(f.year) ||
      !Number.isFinite(f.month) ||
      !Number.isFinite(f.day) ||
      !Number.isFinite(f.hour) ||
      !Number.isFinite(f.min)
    ) {
      return null;
    }
    if (f.year < 1900 || f.year > 2100) return null;
    if (f.month < 1 || f.month > 12 || f.day < 1 || f.day > 31) return null;
    if (f.hour < 0 || f.hour > 23 || f.min < 0 || f.min > 59) return null;

    const useCoords = f.lat != null && f.lng != null && (f.timezone?.trim() ?? "").length > 0;
    const useCity = !!(f.city?.trim()) && !!(f.nation?.trim());
    if (!useCoords && !useCity) return null;

    const base: ChartApiParams = {
      year: Math.trunc(f.year),
      month: Math.trunc(f.month),
      day: Math.trunc(f.day),
      hour: Math.trunc(f.hour),
      min: Math.trunc(f.min),
      house_system: f.house_system,
    };
    const trimmedName = f.name.trim();
    if (trimmedName) base.name = trimmedName;

    if (useCoords) {
      base.lat = f.lat;
      base.lng = f.lng;
      base.timezone = f.timezone!.trim();
    } else {
      base.city = f.city!.trim();
      base.nation = f.nation!.trim();
      if (f.timezone?.trim()) base.timezone = f.timezone.trim();
    }
    return base;
  }

  const hasValidLocation = $derived(
    (form.lat != null && form.lng != null && (form.timezone?.trim() ?? "").length > 0) ||
      (!!(form.city?.trim()) && !!(form.nation?.trim()))
  );

  const hasCompleteBirthMoment = $derived.by(() => {
    const f = form;
    if (
      f.year == null ||
      f.month == null ||
      f.day == null ||
      f.hour == null ||
      f.min == null ||
      !Number.isFinite(f.year) ||
      !Number.isFinite(f.month) ||
      !Number.isFinite(f.day) ||
      !Number.isFinite(f.hour) ||
      !Number.isFinite(f.min)
    )
      return false;
    if (f.year < 1900 || f.year > 2100) return false;
    if (f.month < 1 || f.month > 12 || f.day < 1 || f.day > 31) return false;
    if (f.hour < 0 || f.hour > 23 || f.min < 0 || f.min > 59) return false;
    return true;
  });

  async function handleSubmit() {
    loading = true;
    error = null;
    try {
      const params = buildChartApiParams(form);
      if (!params) {
        error = "Please enter your full birth date, time, and location.";
        return;
      }
      const c = await fetchChart(params);
      onChartFetched(c, params);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to fetch chart";
    } finally {
      loading = false;
    }
  }

  function handleLocationSelect(loc: LocationResult) {
    form = {
      ...form,
      lat: loc.lat,
      lng: loc.lng,
      timezone: loc.timezone,
      city: loc.city,
      nation: loc.nation,
    };
    locationDisplay = loc.display;
  }

  function handleLocationClear() {
    form = { ...form, lat: undefined, lng: undefined, timezone: undefined, city: undefined, nation: undefined };
    locationDisplay = "";
  }
</script>

<div class="form-view">
  <header class="form-header">
    <h1>Astro Chart</h1>
    <p class="subtitle">Enter birth data to generate your natal chart</p>
  </header>

  <div class="form-and-readings">
    <form class="chart-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <label>
        <span>Name</span>
        <input type="text" bind:value={form.name} placeholder="Chart name (optional)" />
      </label>
      <label>
        <span>Date</span>
        <div class="date-row">
          <input type="number" bind:value={form.month} min="1" max="12" placeholder="MM" />
          <input type="number" bind:value={form.day} min="1" max="31" placeholder="DD" />
          <input type="number" bind:value={form.year} min="1900" max="2100" placeholder="YYYY" />
        </div>
      </label>
      <label>
        <span>Time (local)</span>
        <div class="date-row">
          <input type="number" bind:value={form.hour} min="0" max="23" placeholder="HH" />
          <input type="number" bind:value={form.min} min="0" max="59" placeholder="MM" />
        </div>
      </label>
      <label>
        <span>Location</span>
        <LocationInput value={locationDisplay} onSelect={handleLocationSelect} onClear={handleLocationClear} placeholder="Search for a city…" />
      </label>
      <label>
        <span>House System</span>
        <div class="house-system-toggle">
          <button
            type="button"
            class="toggle-option"
            class:active={form.house_system === "whole_sign"}
            onclick={() => (form = { ...form, house_system: "whole_sign" })}
          >
            Whole Sign
          </button>
          <button
            type="button"
            class="toggle-option"
            class:active={form.house_system === "placidus"}
            onclick={() => (form = { ...form, house_system: "placidus" })}
          >
            Placidus
          </button>
        </div>
      </label>
      {#if error}
        <p class="form-error">{error}</p>
      {/if}
      <button type="submit" disabled={loading || !hasValidLocation || !hasCompleteBirthMoment}>
        {loading ? "Loading…" : "Get Chart"}
      </button>
    </form>
  </div>
</div>

<style>
  .form-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    padding: 2rem;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .form-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #e6edf3;
    font-weight: 600;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    color: #8b949e;
  }

  .chart-form {
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .chart-form label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .chart-form label span {
    color: #8b949e;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chart-form input {
    padding: 0.5rem 0.6rem;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #c9d1d9;
  }

  .chart-form input:focus {
    outline: none;
    border-color: #58a6ff;
  }

  .date-row {
    display: flex;
    gap: 0.5rem;
  }

  .date-row input {
    flex: 1;
  }

  .house-system-toggle {
    display: flex;
    gap: 0;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #30363d;
  }

  .toggle-option {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    background: #0d1117;
    color: #8b949e;
    border: none;
    cursor: pointer;
  }

  .toggle-option:hover {
    color: #c9d1d9;
  }

  .toggle-option.active {
    background: #238636;
    color: white;
  }

  .chart-form button[type="submit"] {
    margin-top: 0.5rem;
    padding: 0.65rem 1rem;
    background: #238636;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
  }

  .chart-form button[type="submit"]:hover:not(:disabled) {
    background: #2ea043;
  }

  .chart-form button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .form-error {
    color: #f85149;
    font-size: 0.85rem;
    margin: 0;
  }

  .form-and-readings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    width: 100%;
    max-width: 400px;
  }
</style>
