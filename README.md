# Astro Chart

A WebGL-powered astrological natal chart renderer.

## Stack

- **Vite** — build tooling
- **Svelte 5** — lightweight UI framework for HTML panels (data entry, sidebar, etc.)
- **PixiJS 8** — WebGL rendering for the chart wheel
- **TypeScript** — throughout

## Architecture

```
src/
├── lib/
│   ├── chart/          # PixiJS chart renderer (self-contained, framework-agnostic)
│   │   ├── renderer.ts # ChartRenderer class — init, draw, resize, destroy
│   │   └── index.ts
│   ├── components/     # Svelte UI components
│   │   ├── BirthDataForm.svelte  # Birth data entry form (initial view)
│   │   ├── ChartCanvas.svelte    # Thin wrapper that mounts ChartRenderer onto a <canvas>
│   │   └── ReadingPanel.svelte   # Chart data, planets, aspects, interpretations
│   └── models/         # Shared data models / types
│       ├── zodiac.ts   # Static zodiac sign definitions
│       ├── reading.ts  # NatalChart, PlanetPlacement, Aspect, etc.
│       └── index.ts
├── App.svelte          # App shell — form-first flow, then chart + reading
├── main.ts             # Entry point
└── app.css             # Global reset / base styles
```

The key design decision is that `ChartRenderer` is a plain TypeScript class that owns its own PixiJS `Application`. It knows nothing about Svelte. The `ChartCanvas.svelte` component is a thin lifecycle wrapper that creates a `<canvas>`, passes it to the renderer, and handles resize/cleanup. This means the rendering logic is portable — if you ever swap frameworks, only the wrapper changes.

## Getting Started

```bash
npm install
npm run dev
```

## Data Models (API Contract)

Chart data lives in `src/lib/models/reading.ts`. This is the agreed contract for the chart API — both request input and response shape.

### Request: `BirthData`

Input for computing a natal chart:

```ts
interface BirthData {
  name: string;
  date: string;        // ISO date: "1990-06-15"
  time: string;        // "14:30" (local time)
  latitude: number;
  longitude: number;
  timezone: string;    // IANA: "America/New_York"
}
```

### Response: `NatalChart`

Complete chart reading returned by the API:

```ts
interface NatalChart {
  birthData: BirthData;
  planets: PlanetPlacement[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: { sign: string; degrees: number; minutes: number };
  midheaven: { sign: string; degrees: number; minutes: number };
}

interface PlanetPlacement {
  planet: string;     // "Sun", "Moon", "Mercury", ...
  sign: string;       // "Aries", "Taurus", ...
  house: number;      // 1–12
  degrees: number;
  minutes: number;
  retrograde: boolean;
}

interface HouseCusp {
  house: number;      // 1–12
  sign: string;
  degrees: number;
  minutes: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  orb: number;
}
```

Sign names: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.

A `SAMPLE_CHART` constant is provided for development.

## API Integration

The app fetches natal charts from the [sissyfoot-astrological-api](https://sissyfoot-astrological-api.onrender.com/chart) via GET with query params: `year`, `month`, `day`, `hour`, `min`, `city`, `nation`, and optionally `house_system` (`whole_sign` or `placidus`). City format: `"City,State"` (e.g. `Laurel,MS`).

The API response is transformed to our internal `NatalChart` format via `chartFromApiResponse()` in `reading.ts`.

## Testing & Analysis

```bash
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run analyze    # Fetch a chart and print an analysis report
```

The analysis script (`scripts/analyze-chart.ts`) fetches chart data and validates:
- **Whole Sign vs Placidus** — In Whole Sign, each house cusp is at 0° of its sign; non-zero degrees indicate Placidus or another quadrant system
- **Planet-house consistency** — For Whole Sign, each planet's sign should match its house's sign
- **Sign order** — Houses should follow zodiac order (e.g. House 1 Libra → House 2 Scorpio → …)

Tests live in `src/**/*.test.ts` and cover API fetching, `chartFromApiResponse` mapping, and chart analysis logic. They can be moved to the server when the API has its own test suite.

## Deploy to Render (Static Site)

The app is configured to deploy as a static site on [Render](https://render.com/).

### Via Dashboard

1. In [Render Dashboard](https://dashboard.render.com/), click **New** → **Static Site**
2. Connect your GitHub/GitLab repository
3. Render will detect the `render.yaml` blueprint and use:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`

### Via Blueprint

If you use [Render Blueprints](https://render.com/docs/infrastructure-as-code), the `render.yaml` in this repo defines the static site. Connect the repo and Render will create the service from the blueprint.

Your site will be available at `https://<service-name>.onrender.com`. You can add a [custom domain](https://render.com/docs/custom-domains) in the dashboard.
- [ ] Interactive planet/aspect hover tooltips
- [ ] Transit charts & synastry overlays
- [ ] Chart persistence / export
