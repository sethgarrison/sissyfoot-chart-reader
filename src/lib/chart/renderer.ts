import { Application, Graphics, Text, TextStyle, Container } from "pixi.js";
import { ZODIAC_SIGNS, ELEMENTS_COLORS } from "../models/zodiac";
import type { NatalChart } from "../models/reading";

export interface ChartRendererOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/**
 * Manages a PixiJS Application that draws an astrological wheel chart.
 * Designed to be mounted/unmounted by a Svelte component.
 */
export class ChartRenderer {
  private app: Application;
  private chartContainer: Container;
  private chart: NatalChart | null = null;
  private centerX = 0;
  private centerY = 0;
  private outerRadius = 0;

  constructor() {
    this.app = new Application();
    this.chartContainer = new Container();
  }

  async init(opts: ChartRendererOptions): Promise<void> {
    await this.app.init({
      canvas: opts.canvas,
      width: opts.width,
      height: opts.height,
      background: 0x0d1117,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.centerX = opts.width / 2;
    this.centerY = opts.height / 2;
    this.outerRadius = Math.min(opts.width, opts.height) * 0.42;

    this.app.stage.addChild(this.chartContainer);
    this.drawEmptyWheel();
  }

  /** Render a full natal chart onto the wheel. */
  setChart(chart: NatalChart): void {
    this.chart = chart;
    this.redraw();
  }

  /** Resize the renderer when the container changes size. */
  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.outerRadius = Math.min(width, height) * 0.42;
    this.redraw();
  }

  /** Tear down the PixiJS application. */
  destroy(): void {
    this.app.destroy(true, { children: true });
  }

  private redraw(): void {
    this.chartContainer.removeChildren();
    this.drawEmptyWheel();
    if (this.chart) {
      this.drawPlanetPlacements(this.chart);
      this.drawAspectLines(this.chart);
    }
  }

  private drawEmptyWheel(): void {
    const g = new Graphics();
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const innerRadius = r * 0.72;
    const houseRingRadius = r * 0.55;

    g.circle(cx, cy, r);
    g.stroke({ width: 2, color: 0x58a6ff });

    g.circle(cx, cy, innerRadius);
    g.stroke({ width: 1.5, color: 0x58a6ff });

    g.circle(cx, cy, houseRingRadius);
    g.stroke({ width: 1, color: 0x30363d });

    g.circle(cx, cy, r * 0.08);
    g.fill({ color: 0x58a6ff, alpha: 0.15 });
    g.stroke({ width: 1, color: 0x58a6ff });

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke({ width: 1, color: 0x30363d });
    }

    this.chartContainer.addChild(g);

    const labelStyle = new TextStyle({
      fontFamily: "serif",
      fontSize: Math.max(14, r * 0.08),
      fill: 0xc9d1d9,
    });

    for (const sign of ZODIAC_SIGNS) {
      const midAngle = ((sign.degreesStart + 15 - 90) * Math.PI) / 180;
      const labelR = (r + innerRadius) / 2;
      const tx = cx + Math.cos(midAngle) * labelR;
      const ty = cy + Math.sin(midAngle) * labelR;

      const text = new Text({
        text: sign.symbol,
        style: new TextStyle({
          ...labelStyle,
          fill: ELEMENTS_COLORS[sign.element],
          fontSize: Math.max(16, r * 0.1),
        }),
      });
      text.anchor.set(0.5);
      text.x = tx;
      text.y = ty;
      this.chartContainer.addChild(text);
    }
  }

  private signTotalDegrees(sign: string, degrees: number, minutes: number): number {
    const signObj = ZODIAC_SIGNS.find((s) => s.name === sign);
    if (!signObj) return 0;
    return signObj.degreesStart + degrees + minutes / 60;
  }

  private drawPlanetPlacements(chart: NatalChart): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const planetRadius = r * 0.45;

    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: Math.max(11, r * 0.06),
      fill: 0xe6edf3,
    });

    for (const p of chart.planets) {
      const totalDeg = this.signTotalDegrees(p.sign, p.degrees, p.minutes);
      const angle = ((totalDeg - 90) * Math.PI) / 180;
      const tx = cx + Math.cos(angle) * planetRadius;
      const ty = cy + Math.sin(angle) * planetRadius;

      const label = new Text({
        text: this.planetGlyph(p.planet),
        style: new TextStyle({
          ...style,
          fill: p.retrograde ? 0xf85149 : 0xe6edf3,
        }),
      });
      label.anchor.set(0.5);
      label.x = tx;
      label.y = ty;
      this.chartContainer.addChild(label);
    }
  }

  private drawAspectLines(chart: NatalChart): void {
    const { centerX: cx, centerY: cy, outerRadius: r } = this;
    const aspectRadius = r * 0.45;
    const g = new Graphics();

    const aspectColors: Record<string, number> = {
      conjunction: 0xf0e68c,
      opposition: 0xe74c3c,
      trine: 0x2ecc71,
      square: 0xe67e22,
      sextile: 0x3498db,
    };

    for (const a of chart.aspects) {
      const p1 = chart.planets.find((p) => p.planet === a.planet1);
      const p2 = chart.planets.find((p) => p.planet === a.planet2);
      if (!p1 || !p2) continue;

      const deg1 = this.signTotalDegrees(p1.sign, p1.degrees, p1.minutes);
      const deg2 = this.signTotalDegrees(p2.sign, p2.degrees, p2.minutes);
      const a1 = ((deg1 - 90) * Math.PI) / 180;
      const a2 = ((deg2 - 90) * Math.PI) / 180;

      const x1 = cx + Math.cos(a1) * aspectRadius;
      const y1 = cy + Math.sin(a1) * aspectRadius;
      const x2 = cx + Math.cos(a2) * aspectRadius;
      const y2 = cy + Math.sin(a2) * aspectRadius;

      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke({
        width: 1,
        color: aspectColors[a.type] ?? 0x484f58,
        alpha: 0.6,
      });
    }

    this.chartContainer.addChild(g);
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
}
