import type { DcFacet, DcObservationResponse } from '../api/types';
import type { Series, SeriesSource } from '../data/types';

/**
 * Converts a Data Commons observation response into one Series per
 * (variable, place) pair, walking byVariable → byEntity → orderedFacets[0].
 *
 * The first facet is the source Data Commons ranks highest; its provenance is
 * kept on the series so the chart can cite it. Places with no observations are
 * left out. The observation API does not return place names, so they come from
 * `placeNames`, falling back to the DCID. The input is not mutated.
 */
export function toSeries(
  response: DcObservationResponse,
  placeNames: Record<string, string> = {},
): Series[] {
  const series: Series[] = [];

  for (const [statVar, byVariable] of Object.entries(response.byVariable ?? {})) {
    for (const [placeDcid, byEntity] of Object.entries(byVariable.byEntity ?? {})) {
      const facet = byEntity.orderedFacets?.[0];
      if (!facet?.observations?.length) continue;

      series.push({
        placeDcid,
        placeName: placeNames[placeDcid] ?? placeDcid,
        statVar,
        observations: facet.observations.map(({ date, value }) => ({ date, value })),
        source: toSource(response.facets?.[facet.facetId]),
      });
    }
  }

  return series;
}

function toSource(facet: DcFacet | undefined): SeriesSource | undefined {
  if (!facet?.importName) return undefined;
  return {
    importName: facet.importName,
    provenanceUrl: facet.provenanceUrl,
    measurementMethod: facet.measurementMethod,
  };
}
