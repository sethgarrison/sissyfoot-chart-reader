<script lang="ts">
  import type { NatalChart, PlanetPlacement } from "../models";
  import { parseHouseInterpretation, getPlanetInHouseInterpretation, getAspectInterpretation } from "../models/reading";
  import type { ChartApiParams } from "../api/chartApi";

  interface Props {
    chart: NatalChart;
    selectedPlanet?: PlanetPlacement | null;
    lastRequestParams?: ChartApiParams | null;
    onNewChart: () => void;
    onStartReading?: () => void;
  }
  let { chart, selectedPlanet = null, lastRequestParams = null, onNewChart, onStartReading }: Props = $props();

  function formatRequestTime(p: ChartApiParams): string {
    return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")} ${String(p.hour).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`;
  }

  /** Parse house_interpretation: per_house (sign + planet interpretations) + shape/quadrant/hemisphere */
  const parsedHouse = $derived(
    parseHouseInterpretation(chart.interpretations?.house_interpretation as Record<string, unknown> | undefined)
  );
</script>

<aside class="reading-panel">
  <header class="reading-header">
    <h1>Astro Chart</h1>
    <div class="header-actions">
      {#if onStartReading}
        <button class="start-reading-btn" onclick={onStartReading}>Start Reading</button>
      {/if}
      <button class="new-chart-btn" onclick={onNewChart}>New Chart</button>
    </div>
  </header>

  {#if selectedPlanet}
    {@const houseCusp = chart.houses.find((h) => h.house === selectedPlanet.house)}
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
        {#if chart.interpretations?.planet_in_sign}
          {@const key = `${selectedPlanet.planet} in ${selectedPlanet.sign}`}
          {#if chart.interpretations.planet_in_sign[key]}
            <p class="planet-detail-interp">{chart.interpretations.planet_in_sign[key]}</p>
          {/if}
        {/if}
        {#if getPlanetInHouseInterpretation(selectedPlanet.planet, selectedPlanet.house, chart.interpretations)}
          <p class="planet-detail-interp">{getPlanetInHouseInterpretation(selectedPlanet.planet, selectedPlanet.house, chart.interpretations)}</p>
        {/if}
        {#if selectedPlanet.retrograde && chart.interpretations?.retrograde_interpretations}
          {@const signKey = `${selectedPlanet.planet} in ${selectedPlanet.sign}`}
          {@const houseKey = `${selectedPlanet.planet} in House ${selectedPlanet.house}`}
          {#if chart.interpretations.retrograde_interpretations[signKey]}
            <p class="planet-detail-interp retrograde-note">{chart.interpretations.retrograde_interpretations[signKey]}</p>
          {:else if chart.interpretations.retrograde_interpretations[houseKey]}
            <p class="planet-detail-interp retrograde-note">{chart.interpretations.retrograde_interpretations[houseKey]}</p>
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

  {#if chart.interpretations}
    <section class="reading-section interpretations-section">
      <h2>Interpretations</h2>

      {#if chart.interpretations.rising_sign_interpretation}
        <h3 class="interpretations-sub">Rising Sign</h3>
        <p class="interpretation-text">{chart.interpretations.rising_sign_interpretation}</p>
      {/if}

      {#if chart.interpretations.big_three}
        {@const bt = chart.interpretations.big_three}
        {@const sunSign = chart.planets.find((p) => p.planet === "Sun")?.sign ?? ""}
        {@const moonSign = chart.planets.find((p) => p.planet === "Moon")?.sign}
        {@const risingSign = chart.ascendant.sign}
        {#if (bt.sun?.[sunSign] ?? bt.moon?.[moonSign ?? ""] ?? bt.ascendant?.[risingSign])}
          <h3 class="interpretations-sub">Big Three</h3>
          <ul class="interpretations-list">
            {#if bt.sun?.[sunSign]?.interpretation}
              <li class="interpretation-item">
                <strong class="interpretation-label">Sun in {sunSign}</strong>
                <p class="interpretation-text">{bt.sun[sunSign].interpretation}</p>
              </li>
            {/if}
            {#if moonSign && bt.moon?.[moonSign]?.interpretation}
              <li class="interpretation-item">
                <strong class="interpretation-label">Moon in {moonSign}</strong>
                <p class="interpretation-text">{bt.moon[moonSign].interpretation}</p>
              </li>
            {/if}
            {#if bt.ascendant?.[risingSign]?.interpretation}
              <li class="interpretation-item">
                <strong class="interpretation-label">Ascendant in {risingSign}</strong>
                <p class="interpretation-text">{bt.ascendant[risingSign].interpretation}</p>
              </li>
            {/if}
          </ul>
        {/if}
      {/if}

      {#if parsedHouse.perHouse.length > 0 || parsedHouse.other.length > 0}
        <h3 class="interpretations-sub">House Interpretations</h3>
        {#each parsedHouse.perHouse as entry}
          <div class="house-interpretation-block">
            <p class="house-interpretation-header">
              <strong>House {entry.house}</strong>
              {#if entry.sign_on_cusp}
                <span class="house-cusp-sign">({entry.sign_on_cusp} on cusp)</span>
              {/if}
            </p>
            {#if entry.planets.length > 0}
              <p class="house-planets-list">Planets: {entry.planets.join(", ")}</p>
            {/if}
            {#if entry.sign_interpretation}
              <p class="interpretation-text sign-interp">{entry.sign_interpretation}</p>
            {/if}
            {#each Object.entries(entry.planet_interpretations) as [key, text]}
              <p class="interpretation-text planet-house-interp"><strong>{key}:</strong> {text}</p>
            {/each}
          </div>
        {/each}
        {#each parsedHouse.other as { label, text }}
          <div class="interpretation-item">
            <strong class="interpretation-label">{label}</strong>
            <p class="interpretation-text">{text}</p>
          </div>
        {/each}
      {/if}

      {#if parsedHouse.perHouse.length === 0 && Object.keys(chart.interpretations.planet_in_house ?? {}).length > 0}
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

      {#if chart.aspects.length > 0}
        {@const aspectsWithInterp = chart.aspects.filter((a) => getAspectInterpretation(a, chart.interpretations))}
        {#if aspectsWithInterp.length > 0}
          <h3 class="interpretations-sub">Aspect Interpretations</h3>
          <ul class="interpretations-list">
            {#each aspectsWithInterp as a}
              {@const interp = getAspectInterpretation(a, chart.interpretations)}
              {#if interp}
                <li class="interpretation-item">
                  <strong class="interpretation-label">{a.planet1} {a.type} {a.planet2}</strong>
                  <p class="interpretation-text">{interp}</p>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      {/if}

      {#if Object.keys(chart.interpretations.modality_element_distribution ?? {}).length > 0}
        <h3 class="interpretations-sub">Element & Modality</h3>
        <ul class="interpretations-list">
          {#each Object.entries(chart.interpretations.modality_element_distribution ?? {}) as [key, text]}
            <li class="interpretation-item">
              <strong class="interpretation-label">{key.replace(/_/g, " ")}</strong>
              <p class="interpretation-text">{text}</p>
            </li>
          {/each}
        </ul>
      {/if}

      {#if chart.interpretations.retrograde_planets && chart.interpretations.retrograde_planets.length > 0}
        {#if Object.keys(chart.interpretations.retrograde_interpretations ?? {}).length > 0}
          <h3 class="interpretations-sub">Retrograde</h3>
          <ul class="interpretations-list">
            {#each Object.entries(chart.interpretations.retrograde_interpretations ?? {}) as [key, text]}
              <li class="interpretation-item">
                <strong class="interpretation-label">{key}</strong>
                <p class="interpretation-text">{text}</p>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </section>
  {/if}
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
      flex: 1;
      min-height: 0;
      max-height: 50vh;
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
    font-size: 0.82rem;
  }

  .house-interpretation-block {
    font-size: 0.82rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #21262d;
  }

  .house-interpretation-block:last-of-type {
    border-bottom: none;
  }

  .house-interpretation-header {
    margin: 0 0 0.25rem;
    font-size: 0.82rem;
    color: #e6edf3;
  }

  .house-interpretation-header strong {
    color: #79c0ff;
    font-weight: 600;
  }

  .house-cusp-sign {
    color: #a5d6ff;
    font-weight: 400;
    margin-left: 0.25em;
  }

  .house-planets-list {
    margin: 0 0 0.25rem;
    font-size: 0.72rem;
    color: #e6edf3;
  }

  .planet-house-interp {
    font-size: 0.62rem;
    margin: 0.12rem 0 0;
    color: #c9d1d9;
    line-height: 1.35;
  }

  .planet-house-interp strong {
    color: #79c0ff;
    font-weight: 500;
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
</style>
