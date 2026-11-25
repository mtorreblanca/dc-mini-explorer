/**
 * Response types for the Data Commons REST v2 observation endpoint.
 * https://docs.datacommons.org/api/rest/v2/observation
 *
 * Most fields are optional because the API leaves them out when there is no
 * data, e.g. an entity with no observations comes back as `{}`.
 */

export interface DcObservation {
  date: string; // ISO 8601: "2020", "2020-06" or "2020-06-15"
  value: number;
}

/** One source's observations for one variable and entity. */
export interface DcOrderedFacet {
  facetId: string;
  observations?: DcObservation[];
  obsCount?: number;
  earliestDate?: string;
  latestDate?: string;
}

/** Where a facet's numbers come from. */
export interface DcFacet {
  importName?: string;
  provenanceId?: string; // e.g. "dc/base/USCensusPEP_Annual_Population"; real responses may send this instead of importName
  provenanceUrl?: string;
  measurementMethod?: string;
  observationPeriod?: string; // ISO 8601 duration, e.g. "P1Y"
  unit?: string;
}

export interface DcObservationResponse {
  byVariable?: Record<
    string,
    {
      byEntity?: Record<
        string,
        {
          // Sorted by Data Commons' preference; the first facet is the best one.
          orderedFacets?: DcOrderedFacet[];
        }
      >;
    }
  >;
  facets?: Record<string, DcFacet>;
}
