import * as d3 from 'd3';
import type { Observation, Point } from '../data/types';

const parseYear = d3.timeParse('%Y');
const bisectDate = d3.bisector((p: Point) => p.date);

/**
 * Converts API-style observations ({ date: "2015", value }) into chart-ready
 * points ({ date: Date, value }), sorted from oldest to newest.
 * Observations with an unparseable date are dropped. The input is not mutated.
 */
export function toPoints(observations: Observation[]): Point[] {
  return observations
    .map((observation) => ({
      date: parseYear(observation.date),
      value: observation.value,
    }))
    .filter((point): point is Point => point.date !== null)
    .sort((a, b) => d3.ascending(a.date, b.date));
}

/**
 * Returns the point whose date is closest to `date`, or undefined if `points`
 * is empty. `points` must be sorted by date (as returned by `toPoints`).
 */
export function nearestPoint(points: Point[], date: Date): Point | undefined {
  if (points.length === 0) return undefined;
  return points[bisectDate.center(points, date)];
}
