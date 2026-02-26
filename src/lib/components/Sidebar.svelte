<script lang="ts">
  import { fetchChart, type ChartApiParams } from "../api/chartApi";
  import type { NatalChart } from "../models";

  interface Props {
    chart?: NatalChart | null;
  }
  let { chart = $bindable(null) }: Props = $props();

  let form = $state<ChartApiParams>({
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

  async function handleSubmit() {
    loading = true;
    error = null;
    try {
      chart = await fetchChart(form);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to fetch chart";
    } finally {
      loading = false;
    }
  }
</script>

<aside class="sidebar">
  <header class="sidebar-header">
    <h1>Astro Chart</h1>
    <p class="subtitle">natal chart explorer</p>
  </header>

  <section class="sidebar-section">
    <h2>Birth Data</h2>
    <form class="chart-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
  </section>

  <section class="sidebar-section">
    <h2>Chart Data</h2>
    {#if chart}
      <dl class="birth-data">
        <dt>Name</dt>
        <dd>{chart.birthData.name}</dd>
        <dt>Date</dt>
        <dd>{chart.birthData.date}</dd>
        <dt>Time</dt>
        <dd>{chart.birthData.time}</dd>
        <dt>Location</dt>
        <dd>{chart.birthData.latitude.toFixed(4)}, {chart.birthData.longitude.toFixed(4)}</dd>
      </dl>
    {:else}
      <p class="placeholder">No chart loaded. Enter birth data to generate a chart.</p>
    {/if}
  </section>

  <section class="sidebar-section">
    <h2>Planets</h2>
    {#if chart}
      <ul class="planet-list">
        {#each chart.planets as p}
          <li>
            <span class="planet-name">{p.planet}</span>
            <span class="planet-pos">
              {p.sign} {p.degrees}&deg;{p.minutes.toString().padStart(2, "0")}'
              {#if p.retrograde}<span class="retro">R</span>{/if}
            </span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="placeholder">&mdash;</p>
    {/if}
  </section>

  <section class="sidebar-section">
    <h2>Aspects</h2>
    {#if chart && chart.aspects.length > 0}
      <ul class="aspect-list">
        {#each chart.aspects as a}
          <li>
            {a.planet1} &ndash; {a.planet2}
            <span class="aspect-type">{a.type}</span>
            <span class="aspect-orb">{a.orb}&deg;</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="placeholder">&mdash;</p>
    {/if}
  </section>

  {#if chart?.interpretations}
    <section class="sidebar-section interpretations-section">
      <h2>Interpretations</h2>

      {#if Object.keys(chart.interpretations.planet_in_sign ?? {}).length > 0}
        <h3 class="interpretations-sub">Planet in Sign</h3>
        <ul class="interpretations-list">
          {#each Object.entries(chart.interpretations.planet_in_sign ?? {}) as [key, text]}
            <li class="interpretation-item">
              <strong class="interpretation-label">{key}</strong>
              <p class="interpretation-text">{text}</p>
            </li>
          {/each}
        </ul>
      {/if}

      {#if Object.keys(chart.interpretations.planet_in_house ?? {}).length > 0}
        <h3 class="interpretations-sub">Planet in House</h3>
        <ul class="interpretations-list">
          {#each Object.entries(chart.interpretations.planet_in_house ?? {}) as [key, text]}
            <li class="interpretation-item">
              <strong class="interpretation-label">{key}</strong>
              <p class="interpretation-text">{text}</p>
            </li>
          {/each}
        </ul>
      {/if}

      {#if chart.interpretations.chart_shape}
        <h3 class="interpretations-sub">Chart Shape</h3>
        {#if chart.interpretations.chart_shape.primary}
          <p class="interpretation-text"><strong>{chart.interpretations.chart_shape.primary}</strong></p>
        {/if}
        {#if chart.interpretations.chart_shape.interpretation}
          <p class="interpretation-text">{chart.interpretations.chart_shape.interpretation}</p>
        {/if}
        {#if chart.interpretations.chart_shape.distribution}
          <ul class="interpretations-list">
            {#each Object.entries(chart.interpretations.chart_shape.distribution) as [key, text]}
              <li class="interpretation-item">
                <strong class="interpretation-label">{key.replace(/_/g, " ")}</strong>
                <p class="interpretation-text">{text}</p>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}

      {#if Object.keys(chart.interpretations.aspects ?? {}).length > 0}
        <h3 class="interpretations-sub">Aspect Interpretations</h3>
        <ul class="interpretations-list">
          {#each Object.entries(chart.interpretations.aspects ?? {}) as [key, text]}
            <li class="interpretation-item">
              <strong class="interpretation-label">{key}</strong>
              <p class="interpretation-text">{text}</p>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</aside>

<style>
  .sidebar {
    width: 300px;
    min-width: 260px;
    background: #161b22;
    border-right: 1px solid #30363d;
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .sidebar-header h1 {
    margin: 0;
    font-size: 1.35rem;
    color: #e6edf3;
    font-weight: 600;
  }

  .subtitle {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    color: #8b949e;
    letter-spacing: 0.05em;
    text-transform: lowercase;
  }

  .sidebar-section h2 {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8b949e;
    border-bottom: 1px solid #21262d;
    padding-bottom: 0.35rem;
  }

  .birth-data {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 0.75rem;
    font-size: 0.85rem;
  }

  .chart-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  .chart-form label {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .chart-form label span {
    color: #8b949e;
    font-size: 0.75rem;
  }
  .chart-form input {
    padding: 0.4rem 0.5rem;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 4px;
    color: #c9d1d9;
  }
  .chart-form input:focus {
    outline: none;
    border-color: #58a6ff;
  }
  .date-row {
    display: flex;
    gap: 0.25rem;
  }
  .date-row input {
    flex: 1;
  }
  .chart-form button {
    margin-top: 0.25rem;
    padding: 0.5rem;
    background: #238636;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
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
    font-size: 0.8rem;
    margin: 0;
  }

  .birth-data dt {
    color: #8b949e;
  }
  .birth-data dd {
    margin: 0;
    color: #c9d1d9;
  }

  .placeholder {
    color: #484f58;
    font-size: 0.85rem;
    font-style: italic;
  }

  .planet-list,
  .aspect-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.82rem;
  }

  .planet-list li,
  .aspect-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.2rem 0;
    color: #c9d1d9;
    border-bottom: 1px solid #21262d;
  }

  .planet-name {
    font-weight: 500;
  }
  .planet-pos {
    color: #8b949e;
    font-family: monospace;
  }
  .retro {
    color: #f85149;
    font-weight: 700;
    margin-left: 0.25em;
  }

  .aspect-type {
    color: #58a6ff;
    font-size: 0.75rem;
    text-transform: capitalize;
    margin: 0 0.5em;
  }
  .aspect-orb {
    color: #484f58;
    font-family: monospace;
  }

  .interpretations-section {
    margin-top: 0.5rem;
  }
  .interpretations-sub {
    margin: 1rem 0 0.4rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8b949e;
  }
  .interpretations-sub:first-of-type {
    margin-top: 0.5rem;
  }
  .interpretations-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.82rem;
  }
  .interpretation-item {
    padding: 0.35rem 0;
    border-bottom: 1px solid #21262d;
  }
  .interpretation-item:last-child {
    border-bottom: none;
  }
  .interpretation-label {
    color: #58a6ff;
    font-weight: 500;
    display: block;
  }
  .interpretation-text {
    margin: 0.2rem 0 0;
    color: #c9d1d9;
    line-height: 1.4;
  }
</style>
