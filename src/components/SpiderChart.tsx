import React, { useEffect, useMemo, useState } from 'react';
import { Router } from '../types';
import './SpiderChart.css';

interface SpiderChartProps {
  routers: Router[];
  maxRouters?: number;
}

const SpiderChart: React.FC<SpiderChartProps> = ({ routers, maxRouters = 5 }) => {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartLayout = useMemo(() => {
    if (viewportWidth <= 480) {
      return { size: 300, radius: 120, labelOffset: 28, fontScale: 0.8 };
    }
    if (viewportWidth <= 768) {
      return { size: 360, radius: 150, labelOffset: 35, fontScale: 0.9 };
    }
    return { size: 450, radius: 180, labelOffset: 40, fontScale: 1 };
  }, [viewportWidth]);

  // Get top N routers by overall rank
  const topRouters = routers
    .sort((a, b) => a.metrics.overallRank - b.metrics.overallRank)
    .slice(0, maxRouters);

  // Define the 6 metrics and their corresponding data keys
  const metrics = [
    { key: 'arenaScore', label: 'Arena', color: '#3b82f6' },
    {
      key: 'optimalSelectionScore',
      label: 'Opt. Select',
      color: '#10b981',
    },
    { key: 'optimalCostScore', label: 'Opt. Cost', color: '#f59e0b' },
    { key: 'optimalAccScore', label: 'Opt. Acc', color: '#ef4444' },
    { key: 'latencyScore', label: 'Latency', color: '#8b5cf6' },
    { key: 'robustnessScore', label: 'Robust', color: '#ec4899' },
  ] as const;

  // Router colors for the chart
  const routerColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#8b5cf6', // Purple
  ];

  // Calculate positions for each metric point with axis scaling
  const getMetricPosition = (metricIndex: number, value: number, radius: number) => {
    const angle = (metricIndex * 2 * Math.PI) / metrics.length - Math.PI / 2;
    // Scale value to the new axis range
    const scaledValue = (value - axisMin) / axisRange;
    const clampedValue = Math.max(0, Math.min(1, scaledValue)); // Keep within 0-1 for radius
    const x = centerX + Math.cos(angle) * clampedValue * radius;
    const y = centerY + Math.sin(angle) * clampedValue * radius;
    return { x, y };
  };

  // Generate path for a router's performance line
  const getRouterPath = (router: Router, radius: number) => {
    const points = metrics.map((metric, index) => {
      const value = router.metrics[metric.key as keyof typeof router.metrics];
      // Handle null values by using 0 (will be at center)
      if (value === null) {
        const angle = (index * 2 * Math.PI) / metrics.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * 0;
        const y = centerY + Math.sin(angle) * 0;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }
      const pos = getMetricPosition(index, value, radius);
      return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
    });
    return points.join(' ') + ' Z';
  };

  // Calculate adaptive axis scaling to show more variation
  // Filter out null values
  const gridTicks = [0, 20, 40, 60, 80, 100];
  const axisMin = 0;
  const axisMax = 100;
  const axisRange = axisMax - axisMin;

  const chartRadius = chartLayout.radius;
  const centerX = chartLayout.size / 2;
  const centerY = chartLayout.size / 2;

  return (
    <div className="spider-chart-container">
      <div className="spider-chart">
        <svg
          width={chartLayout.size}
          height={chartLayout.size}
          viewBox={`0 0 ${chartLayout.size} ${chartLayout.size}`}
        >
          {/* Grid circles drawn at fixed 0-100 scale */}
          {gridTicks.map((value, index) => {
            const scale = (value - axisMin) / axisRange;
            const r = chartRadius * scale;

            return (
              <g key={index}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={r}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={centerX + r + 8}
                  y={centerY}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="grid-label"
                  fill="#9ca3af"
                  fontSize={22 * chartLayout.fontScale}
                >
                  {value.toString()}
                </text>
              </g>
            );
          })}

          {/* Grid lines (axes) */}
          {metrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / metrics.length - Math.PI / 2;
            const endX = centerX + Math.cos(angle) * chartRadius;
            const endY = centerY + Math.sin(angle) * chartRadius;

            return (
              <line
                key={metric.key}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Metric labels */}
          {metrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / metrics.length - Math.PI / 2;
            const labelX = centerX + Math.cos(angle) * (chartRadius + chartLayout.labelOffset);
            const labelY = centerY + Math.sin(angle) * (chartRadius + chartLayout.labelOffset);

            return (
              <g key={metric.key}>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="metric-label"
                  fill="#1f2937"
                  fontSize={16 * chartLayout.fontScale}
                  fontWeight="600"
                >
                  {metric.label}
                </text>
              </g>
            );
          })}

          {/* Router performance areas */}
          {topRouters.map((router, routerIndex) => {
            const path = getRouterPath(router, chartRadius);
            const color = routerColors[routerIndex % routerColors.length];

            return (
              <g key={router.id}>
                {/* Fill area */}
                <path d={path} fill={color} fillOpacity="0.1" stroke="none" />
                {/* Border line */}
                <path d={path} fill="none" stroke={color} strokeWidth="2" />
                {/* Data points */}
                {metrics.map((metric, metricIndex) => {
                  const value = router.metrics[metric.key as keyof typeof router.metrics];
                  // Skip rendering if value is null
                  if (value === null) return null;
                  const pos = getMetricPosition(metricIndex, value, chartRadius);

                  return (
                    <circle
                      key={`${router.id}-${metric.key}`}
                      cx={pos.x}
                      cy={pos.y}
                      r="3"
                      fill={color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="spider-legend">
        {topRouters.map((router, index) => {
          const color = routerColors[index % routerColors.length];
          return (
            <div key={router.id} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{router.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpiderChart;
