/**
 * Shared chart utilities for angle math, glyphs, and coordinate conversion.
 * Used by both the Pixi renderer and SVG chart.
 */
import { ZODIAC_SIGNS } from "../models/zodiac";
import type { NatalChart } from "../models/reading";
import type { ChartTheme } from "./theme";

/** Convert hex number (0xRRGGBB) to CSS color string. */
export function hexToCss(n: number): string {
  return "#" + n.toString(16).padStart(6, "0");
}

/** Total ecliptic degrees from sign + degrees + minutes. */
export function signTotalDegrees(sign: string, degrees: number, minutes: number): number {
  const signObj = ZODIAC_SIGNS.find((s) => s.name === sign);
  if (!signObj) return 0;
  return signObj.degreesStart + degrees + minutes / 60;
}

/** Convert ecliptic longitude (0–360°) to canvas angle in radians. */
export function eclipticToAngle(
  eclipticDeg: number,
  chart: NatalChart | null
): number {
  const ascDeg = chart
    ? signTotalDegrees(chart.ascendant.sign, chart.ascendant.degrees, chart.ascendant.minutes)
    : 0;
  const deg = chart ? 180 - (eclipticDeg - ascDeg) : 180 - eclipticDeg;
  return (deg * Math.PI) / 180;
}

/** Midpoint of arc from startAngle to endAngle. */
export function arcMidAngle(startAngle: number, endAngle: number): number {
  let delta = endAngle - startAngle;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  return startAngle + delta / 2;
}

/** Number of segments to approximate each arc (smooth circle). */
const ARC_SEGMENTS = 8;

/** SVG path for a wedge using line segments — avoids SVG arc direction ambiguity. */
export function wedgePath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  let delta = endAngle - startAngle;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  const step = delta / ARC_SEGMENTS;
  const parts: string[] = [];
  const x0 = cx + innerRadius * Math.cos(startAngle);
  const y0 = cy + innerRadius * Math.sin(startAngle);
  parts.push(`M ${x0} ${y0}`);
  for (let i = 1; i <= ARC_SEGMENTS; i++) {
    const a = startAngle + step * i;
    const x = cx + innerRadius * Math.cos(a);
    const y = cy + innerRadius * Math.sin(a);
    parts.push(`L ${x} ${y}`);
  }
  parts.push(`L ${cx + outerRadius * Math.cos(endAngle)} ${cy + outerRadius * Math.sin(endAngle)}`);
  for (let i = ARC_SEGMENTS - 1; i >= 0; i--) {
    const a = startAngle + step * i;
    const x = cx + outerRadius * Math.cos(a);
    const y = cy + outerRadius * Math.sin(a);
    parts.push(`L ${x} ${y}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

export function planetGlyph(planet: string): string {
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

export function lunarNodeGlyph(node: string): string {
  const glyphs: Record<string, string> = {
    "North Node": "\u260A",
    "South Node": "\u260B",
  };
  return glyphs[node] ?? node.slice(0, 2);
}

/** Get planet dot color (hex number) from theme. Falls back to default if not set. */
export function planetDotColor(planet: string, theme: ChartTheme): number {
  const c = theme.planets.dotColors?.[planet];
  if (c !== undefined) return c;
  return theme.planets.default;
}

/** Get sign color (hex number) from theme. */
export function signColor(
  sign: { name: string; element: string },
  theme: ChartTheme
): number {
  const perSign = theme.signs.bySign?.[sign.name];
  if (perSign !== undefined) return perSign;
  const el = sign.element as keyof ChartTheme["signs"];
  return (theme.signs[el] as number) ?? theme.signs.fire;
}

/** House cusp angles in radians (canvas space). */
export function getHouseCuspAngles(chart: NatalChart | null): number[] {
  if (chart?.houses && chart.houses.length >= 12) {
    const sorted = [...chart.houses].sort((a, b) => a.house - b.house);
    return sorted.map((c) =>
      eclipticToAngle(signTotalDegrees(c.sign, c.degrees, c.minutes), chart)
    );
  }
  const ascDeg = chart
    ? signTotalDegrees(chart.ascendant.sign, chart.ascendant.degrees, chart.ascendant.minutes)
    : 0;
  return Array.from({ length: 12 }, (_, i) =>
    eclipticToAngle((ascDeg + i * 30) % 360, chart)
  );
}

export { ZODIAC_SIGNS };
