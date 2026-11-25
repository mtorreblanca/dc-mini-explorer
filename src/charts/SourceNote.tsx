import type { SeriesSource } from '../data/types';

/** Only http(s) links are rendered, so an odd URL in API data can't become a javascript: link. */
function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

/** Cites where the chart's numbers come from, as Data Commons does for every number. */
export function SourceNote({ source }: { source?: SeriesSource }) {
  const href = safeHref(source?.provenanceUrl);

  return (
    <p className="source">
      Source:{' '}
      {source ? (
        href ? (
          <a href={href} target="_blank" rel="noreferrer">
            {source.importName}
          </a>
        ) : (
          source.importName
        )
      ) : (
        'unknown'
      )}
      {source?.measurementMethod && <> ({source.measurementMethod})</>}, via{' '}
      <a href="https://datacommons.org" target="_blank" rel="noreferrer">
        Data Commons
      </a>
    </p>
  );
}
