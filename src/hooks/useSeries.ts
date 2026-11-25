import { useEffect, useState } from 'react';
import { fetchSeries } from '../api/dataCommons';
import type { Series } from '../data/types';
import { toSeries } from '../lib/toSeries';

export type SeriesState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'empty' }
  | { status: 'success'; series: Series[] };

/**
 * Loads one statistical variable for the given places from Data Commons.
 *
 * When the inputs change or the component unmounts, the request in flight is
 * aborted and its result ignored, so a slow, stale response can never
 * overwrite a newer one. `placeNames` should be a stable reference (e.g. a
 * module-level constant); a new object on every render refetches every render.
 */
export function useSeries(
  variable: string,
  places: string[],
  placeNames: Record<string, string> = NO_NAMES,
): SeriesState {
  const [state, setState] = useState<SeriesState>({ status: 'loading' });
  // A string key, so a new array with the same places doesn't refetch.
  const placesKey = places.join('\n');

  useEffect(() => {
    const placeList = placesKey ? placesKey.split('\n') : [];
    if (placeList.length === 0) {
      setState({ status: 'empty' });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchSeries(variable, placeList, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const series = toSeries(response, placeNames);
        setState(series.length > 0 ? { status: 'success', series } : { status: 'empty' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => controller.abort();
  }, [variable, placesKey, placeNames]);

  return state;
}

const NO_NAMES: Record<string, string> = {};
