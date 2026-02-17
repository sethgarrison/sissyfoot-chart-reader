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
│   │   ├── ChartCanvas.svelte  # Thin wrapper that mounts ChartRenderer onto a <canvas>
│   │   └── Sidebar.svelte      # HTML sidebar for birth data display & future data entry
│   └── models/         # Shared data models / types
│       ├── zodiac.ts   # Static zodiac sign definitions
│       ├── reading.ts  # NatalChart, PlanetPlacement, Aspect, etc.
│       └── index.ts
├── App.svelte          # App shell — sidebar + canvas layout
├── main.ts             # Entry point
└── app.css             # Global reset / base styles
```

The key design decision is that `ChartRenderer` is a plain TypeScript class that owns its own PixiJS `Application`. It knows nothing about Svelte. The `ChartCanvas.svelte` component is a thin lifecycle wrapper that creates a `<canvas>`, passes it to the renderer, and handles resize/cleanup. This means the rendering logic is portable — if you ever swap frameworks, only the wrapper changes.

## Getting Started

```bash
npm install
npm run dev
```

## Data Models

Models live in `src/lib/models/`. The two key interfaces:

- **`ZodiacSign`** — static definition of the 12 signs (element, modality, ruling planet, degree range)
- **`NatalChart`** — a complete chart reading (birth data, planet placements, house cusps, aspects, ascendant, midheaven)

These are designed to match what a backend ephemeris calculation would produce. A `SAMPLE_CHART` constant is provided for development.

## Roadmap

- [ ] Backend service for chart calculation (ephemeris)
- [ ] Birth data entry form
- [ ] Interactive planet/aspect hover tooltips
- [ ] Transit charts & synastry overlays
- [ ] Chart persistence / export
