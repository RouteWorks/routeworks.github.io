import React from 'react';
import { Router } from '../types';
import './SpiderChart.css';

interface SpiderChartProps {
  routers: Router[];
  maxRouters?: number;
}

const SpiderChart: React.FC<SpiderChartProps> = ({ routers, maxRouters = 5 }) => {
  // Get top N routers by overall rank
  const topRouters = routers
    .sort((a, b) => a.metrics.overallRank - b.metrics.overallRank)
    .slice(0, maxRouters);

  // Define the 5 metrics and their corresponding data keys
  const metrics = [
    { key: 'arenaScore', label: 'Arena', color: '#3b82f6' },
    { key: 'costRatioScore', label: 'Cost', color: '#10b981' },
    { key: 'optimalAccScore', label: 'Optimal', color: '#f59e0b' },
    { key: 'latencyScore', label: 'Latency', color: '#ef4444' },
    { key: 'robustnessScore', label: 'Robust', color: '#8b5cf6' }
  ] as const;

  // Router colors for the chart
  const routerColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#8b5cf6'  // Purple
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
      const value = router.metrics[metric.key];
      const pos = getMetricPosition(index, value, radius);
      return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
    });
    return points.join(' ') + ' Z';
  };

  // Calculate adaptive axis scaling to show more variation
  const allValues = topRouters.flatMap(router => 
    metrics.map(metric => router.metrics[metric.key])
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  
  // Set axis range to show more variation
  // If values are clustered (e.g., 0.8-0.9), show axis with 25% padding above and below
  const axisMin = Math.max(0, minValue - valueRange * 0.25);
  const axisMax = Math.min(1, maxValue + valueRange * 0.25);
  const axisRange = axisMax - axisMin;
  
  const chartRadius = 180;
  const centerX = 225;
  const centerY = 225;

  return (
    <div className="spider-chart-container">
      <div className="spider-chart">
        <svg width="450" height="450" viewBox="0 0 450 450">
          {/* Grid circles drawn at real 0.1 score increments */}
          {Array.from({ length: 11 }, (_, i) => (i * 0.1))
            .filter(v => v >= axisMin && v <= axisMax)
            .map((value, index) => {
              // Map true axis value -> 0–1 visual radius fraction
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
                    fontSize="22"
                  >
                    {value.toFixed(1)}
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
            const labelX = centerX + Math.cos(angle) * (chartRadius + 40);
            const labelY = centerY + Math.sin(angle) * (chartRadius + 40);
            
            return (
              <g key={metric.key}>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="metric-label"
                  fill="#1f2937"
                  fontSize="16"
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
                <path
                  d={path}
                  fill={color}
                  fillOpacity="0.1"
                  stroke="none"
                />
                {/* Border line */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                />
                {/* Data points */}
                {metrics.map((metric, metricIndex) => {
                  const value = router.metrics[metric.key];
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
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              />
              <span className="legend-label">{router.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpiderChart;
