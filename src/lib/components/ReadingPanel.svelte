<script lang="ts">
  import type { NatalChart } from "../models";

  interface Props {
    chart: NatalChart;
    onNewChart: () => void;
  }
  let { chart, onNewChart }: Props = $props();
</script>

<aside class="reading-panel">
  <header class="reading-header">
    <h1>Astro Chart</h1>
    <button class="new-chart-btn" onclick={onNewChart}>New Chart</button>
  </header>

  <section class="reading-section">
    <h2>Chart Data</h2>
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
  </section>

  <section class="reading-section">
    <h2>Planets</h2>
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
  </section>

  {#if chart.lunarNodes && chart.lunarNodes.length > 0}
    <section class="reading-section">
      <h2>Lunar Nodes</h2>
      <ul class="planet-list">
        {#each chart.lunarNodes as n}
          <li>
            <span class="planet-name">{n.node}</span>
            <span class="planet-pos">
              {n.sign} {n.degrees}&deg;{n.minutes.toString().padStart(2, "0")}' · House {n.house}
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="reading-section">
    <h2>Aspects</h2>
    {#if chart.aspects.length > 0}
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

  {#if chart.interpretations}
    <section class="reading-section interpretations-section">
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
  .reading-panel {
    width: 340px;
    min-width: 300px;
    background: #161b22;
    border-left: 1px solid #30363d;
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .reading-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .reading-header h1 {
    margin: 0;
    font-size: 1.2rem;
    color: #e6edf3;
    font-weight: 600;
  }

  .new-chart-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    background: transparent;
    color: #8b949e;
    border: 1px solid #30363d;
    border-radius: 6px;
    cursor: pointer;
  }

  .new-chart-btn:hover {
    color: #c9d1d9;
    border-color: #484f58;
  }

  .reading-section h2 {
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
