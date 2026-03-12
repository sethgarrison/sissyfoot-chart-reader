/**
 * Slide types for the interactive natal chart reading.
 * Each slide maps to a section of the reading flow.
 */
export type ReadingSlideKind =
  | "overview"
  | "chart_type"
  | "house_overview"
  | "planets_in_houses"
  | "retrograde"
  | "element_overview"
  | "modality_overview"
  | "aspects"
  | "interesting_findings";

export interface ReadingSlide {
  kind: ReadingSlideKind;
  /** Display title */
  title: string;
  /** Optional subtitle or section label */
  subtitle?: string;
  /** Index of this slide in the deck (0-based) */
  index: number;
  /** For planets_in_houses: which planet+house this slide covers */
  planetInHouse?: { planet: string; house: number };
}

/** Human-friendly labels for each slide kind */
export const SLIDE_LABELS: Record<ReadingSlideKind, string> = {
  overview: "Overview",
  chart_type: "Chart Type & Shape",
  house_overview: "House Overview",
  planets_in_houses: "Planets in Houses",
  retrograde: "Retrograde Planets",
  element_overview: "Element Overview",
  modality_overview: "Modality Overview",
  aspects: "Aspects",
  interesting_findings: "Interesting Findings",
};
