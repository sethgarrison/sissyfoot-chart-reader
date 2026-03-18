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
    /** House segment fill colors (alternating for boundary visibility) */
    houseFillLight: number;
    houseFillDark: number;
    houseFillAlpha: number;
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
    /** Per-planet colors for the position dots (metallic/planetary colors) */
    dotColors?: Partial<Record<string, number>>;
  };

  /** Aspect lines (conjunction, opposition, trine, square, sextile, quincunx) */
  aspects: {
    conjunction: number;
    opposition: number;
    trine: number;
    square: number;
    sextile: number;
    quincunx: number;
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
  "Chiron",
] as const;

/** Default theme: Traditional white chart with black lines */
export const DEFAULT_CHART_THEME: ChartTheme = {
  chart: {
    background: 0xffffff,
    wheelStroke: 0x000000,
    wheelStrokeMuted: 0x000000,
    centerFill: 0x000000,
    centerStroke: 0x000000,
    houseLineStroke: 0x000000,
    houseFillLight: 0xf5f5f5,
    houseFillDark: 0xffffff,
    houseFillAlpha: 0.9,
    labelMuted: 0x000000,
  },
  signs: {
    fire: 0xc21807,
    earth: 0x556b2f,
    air: 0xe67e22,
    water: 0x3498db,
    bySign: {
      Aries: 0xc21807,
      Taurus: 0x556b2f,
      Gemini: 0xe67e22,
      Cancer: 0xffbf00,
      Leo: 0xd4af37,
      Virgo: 0x9acd32,
      Libra: 0x0f7f4f,
      Scorpio: 0x8b0000,
      Sagittarius: 0x1f3a93,
      Capricorn: 0x2e2d88,
      Aquarius: 0x6a0dad,
      Pisces: 0x4b0082,
    },
    segmentFillAlpha: 0.85,
  },
  angles: {
    tickStroke: 0x000000,
    labelFill: 0x000000,
  },
  planets: {
    default: 0x000000,
    retrograde: 0xb91c1c,
    hover: 0x374151,
    tooltip: 0x000000,
    dotColors: {
      Sun: 0xffd700,      // Gold
      Moon: 0xe8e8e8,     // Silver / Pearl White
      Mercury: 0xff8c00,  // Quicksilver / Iridescent Orange
      Venus: 0x50c878,    // Copper / Emerald Green
      Mars: 0xb22222,     // Iron / Blood Red
      Jupiter: 0x4169e1,  // Tin / Royal Blue
      Saturn: 0x2f2f4f,   // Lead / Black Indigo
      Uranus: 0x00ced1,   // Aqua
      Neptune: 0x1e90ff,  // Dodger Blue
      Pluto: 0x4b0082,    // Indigo
      Chiron: 0x6b7280,   // Gray (wounded healer)
    },
  },
  aspects: {
    conjunction: 0xfbbf24,   // amber — blending
    opposition: 0xdc2626,   // red — tension
    trine: 0x16a34a,       // green — harmony
    square: 0xea580c,       // orange — challenge
    sextile: 0x2563eb,      // blue — opportunity
    quincunx: 0x7c3aed,     // violet — adjustment
    default: 0x6b7280,
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
    const { bySign: partialBySign, ...partialRest } = partial.signs;
    Object.assign(merged.signs, partialRest);
    // Deep-merge bySign so partial overrides don't wipe other sign colors
    if (partialBySign) {
      merged.signs.bySign = { ...(merged.signs.bySign ?? {}), ...partialBySign };
    }
  }
  if (partial.angles) {
    Object.assign(merged.angles, partial.angles);
  }
  if (partial.planets) {
    const { dotColors: partialDotColors, ...partialPlanetRest } = partial.planets;
    Object.assign(merged.planets, partialPlanetRest);
    if (partialDotColors) {
      merged.planets.dotColors = { ...(merged.planets.dotColors ?? {}), ...partialDotColors };
    }
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
