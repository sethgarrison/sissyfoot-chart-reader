<script lang="ts">
  import { onMount } from "svelte";
  import ChartSvg from "../chart/ChartSvg.svelte";
  import { signTotalDegrees, eclipticToAngle } from "../chart/chart-utils";
  import type { NatalChart, PlanetPlacement } from "../models";

  let wrapperEl: HTMLDivElement;
  let width = $state(400);
  let height = $state(400);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.15;

  let scale = $state(1);
  let panX = $state(0);
  let panY = $state(0);

  interface Props {
    chart?: NatalChart | null;
    onPlanetSelect?: (planet: PlanetPlacement) => void;
  }
  let { chart = null, onPlanetSelect }: Props = $props();

  function zoom(delta: number) {
    const factor = 1 + (delta > 0 ? ZOOM_STEP : -ZOOM_STEP);
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * factor));
  }

  function pan(dx: number, dy: number) {
    panX += dx;
    panY += dy;
  }

  function resetView() {
    scale = 1;
    panX = 0;
    panY = 0;
  }

  function focusOnPlanet(planet: PlanetPlacement) {
    if (!chart) return;
    const r = Math.min(width, height) * 0.42;
    const planetRadius = r * 0.45;
    const totalDeg = signTotalDegrees(planet.sign, planet.degrees, planet.minutes);
    const a = eclipticToAngle(totalDeg, chart);
    panX = -Math.cos(a) * planetRadius;
    panY = -Math.sin(a) * planetRadius;
    scale = 2.5;
  }

  function handlePlanetSelect(planet: PlanetPlacement) {
    onPlanetSelect?.(planet);
    focusOnPlanet(planet);
  }

  onMount(() => {
    if (!wrapperEl) return;
    width = wrapperEl.clientWidth;
    height = wrapperEl.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          width = w;
          height = h;
        }
      }
    });
    ro.observe(wrapperEl);

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      pan(dx, dy);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 0) {
        isPanning = false;
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      }
    };

    wrapperEl.addEventListener("wheel", onWheel, { passive: false });
    wrapperEl.addEventListener("pointerdown", onPointerDown);
    wrapperEl.addEventListener("pointermove", onPointerMove);
    wrapperEl.addEventListener("pointerup", onPointerUp);
    wrapperEl.addEventListener("pointercancel", onPointerUp);

    return () => {
      ro.disconnect();
      wrapperEl.removeEventListener("wheel", onWheel);
      wrapperEl.removeEventListener("pointerdown", onPointerDown);
      wrapperEl.removeEventListener("pointermove", onPointerMove);
      wrapperEl.removeEventListener("pointerup", onPointerUp);
      wrapperEl.removeEventListener("pointercancel", onPointerUp);
    };
  });
</script>

<div class="chart-canvas-wrapper" bind:this={wrapperEl}>
  <ChartSvg
    {chart}
    {width}
    {height}
    {scale}
    {panX}
    {panY}
    onPlanetSelect={handlePlanetSelect}
  />
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

  .chart-canvas-wrapper :global(svg) {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }
</style>
