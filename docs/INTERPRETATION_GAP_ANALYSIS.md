# Server Interpretation Model vs Frontend — Gap Analysis

Comparison of the server's complete interpretation model with the frontend implementation.

---

## ✅ Aligned (no changes needed)

| Feature | Server | Frontend | Status |
|---------|--------|----------|--------|
| **planet_in_sign** | `"Planet in Sign"`, `"Rising in {sign}"` | Same keys | ✅ OK |
| **planet_in_house** | `"Planet in House N"` | Same key format | ✅ OK |
| **chart_shape** | `primary`, `interpretation`, `distribution` | Same structure | ✅ OK |
| **chart_shape.distribution** | Keys like `hemisphere_northern`, `quadrant_1`, `quadrant_spread` | `Record<string, string>` — displays any keys | ✅ OK |

---

## 🔴 Gaps Requiring Updates

### 1. Aspect Key Format ✅ FIXED

| | Server | Frontend |
|-|--------|----------|
| **Key format** | `"Planet1 aspect_type Planet2"` (e.g. `"Sun square Moon"`) | `\`${planet1} ${type} ${planet2}\`` (e.g. `"Sun square Moon"`) |
| **Status** | InteractiveReading uses correct format | ✅ |

### 2. modality_element_distribution (new structure)

| | Server | Frontend |
|-|--------|----------|
| **Interpretation text** | `interpretations.modality_element_distribution` — flat dict of keys → text | `by_element.fire.interpretation`, etc. (per-entry) |
| **Supporting data** | `chart.houses_overview.by_element`, `chart.houses_overview.by_quality` | `interpretations.by_element`, `interpretations.by_quality` |
| **Server keys** | `element_fire_dominant`, `element_earth_dominant`, `element_balanced`, `element_lacking_fire`, `quality_cardinal_dominant`, `quality_balanced`, etc. | N/A — we expect per-element count + interpretation |
| **Fix** | Add `modality_element_distribution` to model; use for element/modality slide interpretation text. Get `by_element`/`by_quality` from `houses_overview` (chart-level) or wherever API places it. |

### 3. Retrograde (entirely missing)

| | Server | Frontend |
|-|--------|----------|
| **retrograde_planets** | `list[str]` — planet names | Not in model |
| **retrograde_interpretations** | `dict[str, str]` — keys like `"Mercury in Gemini"`, `"Mercury in House 3"` | Not in model |
| **Fix** | Add both to ChartInterpretations; add Retrograde slide/section when `retrograde_planets.length > 0` |

### 4. houses_overview location & structure

| | Server | Frontend |
|-|--------|----------|
| **Location** | `chart.houses_overview` (top-level chart) | `interpretations.houses_overview` |
| **Structure** | `{ signs_with_planets, by_quality, by_element }` — `by_element`/`by_quality` have `count`, `signs`, `planets` | `Record<string, string>` (flat key→text) |
| **Fix** | Add `houses_overview` to NatalChart (chart-level); type as `SignPlacementOverview` with `by_element`, `by_quality`, optional `signs_with_planets`. If server also sends interpretation strings under houses_overview, support those. |

### 5. Chiron

| | Server | Frontend |
|-|--------|----------|
| **planet_in_sign** | Includes Chiron | We filter to 10 planets only; Chiron excluded |
| **Fix** | Optional: add Chiron to `supportedPlanets` if we want to show it in readings |

### 6. Quincunx aspect

| | Server | Frontend |
|-|--------|----------|
| **aspects** | Includes quincunx | We filter to conjunction, opposition, trine, square, sextile |
| **Fix** | Optional: add quincunx to supported aspects + Aspect type |

---

## Suggested UI mapping (server → slides)

| Slide | Server data source |
|-------|---------------------|
| Overview (Big Three) | `planet_in_sign` for Sun, Moon, Rising |
| Chart Type & Shape | `chart_shape.primary`, `interpretation`, `distribution` |
| House Overview | `houses_overview` (if string blocks) + house list from `chart.houses` |
| Planets in Houses | `planet_in_house` |
| **Retrograde** (new) | `retrograde_planets` + `retrograde_interpretations` |
| Element Overview | `houses_overview.by_element` (count, signs) + `modality_element_distribution` (e.g. `element_fire_dominant`, `element_balanced`, `element_lacking_X`) |
| Modality Overview | `houses_overview.by_quality` + `modality_element_distribution` (`quality_X_dominant`, `quality_balanced`) |
| Aspects | `chart.aspects` + `interpretations.aspects` (key: `"Planet1 aspect_type Planet2"`) |
| Interesting Findings | Could merge: distribution spread keys, retrograde emphasis, etc. |

---

## Summary of required changes

1. **Models**: Add `modality_element_distribution`, `retrograde_planets`, `retrograde_interpretations`; add `houses_overview` at chart level with correct structure.
2. **Aspect key**: Use `"${planet1} ${type} ${planet2}"` for lookups.
3. **Element/Modality slides**: Use `modality_element_distribution` for interpretation; use `houses_overview.by_element`/`by_quality` for count/signs (or interpretations equivalents if API nests differently).
4. **Retrograde**: Add slide/section when any retrograde planets; show `retrograde_interpretations`.
5. **Optional**: Chiron, quincunx.
