<script lang="ts">
  import { onMount } from "svelte";
  import {
    buildChartSearchParams,
    fetchChartRaw,
    fetchReadings,
    fetchReadingByIdRaw,
    type ChartApiParams,
    type ReadingSummary,
  } from "./lib/api/chartApi";
  import type { ChartApiResponse } from "./lib/models/reading";

  let mode = $state<"chart" | "reading">("chart");
  let form = $state<ChartApiParams>({
    name: "Seth",
    year: 1982,
    month: 2,
    day: 10,
    hour: 11,
    min: 36,
    lat: 31.6941,
    lng: -89.1306,
    timezone: "America/Chicago",
    house_system: "whole_sign",
  });
  let readings = $state<ReadingSummary[]>([]);
  let selectedId = $state<string>("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let raw = $state<ChartApiResponse | null>(null);
  let requestUrl = $state<string>("");

  onMount(() => {
    fetchReadings()
      .then((r) => (readings = r))
      .catch(() => (readings = []));
  });

  async function fetchChart() {
    loading = true;
    error = null;
    raw = null;
    requestUrl = "";
    try {
      const search = buildChartSearchParams(form);
      requestUrl = `https://sissyfoot-astrological-api.onrender.com/chart?${search}`;
      const data = await fetchChartRaw(form);
      raw = data;
    } catch (e) {
      error = e instanceof Error ? e.message : "Fetch failed";
    } finally {
      loading = false;
    }
  }

  async function fetchReading() {
    if (!selectedId) return;
    loading = true;
    error = null;
    raw = null;
    requestUrl = "";
    try {
      requestUrl = `https://sissyfoot-astrological-api.onrender.com/readings/${encodeURIComponent(selectedId)}`;
      const data = await fetchReadingByIdRaw(selectedId);
      raw = data;
    } catch (e) {
      error = e instanceof Error ? e.message : "Fetch failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="debug-page">
  <header class="debug-header">
    <h1>API Debug — Raw Server Data</h1>
    <button type="button" class="back-link" onclick={() => (location.hash = '')}>← Back to app</button>
  </header>

  <div class="debug-toolbar">
    <div class="mode-toggle">
      <button type="button" class:active={mode === "chart"} onclick={() => (mode = "chart")}>Chart params</button>
      <button type="button" class:active={mode === "reading"} onclick={() => (mode = "reading")}>Saved reading</button>
    </div>

    {#if mode === "chart"}
      <form class="params-form" onsubmit={(e) => { e.preventDefault(); fetchChart(); }}>
        <div class="form-row">
          <label>Name <input type="text" bind:value={form.name} /></label>
          <label>Year <input type="number" bind:value={form.year} /></label>
          <label>Month <input type="number" bind:value={form.month} min="1" max="12" /></label>
          <label>Day <input type="number" bind:value={form.day} min="1" max="31" /></label>
          <label>Hour <input type="number" bind:value={form.hour} min="0" max="23" /></label>
          <label>Min <input type="number" bind:value={form.min} min="0" max="59" /></label>
        </div>
        <div class="form-row">
          <label>Lat <input type="number" step="any" bind:value={form.lat} placeholder="31.6941" /></label>
          <label>Lng <input type="number" step="any" bind:value={form.lng} placeholder="-89.1306" /></label>
          <label>Timezone <input type="text" bind:value={form.timezone} placeholder="America/Chicago" /></label>
          <label>City <input type="text" bind:value={form.city} placeholder="Laurel,MS" /></label>
          <label>Nation <input type="text" bind:value={form.nation} placeholder="US" /></label>
          <label>
            House
            <select bind:value={form.house_system}>
              <option value="whole_sign">whole_sign</option>
              <option value="placidus">placidus</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>{loading ? "Fetching…" : "Fetch chart"}</button>
      </form>
    {:else}
      <div class="reading-select">
        <select bind:value={selectedId}>
          <option value="">-- pick a reading --</option>
          {#each readings as r}
            <option value={r.identifier}>{r.name || r.identifier}</option>
          {/each}
        </select>
        <button type="button" disabled={!selectedId || loading} onclick={fetchReading}>
          {loading ? "Fetching…" : "Fetch reading"}
        </button>
      </div>
    {/if}
  </div>

  {#if requestUrl}
    <div class="request-info">
      <strong>Request:</strong>
      <code>{requestUrl}</code>
    </div>
  {/if}
  {#if error}
    <pre class="error-box">{error}</pre>
  {/if}
  {#if raw}
    <pre class="raw-json">{JSON.stringify(raw, null, 2)}</pre>
  {/if}
</div>

<style>
  .debug-page {
    min-height: 100vh;
    padding: 1rem;
    background: #0d1117;
    color: #c9d1d9;
    font-family: ui-monospace, monospace;
    font-size: 13px;
  }
  .debug-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .debug-header h1 {
    margin: 0;
    font-size: 1.25rem;
  }
  .back-link {
    color: #58a6ff;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
  }
  .back-link:hover {
    text-decoration: underline;
  }
  .debug-toolbar {
    margin-bottom: 1rem;
  }
  .mode-toggle {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
  .mode-toggle button {
    padding: 0.35rem 0.75rem;
    background: #21262d;
    border: 1px solid #30363d;
    color: #8b949e;
    cursor: pointer;
    font-size: 12px;
  }
  .mode-toggle button.active {
    background: #238636;
    color: white;
    border-color: #238636;
  }
  .params-form,
  .reading-select {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
  }
  .params-form label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .params-form input,
  .params-form select,
  .reading-select select {
    padding: 0.25rem 0.4rem;
    background: #161b22;
    border: 1px solid #30363d;
    color: #c9d1d9;
    font-size: 12px;
  }
  .params-form button,
  .reading-select button {
    padding: 0.35rem 0.75rem;
    background: #238636;
    border: 1px solid #238636;
    color: white;
    cursor: pointer;
    font-size: 12px;
  }
  .params-form button:disabled,
  .reading-select button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .request-info {
    margin-bottom: 0.5rem;
    font-size: 11px;
  }
  .request-info code {
    word-break: break-all;
    color: #8b949e;
  }
  .error-box {
    padding: 0.75rem;
    background: #3d1f1f;
    border: 1px solid #f85149;
    color: #f85149;
    overflow-x: auto;
    margin: 0 0 1rem;
  }
  .raw-json {
    margin: 0;
    padding: 1rem;
    background: #161b22;
    border: 1px solid #30363d;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 70vh;
    font-size: 12px;
    line-height: 1.4;
  }
</style>
