<script lang="ts">
  import { onMount } from "svelte";
  import { ChartRenderer } from "../chart";
  import type { NatalChart, PlanetPlacement } from "../models";

  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;
  let renderer = $state<ChartRenderer | undefined>(undefined);

  interface Props {
    chart?: NatalChart | null;
    onPlanetSelect?: (planet: PlanetPlacement) => void;
  }
  let { chart = null, onPlanetSelect }: Props = $props();

  $effect(() => {
    if (chart && renderer) {
      renderer.setChart(chart, { onPlanetClick: onPlanetSelect ?? undefined });
    }
  });

  onMount(() => {
    const r = new ChartRenderer();
    let mounted = true;

    const w = wrapperEl.clientWidth;
    const h = wrapperEl.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          r.resize(width, height);
          if (chart) r.setChart(chart, { onPlanetClick: onPlanetSelect ?? undefined });
        }
      }
    });

    let removeListeners: (() => void) | null = null;

    r.init({
      canvas: canvasEl,
      width: w,
      height: h,
      onPlanetClick: onPlanetSelect,
    }).then(() => {
      if (!mounted) return;
      renderer = r;
      ro.observe(wrapperEl);

      let isPanning = false;
      let lastX = 0;
      let lastY = 0;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        r.zoom(e.deltaY);
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
        r.pan(dx, dy);
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
      r.destroy();
      renderer = undefined;
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
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
