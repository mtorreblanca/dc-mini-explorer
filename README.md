# DC Mini Explorer

A small, [Data Commons](https://datacommons.org)–style data explorer built with
**React + TypeScript + D3.js**: an interactive time-series chart with an
accessible tooltip, built on a clean split between D3 math and React rendering.

The chart shows real observations from the
[Data Commons REST API](https://docs.datacommons.org/api/rest/v2/observation)
(`Count_Person` for California by default), with the source cited under it.

## Features

- **Timeline chart:** time X axis, linear Y axis starting at zero, line path and axes.
- **Tooltip:** hover snaps to the nearest data point (`d3.bisector`) and shows a
  focus dot, a guide line and a tooltip that flips sides near the right edge.
- **Accessible:** the chart is labelled (`role="img"` + `<title>`), keyboard
  users can step through points with ← / →, and screen readers hear each value
  through an `aria-live` region.
- **Real data, key kept server-side:** the browser calls a same-origin `/dc`
  path; the Vite dev server adds the API key and forwards the request to Data Commons.
- **Loading, error and empty states**, and stale requests are aborted.
- **Tested:** data transforms are pure functions covered by unit tests.

## Tech stack

React 18 · TypeScript (strict) · D3 v7 · Vite · Vitest + React Testing Library

## Getting started

Requires Node.js 18+ and a free Data Commons API key.

1. Get a key at <https://apikeys.datacommons.org>.
2. Copy `.env.example` to `.env` and set `DC_API_KEY=your-key`.
   `.env` is git-ignored. The name has no `VITE_` prefix on purpose: Vite only
   puts `VITE_*` variables into the browser bundle, so the key stays on the dev
   server, which adds it to requests sent to Data Commons.

```bash
cp .env.example .env   # then edit .env
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (watch mode)
npm run build    # type-check + production build in dist/
```

The `/dc` proxy only runs in `npm run dev`. A production build has no server
to add the key yet (see the deployment note in Step 3).

## How it's built

| Who | Does what |
|-----|-----------|
| **D3** | The math: scales, the line path string, axes, bisecting |
| **React** | Renders the SVG elements and owns the state (the hovered point) |
| **useRef + useEffect** | The only place D3 touches the DOM directly (the axes) |

Data flows one way: **`fetchSeries` (API) → `toSeries` + `toPoints` (pure, tested) → `useSeries` state → chart component**.

A few deliberate decisions:

- Scales and the line path are memoized with `useMemo`, so their references stay
  stable and the axes effect only reruns when a scale actually changes.
- Hover state stores the **data point**, not pixels; positions are derived from
  the scales at render time, so the overlay stays correct if the chart resizes.
- The Y domain starts at 0 so changes in a quantity like population are shown
  in proportion rather than exaggerated.

```
src/
  api/        dataCommons.ts (fetchSeries), types.ts (API response types) + tests
  hooks/      useSeries.ts (loading / error / empty, AbortController) + tests
  data/       types.ts (Series, Point)
  lib/        transform.ts (toPoints, nearestPoint), toSeries.ts + tests
              __fixtures__/ saved API responses for tests
  charts/     LineChart.tsx, SourceNote.tsx
  App.tsx
```

## Roadmap

- [x] Timeline chart: scales, line path, axes
- [x] Tooltip: bisector, focus dot, accessible label, keyboard navigation
- [x] **Step 3:** Real data from the Data Commons REST API (key kept out of the client)
- [ ] **Step 4:** Handle real-world data: gaps, negative values, very different magnitudes
- [ ] **Step 5:** Multiple series + legend
- [ ] **Step 6:** Component tests (React Testing Library) + CI
- [ ] **Step 7:** Shareable URL state
- [ ] **Step 8:** Brush + linked chart
- [ ] Later: choropleth map with `d3-geo`, responsive sizing, a11y review

## Next steps (work plan)

Each step is one small branch and one pull request. Work in VS Code, run
`npm run dev` and `npm test` side by side, and commit when the "Done when"
checks pass.

### Step 3: Real data from the Data Commons API

**Goal:** replace `sample.json` with real observations, e.g. `Count_Person`
for a few places, without exposing an API key in the browser bundle.

1. Get a free API key at <https://apikeys.datacommons.org> and put it in `.env`
   as `DC_API_KEY=...` (`.env` is already git-ignored). Do **not** use a
   `VITE_` prefix: Vite would bundle it into the client.
2. In `vite.config.ts`, add a dev `server.proxy` for `/dc` →
   `https://api.datacommons.org`, adding the key from `loadEnv` as the `key`
   query parameter (the docs' auth method for GET; `X-API-Key` is shown for POST). The browser calls `/dc/v2/observation`; the key never leaves the server.
3. Create `src/api/dataCommons.ts` with a typed `fetchSeries(variable, places)`:
   `GET /dc/v2/observation?date=&variable.dcids=…&entity.dcids=…&select=entity&select=variable&select=date&select=value`
   (see the [observation docs](https://docs.datacommons.org/api/rest/v2/observation)
   for the `date` value that returns the full time series vs. only the latest point).
4. Add response types and a pure `toSeries(response)` in `src/lib/` that turns
   `byVariable → byEntity → orderedFacets[0].observations` into `Series[]`.
   Keep the facet's provenance so the chart can cite its source.
5. Add a small `useSeries` hook with loading, error and empty states, and an
   `AbortController` so a stale request can't overwrite a newer one.
6. Show the data source under the chart (Data Commons cites provenance for every number).

**Done when:** the chart shows real data; `toSeries` has unit tests using a saved
JSON fixture (no network in tests); `git grep DC_API_KEY` only matches
`vite.config.ts` and docs; the README explains how to set the key.

> For a deployed demo, move the proxy into a serverless function
> (same pattern as Promptdeck's `api/complete.js`) so production also keeps the key server-side.

### Step 4: Handle real-world data

**Goal:** the line chart stays correct for any variable, not just population.

- **Gaps:** use `line.defined()` so missing years break the line instead of
  drawing a false straight segment.
- **Domain:** start Y at 0 only when all values are ≥ 0; otherwise use the data
  extent (temperature, growth rates). Always `.nice()`.
- **Magnitudes:** format ticks with `d3.format('~s')` (1.2M) or the variable's unit (%, °C).
- **Dates:** parse `YYYY`, `YYYY-MM` and `YYYY-MM-DD` (Data Commons uses all three).
- **Empty data:** render an explicit "No data" state.

**Done when:** each case has a unit test (pure functions in `src/lib/`) and a
fixture you can switch to in the UI.

### Step 5: Multiple series + legend

**Goal:** compare places on one chart.

- One shared X and Y scale computed from **all** series; one `<path>` per series.
- A categorical color scale (`d3.scaleOrdinal`) with an accessible palette; don't
  rely on color alone (legend labels, and highlight the hovered line).
- Tooltip lists every series' value at the hovered date.

**Done when:** 2–5 places render, the legend toggles series on/off, and hovering
highlights one line.

### Step 6: Component tests + CI

- React Testing Library tests for `LineChart`: renders one path per series, axis
  labels exist, the tooltip appears on keyboard focus, the "No data" state.
- Add `.github/workflows/ci.yml` running `npm ci`, `npm run typecheck`,
  `npm test -- --run` and `npm run build` on every push and pull request.

**Done when:** CI is green and the README shows the CI badge.

### Step 7: Shareable URL state

- Store variable, places and date range in `URLSearchParams`; the URL is the
  source of truth, and reloading restores the exact chart.
- Use `history.replaceState` while dragging, `pushState` on discrete choices.

**Done when:** copying the URL into a new tab reproduces the same view (with a test for the parse/serialize functions).

### Step 8: Brush + linked chart

- A small overview chart with `d3.brushX`; the selected range filters the main
  chart. Debounce brush events and store the range in the URL (Step 7).

**Done when:** brushing updates the main chart smoothly and the range survives a reload.
