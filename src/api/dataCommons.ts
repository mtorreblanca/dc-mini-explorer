import type { DcObservationResponse } from './types';

/** Same-origin path that the Vite dev proxy forwards to api.datacommons.org. */
const DC_BASE = '/dc/v2';

export class DataCommonsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'DataCommonsError';
  }
}

/** Builds the query string for every observation of `variable` in `places`. */
export function observationQuery(variable: string, places: string[]): URLSearchParams {
  const params = new URLSearchParams();
  // An empty date returns the full time series ("LATEST" would return only the last point).
  params.set('date', '');
  params.append('variable.dcids', variable);
  for (const place of places) params.append('entity.dcids', place);
  for (const field of ['entity', 'variable', 'date', 'value']) params.append('select', field);
  return params;
}

/**
 * Fetches every observation of one statistical variable for the given places.
 * Throws DataCommonsError when the API answers with an error status.
 */
export async function fetchSeries(
  variable: string,
  places: string[],
  { signal }: { signal?: AbortSignal } = {},
): Promise<DcObservationResponse> {
  const response = await fetch(`${DC_BASE}/observation?${observationQuery(variable, places)}`, {
    signal,
  });

  if (!response.ok) {
    const hint =
      response.status === 401 || response.status === 403
        ? ' Check DC_API_KEY in .env and restart the dev server.'
        : '';
    throw new DataCommonsError(
      `Data Commons request failed (${response.status}).${hint}`,
      response.status,
    );
  }

  return (await response.json()) as DcObservationResponse;
}
