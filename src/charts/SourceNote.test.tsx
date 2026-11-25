import { render, screen } from '@testing-library/react';
import { SourceNote } from './SourceNote';

describe('SourceNote', () => {
  it('links the import name to its provenance URL', () => {
    render(
      <SourceNote
        source={{
          importName: 'ExamplePopulationEstimates',
          provenanceUrl: 'https://example.org/population-estimates',
          measurementMethod: 'ExampleEstimate',
        }}
      />,
    );
    const link = screen.getByRole('link', { name: 'ExamplePopulationEstimates' });
    expect(link).toHaveAttribute('href', 'https://example.org/population-estimates');
    expect(screen.getByText(/ExampleEstimate/)).toBeInTheDocument();
  });

  it('shows the name as plain text when the URL is not http(s)', () => {
    render(<SourceNote source={{ importName: 'Odd', provenanceUrl: 'javascript:alert(1)' }} />);
    expect(screen.queryByRole('link', { name: 'Odd' })).toBeNull();
    expect(screen.getByText(/Odd/)).toBeInTheDocument();
  });

  it('says the source is unknown when there is none', () => {
    render(<SourceNote />);
    expect(screen.getByText(/Source: unknown/)).toBeInTheDocument();
  });
});
