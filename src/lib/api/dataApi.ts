/**
 * Data API client for interpretation tables.
 * Fetches and updates data via /data/* endpoints.
 */

import { DATA_ENDPOINTS } from "../types/data";
import type {
  Planet,
  PlanetUpdate,
  Sign,
  SignUpdate,
  House,
  HouseUpdate,
  Aspect,
  AspectUpdate,
  MoonSignInterpretation,
  MoonSignInterpretationUpdate,
  AscendantSignInterpretation,
  AscendantSignInterpretationUpdate,
  PlanetSignInterpretation,
  PlanetSignInterpretationUpdate,
  PlanetHouseInterpretation,
  PlanetHouseInterpretationUpdate,
  AspectTypeInterpretation,
  AspectTypeInterpretationUpdate,
  AspectInterpretation,
  AspectInterpretationUpdate,
  PlanetAspectInterpretation,
  PlanetAspectInterpretationUpdate,
  SignHouseInterpretation,
  SignHouseInterpretationUpdate,
  ChartShapeInterpretation,
  ChartShapeInterpretationUpdate,
  ChartDistributionInterpretation,
  ChartDistributionInterpretationUpdate,
  ModalityElementDistributionInterpretation,
  ModalityElementDistributionInterpretationUpdate,
} from "../types/data";

const API_BASE = "https://sissyfoot-astrological-api.onrender.com";

async function fetchList<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Data API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function patchItem<T>(path: string, id: number, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Data API PATCH error ${res.status}: ${text}`);
  }
  return res.json();
}

// --- Reference tables ---

export async function fetchPlanets(): Promise<Planet[]> {
  return fetchList<Planet>(DATA_ENDPOINTS.planets);
}

export async function patchPlanet(id: number, body: PlanetUpdate): Promise<Planet> {
  return patchItem<Planet>(DATA_ENDPOINTS.planets, id, body);
}

export async function fetchSigns(): Promise<Sign[]> {
  return fetchList<Sign>(DATA_ENDPOINTS.signs);
}

export async function patchSign(id: number, body: SignUpdate): Promise<Sign> {
  return patchItem<Sign>(DATA_ENDPOINTS.signs, id, body);
}

export async function fetchHouses(): Promise<House[]> {
  return fetchList<House>(DATA_ENDPOINTS.houses);
}

export async function patchHouse(id: number, body: HouseUpdate): Promise<House> {
  return patchItem<House>(DATA_ENDPOINTS.houses, id, body);
}

export async function fetchAspects(): Promise<Aspect[]> {
  return fetchList<Aspect>(DATA_ENDPOINTS.aspects);
}

export async function patchAspect(id: number, body: AspectUpdate): Promise<Aspect> {
  return patchItem<Aspect>(DATA_ENDPOINTS.aspects, id, body);
}

// --- Big Three (Sun merged into Signs) ---

export async function fetchMoonSignInterpretations(): Promise<MoonSignInterpretation[]> {
  return fetchList<MoonSignInterpretation>(DATA_ENDPOINTS.moon);
}

export async function patchMoonSignInterpretation(
  id: number,
  body: MoonSignInterpretationUpdate
): Promise<MoonSignInterpretation> {
  return patchItem<MoonSignInterpretation>(DATA_ENDPOINTS.moon, id, body);
}

export async function fetchAscendantSignInterpretations(): Promise<
  AscendantSignInterpretation[]
> {
  return fetchList<AscendantSignInterpretation>(DATA_ENDPOINTS.ascendant);
}

export async function patchAscendantSignInterpretation(
  id: number,
  body: AscendantSignInterpretationUpdate
): Promise<AscendantSignInterpretation> {
  return patchItem<AscendantSignInterpretation>(DATA_ENDPOINTS.ascendant, id, body);
}

// --- Interpretation tables ---

export async function fetchPlanetSignInterpretations(): Promise<
  PlanetSignInterpretation[]
> {
  return fetchList<PlanetSignInterpretation>(DATA_ENDPOINTS.planetSign);
}

export async function patchPlanetSignInterpretation(
  id: number,
  body: PlanetSignInterpretationUpdate
): Promise<PlanetSignInterpretation> {
  return patchItem<PlanetSignInterpretation>(DATA_ENDPOINTS.planetSign, id, body);
}

export async function fetchPlanetHouseInterpretations(): Promise<
  PlanetHouseInterpretation[]
> {
  return fetchList<PlanetHouseInterpretation>(DATA_ENDPOINTS.planetHouse);
}

export async function patchPlanetHouseInterpretation(
  id: number,
  body: PlanetHouseInterpretationUpdate
): Promise<PlanetHouseInterpretation> {
  return patchItem<PlanetHouseInterpretation>(DATA_ENDPOINTS.planetHouse, id, body);
}

export async function fetchAspectTypeInterpretations(): Promise<
  AspectTypeInterpretation[]
> {
  return fetchList<AspectTypeInterpretation>(DATA_ENDPOINTS.aspectType);
}

export async function patchAspectTypeInterpretation(
  id: number,
  body: AspectTypeInterpretationUpdate
): Promise<AspectTypeInterpretation> {
  return patchItem<AspectTypeInterpretation>(DATA_ENDPOINTS.aspectType, id, body);
}

export async function fetchAspectInterpretations(): Promise<AspectInterpretation[]> {
  return fetchList<AspectInterpretation>(DATA_ENDPOINTS.aspectGeneric);
}

export async function patchAspectInterpretation(
  id: number,
  body: AspectInterpretationUpdate
): Promise<AspectInterpretation> {
  return patchItem<AspectInterpretation>(DATA_ENDPOINTS.aspectGeneric, id, body);
}

export async function fetchPlanetAspectInterpretations(): Promise<
  PlanetAspectInterpretation[]
> {
  return fetchList<PlanetAspectInterpretation>(DATA_ENDPOINTS.planetAspect);
}

export async function patchPlanetAspectInterpretation(
  id: number,
  body: PlanetAspectInterpretationUpdate
): Promise<PlanetAspectInterpretation> {
  return patchItem<PlanetAspectInterpretation>(DATA_ENDPOINTS.planetAspect, id, body);
}

export async function fetchSignHouseInterpretations(): Promise<
  SignHouseInterpretation[]
> {
  return fetchList<SignHouseInterpretation>(DATA_ENDPOINTS.signHouse);
}

export async function patchSignHouseInterpretation(
  id: number,
  body: SignHouseInterpretationUpdate
): Promise<SignHouseInterpretation> {
  return patchItem<SignHouseInterpretation>(DATA_ENDPOINTS.signHouse, id, body);
}

export async function fetchChartShapeInterpretations(): Promise<
  ChartShapeInterpretation[]
> {
  return fetchList<ChartShapeInterpretation>(DATA_ENDPOINTS.chartShape);
}

export async function patchChartShapeInterpretation(
  id: number,
  body: ChartShapeInterpretationUpdate
): Promise<ChartShapeInterpretation> {
  return patchItem<ChartShapeInterpretation>(DATA_ENDPOINTS.chartShape, id, body);
}

export async function fetchChartDistributionInterpretations(): Promise<
  ChartDistributionInterpretation[]
> {
  return fetchList<ChartDistributionInterpretation>(DATA_ENDPOINTS.chartDistribution);
}

export async function patchChartDistributionInterpretation(
  id: number,
  body: ChartDistributionInterpretationUpdate
): Promise<ChartDistributionInterpretation> {
  return patchItem<ChartDistributionInterpretation>(
    DATA_ENDPOINTS.chartDistribution,
    id,
    body
  );
}

export async function fetchModalityElementInterpretations(): Promise<
  ModalityElementDistributionInterpretation[]
> {
  return fetchList<ModalityElementDistributionInterpretation>(
    DATA_ENDPOINTS.modalityElement
  );
}

export async function patchModalityElementInterpretation(
  id: number,
  body: ModalityElementDistributionInterpretationUpdate
): Promise<ModalityElementDistributionInterpretation> {
  return patchItem<ModalityElementDistributionInterpretation>(
    DATA_ENDPOINTS.modalityElement,
    id,
    body
  );
}
