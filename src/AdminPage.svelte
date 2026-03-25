<script lang="ts">
  import { onMount } from "svelte";
  import EditableDataTable from "./lib/components/admin/EditableDataTable.svelte";
  import * as dataApi from "./lib/api/dataApi";
  import type {
    Planet,
    Sign,
    House,
    Aspect,
    MoonSignInterpretation,
    AscendantSignInterpretation,
    PlanetSignInterpretation,
    PlanetHouseInterpretation,
    AspectTypeInterpretation,
    AspectInterpretation,
    PlanetAspectInterpretation,
    SignHouseInterpretation,
    ChartShapeInterpretation,
    ChartDistributionInterpretation,
    ModalityElementDistributionInterpretation,
  } from "./lib/types/data";

  type TabId =
    | "planets"
    | "signs"
    | "houses"
    | "aspects"
    | "moon"
    | "ascendant"
    | "planetSign"
    | "planetHouse"
    | "aspectType"
    | "aspectGeneric"
    | "planetAspect"
    | "signHouse"
    | "chartShape"
    | "chartDistribution"
    | "modalityElement";

  const TABS: { id: TabId; label: string }[] = [
    { id: "planets", label: "Planets" },
    { id: "signs", label: "Signs" },
    { id: "houses", label: "Houses" },
    { id: "aspects", label: "Aspects" },
    { id: "moon", label: "Moon Sign" },
    { id: "ascendant", label: "Ascendant" },
    { id: "planetSign", label: "Planet–Sign" },
    { id: "planetHouse", label: "Planet–House" },
    { id: "aspectType", label: "Aspect Type" },
    { id: "aspectGeneric", label: "Aspect Generic" },
    { id: "planetAspect", label: "Planet–Aspect" },
    { id: "signHouse", label: "Sign–House" },
    { id: "chartShape", label: "Chart Shape" },
    { id: "chartDistribution", label: "Chart Distribution" },
    { id: "modalityElement", label: "Modality–Element" },
  ];

  let activeTab = $state<TabId>("planets");
  let loading = $state(false);
  let loadError = $state<string | null>(null);

  let planets = $state<Planet[]>([]);
  let signs = $state<Sign[]>([]);
  let houses = $state<House[]>([]);
  let aspects = $state<Aspect[]>([]);
  let moonSigns = $state<MoonSignInterpretation[]>([]);
  let ascendants = $state<AscendantSignInterpretation[]>([]);
  let planetSigns = $state<PlanetSignInterpretation[]>([]);
  let planetHouses = $state<PlanetHouseInterpretation[]>([]);
  let aspectTypes = $state<AspectTypeInterpretation[]>([]);
  let aspectGenerics = $state<AspectInterpretation[]>([]);
  let planetAspects = $state<PlanetAspectInterpretation[]>([]);
  let signHouses = $state<SignHouseInterpretation[]>([]);
  let chartShapes = $state<ChartShapeInterpretation[]>([]);
  let chartDistributions = $state<ChartDistributionInterpretation[]>([]);
  let modalityElements = $state<ModalityElementDistributionInterpretation[]>([]);

  async function loadAll() {
    loading = true;
    loadError = null;
    try {
      const [
        p,
        s,
        h,
        a,
        moon,
        asc,
        ps,
        ph,
        at,
        ag,
        pa,
        sh,
        cs,
        cd,
        me,
      ] = await Promise.all([
        dataApi.fetchPlanets(),
        dataApi.fetchSigns(),
        dataApi.fetchHouses(),
        dataApi.fetchAspects(),
        dataApi.fetchMoonSignInterpretations(),
        dataApi.fetchAscendantSignInterpretations(),
        dataApi.fetchPlanetSignInterpretations(),
        dataApi.fetchPlanetHouseInterpretations(),
        dataApi.fetchAspectTypeInterpretations(),
        dataApi.fetchAspectInterpretations(),
        dataApi.fetchPlanetAspectInterpretations(),
        dataApi.fetchSignHouseInterpretations(),
        dataApi.fetchChartShapeInterpretations(),
        dataApi.fetchChartDistributionInterpretations(),
        dataApi.fetchModalityElementInterpretations(),
      ]);
      planets = p;
      signs = s;
      houses = h;
      aspects = a;
      moonSigns = moon;
      ascendants = asc;
      planetSigns = ps;
      planetHouses = ph;
      aspectTypes = at;
      aspectGenerics = ag;
      planetAspects = pa;
      signHouses = sh;
      chartShapes = cs;
      chartDistributions = cd;
      modalityElements = me;
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Failed to load data";
    } finally {
      loading = false;
    }
  }

  onMount(() => loadAll());

  /** Wraps a patch fn to update local state with the API response so the UI reflects the change immediately. */
  function withStateUpdate<T extends { id: number }>(
    patchFn: (id: number, body: any) => Promise<T>,
    getData: () => T[],
    setData: (data: T[]) => void
  ) {
    return async (id: number, update: any) => {
      const updated = await patchFn(id, update);
      setData(getData().map((item) => (item.id === id ? updated : item)));
      return updated;
    };
  }
</script>

<div class="admin-page">
  <header class="admin-header">
    <h1>Interpretation Data Admin</h1>
    <div class="header-actions">
      <button type="button" class="btn-refresh" onclick={loadAll} disabled={loading}>
        {loading ? "Loading…" : "Refresh"}
      </button>
      <button type="button" class="back-link" onclick={() => (location.hash = '')}>← Back to app</button>
    </div>
  </header>

  {#if loadError}
    <div class="load-error">{loadError}</div>
  {/if}

  <div class="tabs">
    {#each TABS as tab}
      <button
        type="button"
        class="tab"
        class:active={activeTab === tab.id}
        onclick={() => (activeTab = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#if activeTab === "planets"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "symbol", label: "Symbol", editable: true },
          { key: "description", label: "Description", editable: true, multiline: true },
          { key: "keywords", label: "Keywords", editable: true, multiline: true },
        ]}
        data={planets}
        onSave={withStateUpdate(dataApi.patchPlanet, () => planets, (v) => (planets = v))}
      />
    {:else if activeTab === "signs"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "element", label: "Element", editable: true },
          { key: "modality", label: "Modality", editable: true },
          { key: "archetypes_balanced", label: "Archetypes Balanced", editable: true, multiline: true },
          { key: "archetypes_unbalanced", label: "Archetypes Unbalanced", editable: true, multiline: true },
          { key: "journey", label: "Journey", editable: true, multiline: true },
          { key: "gifts", label: "Gifts", editable: true, multiline: true },
          { key: "challenges", label: "Challenges", editable: true, multiline: true },
          { key: "interpretation", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={signs}
        onSave={withStateUpdate(dataApi.patchSign, () => signs, (v) => (signs = v))}
      />
    {:else if activeTab === "houses"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "number", label: "Number" },
          { key: "type", label: "Type", editable: true },
          { key: "description", label: "Description", editable: true, multiline: true },
          { key: "subtitle", label: "Subtitle", editable: true },
          { key: "keywords", label: "Keywords", editable: true, multiline: true },
        ]}
        data={houses}
        onSave={withStateUpdate(dataApi.patchHouse, () => houses, (v) => (houses = v))}
      />
    {:else if activeTab === "aspects"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "angle_degrees", label: "Angle (°)", editable: true, type: "number" },
          { key: "symbol", label: "Symbol", editable: true },
          { key: "type", label: "Type", editable: true },
        ]}
        data={aspects}
        onSave={withStateUpdate(dataApi.patchAspect, () => aspects, (v) => (aspects = v))}
      />
    {:else if activeTab === "moon"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "sign", label: "Sign" },
          { key: "nature", label: "Nature", editable: true, multiline: true },
          { key: "sources_of_contentment", label: "Sources of Contentment", editable: true, multiline: true },
          { key: "keywords", label: "Keywords", editable: true, multiline: true },
          { key: "interpretation", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={moonSigns}
        onSave={withStateUpdate(dataApi.patchMoonSignInterpretation, () => moonSigns, (v) => (moonSigns = v))}
      />
    {:else if activeTab === "ascendant"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "sign", label: "Sign" },
          { key: "impression", label: "Impression", editable: true, multiline: true },
          { key: "appearance", label: "Appearance", editable: true, multiline: true },
          { key: "childhood", label: "Childhood", editable: true, multiline: true },
          { key: "balance", label: "Balance", editable: true, multiline: true },
          { key: "interpretation", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={ascendants}
        onSave={withStateUpdate(dataApi.patchAscendantSignInterpretation, () => ascendants, (v) => (ascendants = v))}
      />
    {:else if activeTab === "planetSign"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "planet", label: "Planet" },
          { key: "sign", label: "Sign" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
          { key: "interpretation_long", label: "Long", editable: true, multiline: true },
          { key: "interpretation_short", label: "Short", editable: true },
          { key: "keywords", label: "Keywords", editable: true, multiline: true },
          { key: "retrograde_interpretation", label: "Retrograde", editable: true, multiline: true },
        ]}
        data={planetSigns}
        onSave={withStateUpdate(dataApi.patchPlanetSignInterpretation, () => planetSigns, (v) => (planetSigns = v))}
      />
    {:else if activeTab === "planetHouse"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "planet", label: "Planet" },
          { key: "house", label: "House" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
          { key: "short_interpretation", label: "Short", editable: true },
          { key: "retrograde_interpretation", label: "Retrograde", editable: true, multiline: true },
        ]}
        data={planetHouses}
        onSave={withStateUpdate(dataApi.patchPlanetHouseInterpretation, () => planetHouses, (v) => (planetHouses = v))}
      />
    {:else if activeTab === "aspectType"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "type_key", label: "Type" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={aspectTypes}
        onSave={withStateUpdate(dataApi.patchAspectTypeInterpretation, () => aspectTypes, (v) => (aspectTypes = v))}
      />
    {:else if activeTab === "aspectGeneric"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "aspect", label: "Aspect" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={aspectGenerics}
        onSave={withStateUpdate(dataApi.patchAspectInterpretation, () => aspectGenerics, (v) => (aspectGenerics = v))}
      />
    {:else if activeTab === "planetAspect"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "planet_1", label: "Planet 1" },
          { key: "planet_2", label: "Planet 2" },
          { key: "aspect", label: "Aspect" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={planetAspects}
        onSave={withStateUpdate(dataApi.patchPlanetAspectInterpretation, () => planetAspects, (v) => (planetAspects = v))}
      />
    {:else if activeTab === "signHouse"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "house", label: "House" },
          { key: "sign", label: "Sign" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={signHouses}
        onSave={withStateUpdate(dataApi.patchSignHouseInterpretation, () => signHouses, (v) => (signHouses = v))}
      />
    {:else if activeTab === "chartShape"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "shape_key", label: "Shape" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={chartShapes}
        onSave={withStateUpdate(dataApi.patchChartShapeInterpretation, () => chartShapes, (v) => (chartShapes = v))}
      />
    {:else if activeTab === "chartDistribution"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "distribution_key", label: "Distribution" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={chartDistributions}
        onSave={withStateUpdate(dataApi.patchChartDistributionInterpretation, () => chartDistributions, (v) => (chartDistributions = v))}
      />
    {:else if activeTab === "modalityElement"}
      <EditableDataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "distribution_key", label: "Distribution" },
          { key: "interpretation_text", label: "Interpretation", editable: true, multiline: true },
        ]}
        data={modalityElements}
        onSave={withStateUpdate(dataApi.patchModalityElementInterpretation, () => modalityElements, (v) => (modalityElements = v))}
      />
    {/if}
  </div>
</div>

<style>
  .admin-page {
    min-height: 100vh;
    padding: 1rem;
    background: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .admin-header h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .btn-refresh {
    padding: 0.35rem 0.75rem;
    background: #21262d;
    border: 1px solid #30363d;
    color: #c9d1d9;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
  }
  .btn-refresh:hover:not(:disabled) {
    background: #30363d;
    border-color: #8b949e;
  }
  .btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .back-link {
    color: #58a6ff;
    text-decoration: none;
    font-size: 13px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }
  .back-link:hover {
    text-decoration: underline;
  }
  .load-error {
    padding: 0.75rem;
    background: rgba(248, 81, 73, 0.15);
    border: 1px solid #f85149;
    color: #f85149;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.5rem;
  }
  .tab {
    padding: 0.4rem 0.75rem;
    background: transparent;
    border: 1px solid transparent;
    color: #8b949e;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
  }
  .tab:hover {
    color: #c9d1d9;
    background: #21262d;
  }
  .tab.active {
    background: #238636;
    color: white;
    border-color: #238636;
  }
  .tab-content {
    padding-top: 0.5rem;
  }
</style>
