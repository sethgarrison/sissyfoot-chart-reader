/**
 * Color theme configuration for the astrological chart.
 * All colors are hex integers (0xRRGGBB) for PixiJS.
 *
 * Use this to customize the look and feel of planets, signs, aspects,
 * and chart structure. Pass a partial theme to override only specific values.
 */
export interface ChartTheme {
  /** Chart canvas and structural elements */
  chart: {
    background: number;
    wheelStroke: number;
    wheelStrokeMuted: number;
    centerFill: number;
    centerStroke: number;
    houseLineStroke: number;
    labelMuted: number;
  };

  /** Signs colored by element (fire, earth, air, water) with optional per-sign overrides */
  signs: {
    fire: number;
    earth: number;
    air: number;
    water: number;
    /** Per-sign color overrides. Falls back to element color if not set. */
    bySign?: Partial<Record<string, number>>;
    /** Alpha for the wheel segment fills (0–1). */
    segmentFillAlpha: number;
  };

  /** Angle markers (ASC, MC, DSC) */
  angles: {
    tickStroke: number;
    labelFill: number;
  };

  /** Planet glyphs and tooltips */
  planets: {
    default: number;
    retrograde: number;
    hover: number;
    tooltip: number;
  };

  /** Aspect lines (conjunction, opposition, trine, square, sextile) */
  aspects: {
    conjunction: number;
    opposition: number;
    trine: number;
    square: number;
    sextile: number;
    default: number;
  };
}

/** Element type used for sign coloring */
export type ElementType = keyof ChartTheme["signs"];

/** Aspect type for aspect coloring */
export type AspectType = keyof ChartTheme["aspects"];

/** Planet names for optional per-planet color overrides */
export const PLANET_NAMES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

/** Default theme: GitHub-dark inspired palette */
export const DEFAULT_CHART_THEME: ChartTheme = {
  chart: {
    background: 0x0d1117,
    wheelStroke: 0x58a6ff,
    wheelStrokeMuted: 0x30363d,
    centerFill: 0x58a6ff,
    centerStroke: 0x58a6ff,
    houseLineStroke: 0x30363d,
    labelMuted: 0xc9d1d9,
  },
  signs: {
    fire: 0xe74c3c,
    earth: 0x27ae60,
    air: 0xf1c40f,
    water: 0x3498db,
    bySign: {
      Aries: 0xdc2626,   // Fiery red
      Taurus: 0x1e3a5f,  // Navy blue
      Gemini: 0xfef08a,  // Light yellow
      Cancer: 0xf5f5dc,  // Beige
      Leo: 0xb22222,     // Brick red
      Virgo: 0x90a955,   // Earthy green (light)
      Libra: 0xdb7093,   // Pink
      Scorpio: 0x4a3728, // Deep brown
      Sagittarius: 0x7cfc00,   // Lime green
      Capricorn: 0x36454f,    // Graphite black
      Aquarius: 0x40e0d0,     // Turquoise
      Pisces: 0x00bcd4,       // Cyan
    },
    segmentFillAlpha: 0.4,
  },
  angles: {
    tickStroke: 0x58a6ff,
    labelFill: 0x8b949e,
  },
  planets: {
    default: 0xe6edf3,
    retrograde: 0xf85149,
    hover: 0x58a6ff,
    tooltip: 0xe6edf3,
  },
  aspects: {
    conjunction: 0xf0e68c,
    opposition: 0xe74c3c,
    trine: 0x2ecc71,
    square: 0xe67e22,
    sextile: 0x3498db,
    default: 0x484f58,
  },
};

/** Deep merge a partial theme onto the default. */
export function mergeChartTheme(partial: DeepPartial<ChartTheme>): ChartTheme {
  return mergeChartThemeOver(DEFAULT_CHART_THEME, partial);
}

/** Deep merge a partial theme onto a base theme. Use for incremental updates. */
export function mergeChartThemeOver(
  base: ChartTheme,
  partial: DeepPartial<ChartTheme>
): ChartTheme {
  const merged = JSON.parse(JSON.stringify(base)) as ChartTheme;

  if (partial.chart) {
    Object.assign(merged.chart, partial.chart);
  }
  if (partial.signs) {
    Object.assign(merged.signs, partial.signs);
  }
  if (partial.angles) {
    Object.assign(merged.angles, partial.angles);
  }
  if (partial.planets) {
    Object.assign(merged.planets, partial.planets);
  }
  if (partial.aspects) {
    Object.assign(merged.aspects, partial.aspects);
  }

  return merged;
}

/** Recursive partial for nested objects */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
