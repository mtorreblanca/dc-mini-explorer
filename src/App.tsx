import { useMemo } from "react";
import sample from "./data/sample.json";
import type { Series } from "./data/types";
import { toPoints } from "./lib/transform";
import { LineChart } from "./charts/LineChart";

export default function App() {
  const series = sample.series[0] as Series;
  const points = useMemo(() => toPoints(series.observations), [series]);

  return (
    <main>
      <h1>DC Mini Explorer</h1>
      <p className="subtitle">
        {series.statVar} · {series.placeName} — practice data (synthetic)
      </p>
      <div className="card">
        <LineChart data={points} title={`${series.statVar} over time for ${series.placeName}`} />
      </div>
    </main>
  );
}
