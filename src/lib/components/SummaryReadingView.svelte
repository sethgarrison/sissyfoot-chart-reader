<script lang="ts">
  import type { NatalChart } from "../models";
  import { normalizeChartHouse } from "../models/reading";
  import type {
    InterpretationsSummary,
    HouseGroupSummary,
    SummaryPlacement,
    SummaryAspectItem,
  } from "../models/interpretationsSummary";
  import { getBigThree } from "../reading";

  interface Props {
    chart: NatalChart;
    onClose: () => void;
  }
  let { chart, onClose }: Props = $props();

  const summary = $derived(chart.interpretations_summary);
  const bigThree = $derived(getBigThree(chart));

  /** Until the API omits empty houses, drop groups with no placements or no chart bodies in that house. */
  const houseGroupsToShow = $derived.by(() => {
    const groups = summary?.house_groups ?? [];
    const occupied = new Set(
      [
        ...chart.planets.map((p) => normalizeChartHouse(p.house)),
        ...(chart.lunarNodes ?? []).map((n) => normalizeChartHouse(n.house)),
      ].filter((h): h is number => h != null)
    );
    return groups.filter((hg) => {
      if ((hg.placements?.length ?? 0) === 0) return false;
      const h = normalizeChartHouse(hg.house);
      return h != null && occupied.has(h);
    });
  });

  function houseHeading(hg: HouseGroupSummary): string {
    if (hg.house_keyword) return `House ${hg.house}: ${hg.house_keyword}`;
    return hg.sign_on_cusp ? `House ${hg.house} · ${hg.sign_on_cusp}` : `House ${hg.house}`;
  }

  function aspectLabel(a: SummaryAspectItem): string {
    if (a.aspect.toLowerCase() === "conjunction") {
      return `${a.aspect} → ${a.synthesis}`;
    }
    return `${a.aspect} to ${a.other_body}: ${a.synthesis}`;
  }
</script>

<div class="summary-reading">
  <header class="summary-header">
    <button class="back-btn" onclick={onClose} aria-label="Back to chart">← Back to Chart</button>
  </header>

  <main class="summary-scroll">
    {#if summary}
      {#if summary.chart_context}
        {@const ctx = summary.chart_context}
        <section class="summary-section chart-context">
          <h2 class="section-title">Chart Context</h2>
          {#if ctx.shape}
            <div class="context-block shape-block">
              <h3 class="context-label">Chart Shape</h3>
              <p class="context-text">{ctx.shape.interpretation}</p>
            </div>
          {/if}
          {#if ctx.concentration && Object.keys(ctx.concentration).length > 0}
            <div class="context-block">
              <h3 class="context-label">Hemisphere / Quadrant</h3>
              {#each Object.entries(ctx.concentration) as [key, text]}
                <p class="context-text"><strong>{key.replace(/_/g, " ")}:</strong> {text}</p>
              {/each}
            </div>
          {/if}
          {#if ctx.modality_element && Object.keys(ctx.modality_element).length > 0}
            <div class="context-block">
              <h3 class="context-label">Elements & Modalities</h3>
              {#each Object.entries(ctx.modality_element) as [key, text]}
                <p class="context-text"><strong>{key.replace(/_/g, " ")}:</strong> {text}</p>
              {/each}
            </div>
          {/if}
        </section>
      {/if}

      {#each houseGroupsToShow as hg}
        <section class="summary-section house-section">
          <h2 class="section-title">{houseHeading(hg)}</h2>
          {#each hg.placements as placement}
            <div class="placement-block">
              <p class="placement-line">
                <span class="placement-body">{placement.body}{placement.retrograde ? " Rx" : ""}:</span>
                <span class="placement-synthesis">{placement.synthesis}</span>
              </p>
              {#if placement.long?.in_sign || placement.long?.in_house}
                <details class="placement-long">
                  <summary>Read more</summary>
                  {#if placement.long?.in_sign}
                    <p class="long-text">{placement.long.in_sign}</p>
                  {/if}
                  {#if placement.long?.in_house}
                    <p class="long-text">{placement.long.in_house}</p>
                  {/if}
                </details>
              {/if}
              {#if placement.aspects?.length > 0}
                <ul class="aspect-list">
                  {#each placement.aspects as aspect}
                    <li class="aspect-item">
                      {#if aspect.interpretation}
                        <details>
                          <summary>{aspectLabel(aspect)}</summary>
                          <p class="aspect-interp">{aspect.interpretation}</p>
                        </details>
                      {:else}
                        <span>{aspectLabel(aspect)}</span>
                      {/if}
                      {#if aspect.is_placeholder}
                        <span class="placeholder-badge">draft</span>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/each}
        </section>
      {/each}

      {#if summary.big_three}
        {@const bt = summary.big_three}
        <section class="summary-section big-three-section">
          <h2 class="section-title">Big Three</h2>
          {#if bigThree.sun && bt.sun?.[bigThree.sun.sign]}
            {@const sunEntry = bt.sun[bigThree.sun.sign]}
            <div class="big-three-block">
              <h3 class="bt-label">Sun in {bigThree.sun.sign}</h3>
              {#if sunEntry.interpretation}
                <p class="bt-text">{sunEntry.interpretation}</p>
              {/if}
              {#if sunEntry.archetypes_balanced}
                <p class="bt-text"><strong>Archetypes (balanced):</strong> {sunEntry.archetypes_balanced}</p>
              {/if}
              {#if sunEntry.archetypes_unbalanced}
                <p class="bt-text"><strong>Archetypes (unbalanced):</strong> {sunEntry.archetypes_unbalanced}</p>
              {/if}
              {#if sunEntry.journey}
                <p class="bt-text"><strong>Journey:</strong> {sunEntry.journey}</p>
              {/if}
              {#if sunEntry.gifts}
                <p class="bt-text"><strong>Gifts:</strong> {sunEntry.gifts}</p>
              {/if}
              {#if sunEntry.challenges}
                <p class="bt-text"><strong>Challenges:</strong> {sunEntry.challenges}</p>
              {/if}
            </div>
          {/if}
          {#if bigThree.moon && bt.moon?.[bigThree.moon.sign]}
            {@const moonEntry = bt.moon[bigThree.moon.sign]}
            <div class="big-three-block">
              <h3 class="bt-label">Moon in {bigThree.moon.sign}</h3>
              {#if moonEntry.interpretation}
                <p class="bt-text">{moonEntry.interpretation}</p>
              {/if}
              {#if moonEntry.nature}
                <p class="bt-text"><strong>Nature:</strong> {moonEntry.nature}</p>
              {/if}
              {#if moonEntry.sources_of_contentment}
                <p class="bt-text"><strong>Sources of contentment:</strong> {moonEntry.sources_of_contentment}</p>
              {/if}
              {#if moonEntry.keywords}
                <p class="bt-text"><strong>Keywords:</strong> {moonEntry.keywords}</p>
              {/if}
            </div>
          {/if}
          {#if bigThree.rising && bt.ascendant?.[bigThree.rising.sign]}
            {@const ascEntry = bt.ascendant[bigThree.rising.sign]}
            <div class="big-three-block">
              <h3 class="bt-label">Ascendant in {bigThree.rising.sign}</h3>
              {#if ascEntry.interpretation}
                <p class="bt-text">{ascEntry.interpretation}</p>
              {/if}
              {#if ascEntry.impression}
                <p class="bt-text"><strong>Impression:</strong> {ascEntry.impression}</p>
              {/if}
              {#if ascEntry.appearance}
                <p class="bt-text"><strong>Appearance:</strong> {ascEntry.appearance}</p>
              {/if}
              {#if ascEntry.childhood}
                <p class="bt-text"><strong>Childhood:</strong> {ascEntry.childhood}</p>
              {/if}
              {#if ascEntry.balance}
                <p class="bt-text"><strong>Balance:</strong> {ascEntry.balance}</p>
              {/if}
            </div>
          {/if}
        </section>
      {/if}
    {:else}
      <p class="no-summary">No interpretations summary available for this chart. The API may not yet return <code>interpretations_summary</code>.</p>
    {/if}
  </main>
</div>

<style>
  .summary-reading {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .summary-header {
    flex-shrink: 0;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #30363d;
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

  .summary-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 2rem;
  }

  .summary-section {
    margin-bottom: 2rem;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e6edf3;
    margin: 0 0 1rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #30363d;
  }

  .placement-block {
    margin-bottom: 1.25rem;
  }

  .placement-line {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .placement-body {
    font-weight: 600;
    color: #e6edf3;
    margin-right: 0.35rem;
  }

  .placement-synthesis {
    color: #c9d1d9;
  }

  .placement-long {
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .placement-long summary {
    cursor: pointer;
    color: #58a6ff;
  }

  .long-text {
    margin: 0.5rem 0 0;
    padding-left: 1rem;
    border-left: 2px solid #30363d;
  }

  .aspect-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 1rem;
  }

  .aspect-item {
    font-size: 0.9rem;
    padding: 0.25rem 0;
    color: #8b949e;
  }

  .aspect-item details summary {
    cursor: pointer;
  }

  .aspect-interp {
    margin: 0.35rem 0 0 0.5rem;
    font-size: 0.85rem;
    color: #c9d1d9;
    line-height: 1.4;
  }

  .placeholder-badge {
    font-size: 0.7rem;
    color: #6e7681;
    margin-left: 0.5rem;
  }

  .chart-context .context-block {
    margin-bottom: 1.25rem;
  }

  .context-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem;
  }

  .context-text {
    margin: 0.25rem 0;
    font-size: 0.95rem;
  }

  .big-three-block {
    margin-bottom: 1.5rem;
  }

  .bt-label {
    font-size: 1rem;
    font-weight: 600;
    color: #e6edf3;
    margin: 0 0 0.5rem;
  }

  .bt-text {
    margin: 0.35rem 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .no-summary {
    max-width: 42rem;
    margin: 2rem auto;
    color: #8b949e;
  }

  .no-summary code {
    background: #21262d;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
</style>
