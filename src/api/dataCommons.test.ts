import { DataCommonsError, fetchSeries, observationQuery } from './dataCommons';

describe('observationQuery', () => {
  it('asks for the full series of one variable across several places', () => {
    const params = observationQuery('Count_Person', ['geoId/06', 'geoId/48']);
    expect(params.get('date')).toBe('');
    expect(params.getAll('variable.dcids')).toEqual(['Count_Person']);
    expect(params.getAll('entity.dcids')).toEqual(['geoId/06', 'geoId/48']);
    expect(params.getAll('select')).toEqual(['entity', 'variable', 'date', 'value']);
  });
});

describe('fetchSeries', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls the same-origin proxy, never the API host directly', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchSeries('Count_Person', ['geoId/06']);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url.startsWith('/dc/v2/observation?')).toBe(true);
    expect(url).not.toContain('key=');
  });

  it('throws a DataCommonsError with a key hint on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));

    const request = fetchSeries('Count_Person', ['geoId/06']);
    await expect(request).rejects.toBeInstanceOf(DataCommonsError);
    await expect(request).rejects.toThrow(/DC_API_KEY/);
  });
});
