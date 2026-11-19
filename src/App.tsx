import sample from "./data/sample.json";
import type { Series } from "./data/types";

export default function App() {
  const series = sample.series[0] as Series;

  return (
    <main>
      <h1>DC Mini Explorer</h1>
      <p className="subtitle">
        {series.statVar} · {series.placeName} — practice data (synthetic)
      </p>
    </main>
  );
}
