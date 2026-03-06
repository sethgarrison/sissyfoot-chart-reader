<script lang="ts">
  import ChartCanvas from "./lib/components/ChartCanvas.svelte";
  import BirthDataForm from "./lib/components/BirthDataForm.svelte";
  import ReadingPanel from "./lib/components/ReadingPanel.svelte";
  import type { NatalChart, PlanetPlacement } from "./lib/models";
  import type { ChartApiParams } from "./lib/api/chartApi";

  let chart = $state<NatalChart | null>(null);
  let selectedPlanet = $state<PlanetPlacement | null>(null);
  let lastRequestParams = $state<ChartApiParams | null>(null);
</script>

<div class="app-shell" class:result-view={!!chart}>
  {#if chart}
    <main class="main-content">
      <ChartCanvas {chart} onPlanetSelect={(p) => (selectedPlanet = p)} />
    </main>
    <ReadingPanel {chart} {selectedPlanet} {lastRequestParams} onNewChart={() => { chart = null; selectedPlanet = null; lastRequestParams = null; }} />
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
    height: 100vh;
  }

  .main-content {
    flex: 1;
    display: flex;
    padding: 1rem;
    min-width: 0;
  }
</style>
