<script lang="ts">
  import { onMount } from "svelte";
  import { ChartRenderer } from "../chart";
  import { SAMPLE_CHART } from "../models";
  import type { NatalChart } from "../models";

  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;
  let renderer: ChartRenderer;

  interface Props {
    chart?: NatalChart;
  }
  let { chart = SAMPLE_CHART }: Props = $props();

  onMount(() => {
    renderer = new ChartRenderer();

    const w = wrapperEl.clientWidth;
    const h = wrapperEl.clientHeight;

    renderer.init({ canvas: canvasEl, width: w, height: h }).then(() => {
      if (chart) renderer.setChart(chart);
    });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          renderer.resize(width, height);
          if (chart) renderer.setChart(chart);
        }
      }
    });
    ro.observe(wrapperEl);

    return () => {
      ro.disconnect();
      renderer.destroy();
    };
  });
</script>

<div class="chart-canvas-wrapper" bind:this={wrapperEl}>
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .chart-canvas-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d1117;
    border-radius: 8px;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
