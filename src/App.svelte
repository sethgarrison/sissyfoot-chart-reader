<script lang="ts">
  import { onMount } from "svelte";
  import ChartCanvasSvg from "./lib/components/ChartCanvasSvg.svelte";
  import BirthDataForm from "./lib/components/BirthDataForm.svelte";
  import ReadingPanel from "./lib/components/ReadingPanel.svelte";
  import ScrollReadingView from "./lib/components/ScrollReadingView.svelte";
  import type { NatalChart, PlanetPlacement } from "./lib/models";
  import { fetchChart, type ChartApiParams } from "./lib/api/chartApi";
  import {
    clearChartShareFromUrl,
    parseChartParamsFromSearchParams,
    replaceUrlWithChartParams,
  } from "./lib/chart/chartShareUrl";

  let chart = $state<NatalChart | null>(null);
  let selectedPlanet = $state<PlanetPlacement | null>(null);
  let lastRequestParams = $state<ChartApiParams | null>(null);
  let readingMode = $state(false);

  const chartParamsFromUrl =
    typeof window !== "undefined"
      ? parseChartParamsFromSearchParams(new URLSearchParams(window.location.search))
      : null;

  let urlFetchPending = $state(!!chartParamsFromUrl);
  let urlFetchError = $state<string | null>(null);

  onMount(() => {
    if (!chartParamsFromUrl) {
      urlFetchPending = false;
      return;
    }
    fetchChart(chartParamsFromUrl)
      .then((c) => {
        chart = c;
        lastRequestParams = chartParamsFromUrl;
        replaceUrlWithChartParams(chartParamsFromUrl);
      })
      .catch((e) => {
        urlFetchError = e instanceof Error ? e.message : "Could not load chart from link.";
      })
      .finally(() => {
        urlFetchPending = false;
      });
  });

  function handleChartFetched(c: NatalChart, params?: ChartApiParams) {
    chart = c;
    selectedPlanet = null;
    lastRequestParams = params ?? null;
    readingMode = false;
    if (params) replaceUrlWithChartParams(params);
    else clearChartShareFromUrl();
  }

  function handleNewChart() {
    chart = null;
    selectedPlanet = null;
    lastRequestParams = null;
    readingMode = false;
    urlFetchError = null;
    clearChartShareFromUrl();
  }
</script>

<div class="app-shell" class:result-view={!!chart}>
  {#if chart}
    {#if readingMode}
      <ScrollReadingView {chart} onClose={() => (readingMode = false)} />
    {:else}
      <main class="main-content">
        <ChartCanvasSvg {chart} onPlanetSelect={(p) => (selectedPlanet = p)} />
      </main>
      <ReadingPanel
        {chart}
        {selectedPlanet}
        {lastRequestParams}
        onNewChart={handleNewChart}
        onStartReading={() => (readingMode = true)}
      />
    {/if}
  {:else if urlFetchPending}
    <div class="url-bootstrap">
      <p>Loading chart from link…</p>
    </div>
  {:else}
    <div class="form-entry">
      {#if urlFetchError}
        <p class="url-bootstrap-error" role="alert">{urlFetchError}</p>
      {/if}
      <BirthDataForm onChartFetched={handleChartFetched} />
    </div>
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

  .url-bootstrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .url-bootstrap p {
    margin: 0;
    color: #8b949e;
    font-size: 1rem;
  }

  .form-entry {
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    padding: 1.25rem 1rem 2rem;
  }

  .url-bootstrap-error {
    max-width: 28rem;
    margin: 0 auto 1.25rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background: #3d1111;
    border: 1px solid #f85149;
    color: #ffa198;
    font-size: 0.9rem;
    line-height: 1.45;
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
