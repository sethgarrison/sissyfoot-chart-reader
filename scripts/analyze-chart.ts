#!/usr/bin/env npx tsx
/**
 * Fetch a chart from the API and print an analysis report.
 * Usage: npx tsx scripts/analyze-chart.ts [year] [month] [day] [hour] [min] [city] [nation] [house_system]
 *
 * Default: 1990-06-15 14:30 New York,NY US whole_sign
 */

const API_BASE = "https://sissyfoot-astrological-api.onrender.com";

async function main() {
  const [year, month, day, hour, min, city, nation, houseSystem, tzStr] = [
    process.argv[2] ?? "1990",
    process.argv[3] ?? "6",
    process.argv[4] ?? "15",
    process.argv[5] ?? "14",
    process.argv[6] ?? "30",
    process.argv[7] ?? "New York,NY",
    process.argv[8] ?? "US",
    process.argv[9] ?? "whole_sign",
    process.argv[10], // optional: America/Los_Angeles etc.
  ];

  const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const search = new URLSearchParams({
    year,
    month,
    day,
    time,
    city,
    nation,
    house_system: houseSystem,
  });
  if (tzStr) search.set("tz_str", tzStr);

  console.log(`Fetching chart: ${year}-${month}-${day} ${hour}:${min} ${city} ${nation} (${houseSystem})\n`);

  const url = `${API_BASE}/chart?${search}`;
  console.log("REQUEST URL:", url);
  console.log("(time=" + time + " includes minutes; tz_str for timezone if provided)\n");

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`API error ${res.status}:`, await res.text());
    process.exit(1);
  }

  const api = await res.json();

  console.log("=== REQUEST vs RESPONSE ===");
  console.log("Submitted time:", `${hour}:${min} (hour:min)`);
  console.log("API birth_datetime:", (api as any).birth_datetime ?? "(missing)");
  if ((api as any).birth_datetime) {
    const dt = (api as any).birth_datetime;
    const match = dt.match(/T(\d{1,2}):(\d{2})/);
    if (match) {
      const [_, h, m] = match;
      const minsMatch = hour === h && min === m;
      console.log("Minutes preserved?", minsMatch ? "YES" : "NO (response time differs from request)");
    }
  }
  console.log("");

  // Dynamic import to avoid bundling in tests
  const { analyzeChartApiResponse } = await import("../src/lib/analysis/chartAnalysis");

  const report = analyzeChartApiResponse(api);

  console.log("=== RAW API RESPONSE ===");
  console.log(JSON.stringify(report.raw, null, 2));

  console.log("\n=== WHOLE SIGN CHECK ===");
  console.log("Is Whole Sign (all cusps at 0°):", report.wholeSign.isWholeSign);
  if (report.wholeSign.nonZeroCusps.length > 0) {
    console.log("Non-zero cusps:", report.wholeSign.nonZeroCusps);
  }
  console.log("Expected sign order (Whole Sign):", report.wholeSign.expectedSignOrder.join(" -> "));

  console.log("\n=== PLANET-HOUSE CONSISTENCY ===");
  console.log("Valid:", report.planetHouseConsistency.valid);
  if (!report.planetHouseConsistency.valid) {
    console.log("Inconsistencies:", report.planetHouseConsistency.inconsistencies);
  }

  console.log("\n=== SIGN ORDER ===");
  console.log("Valid:", report.signOrder.valid);
  if (!report.signOrder.valid) {
    console.log("Issues:", report.signOrder.issues);
  }

  // Also print house cusps for manual inspection
  console.log("\n=== HOUSE CUSPS (for drawing) ===");
  for (const h of report.raw.houseCusps) {
    console.log(`  House ${h.house}: ${h.sign} ${h.degree}° (abs: ${h.abs_degree}°)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
