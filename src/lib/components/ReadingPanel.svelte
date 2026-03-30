<script lang="ts">
  import type { NatalChart, PlanetPlacement } from "../models";
  import { getPlanetInHouseInterpretation, getPlanetInSignInterpretation } from "../models/reading";
  import type { ChartApiParams } from "../api/chartApi";
  import { getChartShareUrl } from "../chart/chartShareUrl";

  interface Props {
    chart: NatalChart;
    selectedPlanet?: PlanetPlacement | null;
    lastRequestParams?: ChartApiParams | null;
    onNewChart: () => void;
    onStartReading?: () => void;
  }
  let { chart, selectedPlanet = null, lastRequestParams = null, onNewChart, onStartReading }: Props = $props();

  let shareCopied = $state(false);
  let shareCopyTimer: ReturnType<typeof setTimeout> | null = null;

  function formatRequestTime(p: ChartApiParams): string {
    return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")} ${String(p.hour).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`;
  }

  async function copyShareLink() {
    if (!lastRequestParams) return;
    const url = getChartShareUrl(lastRequestParams);
    try {
      await navigator.clipboard.writeText(url);
      shareCopied = true;
      if (shareCopyTimer) clearTimeout(shareCopyTimer);
      shareCopyTimer = setTimeout(() => {
        shareCopied = false;
        shareCopyTimer = null;
      }, 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }
</script>

<aside class="reading-panel">
  <header class="reading-header">
    <h1>Astro Chart</h1>
    <div class="header-actions">
      {#if lastRequestParams}
        <button class="share-link-btn" type="button" onclick={copyShareLink}>
          {shareCopied ? "Copied!" : "Copy link"}
        </button>
      {/if}
      {#if onStartReading}
        <button class="start-reading-btn" onclick={onStartReading}>Start Reading</button>
      {/if}
      <button class="new-chart-btn" onclick={onNewChart}>New Chart</button>
    </div>
  </header>

  {#if selectedPlanet}
    {@const houseCusp = chart.houses.find((h) => h.house === selectedPlanet.house)}
    {@const interpSign = getPlanetInSignInterpretation(selectedPlanet.planet, selectedPlanet.sign, chart.interpretation)}
    {@const interpHouse = getPlanetInHouseInterpretation(
      selectedPlanet.planet,
      selectedPlanet.house,
      chart.interpretation
    )}
    <section class="reading-section focused-planet">
      <h2>In Focus</h2>
      <div class="planet-detail">
        <p class="planet-detail-name">{selectedPlanet.planet}</p>
        <p class="planet-detail-placement">
          {selectedPlanet.sign} {selectedPlanet.degrees}&deg;{selectedPlanet.minutes.toString().padStart(2, "0")}'
          · House {selectedPlanet.house}
          {#if selectedPlanet.retrograde}<span class="retro">R</span>{/if}
        </p>
        {#if houseCusp}
          <p class="planet-detail-house">
            House {selectedPlanet.house} cusp: {houseCusp.sign} {houseCusp.degrees}&deg;{houseCusp.minutes.toString().padStart(2, "0")}'
          </p>
        {/if}
        {#if interpSign}
        <h4>{selectedPlanet.planet} in {selectedPlanet.sign}</h4>
          <p class="planet-detail-interp">{interpSign}</p>
        {/if}
        {#if interpHouse}
          <h4>{selectedPlanet.planet} in House {selectedPlanet.house}</h4>
          <p class="planet-detail-interp">{interpHouse}</p>
        {/if}
        {#if selectedPlanet.retrograde && chart.interpretation?.retrograde_interpretations}
          {@const ri = chart.interpretation.retrograde_interpretations as Record<string, string>}
          {@const signKey = `${selectedPlanet.planet} in ${selectedPlanet.sign}`}
          {@const houseKey = `${selectedPlanet.planet} in House ${selectedPlanet.house}`}
          {#if ri[signKey]}
            <p class="planet-detail-interp retrograde-note">{ri[signKey]}</p>
          {:else if ri[houseKey]}
            <p class="planet-detail-interp retrograde-note">{ri[houseKey]}</p>
          {/if}
        {/if}
      </div>
    </section>
  {/if}

  <section class="reading-section">
    <h2>Chart Data</h2>
    <dl class="birth-data">
      {#if lastRequestParams}
        <dt>Submitted (you entered)</dt>
        <dd>
          {formatRequestTime(lastRequestParams)}
          {#if lastRequestParams.timezone}
            <span class="tz-badge">{lastRequestParams.timezone}</span>
          {/if}
        </dd>
      {/if}
      <dt>Name</dt>
      <dd>{chart.birthData.name}</dd>
      <dt>Date</dt>
      <dd>{chart.birthData.date}</dd>
      <dt>Time (API returned)</dt>
      <dd>{chart.birthData.time}</dd>
      <dt>Location (lat, lng)</dt>
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
</aside>

<style>
  .reading-panel {
    width: 340px;
    min-width: 300px;
    flex-shrink: 0;
    background: #161b22;
    border-left: 1px solid #30363d;
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    .reading-panel {
      width: 100%;
      min-width: unset;
      /* Avoid flex:1 + min-height:0 in an auto-height column parent — can compute to zero height. */
      flex: none;
      flex-shrink: 0;
      max-height: min(50vh, 28rem);
      border-left: none;
      border-top: 1px solid #30363d;
    }
  }

  .reading-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .share-link-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    background: #21262d;
    color: #58a6ff;
    border: 1px solid #30363d;
    border-radius: 6px;
    cursor: pointer;
    min-width: 5.25rem;
  }

  .share-link-btn:hover {
    border-color: #58a6ff;
    color: #79b8ff;
  }

  .start-reading-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    background: #238636;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .start-reading-btn:hover {
    background: #2ea043;
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

  .reading-section h4 {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8b949e;
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

  .tz-badge {
    display: inline-block;
    margin-left: 0.4rem;
    font-size: 0.75rem;
    color: #6e7681;
  }

  .focused-planet {
    background: rgba(88, 166, 255, 0.08);
    border: 1px solid rgba(88, 166, 255, 0.25);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .planet-detail {
    margin: 0;
  }

  .planet-detail-name {
    font-size: 1rem;
    font-weight: 600;
    color: #e6edf3;
    margin: 0 0 0.25rem;
  }

  .planet-detail-placement {
    font-size: 0.85rem;
    color: #8b949e;
    font-family: monospace;
    margin: 0 0 0.25rem;
  }

  .planet-detail-house {
    font-size: 0.8rem;
    color: #6e7681;
    font-family: monospace;
    margin: 0 0 0.5rem;
  }

  .planet-detail-interp {
    font-size: 0.82rem;
    color: #c9d1d9;
    line-height: 1.4;
    margin: 0.5rem 0 0;
    padding-top: 0.5rem;
    border-top: 1px solid #21262d;
  }

  .retrograde-note {
    color: #e6c88a;
  }
</style>
