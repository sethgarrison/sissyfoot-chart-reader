<script lang="ts">
  import type { NatalChart } from "../models";

  interface Props {
    chart?: NatalChart | null;
  }
  let { chart = null }: Props = $props();
</script>

<aside class="sidebar">
  <header class="sidebar-header">
    <h1>Astro Chart</h1>
    <p class="subtitle">natal chart explorer</p>
  </header>

  <section class="sidebar-section">
    <h2>Birth Data</h2>
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
</style>
