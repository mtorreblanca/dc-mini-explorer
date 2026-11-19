/** One data point in a time series (one year, one value). */
export interface Observation {
  date: string; // "2015" (Data Commons often uses year strings)
  value: number;
}

/** A statistical variable observed for one place over time. */
export interface Series {
  placeDcid: string;   // e.g. "geoId/06" (California)
  placeName: string;
  statVar: string;     // e.g. "Count_Person"
  observations: Observation[];
}

/** Chart-ready point: real Date objects instead of strings. */
export interface Point {
  date: Date;
  value: number;
}
