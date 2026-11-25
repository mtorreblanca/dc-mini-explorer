/** One data point in a time series (one year, one value). */
export interface Observation {
  date: string; // "2015" (Data Commons often uses year strings)
  value: number;
}

/** Where a series' numbers come from (Data Commons cites this for every number). */
export interface SeriesSource {
  importName: string;      // e.g. "USCensusPEP_Annual_Population"
  provenanceUrl?: string;
  measurementMethod?: string;
}

/** A statistical variable observed for one place over time. */
export interface Series {
  placeDcid: string;   // e.g. "geoId/06" (California)
  placeName: string;
  statVar: string;     // e.g. "Count_Person"
  observations: Observation[];
  source?: SeriesSource;
}

/** Chart-ready point: real Date objects instead of strings. */
export interface Point {
  date: Date;
  value: number;
}
