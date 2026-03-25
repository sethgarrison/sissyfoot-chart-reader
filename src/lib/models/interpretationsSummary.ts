/**
 * Types for interpretations_summary from GET /chart.
 * Matches server shape from interpretations/summary.py.
 * @see Client guide: rendering interpretations_summary
 */

/** Big Three entry (Sun/Moon/Ascendant in sign). Same shape as ChartInterpretations.big_three. */
export interface BigThreeEntrySummary {
  interpretation?: string;
  archetypes_balanced?: string;
  archetypes_unbalanced?: string;
  journey?: string;
  gifts?: string;
  challenges?: string;
  nature?: string;
  sources_of_contentment?: string;
  keywords?: string;
  impression?: string;
  appearance?: string;
  childhood?: string;
  balance?: string;
  source?: "database";
  is_placeholder?: boolean;
}

/** One aspect under a placement. Same aspect may appear under both endpoints. */
export interface SummaryAspectItem {
  aspect: string;
  synthesis: string;
  interpretation?: string;
  aspect_keyphrase: string | null;
  other_body: string;
  other_sign: string;
  other_planet_keyword?: string | null;
  other_sign_adverb?: string | null;
  is_placeholder?: boolean;
}

/** One chart planet in a house (placement row). */
export interface SummaryPlacement {
  body: string;
  synthesis: string;
  planet_keyword?: string | null;
  sign?: string | null;
  sign_adverb?: string | null;
  retrograde: boolean;
  long?: {
    in_sign?: string | null;
    in_house?: string | null;
  };
  aspects: SummaryAspectItem[];
}

/** One house section — only houses with at least one planet. */
export interface HouseGroupSummary {
  house: number;
  house_keyword: string | null;
  sign_on_cusp: string;
  placements: SummaryPlacement[];
}

/** Chart context: shape, concentration, modality/element emphasis. */
export interface ChartContextSummary {
  shape?: {
    key: string;
    interpretation: string;
  } | null;
  concentration?: Record<string, string>;
  modality_element?: Record<string, string>;
}

/** Big three objects (Sun, Moon, Ascendant) — same structure as legacy interpretations.big_three. */
export interface BigThreeSummary {
  sun?: Record<string, BigThreeEntrySummary>;
  moon?: Record<string, BigThreeEntrySummary>;
  ascendant?: Record<string, BigThreeEntrySummary>;
}

/** Simplified reading payload. Prefer this over legacy interpretations. */
export interface InterpretationsSummary {
  house_groups: HouseGroupSummary[];
  chart_context?: ChartContextSummary | null;
  big_three?: BigThreeSummary | null;
}
