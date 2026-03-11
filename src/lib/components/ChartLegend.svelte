<script lang="ts">
  import { ZODIAC_SIGNS } from "../models/zodiac";
  import { PLANET_NAMES } from "../chart/theme";
  import { PLANET_ASTRONOMICON } from "../chart/chart-utils";
</script>

<div class="chart-legend">
  <section class="legend-section">
    <h3 class="legend-title">Signs</h3>
    <ul class="legend-list">
      {#each ZODIAC_SIGNS as sign}
        <li>
          <span class="glyph">{sign.astronomiconChar}</span>
          <span class="label">{sign.name}</span>
        </li>
      {/each}
    </ul>
  </section>
  <section class="legend-section">
    <h3 class="legend-title">Planets</h3>
    <ul class="legend-list">
      {#each PLANET_NAMES as planetName}
        <li>
          <span class="glyph">{PLANET_ASTRONOMICON[planetName] ?? "?"}</span>
          <span class="label">{planetName}</span>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .chart-legend {
    position: absolute;
    bottom: 0.75rem;
    left: 0.75rem;
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  .legend-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .legend-title {
    margin: 0;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
  }

  .legend-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.6rem;
  }

  .legend-list li {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .glyph {
    font-family: "Astronomicon", serif;
    font-size: 0.9rem;
    color: #374151;
  }

  .label {
    font-size: 0.7rem;
    color: #6b7280;
    text-transform: capitalize;
  }
</style>
