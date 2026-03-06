import { Application, Graphics, Text, TextStyle, Container, Circle } from "pixi.js";
import { ZODIAC_SIGNS } from "../models/zodiac";
import type { NatalChart, PlanetPlacement } from "../models/reading";
import {
  DEFAULT_CHART_THEME,
  mergeChartTheme,
  mergeChartThemeOver,
  type ChartTheme,
  type DeepPartial,
} from "./theme";

export interface ChartRendererOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  /** Optional theme overrides. Merged onto DEFAULT_CHART_THEME. */
  theme?: DeepPartial<ChartTheme>;
  /** Called when a planet is clicked; chart will zoom to that planet. */
  onPlanetClick?: (planet: PlanetPlacement) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.15;

const INTRO_SPIN_DURATION_MS = 7000; // Slow, gentle
const INTRO_SPIN_REVOLUTIONS = 1.5; // One to two rotations before settling

/**
 * Manages a PixiJS Application that draws an astrological wheel chart.
 * Designed to be mounted/unmounted by a Svelte component.
 */
export class ChartRenderer {
  private app: Application;
  private chartContainer: Container;
  private chart: NatalChart | null = null;
  private theme: ChartTheme;
  private centerX = 0;
  private centerY = 0;
  private outerRadius = 0;
  private zoomLevel = 1;
  private panX = 0;
  private panY = 0;
  private introTicker: (() => void) | null = null;
  private onPlanetClick: ((planet: PlanetPlacement) => void) | null = null;

  constructor() {
    this.app = new Application();
    this.chartContainer = new Container();
    this.theme = DEFAULT_CHART_THEME;
  }

  async init(opts: ChartRendererOptions): Promise<void> {
    this.theme = opts.theme ? mergeChartTheme(opts.theme) : DEFAULT_CHART_THEME;
    this.onPlanetClick = opts.onPlanetClick ?? null;

    await this.app.init({
      canvas: opts.canvas,
      width: opts.width,
      height: opts.height,
      background: this.theme.chart.background,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.centerX = opts.width / 2;
    this.centerY = opts.height / 2;
    this.outerRadius = Math.min(opts.width, opts.height) * 0.42;

    this.app.stage.addChild(this.chartContainer);
    this.applyZoomPan();
    this.drawEmptyWheel();
  }

  /** Render a full natal chart onto the wheel. */
  setChart(
    chart: NatalChart,
    options?: { playIntroAnimation?: boolean; onPlanetClick?: (planet: PlanetPlacement) => void }
  ): void {
    const wasEmpty = !this.chart;
    if (options?.onPlanetClick !== undefined) this.onPlanetClick = options.onPlanetClick ?? null;
    this.chart = chart;
    this.redraw();
    if (wasEmpty && chart && options?.playIntroAnimation !== false) {
      this.playIntroSpin();
    }
  }

  /** Resize the renderer when the container changes size. */
  resize(width: number, height: number): void {
    if (!this.app?.renderer) return; // Not yet initialized
    this.app.renderer.resize(width, height);
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.outerRadius = Math.min(width, height) * 0.42;
    this.applyZoomPan();
    this.redraw();
  }

  /** Zoom in/out. delta > 0 zooms in, delta < 0 zooms out. */
  zoom(delta: number): void {
    const factor = 1 + (delta > 0 ? ZOOM_STEP : -ZOOM_STEP);
    this.zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoomLevel * factor));
    this.applyZoomPan();
  }

  /** Pan the chart. Called during drag. */
  pan(dx: number, dy: number): void {
    this.panX += dx;
    this.panY += dy;
    this.applyZoomPan();
  }

  /** Reset zoom and pan to default. */
  resetView(): void {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyZoomPan();
  }

  /** Zoom and pan to focus on a specific planet. */
  focusOnPlanet(planet: PlanetPlacement): void {
    if (!this.chart) return;
    const planetRadius = this.outerRadius * 0.45;
    const totalDeg = this.signTotalDegrees(planet.sign, planet.degrees, planet.minutes);
    const angle = this.eclipticToAngle(totalDeg);
    this.panX = -Math.cos(angle) * planetRadius;
    this.panY = -Math.sin(angle) * planetRadius;
    this.zoomLevel = 2.5;
    this.applyZoomPan();
  }

  private applyZoomPan(): void {
    this.chartContainer.pivot.set(this.centerX, this.centerY);
    this.chartContainer.position.set(this.centerX + this.panX, this.centerY + this.panY);
    this.chartContainer.scale.set(this.zoomLevel);
  }

  /** Update the planet click callback. Call this when the Svelte callback changes. */
  setOnPlanetClick(cb: ((planet: PlanetPlacement) => void) | null | undefined): void {
    this.onPlanetClick = cb ?? null;
  }

  /** Update the theme and redraw. Use partial overrides; merged onto current theme. */
  setTheme(partial: DeepPartial<ChartTheme>): void {
    this.theme = mergeChartThemeOver(this.theme, partial);
    if (this.app?.renderer) {
      this.app.renderer.background.color = this.theme.chart.background;
      this.redraw();
    }
  }

  /** Tear down the PixiJS application. */
  destroy(): void {
    if (this.introTicker) {
      this.app.ticker.remove(this.introTicker);
      this.introTicker = null;
    }
    this.app.destroy(true, { children: true });
  }

  /** Play the introductory spin animation when the chart first loads. */
  private playIntroSpin(): void {
    const startRotation = INTRO_SPIN_REVOLUTIONS * Math.PI * 2;
    this.chartContainer.rotation = startRotation;

    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / INTRO_SPIN_DURATION_MS, 1);
      // Ease-out quint: very gentle deceleration for hypnotic feel
      const eased = 1 - Math.pow(1 - progress, 5);
      this.chartContainer.rotation = startRotation * (1 - eased);

      if (progress >= 1) {
        this.app.ticker.remove(tick);
        this.introTicker = null;
        this.chartContainer.rotation = 0;
      }
    };

    this.introTicker = tick;
    this.app.ticker.add(tick);
  }

  private redraw(): void {
    this.chartContainer.removeChildren();
    this.drawEmptyWheel();
    if (this.chart) {
      this.drawAngleMarkers(this.chart);
      this.drawPlanetPlacements(this.chart);
      this.drawLunarNodePlacements(this.chart);
      this.drawAspectLines(this.chart);
    }
  }

  private drawEmptyWheel(): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const innerRadius = r * 0.72;
    const houseRingRadius = r * 0.55;
    const t = this.theme.chart;
    const black = 0x000000;

    // 1. Inner circle: house segments with black dividing lines
    if (this.chart && this.chart.houses.length >= 12) {
      this.drawHouseSegments();
    }

    const g = new Graphics();
    g.circle(cx, cy, r);
    g.stroke({ width: 2, color: t.wheelStroke });

    g.circle(cx, cy, innerRadius);
    g.stroke({ width: 1.5, color: t.wheelStroke });

    g.circle(cx, cy, houseRingRadius);
    g.stroke({ width: 1, color: t.wheelStrokeMuted });

    g.circle(cx, cy, r * 0.06);
    g.fill({ color: t.centerFill, alpha: 1 });
    g.stroke({ width: 1, color: t.centerStroke });

    this.chartContainer.addChild(g);

    // 3. House cusp lines: center to outer edge (black) — clearly delineate houses
    const houseCusps = this.getHouseCuspAngles();
    const centerR = r * 0.06;
    for (let i = 0; i < houseCusps.length; i++) {
      const angle = houseCusps[i];
      const lineG = new Graphics();
      lineG.moveTo(cx + Math.cos(angle) * centerR, cy + Math.sin(angle) * centerR);
      lineG.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      lineG.stroke({ width: 1.5, color: black });
      this.chartContainer.addChild(lineG);
    }

    // 4. Zodiac outer ring: full divisions between signs (black radial lines)
    for (const sign of ZODIAC_SIGNS) {
      const angle = this.eclipticToAngle(sign.degreesStart);
      const div = new Graphics();
      div.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
      div.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      div.stroke({ width: 1.5, color: black });
      this.chartContainer.addChild(div);
    }

    // 5. Zodiac tick marks: outward-pointing at each sign boundary
    const tickLength = r * 0.04;
    for (const sign of ZODIAC_SIGNS) {
      const angle = this.eclipticToAngle(sign.degreesStart);
      const tick = new Graphics();
      tick.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      tick.lineTo(cx + Math.cos(angle) * (r + tickLength), cy + Math.sin(angle) * (r + tickLength));
      tick.stroke({ width: 1.5, color: black });
      this.chartContainer.addChild(tick);
    }

    // 6. Sign labels (symbols) in the zodiac ring
    const labelStyle = new TextStyle({
      fontFamily: "serif",
      fontSize: Math.max(14, r * 0.08),
      fill: black,
    });

    const signHitRadius = Math.max(14, r * 0.08);
    const signTooltipStyle = new TextStyle({
      fontFamily: "sans-serif",
      fontSize: Math.max(12, r * 0.055),
      fill: this.theme.planets.tooltip,
    });

    for (const sign of ZODIAC_SIGNS) {
      const midAngle = this.eclipticToAngle(sign.degreesStart + 15);
      const labelR = (r + innerRadius) / 2;
      const tx = cx + Math.cos(midAngle) * labelR;
      const ty = cy + Math.sin(midAngle) * labelR;

      const container = new Container();
      container.x = tx;
      container.y = ty;
      container.eventMode = "static";
      container.cursor = "pointer";
      container.hitArea = new Circle(0, 0, signHitRadius);

      const text = new Text({
        text: sign.symbol,
        style: new TextStyle({
          ...labelStyle,
          fill: black,
          fontSize: Math.max(16, r * 0.1),
        }),
      });
      text.anchor.set(0.5);
      text.x = 0;
      text.y = 0;
      container.addChild(text);

      let tooltip: Text | null = null;
      container.on("pointerover", () => {
        text.style.fill = this.theme.planets.hover;
        text.scale.set(1.2);
        tooltip = new Text({ text: sign.name, style: signTooltipStyle });
        tooltip.anchor.set(0.5, 1);
        tooltip.x = 0;
        tooltip.y = -signHitRadius - 4;
        tooltip.zIndex = 100;
        container.addChild(tooltip);
      });
      container.on("pointerout", () => {
        text.style.fill = black;
        text.scale.set(1);
        if (tooltip) {
          container.removeChild(tooltip);
          tooltip.destroy();
          tooltip = null;
        }
      });

      this.chartContainer.addChild(container);
    }
  }

  private drawAngleMarkers(chart: NatalChart): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const tickLength = r * 0.06;
    const labelRadius = r + tickLength + Math.max(14, r * 0.04);
    const anglesTheme = this.theme.angles;

    const angleStyle = new TextStyle({
      fontFamily: "sans-serif",
      fontSize: Math.max(10, r * 0.055),
      fill: anglesTheme.labelFill,
      fontWeight: "600",
    });

    const ascDeg = this.signTotalDegrees(chart.ascendant.sign, chart.ascendant.degrees, chart.ascendant.minutes);
    const mcDeg = this.signTotalDegrees(chart.midheaven.sign, chart.midheaven.degrees, chart.midheaven.minutes);
    const dscDeg = (ascDeg + 180) % 360;

    for (const [label, totalDeg] of [
      ["ASC", ascDeg],
      ["MC", mcDeg],
      ["DSC", dscDeg],
    ] as const) {
      const angle = this.eclipticToAngle(totalDeg);
      const g = new Graphics();

      // Tick pointing outward from the wheel
      const x1 = cx + Math.cos(angle) * r;
      const y1 = cy + Math.sin(angle) * r;
      const x2 = cx + Math.cos(angle) * (r + tickLength);
      const y2 = cy + Math.sin(angle) * (r + tickLength);
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke({ width: 1.5, color: anglesTheme.tickStroke, alpha: 0.9 });
      this.chartContainer.addChild(g);

      // Label just outside the tick
      const labelX = cx + Math.cos(angle) * labelRadius;
      const labelY = cy + Math.sin(angle) * labelRadius;
      const text = new Text({ text: label, style: angleStyle });
      text.anchor.set(0.5);
      text.x = labelX;
      text.y = labelY;
      this.chartContainer.addChild(text);
    }
  }

  /**
   * Convert ecliptic longitude (0–360°) to canvas angle in radians.
   * House 1 (Ascendant) is at 9 o'clock (left); houses proceed clockwise.
   */
  private eclipticToAngle(eclipticDeg: number): number {
    const ascDeg = this.chart
      ? this.signTotalDegrees(this.chart.ascendant.sign, this.chart.ascendant.degrees, this.chart.ascendant.minutes)
      : 0;
    const deg = this.chart ? 180 - (eclipticDeg - ascDeg) : 180 - eclipticDeg;
    return (deg * Math.PI) / 180;
  }

  private signTotalDegrees(sign: string, degrees: number, minutes: number): number {
    const signObj = ZODIAC_SIGNS.find((s) => s.name === sign);
    if (!signObj) return 0;
    return signObj.degreesStart + degrees + minutes / 60;
  }

  /** Midpoint of arc from startAngle to endAngle, taking the shorter path. Handles wrap-around. */
  private arcMidAngle(startAngle: number, endAngle: number): number {
    let delta = endAngle - startAngle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    return startAngle + delta / 2;
  }

  /** Get house cusp angles in radians (canvas space). Uses actual cusps when chart has houses. */
  private getHouseCuspAngles(): number[] {
    if (this.chart?.houses && this.chart.houses.length >= 12) {
      const sorted = [...this.chart.houses].sort((a, b) => a.house - b.house);
      return sorted.map((c) =>
        this.eclipticToAngle(this.signTotalDegrees(c.sign, c.degrees, c.minutes))
      );
    }
    const ascDeg = this.chart
      ? this.signTotalDegrees(this.chart.ascendant.sign, this.chart.ascendant.degrees, this.chart.ascendant.minutes)
      : 0;
    return Array.from({ length: 12 }, (_, i) =>
      this.eclipticToAngle((ascDeg + i * 30) % 360)
    );
  }

  /** Draw filled house segments in the inner band for clearer boundary visibility. */
  private drawHouseSegments(): void {
    if (!this.chart?.houses || this.chart.houses.length < 12) return;
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const innerRadius = r * 0.72;
    const houseRingRadius = r * 0.55;
    const t = this.theme.chart;

    const cuspAngles = this.getHouseCuspAngles();
    if (cuspAngles.length < 12) return;

    const houseFill = new Graphics();
    const labelRadius = (houseRingRadius + innerRadius) / 2;
    const houseLabelStyle = new TextStyle({
      fontFamily: "sans-serif",
      fontSize: Math.max(10, r * 0.06),
      fill: t.labelMuted,
      fontWeight: "600",
    });

    for (let i = 0; i < 12; i++) {
      const startAngle = cuspAngles[i];
      const endAngle = cuspAngles[(i + 1) % 12];
      const color = i % 2 === 0 ? t.houseFillLight : t.houseFillDark;

      houseFill.moveTo(cx + Math.cos(startAngle) * houseRingRadius, cy + Math.sin(startAngle) * houseRingRadius);
      houseFill.arc(cx, cy, houseRingRadius, startAngle, endAngle, false);
      houseFill.lineTo(cx + Math.cos(endAngle) * innerRadius, cy + Math.sin(endAngle) * innerRadius);
      houseFill.arc(cx, cy, innerRadius, endAngle, startAngle, true);
      houseFill.closePath();
      houseFill.fill({ color, alpha: t.houseFillAlpha });
    }
    this.chartContainer.addChild(houseFill);

    for (let i = 0; i < 12; i++) {
      const startAngle = cuspAngles[i];
      const endAngle = cuspAngles[(i + 1) % 12];
      const midAngle = this.arcMidAngle(startAngle, endAngle);
      const labelX = cx + Math.cos(midAngle) * labelRadius;
      const labelY = cy + Math.sin(midAngle) * labelRadius;
      const houseNum = new Text({
        text: String(i + 1),
        style: houseLabelStyle,
      });
      houseNum.anchor.set(0.5);
      houseNum.x = labelX;
      houseNum.y = labelY;
      this.chartContainer.addChild(houseNum);
    }
  }

  private drawPlanetPlacements(chart: NatalChart): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const planetRadius = r * 0.45;
    const hitRadius = Math.max(14, r * 0.08);
    const planetsTheme = this.theme.planets;

    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: Math.max(11, r * 0.06),
      fill: planetsTheme.default,
    });

    const tooltipStyle = new TextStyle({
      fontFamily: "sans-serif",
      fontSize: Math.max(12, r * 0.055),
      fill: planetsTheme.tooltip,
    });

    for (const p of chart.planets) {
      const totalDeg = this.signTotalDegrees(p.sign, p.degrees, p.minutes);
      const angle = this.eclipticToAngle(totalDeg);
      const tx = cx + Math.cos(angle) * planetRadius;
      const ty = cy + Math.sin(angle) * planetRadius;

      const container = new Container();
      container.x = tx;
      container.y = ty;
      container.eventMode = "static";
      container.cursor = "pointer";
      container.hitArea = new Circle(0, 0, hitRadius);

      const label = new Text({
        text: this.planetGlyph(p.planet),
        style: new TextStyle({
          ...style,
          fill: p.retrograde ? planetsTheme.retrograde : planetsTheme.default,
        }),
      });
      label.anchor.set(0.5);
      label.x = 0;
      label.y = 0;
      container.addChild(label);

      let tooltip: Text | null = null;
      container.on("pointerover", () => {
        label.style.fill = planetsTheme.hover;
        label.scale.set(1.2);
        const detail = `${p.planet} ${p.sign} ${p.degrees}°${String(p.minutes).padStart(2, "0")}' · House ${p.house}${p.retrograde ? " R" : ""}`;
        tooltip = new Text({ text: detail, style: tooltipStyle });
        tooltip.anchor.set(0.5, 1);
        tooltip.x = 0;
        tooltip.y = -hitRadius - 4;
        tooltip.zIndex = 100;
        container.addChild(tooltip);
      });
      container.on("pointerout", () => {
        label.style.fill = p.retrograde ? planetsTheme.retrograde : planetsTheme.default;
        label.scale.set(1);
        if (tooltip) {
          container.removeChild(tooltip);
          tooltip.destroy();
          tooltip = null;
        }
      });

      container.on("pointerdown", (e) => {
        e.stopPropagation();
        this.onPlanetClick?.(p);
        this.focusOnPlanet(p);
      });

      this.chartContainer.addChild(container);
    }
  }

  private drawLunarNodePlacements(chart: NatalChart): void {
    const nodes = chart.lunarNodes;
    if (!nodes || nodes.length === 0) return;

    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const nodeRadius = r * 0.45;
    const hitRadius = Math.max(14, r * 0.08);
    const planetsTheme = this.theme.planets;

    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: Math.max(11, r * 0.06),
      fill: planetsTheme.default,
    });

    const tooltipStyle = new TextStyle({
      fontFamily: "sans-serif",
      fontSize: Math.max(12, r * 0.055),
      fill: planetsTheme.tooltip,
    });

    for (const n of nodes) {
      const totalDeg = this.signTotalDegrees(n.sign, n.degrees, n.minutes);
      const angle = this.eclipticToAngle(totalDeg);
      const tx = cx + Math.cos(angle) * nodeRadius;
      const ty = cy + Math.sin(angle) * nodeRadius;

      const container = new Container();
      container.x = tx;
      container.y = ty;
      container.eventMode = "static";
      container.cursor = "pointer";
      container.hitArea = new Circle(0, 0, hitRadius);

      const label = new Text({
        text: this.lunarNodeGlyph(n.node),
        style: new TextStyle({ ...style }),
      });
      label.anchor.set(0.5);
      label.x = 0;
      label.y = 0;
      container.addChild(label);

      let tooltip: Text | null = null;
      container.on("pointerover", () => {
        label.style.fill = planetsTheme.hover;
        label.scale.set(1.2);
        const detail = `${n.node} ${n.sign} ${n.degrees}°${String(n.minutes).padStart(2, "0")}' · House ${n.house}`;
        tooltip = new Text({ text: detail, style: tooltipStyle });
        tooltip.anchor.set(0.5, 1);
        tooltip.x = 0;
        tooltip.y = -hitRadius - 4;
        tooltip.zIndex = 100;
        container.addChild(tooltip);
      });
      container.on("pointerout", () => {
        label.style.fill = planetsTheme.default;
        label.scale.set(1);
        if (tooltip) {
          container.removeChild(tooltip);
          tooltip.destroy();
          tooltip = null;
        }
      });

      this.chartContainer.addChild(container);
    }
  }

  private drawAspectLines(chart: NatalChart): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const aspectRadius = r * 0.45;
    const aspectColors = this.theme.aspects;

    for (const a of chart.aspects) {
      const p1 = chart.planets.find((p) => p.planet === a.planet1);
      const p2 = chart.planets.find((p) => p.planet === a.planet2);
      if (!p1 || !p2) continue;

      const deg1 = this.signTotalDegrees(p1.sign, p1.degrees, p1.minutes);
      const deg2 = this.signTotalDegrees(p2.sign, p2.degrees, p2.minutes);
      const a1 = this.eclipticToAngle(deg1);
      const a2 = this.eclipticToAngle(deg2);

      const x1 = cx + Math.cos(a1) * aspectRadius;
      const y1 = cy + Math.sin(a1) * aspectRadius;
      const x2 = cx + Math.cos(a2) * aspectRadius;
      const y2 = cy + Math.sin(a2) * aspectRadius;

      const g = new Graphics();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke({
        width: 1,
        color: aspectColors[a.type] ?? aspectColors.default,
        alpha: 0.6,
      });
      this.chartContainer.addChild(g);
    }
  }

  private planetGlyph(planet: string): string {
    const glyphs: Record<string, string> = {
      Sun: "\u2609",
      Moon: "\u263D",
      Mercury: "\u263F",
      Venus: "\u2640",
      Mars: "\u2642",
      Jupiter: "\u2643",
      Saturn: "\u2644",
      Uranus: "\u2645",
      Neptune: "\u2646",
      Pluto: "\u2647",
    };
    return glyphs[planet] ?? planet.slice(0, 2);
  }

  private lunarNodeGlyph(node: string): string {
    const glyphs: Record<string, string> = {
      "North Node": "\u260A", // ☊ Dragon's Head
      "South Node": "\u260B", // ☋ Dragon's Tail
    };
    return glyphs[node] ?? node.slice(0, 2);
  }
}
