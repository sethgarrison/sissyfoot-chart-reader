<script lang="ts">
  import ChartSvg from "../chart/ChartSvg.svelte";
  import type { NatalChart, PlanetPlacement } from "../models";
  import type { HouseGroupSummary, SummaryPlacement } from "../models/interpretationsSummary";
  import type { HouseInterpretation } from "../types/data";
  import { getPlanetInHouseInterpretation, getPlanetInSignInterpretation, normalizeChartHouse } from "../models/reading";
  import { getBigThree, planetArtSrc, RISING_ART_SRC, zodiacArtSrc } from "../reading";

  interface Props {
    chart: NatalChart;
    onClose: () => void;
  }
  let { chart, onClose }: Props = $props();

  const bigThree = $derived(getBigThree(chart));
  const interpretationsSummary = $derived(chart.interpretations_summary);
  const risingSignArtSrc = $derived(zodiacArtSrc(bigThree.ascendant.placement.sign));
  const CHART_PX = 440;

  /** Houses 1–12 that contain at least one planet (excluding Sun/Moon — covered above), in order. */
  const houseSections = $derived.by(() => {
    const byHouse = new Map<number, PlanetPlacement[]>();
    for (const p of chart.planets) {
      if (p.planet === "Sun" || p.planet === "Moon") continue;
      const h = normalizeChartHouse(p.house);
      if (h == null || h < 1 || h > 12) continue;
      const list = byHouse.get(h) ?? [];
      list.push(p);
      byHouse.set(h, list);
    }
    const occupied = new Set(byHouse.keys());
    const summaryGroups = interpretationsSummary?.house_groups ?? [];
    const houses = [...occupied].sort((a, b) => a - b);

    return houses.map((houseNum) => {
      const planets = (byHouse.get(houseNum) ?? []).slice().sort((a, b) => a.planet.localeCompare(b.planet));
      const summaryGroup = summaryGroups.find((g) => {
        const gh = normalizeChartHouse(g.house);
        return gh === houseNum && gh != null && occupied.has(gh) && (g.placements?.length ?? 0) > 0;
      });
      const cusp = chart.houses.find((h) => h.house === houseNum);
      const legacyGroup = chart.interpretation?.house_groups?.find(
        (hg) => normalizeChartHouse(hg.house) === houseNum
      );
      return { house: houseNum, cusp, planets, summaryGroup, legacyGroup };
    });
  });

  function summaryPlacementFor(
    group: HouseGroupSummary | undefined,
    planetName: string
  ): SummaryPlacement | undefined {
    return group?.placements?.find((pl) => pl.body === planetName);
  }

  function meaningInSign(placement: PlanetPlacement, sumPl: SummaryPlacement | undefined): string {
    return (
      getPlanetInSignInterpretation(placement.planet, placement.sign, chart.interpretation) ??
      sumPl?.long?.in_sign ??
      ""
    ).trim();
  }

  function meaningInHouse(placement: PlanetPlacement, sumPl: SummaryPlacement | undefined): string {
    return (
      getPlanetInHouseInterpretation(placement.planet, placement.house, chart.interpretation) ??
      sumPl?.long?.in_house ??
      ""
    ).trim();
  }

  function legacyPlanetRow(group: HouseInterpretation | undefined, planetName: string) {
    return group?.planets?.find((pl) => pl.body === planetName);
  }

  function houseZodiacImgSrc(
    summaryGroup: HouseGroupSummary | undefined,
    cusp: { sign: string } | undefined
  ): string | undefined {
    const sign = summaryGroup?.sign_on_cusp?.trim() || cusp?.sign?.trim() || "";
    return sign ? zodiacArtSrc(sign) : undefined;
  }

  function summaryGroupForHouse(house: number): HouseGroupSummary | undefined {
    const h = normalizeChartHouse(house);
    return interpretationsSummary?.house_groups?.find(
      (g) => normalizeChartHouse(g.house) === h
    );
  }

  /** Planet-in-house copy from structured interpretation and/or summary `long.in_house`. */
  function luminariesInHouse(body: "Sun" | "Moon", placement: PlanetPlacement): string {
    const hg = summaryGroupForHouse(placement.house);
    return meaningInHouse(placement, summaryPlacementFor(hg, body));
  }

  function ascendantInHouseText(): string {
    const hg = summaryGroupForHouse(1);
    const sumPl = summaryPlacementFor(hg, "Ascendant");
    return (
      getPlanetInHouseInterpretation("Ascendant", 1, chart.interpretation) ??
      sumPl?.long?.in_house ??
      ""
    ).trim();
  }

  /** Rising sign: structured `planet_in_sign` + summary `long.in_sign` for Ascendant. */
  function ascendantInSignText(): string {
    const sign = chart.ascendant.sign;
    const hg = summaryGroupForHouse(1);
    const sumPl = summaryPlacementFor(hg, "Ascendant");
    return (
      getPlanetInSignInterpretation("Ascendant", sign, chart.interpretation) ??
      sumPl?.long?.in_sign ??
      ""
    ).trim();
  }

  const ascendantInHouseCopy = $derived.by(() => ascendantInHouseText());
  const ascendantInSignCopy = $derived.by(() => ascendantInSignText());
</script>

<div class="scroll-reading">
  <header class="scroll-header">
    <button class="back-btn" type="button" onclick={onClose} aria-label="Back to chart">
      ← Back to Chart
    </button>
  </header>

  <main class="scroll-body">
    <section class="reading-section chart-section" aria-labelledby="chart-heading">
      <h2 id="chart-heading" class="section-title">Your chart</h2>
      <div class="chart-static" aria-hidden="true">
        <ChartSvg {chart} width={CHART_PX} height={CHART_PX} scale={1} panX={0} panY={0} />
      </div>
    </section>

    <section class="reading-section sun-section big-three-section" aria-labelledby="sun-heading">
      <h2 id="sun-heading" class="section-title">Sun</h2>
      {#if bigThree.sun.placement}
        {@const sun = bigThree.sun.placement}
        {@const sunInHouse = luminariesInHouse("Sun", sun)}
        {@const sunSignArt = zodiacArtSrc(sun.sign)}
        <div class="big-three-layout">
          <div class="big-three-col big-three-col--planet" aria-hidden="true">
            {#if planetArtSrc("Sun")}
              <figure class="big-three-planet-art">
                <img src={planetArtSrc("Sun")} alt="" />
              </figure>
            {/if}
            {#if sunSignArt}
              <figure class="big-three-sign-art">
                <img src={sunSignArt} alt="" />
              </figure>
            {/if}
          </div>
          <div class="big-three-col big-three-col--copy">
            <p class="big-three-sign-name">{sun.sign}</p>
            <p class="big-three-meta">
              {sun.degrees}°{sun.minutes.toString().padStart(2, "0")}' · House {sun.house}{#if sun.retrograde}<span
                class="rx">Rx</span>{/if}
            </p>

            {#if bigThree.sun.reading}
              {@const sunEntry = bigThree.sun.reading}
              <div class="interpretation-display big-three-reading sun-reading">
                {#if sunEntry.interpretation}
                  <p class="sun-reading-lead interpretation-display__text">{sunEntry.interpretation}</p>
                {/if}
                {#if sunEntry.archetypes_balanced}
                  <p class="body-text interpretation-display__text">
                    <strong>Archetypes (balanced):</strong>
                    {sunEntry.archetypes_balanced}
                  </p>
                {/if}
                {#if sunEntry.archetypes_unbalanced}
                  <p class="body-text interpretation-display__text">
                    <strong>Archetypes (unbalanced):</strong>
                    {sunEntry.archetypes_unbalanced}
                  </p>
                {/if}
                {#if sunEntry.journey}
                  <p class="body-text interpretation-display__text"><strong>Journey:</strong> {sunEntry.journey}</p>
                {/if}
                {#if sunEntry.gifts}
                  <p class="body-text interpretation-display__text"><strong>Gifts:</strong> {sunEntry.gifts}</p>
                {/if}
                {#if sunEntry.challenges}
                  <p class="body-text interpretation-display__text"><strong>Challenges:</strong> {sunEntry.challenges}</p>
                {/if}
              </div>
            {/if}

            {#if sunInHouse}
              <div class="interpretation-display">
                <h3 class="interpretation-display__label">In House {sun.house}</h3>
                <p class="body-text interpretation-display__text big-three-house-text">{sunInHouse}</p>
              </div>
            {/if}

            {#if !bigThree.sun.reading && !sunInHouse}
              <p class="muted">No Sun sign reading available for this chart.</p>
            {/if}
          </div>
        </div>
      {:else}
        <p class="muted">No Sun placement in this chart.</p>
      {/if}
    </section>

    <section class="reading-section moon-section big-three-section" aria-labelledby="moon-heading">
      <h2 id="moon-heading" class="section-title">Moon</h2>
      {#if bigThree.moon.placement}
        {@const moon = bigThree.moon.placement}
        {@const moonInHouse = luminariesInHouse("Moon", moon)}
        {@const moonSignArt = zodiacArtSrc(moon.sign)}
        <div class="big-three-layout">
          <div class="big-three-col big-three-col--planet" aria-hidden="true">
            {#if planetArtSrc("Moon")}
              <figure class="big-three-planet-art">
                <img src={planetArtSrc("Moon")} alt="" />
              </figure>
            {/if}
            {#if moonSignArt}
              <figure class="big-three-sign-art">
                <img src={moonSignArt} alt="" />
              </figure>
            {/if}
          </div>
          <div class="big-three-col big-three-col--copy">
            <p class="big-three-sign-name">{moon.sign}</p>
            <p class="big-three-meta">
              {moon.degrees}°{moon.minutes.toString().padStart(2, "0")}' · House {moon.house}{#if moon.retrograde}<span
                class="rx">Rx</span>{/if}
            </p>

            {#if bigThree.moon.reading}
              {@const moonEntry = bigThree.moon.reading}
              <div class="interpretation-display big-three-reading moon-reading">
                {#if moonEntry.interpretation}
                  <p class="sun-reading-lead interpretation-display__text">{moonEntry.interpretation}</p>
                {/if}
                {#if moonEntry.nature}
                  <p class="body-text interpretation-display__text"><strong>Nature:</strong> {moonEntry.nature}</p>
                {/if}
                {#if moonEntry.sources_of_contentment}
                  <p class="body-text interpretation-display__text">
                    <strong>Sources of contentment:</strong>
                    {moonEntry.sources_of_contentment}
                  </p>
                {/if}
                {#if moonEntry.keywords}
                  <p class="body-text interpretation-display__text"><strong>Keywords:</strong> {moonEntry.keywords}</p>
                {/if}
              </div>
            {/if}

            {#if moonInHouse}
              <div class="interpretation-display">
                <h3 class="interpretation-display__label">In House {moon.house}</h3>
                <p class="body-text interpretation-display__text big-three-house-text">{moonInHouse}</p>
              </div>
            {/if}

            {#if !bigThree.moon.reading && !moonInHouse}
              <p class="muted">No Moon sign reading available for this chart.</p>
            {/if}
          </div>
        </div>
      {:else}
        <p class="muted">No Moon placement in this chart.</p>
      {/if}
    </section>

    <section class="reading-section rising-section big-three-section" aria-labelledby="rising-heading">
      <h2 id="rising-heading" class="section-title">Rising (Ascendant)</h2>
      <div class="big-three-layout">
        <div class="big-three-col big-three-col--planet" aria-hidden="true">
          <figure class="big-three-planet-art">
            <img src={RISING_ART_SRC} alt="" />
          </figure>
          {#if risingSignArtSrc}
            <figure class="big-three-sign-art">
              <img src={risingSignArtSrc} alt="" />
            </figure>
          {/if}
        </div>
        <div class="big-three-col big-three-col--copy">
          <p class="big-three-sign-name">{bigThree.ascendant.placement.sign}</p>
          <p class="big-three-meta">
            {bigThree.ascendant.placement.degrees}°{bigThree.ascendant.placement.minutes
              .toString()
              .padStart(2, "0")}' · 1st house cusp
          </p>

          {#if bigThree.ascendant.reading}
            {@const ascEntry = bigThree.ascendant.reading}
            <div class="interpretation-display big-three-reading rising-reading">
              {#if ascEntry.interpretation}
                <p class="sun-reading-lead interpretation-display__text">{ascEntry.interpretation}</p>
              {/if}
              {#if ascEntry.impression}
                <p class="body-text interpretation-display__text"><strong>Impression:</strong> {ascEntry.impression}</p>
              {/if}
              {#if ascEntry.appearance}
                <p class="body-text interpretation-display__text"><strong>Appearance:</strong> {ascEntry.appearance}</p>
              {/if}
              {#if ascEntry.childhood}
                <p class="body-text interpretation-display__text"><strong>Childhood:</strong> {ascEntry.childhood}</p>
              {/if}
              {#if ascEntry.balance}
                <p class="body-text interpretation-display__text"><strong>Balance:</strong> {ascEntry.balance}</p>
              {/if}
            </div>
          {/if}

          {#if ascendantInSignCopy}
            <div class="interpretation-display">
              <h3 class="interpretation-display__label">In {bigThree.ascendant.placement.sign}</h3>
              <p class="body-text interpretation-display__text big-three-house-text">{ascendantInSignCopy}</p>
            </div>
          {/if}

          {#if ascendantInHouseCopy}
            <div class="interpretation-display">
              <h3 class="interpretation-display__label">In House 1</h3>
              <p class="body-text interpretation-display__text big-three-house-text">{ascendantInHouseCopy}</p>
            </div>
          {/if}

          {#if !bigThree.ascendant.reading && !ascendantInHouseCopy && !ascendantInSignCopy}
            <p class="muted">No Ascendant reading available for this chart.</p>
          {/if}
        </div>
      </div>
    </section>

    {#each houseSections as block (block.house)}
      {@const legacyHg = block.legacyGroup}
      {@const houseZImg = houseZodiacImgSrc(block.summaryGroup, block.cusp)}
      {@const houseCuspSign = block.cusp?.sign ?? block.summaryGroup?.sign_on_cusp ?? ""}
      {@const houseInSignInterp = legacyHg?.interpretation?.house_in_sign?.trim() ?? ""}
      <section class="reading-section house-section" aria-labelledby="house-{block.house}-heading">
        <h2 id="house-{block.house}-heading" class="section-title">
          {#if houseCuspSign}
            House {block.house} – {houseCuspSign}
          {:else if block.summaryGroup?.house_keyword}
            House {block.house}: {block.summaryGroup.house_keyword}
          {:else}
            House {block.house}
          {/if}
        </h2>
        {#if block.summaryGroup?.house_keyword && houseCuspSign}
          <p class="house-keyword-sub">{block.summaryGroup.house_keyword}</p>
        {/if}

        {#if houseZImg || houseInSignInterp}
          <div class="house-cusp-layout">
            <div class="house-cusp-col house-cusp-col--art" aria-hidden="true">
              {#if houseZImg}
                <figure class="house-cusp-sign-art">
                  <img src={houseZImg} alt="" />
                </figure>
              {/if}
            </div>
            <div class="house-cusp-col house-cusp-col--copy">
              <div
                class="interpretation-display"
                class:interpretation-display--empty={!houseInSignInterp}
              >
                {#if houseInSignInterp}
                  <p class="body-text interpretation-display__text house-cusp-interp">{houseInSignInterp}</p>
                {:else}
                  <p class="interpretation-display__placeholder house-cusp-placeholder">
                    No house–sign interpretation loaded yet.
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        {#each block.planets as placement (placement.planet + "-" + block.house)}
          {@const sumPl = summaryPlacementFor(block.summaryGroup, placement.planet)}
          {@const legPl = legacyPlanetRow(legacyHg, placement.planet)}
          {@const signText = meaningInSign(placement, sumPl)}
          {@const houseText = meaningInHouse(placement, sumPl)}
          {@const planetImgSrc = planetArtSrc(placement.planet)}
          <article class="house-planet-block">
            <div class="house-planet-layout">
              <div class="house-planet-col house-planet-col--art" aria-hidden="true">
                {#if planetImgSrc}
                  <figure class="house-planet-art">
                    <img src={planetImgSrc} alt="" />
                  </figure>
                {/if}
              </div>
              <div class="house-planet-col house-planet-col--copy">
                <h3 class="big-three-sign-name">
                  {placement.planet}{placement.retrograde ? " Rx" : ""} in {placement.sign}
                  <span class="planet-title-house"> · House {block.house}</span>
                </h3>
                <p class="planet-degree">
                  {placement.degrees}°{placement.minutes.toString().padStart(2, "0")}'
                  {#if sumPl?.synthesis}
                    <span class="degree-syn"> — </span><span class="synthesis">{sumPl.synthesis}</span>
                  {:else if legPl?.synthesis}
                    <span class="degree-syn"> — </span><span class="synthesis">{legPl.synthesis}</span>
                  {/if}
                </p>

                <div class="interpretation-display" class:interpretation-display--empty={!signText}>
                  <h4 class="interpretation-display__label">In {placement.sign}</h4>
                  {#if signText}
                    <p class="body-text interpretation-display__text">{signText}</p>
                  {:else}
                    <p class="interpretation-display__placeholder">No sign interpretation loaded yet.</p>
                  {/if}
                </div>

                <div class="interpretation-display" class:interpretation-display--empty={!houseText}>
                  <h4 class="interpretation-display__label">In House {block.house}</h4>
                  {#if houseText}
                    <p class="body-text interpretation-display__text">{houseText}</p>
                  {:else}
                    <p class="interpretation-display__placeholder">No house interpretation loaded yet.</p>
                  {/if}
                </div>
              </div>
            </div>
          </article>
        {/each}
      </section>
    {/each}
  </main>
</div>

<style>
  .scroll-reading {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .scroll-header {
    flex-shrink: 0;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #30363d;
  }

  .back-btn {
    background: transparent;
    color: #58a6ff;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  .scroll-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 2rem 3rem;
  }

  .reading-section {
    margin-bottom: 2.5rem;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
  }

  .reading-section.big-three-section {
    max-width: 48rem;
  }

  .reading-section.house-section {
    max-width: 48rem;
  }

  .house-keyword-sub {
    margin: -0.5rem 0 1.15rem;
    font-size: 0.92rem;
    color: #8b949e;
    line-height: 1.45;
  }

  .house-cusp-layout {
    display: grid;
    grid-template-columns: minmax(7.5rem, 11.5rem) minmax(0, 1fr);
    gap: 1.75rem 2.25rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .house-cusp-col--art {
    display: flex;
    justify-content: center;
  }

  .house-cusp-sign-art {
    margin: 0;
    width: 100%;
    max-width: 10.5rem;
  }

  .house-cusp-sign-art img {
    display: block;
    width: 100%;
    max-width: 10.5rem;
    max-height: 10rem;
    height: auto;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.38);
  }

  .house-cusp-interp {
    margin: 0;
  }

  .house-cusp-placeholder {
    font-style: italic;
  }

  .interpretation-display {
    margin-top: 0;
    padding: 0.85rem 1rem 1rem;
    border-radius: 8px;
    background: #161b22;
    border: 1px solid #30363d;
  }

  .interpretation-display--empty {
    border-style: dashed;
    border-color: #484f58;
    background: #0d1117;
  }

  .interpretation-display__label {
    margin: 0 0 0.45rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #58a6ff;
    line-height: 1.35;
  }

  h3.interpretation-display__label,
  h4.interpretation-display__label {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .interpretation-display__text:last-child,
  .interpretation-display > .body-text:last-child {
    margin-bottom: 0;
  }

  .interpretation-display__placeholder {
    margin: 0;
    font-size: 0.92rem;
    font-style: italic;
    color: #6e7681;
    line-height: 1.5;
  }

  .big-three-col--copy > .interpretation-display + .interpretation-display {
    margin-top: 1.15rem;
  }

  .house-planet-block {
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid #30363d;
  }

  .house-planet-block:first-of-type {
    margin-top: 0.25rem;
    padding-top: 0;
    border-top: none;
  }

  .house-planet-layout {
    display: grid;
    grid-template-columns: minmax(7.5rem, 11.5rem) minmax(0, 1fr);
    gap: 1.75rem 2.25rem;
    align-items: start;
  }

  .house-planet-col--art {
    display: flex;
    justify-content: center;
  }

  .house-planet-art {
    margin: 0;
    width: 100%;
    max-width: 11rem;
  }

  .house-planet-art img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
  }

  .house-planet-col--copy {
    min-width: 0;
  }

  .house-planet-col--copy .planet-degree {
    margin-bottom: 0.75rem;
  }

  .house-planet-col--copy > .interpretation-display:first-of-type {
    margin-top: 0.35rem;
  }

  .house-planet-col--copy > .interpretation-display + .interpretation-display {
    margin-top: 0.85rem;
  }

  @media (max-width: 700px) {
    .house-cusp-layout,
    .house-planet-layout {
      grid-template-columns: 1fr;
      gap: 1.15rem;
    }

    .house-planet-col--art {
      max-width: 11rem;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .big-three-layout {
    display: grid;
    grid-template-columns: minmax(7.5rem, 11.5rem) minmax(0, 1fr);
    gap: 1.75rem 2.25rem;
    align-items: start;
  }

  .big-three-col--planet {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    justify-content: flex-start;
  }

  .big-three-col--copy {
    min-width: 0;
  }

  .big-three-planet-art {
    margin: 0;
    width: 100%;
    max-width: 11rem;
  }

  .big-three-planet-art img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
  }

  .big-three-sign-art {
    margin: 0;
    width: 100%;
    max-width: 10.5rem;
  }

  .big-three-sign-art img {
    display: block;
    width: 100%;
    max-width: 10.5rem;
    max-height: 10rem;
    height: auto;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.38);
  }

  .big-three-sign-name {
    margin: 0 0 0.35rem;
    font-size: clamp(1.85rem, 4.5vw, 2.55rem);
    font-weight: 650;
    letter-spacing: -0.02em;
    line-height: 1.12;
    color: #f0f6fc;
  }

  h3.big-three-sign-name {
    font-size: clamp(1.85rem, 4.5vw, 2.55rem);
    font-weight: 650;
  }

  .big-three-meta {
    margin: 0 0 1.2rem;
    font-size: 0.88rem;
    color: #8b949e;
    line-height: 1.45;
  }

  .big-three-meta .rx {
    margin-left: 0.35rem;
  }

  .big-three-reading {
    margin-top: 0;
  }

  .big-three-reading.sun-reading,
  .big-three-reading.moon-reading,
  .big-three-reading.rising-reading {
    margin-top: 0;
  }

  @media (max-width: 700px) {
    .big-three-layout {
      grid-template-columns: 1fr;
      gap: 1.35rem;
    }

    .big-three-col--planet {
      max-width: 11rem;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e6edf3;
    margin: 0 0 1rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #30363d;
  }

  .chart-static {
    display: flex;
    justify-content: center;
    pointer-events: none;
    user-select: none;
  }

  .chart-static :global(svg) {
    max-width: 100%;
    height: auto;
  }

  .rx {
    margin-left: 0.35rem;
    font-size: 0.85rem;
    color: #8b949e;
  }

  .big-three-house-text {
    margin-top: 0;
    margin-bottom: 0.75rem;
  }

  .body-text {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #c9d1d9;
  }

  .sun-reading {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .reading-section:not(.big-three-section) .sun-reading {
    margin-top: 1.25rem;
  }

  .sun-reading-lead {
    margin: 0 0 0.5rem;
    font-size: 1.02rem;
    line-height: 1.55;
    color: #e6edf3;
  }

  .sun-reading .body-text,
  .moon-reading .body-text,
  .rising-reading .body-text {
    margin: 0;
  }

  .moon-reading,
  .rising-reading {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .reading-section:not(.big-three-section) .moon-reading,
  .reading-section:not(.big-three-section) .rising-reading {
    margin-top: 1.25rem;
  }

  .muted {
    margin: 0;
    font-size: 0.95rem;
    color: #8b949e;
  }

  .planet-title-house {
    font-weight: 500;
    color: #8b949e;
  }

  .planet-degree {
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
    color: #8b949e;
    line-height: 1.45;
  }

  .synthesis {
    color: #c9d1d9;
  }
</style>
