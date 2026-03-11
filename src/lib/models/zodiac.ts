export interface ZodiacSign {
  name: string;
  /** Unicode symbol (e.g. ♈) - fallback when Astronomicon not available */
  symbol: string;
  /** Astronomicon font character - use with font-family: Astronomicon */
  astronomiconChar: string;
  element: "fire" | "earth" | "air" | "water";
  modality: "cardinal" | "fixed" | "mutable";
  rulingPlanet: string;
  degreesStart: number;
  degreesEnd: number;
  houseNumber: number;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: "Aries",
    symbol: "\u2648",
    astronomiconChar: "A",
    element: "fire",
    modality: "cardinal",
    rulingPlanet: "Mars",
    degreesStart: 0,
    degreesEnd: 30,
    houseNumber: 1,
  },
  {
    name: "Taurus",
    symbol: "\u2649",
    astronomiconChar: "B",
    element: "earth",
    modality: "fixed",
    rulingPlanet: "Venus",
    degreesStart: 30,
    degreesEnd: 60,
    houseNumber: 2,
  },
  {
    name: "Gemini",
    symbol: "\u264A",
    astronomiconChar: "C",
    element: "air",
    modality: "mutable",
    rulingPlanet: "Mercury",
    degreesStart: 60,
    degreesEnd: 90,
    houseNumber: 3,
  },
  {
    name: "Cancer",
    symbol: "\u264B",
    astronomiconChar: "D",
    element: "water",
    modality: "cardinal",
    rulingPlanet: "Moon",
    degreesStart: 90,
    degreesEnd: 120,
    houseNumber: 4,
  },
  {
    name: "Leo",
    symbol: "\u264C",
    astronomiconChar: "E",
    element: "fire",
    modality: "fixed",
    rulingPlanet: "Sun",
    degreesStart: 120,
    degreesEnd: 150,
    houseNumber: 5,
  },
  {
    name: "Virgo",
    symbol: "\u264D",
    astronomiconChar: "F",
    element: "earth",
    modality: "mutable",
    rulingPlanet: "Mercury",
    degreesStart: 150,
    degreesEnd: 180,
    houseNumber: 6,
  },
  {
    name: "Libra",
    symbol: "\u264E",
    astronomiconChar: "G",
    element: "air",
    modality: "cardinal",
    rulingPlanet: "Venus",
    degreesStart: 180,
    degreesEnd: 210,
    houseNumber: 7,
  },
  {
    name: "Scorpio",
    symbol: "\u264F",
    astronomiconChar: "H",
    element: "water",
    modality: "fixed",
    rulingPlanet: "Pluto",
    degreesStart: 210,
    degreesEnd: 240,
    houseNumber: 8,
  },
  {
    name: "Sagittarius",
    symbol: "\u2650",
    astronomiconChar: "I",
    element: "fire",
    modality: "mutable",
    rulingPlanet: "Jupiter",
    degreesStart: 240,
    degreesEnd: 270,
    houseNumber: 9,
  },
  {
    name: "Capricorn",
    symbol: "\u2651",
    astronomiconChar: "J",
    element: "earth",
    modality: "cardinal",
    rulingPlanet: "Saturn",
    degreesStart: 270,
    degreesEnd: 300,
    houseNumber: 10,
  },
  {
    name: "Aquarius",
    symbol: "\u2652",
    astronomiconChar: "K",
    element: "air",
    modality: "fixed",
    rulingPlanet: "Uranus",
    degreesStart: 300,
    degreesEnd: 330,
    houseNumber: 11,
  },
  {
    name: "Pisces",
    symbol: "\u2653",
    astronomiconChar: "L",
    element: "water",
    modality: "mutable",
    rulingPlanet: "Neptune",
    degreesStart: 330,
    degreesEnd: 360,
    houseNumber: 12,
  },
];

export const ELEMENTS_COLORS: Record<ZodiacSign["element"], number> = {
  fire: 0xe74c3c,
  earth: 0x27ae60,
  air: 0xf1c40f,
  water: 0x3498db,
};
