/**
 * Public artwork paths under `/public` (Vite serves from site root).
 * Folder names contain spaces — use these helpers so sections stay consistent.
 */

const PLANET_BASE = "/Planet Art";
const ZODIAC_BASE = "/Zodiac Art";

/** Planet display name → filename in `public/Planet Art/`. */
export const PLANET_ART_FILE: Record<string, string> = {
  Sun: "SUN.jpg",
  Moon: "MOON.jpg",
  Mercury: "MERCURY.JPG",
  Venus: "VENUS.jpg",
  Mars: "MARS.jpg",
  Jupiter: "JUPITER.jpg",
  Saturn: "SATURN.jpg",
  Uranus: "URANUS.jpg",
  Neptune: "NEPTUNE.jpg",
  Pluto: "PLUTO.jpg",
};

/** Ascendant / rising section (not a planet glyph in the set). */
export const RISING_ART_SRC = `${PLANET_BASE}/RISING.jpg`;

/** Normalized sign name → filename in `public/Zodiac Art/`. */
export const ZODIAC_ART_FILE: Record<string, string> = {
  aries: "ARIES.jpg",
  taurus: "TAURUS.jpg",
  gemini: "GEMINI.jpg",
  cancer: "CANCER.jpg",
  leo: "LEO.jpg",
  virgo: "VIRGO.jpg",
  libra: "LIBRA.jpg",
  scorpio: "SCORPIO.jpg",
  sagittarius: "SAGITTARIUS.jpg",
  capricorn: "CAPRICORN.jpg",
  aquarius: "AQUARIUS.jpg",
  pisces: "PISCES.jpg",
};

export function planetArtSrc(planetName: string): string | undefined {
  const file = PLANET_ART_FILE[planetName];
  return file ? `${PLANET_BASE}/${file}` : undefined;
}

export function zodiacArtSrc(sign: string): string | undefined {
  const file = ZODIAC_ART_FILE[sign.trim().toLowerCase()];
  return file ? `${ZODIAC_BASE}/${file}` : undefined;
}
