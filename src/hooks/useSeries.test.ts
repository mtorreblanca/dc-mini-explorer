import { renderHook, waitFor } from '@testing-library/react';
import fixture from '../lib/__fixtures__/observation-count-person.json';
import { useSeries } from './useSeries';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const PLACES = ['geoId/06', 'geoId/48'];

describe('useSeries', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts loading, then returns the series', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(fixture)));

    const { result } = renderHook(() => useSeries('Count_Person', PLACES));
    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    if (result.current.status !== 'success') throw new Error('unreachable');
    expect(result.current.series).toHaveLength(2);
  });

  it('reports empty when no place has data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({})));

    const { result } = renderHook(() => useSeries('Count_Person', PLACES));
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('reports the error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, 500)));

    const { result } = renderHook(() => useSeries('Count_Person', PLACES));
    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status !== 'error') throw new Error('unreachable');
    expect(result.current.error.message).toMatch(/500/);
  });

  it('ignores a stale response that arrives after a newer request', async () => {
    let resolveStale!: (response: Response) => void;
    const signals: AbortSignal[] = [];
    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url: string, init: RequestInit) => {
        signals.push(init.signal!);
        return new Promise<Response>((resolve) => (resolveStale = resolve));
      })
      .mockImplementationOnce(() => Promise.resolve(json({})));
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ variable }) => useSeries(variable, PLACES), {
      initialProps: { variable: 'Count_Person' },
    });
    rerender({ variable: 'Median_Age_Person' });

    await waitFor(() => expect(result.current.status).toBe('empty'));
    expect(signals[0].aborted).toBe(true);

    resolveStale(json(fixture)); // The old request finishes late...
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.status).toBe('empty'); // ...and is ignored.
  });
});
