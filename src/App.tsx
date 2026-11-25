import { useMemo } from "react";
import { useSeries } from "./hooks/useSeries";
import { toPoints } from "./lib/transform";
import { LineChart } from "./charts/LineChart";
import { SourceNote } from "./charts/SourceNote";

// What to show. Module-level constants keep references stable for useSeries.
const VARIABLE = "Count_Person";
const PLACES = ["geoId/06"];
const PLACE_NAMES: Record<string, string> = { "geoId/06": "California" };

export default function App() {
  const state = useSeries(VARIABLE, PLACES, PLACE_NAMES);
  // One series for now; Step 5 adds multiple series and a legend.
  const series = state.status === "success" ? state.series[0] : undefined;
  const points = useMemo(() => (series ? toPoints(series.observations) : []), [series]);
  const placeName = series?.placeName ?? PLACE_NAMES[PLACES[0]] ?? PLACES[0];

  return (
    <main>
      <h1>DC Mini Explorer</h1>
      <p className="subtitle">
        {VARIABLE} · {placeName} · Data Commons
      </p>
      <div className="card" aria-busy={state.status === "loading"}>
        {state.status === "loading" && <p className="status">Loading data…</p>}
        {state.status === "error" && (
          <p className="status status-error" role="alert">
            Couldn't load data. {state.error.message}
          </p>
        )}
        {state.status === "empty" && (
          <p className="status">
            No data for {VARIABLE} in {placeName}.
          </p>
        )}
        {series && (
          <>
            <LineChart data={points} title={`${series.statVar} over time for ${series.placeName}`} />
            <SourceNote source={series.source} />
          </>
        )}
      </div>
    </main>
  );
}
