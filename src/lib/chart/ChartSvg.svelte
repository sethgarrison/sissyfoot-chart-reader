<script lang="ts">
  import {
    eclipticToAngle,
    signTotalDegrees,
    getHouseCuspAngles,
    arcMidAngle,
    wedgePath,
    hexToCss,
    signColor,
    planetDotColor,
    planetGlyph,
    lunarNodeGlyph,
    ZODIAC_SIGNS,
  } from "./chart-utils";
  import { mergeChartTheme, type ChartTheme, type DeepPartial } from "./theme";
  import type { NatalChart, PlanetPlacement } from "../models/reading";

  interface Props {
    chart?: NatalChart | null;
    width: number;
    height: number;
    scale?: number;
    panX?: number;
    panY?: number;
    theme?: DeepPartial<ChartTheme>;
    onPlanetSelect?: (planet: PlanetPlacement) => void;
  }
  let {
    chart = null,
    width,
    height,
    scale = 1,
    panX = 0,
    panY = 0,
    theme: themeOverride,
    onPlanetSelect,
  }: Props = $props();

  const theme = $derived(mergeChartTheme(themeOverride ?? {}));
  const cx = $derived(width / 2);
  const cy = $derived(height / 2);
  const r = $derived(Math.min(width, height) * 0.42);
  const signRingHeight = $derived(r * 0.12);
  const innerRadius = $derived(r - signRingHeight);
  const houseRadius = $derived(innerRadius);
  const planetGlyphRadius = $derived((innerRadius + r) / 2);
  const centerR = $derived(r * 0.06);
  const outerEdge = $derived(r + signRingHeight);

  const transform = $derived(
    `translate(${cx + panX}, ${cy + panY}) scale(${scale}) translate(${-cx}, ${-cy})`
  );

  const angle = (deg: number) => eclipticToAngle(deg, chart);
  const cuspAngles = $derived(getHouseCuspAngles(chart));

  const signFontSize = $derived(Math.max(20, r * 0.12));
  const houseFontSize = $derived(Math.max(10, r * 0.06));
  const planetFontSize = $derived(Math.max(18, r * 0.1));
  const tooltipFontSize = $derived(Math.max(12, r * 0.055));
  const angleFontSize = $derived(Math.max(10, r * 0.055));

  let hoveredSign = $state<string | null>(null);
  let hoveredPlanet = $state<string | null>(null);
  let hoveredNode = $state<string | null>(null);

  function handlePlanetClick(p: PlanetPlacement) {
    onPlanetSelect?.(p);
  }

  function setHoveredSign(name: string | null) {
    hoveredSign = name;
  }

  function setHoveredPlanet(planet: string | null) {
    hoveredPlanet = planet;
  }

  function setHoveredNode(node: string | null) {
    hoveredNode = node;
  }
</script>

<svg
  class="chart-svg"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
  role="img"
  aria-label={chart ? "Natal chart" : "Empty chart wheel"}
>
  <g class="chart-transform" transform={transform}>
    <!-- 0. Sign ring background (slim outer ring) -->
    {#each ZODIAC_SIGNS as zodiacSign}
      {@const startAngle = angle(zodiacSign.degreesStart)}
      {@const endAngle = angle(zodiacSign.degreesEnd)}
      {@const fillColor = signColor(zodiacSign, theme)}
      <path
        class="sign-ring-segment"
        d={wedgePath(cx, cy, r, r + signRingHeight, startAngle, endAngle)}
        fill={hexToCss(fillColor)}
        fill-opacity={theme.signs.segmentFillAlpha}
      />
    {/each}

    <!-- 1. Zodiac segments -->
    {#each ZODIAC_SIGNS as zodiacSign}
      {@const startAngle = angle(zodiacSign.degreesStart)}
      {@const endAngle = angle(zodiacSign.degreesEnd)}
      {@const fillColor = signColor(zodiacSign, theme)}
      <g
        class="zodiac-segment-group"
        role="img"
        aria-label="Zodiac segment {zodiacSign.name}"
        onmouseenter={() => setHoveredSign(zodiacSign.name)}
        onmouseleave={() => setHoveredSign(null)}
      >
        <path
          class="zodiac-segment"
          class:sign-hover={hoveredSign === zodiacSign.name}
          d={wedgePath(cx, cy, innerRadius, r, startAngle, endAngle)}
          fill={hexToCss(fillColor)}
          fill-opacity={theme.signs.segmentFillAlpha}
        />
      </g>
    {/each}

    <!-- 2. House wedges (center to inner edge of zodiac) with numbers in each wedge -->
    {#if chart?.houses && chart.houses.length >= 12}
      {#each cuspAngles as _, i}
        {@const startAngle = cuspAngles[i]}
        {@const endAngle = cuspAngles[(i + 1) % 12]}
        {@const rulingSign = ZODIAC_SIGNS[i]}
        {@const color = signColor(rulingSign, theme)}
        <path
          class="house-segment"
          d={wedgePath(cx, cy, centerR, houseRadius, startAngle, endAngle)}
          fill={hexToCss(color)}
          fill-opacity={theme.chart.houseFillAlpha}
        />
      {/each}
      {#each cuspAngles as _, i}
        {@const midAngle = arcMidAngle(cuspAngles[i], cuspAngles[(i + 1) % 12])}
        {@const labelRadius = (centerR + houseRadius) / 2}
        {@const labelX = cx + Math.cos(midAngle) * labelRadius}
        {@const labelY = cy + Math.sin(midAngle) * labelRadius}
        <text
          class="house-label"
          x={labelX}
          y={labelY}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={houseFontSize}
          fill={hexToCss(theme.chart.labelMuted)}
        >
          {i + 1}
        </text>
      {/each}
    {/if}

    <!-- 3. Wheel strokes -->
    <circle class="wheel-stroke" cx={cx} cy={cy} r={r + signRingHeight} fill="none" stroke={hexToCss(theme.chart.wheelStroke)} stroke-width="2" />
    <circle class="wheel-stroke" cx={cx} cy={cy} r={r} fill="none" stroke={hexToCss(theme.chart.wheelStroke)} stroke-width="1.5" />
    <circle class="wheel-stroke" cx={cx} cy={cy} r={innerRadius} fill="none" stroke={hexToCss(theme.chart.wheelStroke)} stroke-width="1.5" />
    <circle class="center-dot" cx={cx} cy={cy} r={centerR} fill={hexToCss(theme.chart.centerFill)} stroke={hexToCss(theme.chart.centerStroke)} stroke-width="1" />

    <!-- 4. House cusp lines -->
    {#each cuspAngles as cuspAngle}
      <line
        class="house-cusp"
        x1={cx + Math.cos(cuspAngle) * centerR}
        y1={cy + Math.sin(cuspAngle) * centerR}
        x2={cx + Math.cos(cuspAngle) * outerEdge}
        y2={cy + Math.sin(cuspAngle) * outerEdge}
        stroke={hexToCss(0x000000)}
        stroke-width="1.5"
      />
    {/each}

    <!-- 5. Zodiac dividers -->
    {#each ZODIAC_SIGNS as zodiacSign}
      {@const a = angle(zodiacSign.degreesStart)}
      <line
        x1={cx + Math.cos(a) * centerR}
        y1={cy + Math.sin(a) * centerR}
        x2={cx + Math.cos(a) * outerEdge}
        y2={cy + Math.sin(a) * outerEdge}
        stroke={hexToCss(0x000000)}
        stroke-width="1.5"
      />
    {/each}

    <!-- 6. Tick marks (at zodiac outer edge) -->
    {#each ZODIAC_SIGNS as zodiacSign}
      {@const tickLength = signRingHeight * 0.5}
      {@const a = angle(zodiacSign.degreesStart)}
      <line
        x1={cx + Math.cos(a) * r}
        y1={cy + Math.sin(a) * r}
        x2={cx + Math.cos(a) * (r + tickLength)}
        y2={cy + Math.sin(a) * (r + tickLength)}
        stroke={hexToCss(0x000000)}
        stroke-width="1.5"
      />
    {/each}

    <!-- 7. Sign labels (outer slim ring) -->
    {#each ZODIAC_SIGNS as zodiacSign}
      {@const midAngle = angle(zodiacSign.degreesStart + 15)}
      {@const labelR = r + signRingHeight / 2}
      {@const labelX = cx + Math.cos(midAngle) * labelR}
      {@const labelY = cy + Math.sin(midAngle) * labelR}
      <g
        class="sign-label"
        role="img"
        aria-label="Sign {zodiacSign.name}"
        transform="translate({labelX},{labelY})"
        onmouseenter={() => setHoveredSign(zodiacSign.name)}
        onmouseleave={() => setHoveredSign(null)}
      >
        <g transform={hoveredSign === zodiacSign.name ? "scale(1.2)" : ""}>
          <text
            class="sign-glyph"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#ffffff"
            font-size={signFontSize}
          >
            {zodiacSign.astronomiconChar}
          </text>
        </g>
        {#if hoveredSign === zodiacSign.name}
          <text
            class="sign-tooltip"
            text-anchor="middle"
            y="-18"
            font-size={tooltipFontSize}
            fill={hexToCss(theme.planets.tooltip)}
          >
            {zodiacSign.name}
          </text>
        {/if}
      </g>
    {/each}

    <!-- 8. Angle markers (ASC, MC, DSC) -->
    {#if chart}
      {@const ascDeg = signTotalDegrees(chart.ascendant.sign, chart.ascendant.degrees, chart.ascendant.minutes)}
      {@const mcDeg = signTotalDegrees(chart.midheaven.sign, chart.midheaven.degrees, chart.midheaven.minutes)}
      {@const dscDeg = (ascDeg + 180) % 360}
      {@const tickLen = signRingHeight}
      {@const labelRadius = r + signRingHeight + Math.max(14, r * 0.04)}
      {#each [["ASC", ascDeg], ["MC", mcDeg], ["DSC", dscDeg]] as [label, totalDeg]}
        {@const a = angle(totalDeg)}
        <line
          x1={cx + Math.cos(a) * r}
          y1={cy + Math.sin(a) * r}
          x2={cx + Math.cos(a) * (r + signRingHeight)}
          y2={cy + Math.sin(a) * (r + signRingHeight)}
          stroke={hexToCss(theme.angles.tickStroke)}
          stroke-opacity="0.9"
          stroke-width="1.5"
        />
        <text
          x={cx + Math.cos(a) * labelRadius}
          y={cy + Math.sin(a) * labelRadius}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={angleFontSize}
          fill={hexToCss(theme.angles.labelFill)}
          font-weight="600"
        >
          {label}
        </text>
      {/each}
    {/if}

    <!-- 9. Aspect lines (from planet dots on inner rim) -->
    {#if chart}
      {@const aspectRadius = innerRadius}
      {#each chart.aspects as a}
        {@const p1 = chart.planets.find((p) => p.planet === a.planet1)}
        {@const p2 = chart.planets.find((p) => p.planet === a.planet2)}
        {#if p1 && p2}
          {@const deg1 = signTotalDegrees(p1.sign, p1.degrees, p1.minutes)}
          {@const deg2 = signTotalDegrees(p2.sign, p2.degrees, p2.minutes)}
          {@const a1 = angle(deg1)}
          {@const a2 = angle(deg2)}
          <line
            x1={cx + Math.cos(a1) * aspectRadius}
            y1={cy + Math.sin(a1) * aspectRadius}
            x2={cx + Math.cos(a2) * aspectRadius}
            y2={cy + Math.sin(a2) * aspectRadius}
            stroke={hexToCss(theme.aspects[a.type] ?? theme.aspects.default)}
            stroke-opacity="1"
            stroke-width="2"
          />
        {/if}
      {/each}
    {/if}

    <!-- 10. Planet dots (on inner rim of zodiac) + glyphs (in zodiac band) -->
    {#if chart}
      {@const dotRadius = 4}
      {@const hitRadius = Math.max(14, r * 0.08)}
      {#each chart.planets as p}
        {@const totalDeg = signTotalDegrees(p.sign, p.degrees, p.minutes)}
        {@const a = angle(totalDeg)}
        {@const dotX = cx + Math.cos(a) * innerRadius}
        {@const dotY = cy + Math.sin(a) * innerRadius}
        {@const glyphX = cx + Math.cos(a) * planetGlyphRadius}
        {@const glyphY = cy + Math.sin(a) * planetGlyphRadius}
        {@const isHovered = hoveredPlanet === p.planet}
        <g
          class="planet-placement"
          role="button"
          tabindex="0"
          onmouseenter={() => setHoveredPlanet(p.planet)}
          onmouseleave={() => setHoveredPlanet(null)}
          onclick={() => handlePlanetClick(p)}
          onkeydown={(e) => e.key === "Enter" && handlePlanetClick(p)}
          style="cursor: pointer; outline: none;"
        >
          <circle cx={dotX} cy={dotY} r={hitRadius} fill="transparent" />
          <circle
            class="planet-dot"
            cx={dotX}
            cy={dotY}
            r={dotRadius}
            fill={hexToCss(planetDotColor(p.planet, theme))}
          />
          <g transform="translate({glyphX},{glyphY})">
            <g transform={isHovered ? "scale(1.2)" : ""}>
              <text
                text-anchor="middle"
                dominant-baseline="central"
                font-size={planetFontSize}
                fill={isHovered ? hexToCss(theme.planets.hover) : "#ffffff"}
              >
                {planetGlyph(p.planet)}
              </text>
            </g>
          </g>
          {#if isHovered}
            <text
              class="planet-tooltip"
              x={glyphX}
              y={glyphY - hitRadius - 4}
              text-anchor="middle"
              font-size={tooltipFontSize}
              fill={hexToCss(theme.planets.tooltip)}
            >
              {p.planet} {p.sign} {p.degrees}°{String(p.minutes).padStart(2, "0")}' · House {p.house}{p.retrograde ? " R" : ""}
            </text>
          {/if}
        </g>
      {/each}
    {/if}

    <!-- 11. Lunar node placements (dots on rim, glyphs in zodiac band) -->
    {#if chart?.lunarNodes && chart.lunarNodes.length > 0}
      {@const nodeDotRadius = 4}
      {@const hitRadius = Math.max(14, r * 0.08)}
      {#each chart.lunarNodes as n}
        {@const totalDeg = signTotalDegrees(n.sign, n.degrees, n.minutes)}
        {@const a = angle(totalDeg)}
        {@const dotX = cx + Math.cos(a) * innerRadius}
        {@const dotY = cy + Math.sin(a) * innerRadius}
        {@const glyphX = cx + Math.cos(a) * planetGlyphRadius}
        {@const glyphY = cy + Math.sin(a) * planetGlyphRadius}
        {@const isHovered = hoveredNode === n.node}
        <g
          class="node-placement"
          role="img"
          aria-label="Lunar node {n.node}"
          onmouseenter={() => setHoveredNode(n.node)}
          onmouseleave={() => setHoveredNode(null)}
        >
          <circle cx={dotX} cy={dotY} r={hitRadius} fill="transparent" />
          <circle class="node-dot" cx={dotX} cy={dotY} r={nodeDotRadius} fill={hexToCss(theme.planets.default)} />
          <text
            x={glyphX}
            y={glyphY}
            text-anchor="middle"
            dominant-baseline="central"
            font-size={planetFontSize}
            fill={hexToCss(isHovered ? theme.planets.hover : theme.planets.default)}
          >
            {lunarNodeGlyph(n.node)}
          </text>
          {#if isHovered}
            <text
              class="node-tooltip"
              x={glyphX}
              y={glyphY - hitRadius - 4}
              text-anchor="middle"
              font-size={tooltipFontSize}
              fill={hexToCss(theme.planets.tooltip)}
            >
              {n.node} {n.sign} {n.degrees}°{String(n.minutes).padStart(2, "0")}' · House {n.house}
            </text>
          {/if}
        </g>
      {/each}
    {/if}
  </g>
</svg>

<style>
  .chart-svg {
    display: block;
    font-family: serif;
  }

  .chart-svg .zodiac-segment {
    transition: fill-opacity 0.15s ease;
  }

  .chart-svg .zodiac-segment.sign-hover {
    fill-opacity: 0.7;
  }

  .sign-glyph {
    font-family: "Astronomicon", serif;
  }

  .chart-svg .sign-label .sign-glyph {
    font-family: "Astronomicon", serif;
    transition: fill 0.15s ease;
  }

  .chart-svg .sign-tooltip,
  .chart-svg .planet-tooltip,
  .chart-svg .node-tooltip {
    font-family: sans-serif;
    pointer-events: none;
  }

  .chart-svg .house-label {
    font-family: sans-serif;
    font-weight: 600;
  }

  .chart-svg .planet-placement text,
  .chart-svg .node-placement text {
    font-family: monospace;
  }

  .chart-svg .planet-dot,
  .chart-svg .node-dot {
    stroke: #000;
    stroke-width: 1;
  }
</style>
