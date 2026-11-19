import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Point } from '../data/types';
import { nearestPoint } from '../lib/transform';

interface LineChartProps {
  data: Point[];
  width?: number;
  height?: number;
  title: string;
}

// Space around the plot area, reserved for the axes.
const MARGIN = { top: 16, right: 24, bottom: 32, left: 48 };
// Y-axis maximum used when there is no data.
const DEFAULT_Y_MAX = 200;
// Tooltip box size and its gap from the focus dot, in pixels.
const TOOLTIP = { width: 84, height: 24, offset: 10 };

const formatYear = d3.timeFormat('%Y');
const formatValue = d3.format(',');

/**
 * Time-series line chart.
 *
 * D3 does the math (scales, the line path, axes); React renders the SVG and
 * owns the state. D3 only touches the DOM to draw the axes, inside useEffect.
 */
export function LineChart({ data, width = 700, height = 320, title }: LineChartProps) {
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  const [hoveredPoint, setHoveredPoint] = useState<Point | undefined>(undefined);

  // Date → horizontal pixels.
  const xScale = useMemo(() => {
    const today = new Date();
    const [min, max] = d3.extent(data, (d) => d.date);
    return d3
      .scaleTime()
      .domain([min ?? today, max ?? today])
      .range([0, innerWidth]);
  }, [data, innerWidth]);

  // Value → vertical pixels. The range is inverted because SVG y grows downward.
  // The domain starts at 0 so changes are shown in proportion.
  const yScale = useMemo(() => {
    const maxValue = d3.max(data, (d) => d.value);
    return d3
      .scaleLinear()
      .domain([0, maxValue ?? DEFAULT_Y_MAX])
      .nice()
      .range([innerHeight, 0]);
  }, [data, innerHeight]);

  const linePath = useMemo(() => {
    const line = d3
      .line<Point>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));
    return line(data) ?? '';
  }, [data, xScale, yScale]);

  useEffect(() => {
    const xAxisEl = xAxisRef.current;
    const yAxisEl = yAxisRef.current;
    if (!xAxisEl || !yAxisEl) return;

    d3.select(xAxisEl).call(d3.axisBottom(xScale));
    d3.select(yAxisEl).call(d3.axisLeft(yScale));
  }, [xScale, yScale]);

  // Pointer → pixel x → date → nearest data point.
  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const [x] = d3.pointer(event);
    setHoveredPoint(nearestPoint(data, xScale.invert(x)));
  };

  const clearHover = () => setHoveredPoint(undefined);

  // Places the tooltip right of the dot, or left of it when it would overflow.
  const tooltipX = (pointX: number) => {
    const rightEdge = pointX + TOOLTIP.offset + TOOLTIP.width;
    return rightEdge > innerWidth
      ? pointX - TOOLTIP.offset - TOOLTIP.width
      : pointX + TOOLTIP.offset;
  };

  return (
    <svg width={width} height={height} role="img" aria-label={title}>
      <title>{title}</title>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        <g ref={yAxisRef} className="axis" />
        <g ref={xAxisRef} className="axis" transform={`translate(0,${innerHeight})`} />
        <path className="line" d={linePath} />

        {hoveredPoint && (
          <>
            <line
              className="focus-line"
              x1={xScale(hoveredPoint.date)}
              x2={xScale(hoveredPoint.date)}
              y1={innerHeight}
              y2={yScale(hoveredPoint.value)}
            />
            <circle
              className="focus-dot"
              cx={xScale(hoveredPoint.date)}
              cy={yScale(hoveredPoint.value)}
              r={4}
            />
            <g
              className="tooltip"
              transform={`translate(${tooltipX(xScale(hoveredPoint.date))},${
                yScale(hoveredPoint.value) - TOOLTIP.height / 2
              })`}
            >
              <rect width={TOOLTIP.width} height={TOOLTIP.height} />
              <text x={8} y={TOOLTIP.height / 2} dominantBaseline="middle">
                {formatYear(hoveredPoint.date)} · {formatValue(hoveredPoint.value)}
              </text>
            </g>
          </>
        )}

        {/* Invisible hit area over the plot. Drawn last so it sits on top. */}
        <rect
          className="overlay"
          width={innerWidth}
          height={innerHeight}
          onPointerMove={handlePointerMove}
          onPointerLeave={clearHover}
        />
      </g>
    </svg>
  );
}
