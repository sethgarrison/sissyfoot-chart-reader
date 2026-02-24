<script lang="ts">
  import { onMount } from "svelte";
  import ChartCanvas from "./lib/components/ChartCanvas.svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import { fetchChart } from "./lib/api/chartApi";
  import type { NatalChart } from "./lib/models";

  let chart = $state<NatalChart | null>(null);

  onMount(() => {
    fetchChart({
      year: 1970,
      month: 8,
      day: 8,
      hour: 17,
      min: 55,
      city: "Bakersfield,CA",
      nation: "US",
    })
      .then((c) => (chart = c))
      .catch(() => {});
  });
</script>

<div class="app-shell">
  <Sidebar bind:chart />
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
