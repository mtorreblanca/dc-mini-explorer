# DC Mini Explorer

A small, [Data Commons](https://datacommons.org)–style data explorer built with
**React + TypeScript + D3.js**: an interactive time-series chart with an
accessible tooltip, built on a clean split between D3 math and React rendering.

> The data in `src/data/sample.json` is **synthetic**, shaped like Data Commons
> observations. It is not real statistics.

## Features

- **Timeline chart:** time X axis, linear Y axis starting at zero, line path and axes.
- **Tooltip:** hover snaps to the nearest data point (`d3.bisector`) and shows a
  focus dot, a guide line and a tooltip that flips sides near the right edge.
- **Accessible:** the chart is labelled (`role="img"` + `<title>`), keyboard
  users can step through points with ← / →, and screen readers hear each value
  through an `aria-live` region.
- **Tested:** data transforms are pure functions covered by unit tests.

## Tech stack

React 18 · TypeScript (strict) · D3 v7 · Vite · Vitest + React Testing Library

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (watch mode)
npm run build    # type-check + production build in dist/
```

## How it's built

| Who | Does what |
|-----|-----------|
| **D3** | The math: scales, the line path string, axes, bisecting |
| **React** | Renders the SVG elements and owns the state (the hovered point) |
| **useRef + useEffect** | The only place D3 touches the DOM directly (the axes) |

Data flows one way: **raw API-shaped data → `transform.ts` (pure, tested) → chart component**.

A few deliberate decisions:

- Scales and the line path are memoized with `useMemo`, so their references stay
  stable and the axes effect only reruns when a scale actually changes.
- Hover state stores the **data point**, not pixels; positions are derived from
  the scales at render time, so the overlay stays correct if the chart resizes.
- The Y domain starts at 0 so changes in a quantity like population are shown
  in proportion rather than exaggerated.

```
src/
  data/       types.ts, sample.json
  lib/        transform.ts (toPoints, nearestPoint) + tests
  charts/     LineChart.tsx
  App.tsx
```

## Roadmap

- [x] Timeline chart: scales, line path, axes
- [x] Tooltip: bisector, focus dot, accessible label, keyboard navigation
- [ ] Multiple series + legend
- [ ] Brush + linked chart
- [ ] Real data from the Data Commons REST API
- [ ] Shareable URL state
- [ ] Choropleth map with `d3-geo`
- [ ] Component tests, responsive sizing, a11y review
