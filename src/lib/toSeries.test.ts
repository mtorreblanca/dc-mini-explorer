import fixture from './__fixtures__/observation-count-person.json';
import type { DcObservationResponse } from '../api/types';
import { toSeries } from './toSeries';

const response = fixture as DcObservationResponse;

describe('toSeries', () => {
  it('returns one series per place that has data', () => {
    const series = toSeries(response);
    expect(series.map((s) => s.placeDcid)).toEqual(['geoId/06', 'geoId/48']);
    expect(series.every((s) => s.statVar === 'Count_Person')).toBe(true);
  });

  it('uses the first (preferred) facet', () => {
    const [california] = toSeries(response);
    expect(california.observations.map((o) => o.value)).toEqual([1020, 1010, 1030]);
  });

  it("keeps the facet's provenance as the series source", () => {
    const [california] = toSeries(response);
    expect(california.source).toEqual({
      importName: 'ExamplePopulationEstimates',
      provenanceUrl: 'https://example.org/population-estimates',
      measurementMethod: 'ExampleEstimate',
    });
  });

  it('uses given place names and falls back to the DCID', () => {
    const series = toSeries(response, { 'geoId/06': 'California' });
    expect(series.map((s) => s.placeName)).toEqual(['California', 'geoId/48']);
  });

  it('returns an empty array for an empty response', () => {
    expect(toSeries({})).toEqual([]);
    expect(toSeries({ byVariable: { Count_Person: {} } })).toEqual([]);
  });

  it('leaves the source out when the facet is unknown', () => {
    const series = toSeries({
      byVariable: {
        Count_Person: {
          byEntity: {
            'geoId/06': {
              orderedFacets: [{ facetId: 'missing', observations: [{ date: '2020', value: 1 }] }],
            },
          },
        },
      },
    });
    expect(series[0].source).toBeUndefined();
  });
});
