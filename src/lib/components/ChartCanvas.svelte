<script lang="ts">
  import { onMount } from "svelte";
  import { ChartRenderer } from "../chart";
  import type { NatalChart } from "../models";

  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;
  let renderer: ChartRenderer;

  interface Props {
    chart?: NatalChart | null;
  }
  let { chart = null }: Props = $props();

  $effect(() => {
    if (chart) renderer?.setChart(chart);
  });

  onMount(() => {
    renderer = new ChartRenderer();
    let mounted = true;

    const w = wrapperEl.clientWidth;
    const h = wrapperEl.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          renderer.resize(width, height);
          if (chart) renderer.setChart(chart);
        }
      }
    });

    let removeListeners: (() => void) | null = null;

    renderer.init({ canvas: canvasEl, width: w, height: h }).then(() => {
      if (!mounted) return;
      if (chart) renderer.setChart(chart);
      ro.observe(wrapperEl);

      let isPanning = false;
      let lastX = 0;
      let lastY = 0;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        renderer.zoom(e.deltaY);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isPanning) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        renderer.pan(dx, dy);
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.button === 0) {
          isPanning = false;
          (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
        }
      };

      canvasEl.addEventListener("wheel", onWheel, { passive: false });
      canvasEl.addEventListener("pointerdown", onPointerDown);
      canvasEl.addEventListener("pointermove", onPointerMove);
      canvasEl.addEventListener("pointerup", onPointerUp);
      canvasEl.addEventListener("pointercancel", onPointerUp);

      removeListeners = () => {
        canvasEl.removeEventListener("wheel", onWheel);
        canvasEl.removeEventListener("pointerdown", onPointerDown);
        canvasEl.removeEventListener("pointermove", onPointerMove);
        canvasEl.removeEventListener("pointerup", onPointerUp);
        canvasEl.removeEventListener("pointercancel", onPointerUp);
      };
    });

    return () => {
      mounted = false;
      ro.disconnect();
      removeListeners?.();
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
