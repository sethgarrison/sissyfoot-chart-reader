<script lang="ts">
  import type { NatalChart } from "../models";
  import { getAspectInterpretation, getPlanetInHouseInterpretation } from "../models/reading";
  import {
    buildReadingSlides,
    computeElementCounts,
    computeHemispheres,
    computeModalityCounts,
    computePlanetsByHouse,
    computeQuarters,
    getBigThree,
  } from "../reading";
  import type { ReadingSlide } from "../reading/slideTypes";
  import type { ElementDistributionData, QualityDistributionData } from "../types/data";

  const ELEMENT_BUCKET_KEYS: (keyof ElementDistributionData)[] = ["fire", "earth", "air", "water"];
  const QUALITY_BUCKET_KEYS: (keyof QualityDistributionData)[] = ["cardinal", "fixed", "mutable"];

  interface Props {
    chart: NatalChart;
    onClose: () => void;
  }
  let { chart, onClose }: Props = $props();

  let currentIndex = $state(0);
  const slides = $derived(buildReadingSlides(chart));
  const currentSlide = $derived(slides[currentIndex] ?? slides[0]);
  const totalSlides = $derived(slides.length);

  /** Element counts from API `chart_data` (geometry bucket), else computed from placements */
  const elements = $derived(
    chart.chartData?.by_element
      ? {
          fire: chart.chartData.by_element.fire.count,
          earth: chart.chartData.by_element.earth.count,
          air: chart.chartData.by_element.air.count,
          water: chart.chartData.by_element.water.count,
        }
      : computeElementCounts(chart)
  );
  const modalities = $derived(
    chart.chartData?.by_quality
      ? {
          cardinal: chart.chartData.by_quality.cardinal.count,
          fixed: chart.chartData.by_quality.fixed.count,
          mutable: chart.chartData.by_quality.mutable.count,
        }
      : computeModalityCounts(chart)
  );
  const byElement = $derived(chart.chartData?.by_element);
  const byQuality = $derived(chart.chartData?.by_quality);
  const modalityElementDist = $derived.by(() => {
    const ctx = chart.interpretation?.context;
    if (!ctx) return {} as Record<string, string>;
    return {
      [ctx.spatial_distribution.key]: ctx.spatial_distribution.interpretation,
      [ctx.quality_distribution.key]: ctx.quality_distribution.interpretation,
      [ctx.modality_distribution.key]: ctx.modality_distribution.interpretation,
    };
  });
  const elementDistInterps = $derived(Object.entries(modalityElementDist).filter(([k]) => k.startsWith("element_")));
  const qualityDistInterps = $derived(Object.entries(modalityElementDist).filter(([k]) => k.startsWith("quality_")));
  const hemispheres = $derived(computeHemispheres(chart));
  const quarters = $derived(computeQuarters(chart));
  const planetsByHouse = $derived(computePlanetsByHouse(chart));
  const bigThree = $derived(getBigThree(chart));
  const retrogradePlanets = $derived(
    chart.interpretation?.retrograde_planets ?? chart.planets.filter((p) => p.retrograde).map((p) => p.planet)
  );
  const retrogradeInterp = $derived(
    chart.interpretation?.retrograde_interpretations as Record<string, string> | undefined
  );

  function next() {
    if (currentIndex < totalSlides - 1) currentIndex++;
  }
  function prev() {
    if (currentIndex > 0) currentIndex--;
  }
  function goTo(i: number) {
    currentIndex = Math.max(0, Math.min(i, totalSlides - 1));
  }
</script>

<div class="reading-deck">
  <header class="deck-header">
    <button class="back-btn" onclick={onClose} aria-label="Back to chart">
      ← Back to Chart
    </button>
    <div class="slide-indicator">
      {currentIndex + 1} / {totalSlides}
    </div>
  </header>

  <main class="slide-area">
    {#if currentSlide}
      <article class="slide" data-kind={currentSlide.kind}>
        <h1 class="slide-title">{currentSlide.title}</h1>
        {#if currentSlide.subtitle}
          <p class="slide-subtitle">{currentSlide.subtitle}</p>
        {/if}

        {#if currentSlide.kind === "overview"}
          <div class="slide-content overview-content">
            <dl class="big-three">
              <dt>Sun</dt>
              <dd class="placement">
                {bigThree.sun.placement
                  ? `${bigThree.sun.placement.sign} ${bigThree.sun.placement.degrees}°${bigThree.sun.placement.minutes.toString().padStart(2, "0")}' · House ${bigThree.sun.placement.house}`
                  : "—"}
              </dd>
              {#if bigThree.sun.reading?.interpretation}
                <dd class="interp">{bigThree.sun.reading.interpretation}</dd>
              {/if}
              <dt>Moon</dt>
              <dd class="placement">
                {bigThree.moon.placement
                  ? `${bigThree.moon.placement.sign} ${bigThree.moon.placement.degrees}°${bigThree.moon.placement.minutes.toString().padStart(2, "0")}' · House ${bigThree.moon.placement.house}`
                  : "—"}
              </dd>
              {#if bigThree.moon.reading?.interpretation}
                <dd class="interp">{bigThree.moon.reading.interpretation}</dd>
              {/if}
              <dt>Rising</dt>
              <dd class="placement">{bigThree.ascendant.placement.sign}</dd>
              {#if bigThree.ascendant.reading?.interpretation}
                <dd class="interp">{bigThree.ascendant.reading.interpretation}</dd>
              {/if}
            </dl>
          </div>

          {:else if currentSlide.kind === "chart_type"}
            <div class="slide-content chart-type-content">
              <p class="placeholder-note">
                [Interpretation data: chart shape, hemispheres, quarters]
              </p>
              {#if chart.interpretation?.context?.shape}
                <div class="shape-section">
                  <p><strong>{chart.interpretation.context.shape.key}</strong></p>
                  <p>{chart.interpretation.context.shape.interpretation}</p>
                </div>
              {/if}
              <div class="distribution-grid">
                <section>
                  <h3>Hemispheres</h3>
                  <p>East (1–6): {hemispheres.eastern.length} · West (7–12): {hemispheres.western.length}</p>
                  <p>North (10–3): {hemispheres.northern.length} · South (4–9): {hemispheres.southern.length}</p>
                </section>
                <section>
                  <h3>Quarters</h3>
                  <p>1st (1–3): {quarters.first.length} · 2nd (4–6): {quarters.second.length}</p>
                  <p>3rd (7–9): {quarters.third.length} · 4th (10–12): {quarters.fourth.length}</p>
                </section>
              </div>
            </div>

          {:else if currentSlide.kind === "house_overview"}
            <div class="slide-content house-overview-content">
              <ul class="house-list">
                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as h}
                  {@const planetsInHouse = planetsByHouse.get(h) ?? []}
                  {@const houseCusp = chart.houses.find((x) => x.house === h)}
                  <li class="house-item">
                    <span class="house-num">House {h}</span>
                    <span class="house-cusp">{houseCusp?.sign ?? "—"}</span>
                    <span class="house-planets">
                      {planetsInHouse.length
                        ? planetsInHouse.map((p) => p.planet).join(", ")
                        : "—"}
                    </span>
                  </li>
                {/each}
              </ul>
            </div>

          {:else if currentSlide.kind === "retrograde"}
            <div class="slide-content retrograde-content">
              <p class="retrograde-intro">{retrogradePlanets.length} retrograde planet{retrogradePlanets.length !== 1 ? "s" : ""}: {retrogradePlanets.join(", ")}</p>
              {#if retrogradeInterp && Object.keys(retrogradeInterp).length > 0}
                <ul class="retrograde-list">
                  {#each Object.entries(retrogradeInterp ?? {}) as [key, text]}
                    <li class="retrograde-item">
                      <strong class="retrograde-label">{key}</strong>
                      <p class="retrograde-text">{text}</p>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="placeholder-note">[Retrograde interpretation text when available from API]</p>
              {/if}
            </div>

          {:else if currentSlide.kind === "planets_in_houses"}
            <div class="slide-content planets-in-houses-content">
              {#if currentSlide.planetInHouse}
                {@const pi = currentSlide.planetInHouse}
                {@const interp = getPlanetInHouseInterpretation(pi.planet, pi.house, chart.interpretation)}
                <p class="planet-house-label">{pi.planet} in House {pi.house}</p>
                {#if interp}
                  <p class="interpretation">{interp}</p>
                {:else}
                  <p class="placeholder-note">[Interpretation data: planet-in-house for this combination]</p>
                {/if}
              {/if}
            </div>

          {:else if currentSlide.kind === "element_overview"}
            <div class="slide-content element-overview-content">
              {#if byElement}
                <ul class="element-list">
                  {#each ELEMENT_BUCKET_KEYS as key}
                    {@const entry = byElement[key]}
                    {#if entry}
                      <li class="element-item">
                        <span class="element-label">{key.charAt(0).toUpperCase() + key.slice(1)}: {entry.count}</span>
                        <span class="element-signs">({entry.signs.join(", ")})</span>
                        {#if entry.interpretation}
                          <p class="element-interp">{entry.interpretation}</p>
                        {/if}
                      </li>
                    {/if}
                  {/each}
                </ul>
              {:else}
                <ul class="element-list">
                  <li>Fire: {elements.fire}</li>
                  <li>Earth: {elements.earth}</li>
                  <li>Air: {elements.air}</li>
                  <li>Water: {elements.water}</li>
                </ul>
              {/if}
              {#each Object.entries(modalityElementDist).filter(([k]) => k.startsWith("element_")) as [key, text]}
                <div class="modality-element-block">
                  <h4 class="modality-element-key">{key.replace("element_", "").replace(/_/g, " ")}</h4>
                  <p class="modality-element-text">{text}</p>
                </div>
              {/each}
            </div>

          {:else if currentSlide.kind === "modality_overview"}
            <div class="slide-content modality-overview-content">
              {#if byQuality}
                <ul class="modality-list">
                  {#each QUALITY_BUCKET_KEYS as key}
                    {@const entry = byQuality[key]}
                    {#if entry}
                      <li class="modality-item">
                        <span class="modality-label">{key.charAt(0).toUpperCase() + key.slice(1)}: {entry.count}</span>
                        <span class="modality-signs">({entry.signs.join(", ")})</span>
                        {#if entry.interpretation}
                          <p class="modality-interp">{entry.interpretation}</p>
                        {/if}
                      </li>
                    {/if}
                  {/each}
                </ul>
              {:else}
                <ul class="modality-list">
                  <li>Cardinal: {modalities.cardinal}</li>
                  <li>Fixed: {modalities.fixed}</li>
                  <li>Mutable: {modalities.mutable}</li>
                </ul>
              {/if}
            </div>

          {:else if currentSlide.kind === "aspects"}
            <div class="slide-content aspects-content">
              <p class="placeholder-note">
                [Interpretation data: aspect meanings — from API when available]
              </p>
              {#if chart.aspects.length > 0}
                <ul class="aspect-list">
                  {#each chart.aspects as a}
                    {@const interp = getAspectInterpretation(a, chart.interpretation)}
                    <li>
                      {a.planet1} – {a.planet2}
                      <span class="aspect-type">{a.type}</span>
                      {a.orb}°
                      {#if interp}
                        <p class="aspect-interp">{interp}</p>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {:else}
                <p>No major aspects.</p>
              {/if}
            </div>

          {:else if currentSlide.kind === "interesting_findings"}
            <div class="slide-content interesting-findings-content">
              <p class="placeholder-note">
                [Interpretation data: notable patterns — stellium, empty houses, etc.]
              </p>
              <p>Standout patterns will be highlighted here once interpretation tables are available.</p>
            </div>

          {:else}
            <div class="slide-content"><p>Unknown slide type.</p></div>
        {/if}
      </article>
    {/if}
  </main>

  <footer class="deck-footer">
    <button class="nav-btn prev" onclick={prev} disabled={currentIndex === 0}>
      Previous
    </button>
    <nav class="slide-dots" aria-label="Slide navigation">
      {#each slides as slide, i}
        <button
          class="dot"
          class:active={i === currentIndex}
          onclick={() => goTo(i)}
          aria-label="Go to slide {i + 1}"
        >
          {i + 1}
        </button>
      {/each}
    </nav>
    <button class="nav-btn next" onclick={next} disabled={currentIndex >= totalSlides - 1}>
      Next
    </button>
  </footer>
</div>

<style>
  .reading-deck {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .deck-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #30363d;
    flex-shrink: 0;
  }

  .back-btn {
    background: transparent;
    color: #58a6ff;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  .slide-indicator {
    font-size: 0.85rem;
    color: #8b949e;
  }

  .slide-area {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 2.5rem;
  }

  .slide {
    max-width: 42rem;
    margin: 0 auto;
  }

  .slide-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #e6edf3;
  }

  .slide-subtitle {
    margin: 0 0 1.5rem;
    font-size: 0.9rem;
    color: #8b949e;
  }

  .slide-content {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .placeholder-note {
    font-style: italic;
    color: #6e7681;
    margin-bottom: 1rem;
  }

  .big-three {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 1rem;
  }

  .big-three dt {
    color: #8b949e;
  }

  .big-three dd {
    margin: 0;
  }

  .distribution-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  .distribution-grid h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8b949e;
    margin: 0 0 0.5rem;
  }

  .distribution-grid p {
    margin: 0.25rem 0;
  }

  .house-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .house-item {
    display: grid;
    grid-template-columns: 80px 80px 1fr;
    gap: 0.5rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid #21262d;
  }

  .house-num {
    font-weight: 500;
  }

  .house-cusp {
    color: #8b949e;
  }

  .house-planets {
    color: #c9d1d9;
  }

  .planet-house-label {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .interpretation {
    margin: 0;
  }

  .element-list,
  .modality-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  .element-list li,
  .modality-list li {
    padding: 0.35rem 0;
    border-bottom: 1px solid #21262d;
  }

  .aspect-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .aspect-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #21262d;
  }

  .aspect-type {
    color: #58a6ff;
    margin: 0 0.5rem;
    text-transform: capitalize;
  }

  .aspect-interp {
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    color: #8b949e;
  }

  .deck-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-top: 1px solid #30363d;
    flex-shrink: 0;
    gap: 1rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    background: #21262d;
    color: #c9d1d9;
    border: 1px solid #30363d;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-btn:hover:not(:disabled) {
    background: #30363d;
    color: #e6edf3;
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .slide-dots {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .dot {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: transparent;
    color: #8b949e;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .dot:hover {
    background: #21262d;
    color: #c9d1d9;
  }

  .dot.active {
    background: #58a6ff;
    border-color: #58a6ff;
    color: #ffffff;
  }
</style>
