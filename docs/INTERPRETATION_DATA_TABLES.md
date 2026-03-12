# Interpretation Data Tables for Interactive Reading

This document lists the interpretation data tables needed for the interactive natal chart reading feature. Most content will come from the database once it is in progress; this serves as a checklist for UI readiness and missing data.

## Currently Available from API

| Table | Source | Key Format | Notes |
|-------|--------|------------|-------|
| `planet_in_sign` | API `interpretations` | `"Sun in Gemini"` | Per planet + sign |
| `planet_in_house` | API `interpretations` | `"Moon in House 5"` | Per planet + house |
| `aspects` | API `interpretations` | TBD (e.g. `"Sun-Moon"` or `"Sun/Moon"`) | Per aspect pair |
| `chart_shape` | API `interpretations` | `primary`, `interpretation`, `distribution` | Shape type + distribution by hemisphere/quarter |

## Missing Tables (For Future DB)

### 1. Overview — Sun, Moon, Rising Synthesis

- **Purpose**: General interpretation combining the Big Three (Sun, Moon, Rising) into a cohesive personality/life theme summary.
- **Structure**: Could be keyed by `"Sun-Moon-Rising"` (e.g. `"Gemini-Pisces-Libra"`) or stored as template + substitutions.
- **Status**: Not in API; needs DB table or generative approach.

### 2. Chart Type & Hemisphere/Quarter Interpretations

- **Hemispheres**: Eastern vs Western, Northern vs Southern — what does planet emphasis in each mean?
- **Quarters**: 1st (1–3), 2nd (4–6), 3rd (7–9), 4th (10–12) — interpretation text per quarter emphasis.
- **Chart Shape**: Stellium, splash, bowl, etc. — API may provide `chart_shape.primary`; interpretation text for each shape type may need a lookup table.
- **Status**: API provides `chart_shape` when available; hemisphere/quarter interpretation text missing.

### 3. House Overview — House Meanings (1–12)

- **Purpose**: Brief meanings for each of the 12 houses (Identity, Possessions, Communication, etc.).
- **Structure**: `house_meanings[house_number]` → string.
- **Status**: No table exists; used in House Overview slide.

### 4. Planets in Houses — Detailed Interpretation

- **Purpose**: Per-planet, per-house interpretation (e.g. "Mars in House 6").
- **Structure**: API provides `planet_in_house` when available; key format `"Planet in House N"`.
- **Status**: API has it; fallback/offline table needed when API returns empty.

### 5. Element Overview

- **Purpose**: Interpretation of element balance — e.g. "Heavy water", "No fire", "Balanced elements".
- **Structure**: Could be keyed by count distribution (e.g. `"fire:3,earth:2,air:1,water:4"`) or by dominant element + deficit.
- **Status**: Element counts are computed client-side; interpretation text missing.

### 6. Modality Overview

- **Purpose**: Interpretation of modality balance — Cardinal, Fixed, Mutable.
- **Structure**: Similar to elements — keyed by distribution or dominant modality.
- **Status**: Modality counts are computed client-side; interpretation text missing.

### 7. Aspect Interpretations

- **Purpose**: Meaning of each aspect type (conjunction, opposition, trine, square, sextile) and optionally per-planet-pair nuance.
- **Structure**: API provides `aspects` when available; key format TBD.
- **Status**: API has it; fallback for aspect type keywords (e.g. "Square: tension, growth") needed.

### 8. Interesting Findings

- **Purpose**: Notable patterns — stellium, empty houses, retrograde emphasis, angular planets, etc.
- **Structure**: Rule-based or lookup — e.g. "3+ planets in one house" → stellium interpretation; "No planets in 7th" → empty house interpretation.
- **Status**: No automated detection or interpretation table; needs rules + content.

## Recommended DB Schema (Placeholder)

When building the interpretation database, consider tables such as:

```
- interpretation_overview (sun_sign, moon_sign, rising_sign -> text)
- house_meanings (house_number -> text)
- planet_in_house_fallback (planet, house -> text)  -- when API empty
- planet_in_sign_fallback (planet, sign -> text)    -- when API empty
- element_balance (element_distribution_key -> text)
- modality_balance (modality_distribution_key -> text)
- chart_shape_meanings (shape_type -> text)
- hemisphere_meaning (hemisphere_type -> text)
- quarter_meaning (quarter_number -> text)
- aspect_type_keywords (aspect_type -> short_description)
- interesting_finding_rules (pattern_type, condition -> text)
```

## UI Placeholder Notes

The interactive reading uses `[Interpretation data: ...]` placeholders where content is missing. Once tables exist, replace these with API/DB lookups.
