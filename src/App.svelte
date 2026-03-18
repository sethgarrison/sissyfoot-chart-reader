<script lang="ts">
  import ChartCanvasSvg from "./lib/components/ChartCanvasSvg.svelte";
  import BirthDataForm from "./lib/components/BirthDataForm.svelte";
  import ReadingPanel from "./lib/components/ReadingPanel.svelte";
  import InteractiveReading from "./lib/components/InteractiveReading.svelte";
  import type { NatalChart, PlanetPlacement } from "./lib/models";
  import type { ChartApiParams } from "./lib/api/chartApi";

  let chart = $state<NatalChart | null>(null);
  let selectedPlanet = $state<PlanetPlacement | null>(null);
  let lastRequestParams = $state<ChartApiParams | null>(null);
  let readingMode = $state(false);
</script>

<div class="app-shell" class:result-view={!!chart}>
  {#if chart}
    {#if readingMode}
      <InteractiveReading {chart} onClose={() => (readingMode = false)} />
    {:else}
      <main class="main-content">
        <ChartCanvasSvg {chart} onPlanetSelect={(p) => (selectedPlanet = p)} />
      </main>
      <ReadingPanel
        {chart}
        {selectedPlanet}
        {lastRequestParams}
        onNewChart={() => { chart = null; selectedPlanet = null; lastRequestParams = null; readingMode = false; }}
        onStartReading={() => (readingMode = true)}
      />
    {/if}
  {:else}
    <BirthDataForm onChartFetched={(c, params) => { chart = c; lastRequestParams = params ?? null; }} />
  {/if}
</div>

<style>
  .app-shell {
    min-height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #ffffff;
    color: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .app-shell.result-view {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }

  .main-content {
    flex: 1;
    display: flex;
    padding: 1rem;
    min-width: 0;
  }

  @media (max-width: 768px) {
    .app-shell.result-view {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
      overflow-y: auto;
    }

    .main-content {
      flex: none;
      width: 100%;
      aspect-ratio: 1;
      min-height: 280px;
      padding: 0.5rem;
    }
  }
</style>
