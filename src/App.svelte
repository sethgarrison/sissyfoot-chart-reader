<script lang="ts">
  import ChartCanvas from "./lib/components/ChartCanvas.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import { SAMPLE_CHART } from "./lib/models";

  const chart = SAMPLE_CHART;
</script>

<div class="app-shell">
  <Sidebar {chart} />
  <main class="main-content">
    <ChartCanvas {chart} />
  </main>
</div>

<style>
  .app-shell {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .main-content {
    flex: 1;
    display: flex;
    padding: 1rem;
    min-width: 0;
  }
</style>
