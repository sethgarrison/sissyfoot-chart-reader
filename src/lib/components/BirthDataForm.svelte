<script lang="ts">
  import { onMount } from "svelte";
  import {
    fetchChart,
    fetchReadings,
    fetchReadingById,
    type ChartApiParams,
    type ReadingSummary,
  } from "../api/chartApi";
  import type { NatalChart } from "../models";

  interface Props {
    onChartFetched: (chart: NatalChart) => void;
  }
  let { onChartFetched }: Props = $props();

  let form = $state<ChartApiParams>({
    name: "",
    year: 1970,
    month: 8,
    day: 8,
    hour: 17,
    min: 55,
    city: "Bakersfield,CA",
    nation: "US",
  });
  let loading = $state(false);
  let error = $state<string | null>(null);

  let readings = $state<ReadingSummary[]>([]);
  let readingsLoading = $state(true);
  let readingsError = $state<string | null>(null);
  let fetchingId = $state<string | null>(null);

  onMount(() => {
    fetchReadings()
      .then((r) => (readings = r))
      .catch((e) => (readingsError = e instanceof Error ? e.message : "Failed to load readings"))
      .finally(() => (readingsLoading = false));
  });

  async function handleSubmit() {
    loading = true;
    error = null;
    try {
      const c = await fetchChart(form);
      onChartFetched(c);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to fetch chart";
    } finally {
      loading = false;
    }
  }

  async function handleFetchReading(identifier: string) {
    fetchingId = identifier;
    error = null;
    try {
      const c = await fetchReadingById(identifier);
      onChartFetched(c);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to fetch reading";
    } finally {
      fetchingId = null;
    }
  }

  function formatReadingLabel(r: ReadingSummary): string {
    const date = r.birth_datetime.slice(0, 16).replace("T", " ");
    const name = (r.name || "Unknown").replace(/_/g, " ");
    return `${name} — ${date}`;
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
      <span>City, State</span>
      <input type="text" bind:value={form.city} placeholder="Laurel,MS" />
    </label>
    <label>
      <span>Country</span>
      <input type="text" bind:value={form.nation} placeholder="US" />
    </label>
    {#if error}
      <p class="form-error">{error}</p>
    {/if}
    <button type="submit" disabled={loading}>
      {loading ? "Loading…" : "Get Chart"}
    </button>
  </form>

    <section class="previous-readings">
      <h2>Previous Readings</h2>
      {#if readingsLoading}
        <p class="readings-placeholder">Loading…</p>
      {:else if readingsError}
        <p class="readings-error">{readingsError}</p>
      {:else if readings.length === 0}
        <p class="readings-placeholder">No saved readings yet.</p>
      {:else}
        <ul class="readings-list">
          {#each readings as r}
            <li>
              <button
                class="reading-item"
                onclick={() => handleFetchReading(r.identifier)}
                disabled={fetchingId === r.identifier}
              >
                {formatReadingLabel(r)}
                {#if fetchingId === r.identifier}
                  <span class="loading-dot">…</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
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

  .chart-form button {
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

  .chart-form button:hover:not(:disabled) {
    background: #2ea043;
  }

  .chart-form button:disabled {
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

  .previous-readings {
    width: 100%;
  }

  .previous-readings h2 {
    margin: 0 0 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8b949e;
  }

  .readings-placeholder,
  .readings-error {
    font-size: 0.85rem;
    color: #8b949e;
    margin: 0;
  }

  .readings-error {
    color: #f85149;
  }

  .readings-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .readings-list li {
    border-bottom: 1px solid #21262d;
  }

  .readings-list li:last-child {
    border-bottom: none;
  }

  .reading-item {
    display: block;
    width: 100%;
    padding: 0.6rem 0;
    background: none;
    border: none;
    color: #c9d1d9;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
  }

  .reading-item:hover:not(:disabled) {
    color: #58a6ff;
  }

  .reading-item:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .loading-dot {
    margin-left: 0.25em;
    color: #8b949e;
  }
</style>
