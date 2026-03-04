<script lang="ts">
  import ChartCanvas from "./lib/components/ChartCanvas.svelte";
  import BirthDataForm from "./lib/components/BirthDataForm.svelte";
  import ReadingPanel from "./lib/components/ReadingPanel.svelte";
  import type { NatalChart } from "./lib/models";

  let chart = $state<NatalChart | null>(null);
</script>

<div class="app-shell" class:result-view={!!chart}>
  {#if chart}
    <main class="main-content">
      <ChartCanvas {chart} />
    </main>
    <ReadingPanel {chart} onNewChart={() => (chart = null)} />
  {:else}
    <BirthDataForm onChartFetched={(c) => (chart = c)} />
  {/if}
</div>

<style>
  .app-shell {
    min-height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #0d1117;
    color: #c9d1d9;
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
