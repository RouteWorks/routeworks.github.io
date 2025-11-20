import React, { useEffect, useMemo, useState } from 'react';
import './DeferralCurve.css';

interface DeferralCurveProps {
  openSourcePoints: {
    [key: string]: { accuracy: number; cost_per_1k: number };
  };
  closedSourcePoints: {
    [key: string]: { accuracy: number; cost_per_1k: number };
  };
}

const DeferralCurve: React.FC<DeferralCurveProps> = ({ openSourcePoints, closedSourcePoints }) => {
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
      return {
        width: 320,
        height: 260,
        margin: { top: 15, right: 10, bottom: 50, left: 60 },
        pointSize: 5,
        fontScale: 0.78,
      };
    }
    if (viewportWidth <= 768) {
      return {
        width: 400,
        height: 320,
        margin: { top: 20, right: 15, bottom: 55, left: 70 },
        pointSize: 6,
        fontScale: 0.9,
      };
    }
    return {
      width: 500,
      height: 400,
      margin: { top: 20, right: 20, bottom: 60, left: 80 },
      pointSize: 6.5,
      fontScale: 1,
    };
  }, [viewportWidth]);
  // Extract all accuracy and cost values
  const allPoints = [...Object.values(openSourcePoints), ...Object.values(closedSourcePoints)];
  const accuracyValues = allPoints.map(p => p.accuracy);
  const costValues = allPoints.map(p => p.cost_per_1k);

  const minAccuracy = Math.min(...accuracyValues);
  const maxAccuracy = Math.max(...accuracyValues);
  const minCost = Math.min(...costValues);
  const maxCost = Math.max(...costValues);

  // Add some padding to the ranges, but ensure oracle accuracy (0.9089) is visible
  const accuracyRange = maxAccuracy - minAccuracy;
  const costRange = maxCost - minCost;
  const accuracyMin = Math.max(0, minAccuracy - accuracyRange * 0.1);
  const accuracyMax = Math.max(0.95, maxAccuracy + accuracyRange * 0.1); // Ensure oracle accuracy is visible

  // Zoom in on X-axis to spread out the data points better
  const costMin = Math.max(0.01, minCost * 0.5); // Start closer to minimum
  const costMax = maxCost * 1.2; // Extend a bit beyond maximum

  // Chart dimensions
  const chartWidth = chartLayout.width;
  const chartHeight = chartLayout.height;
  const margin = chartLayout.margin;
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Scale functions
  const scaleX = (cost: number) => {
    const logMin = Math.log10(costMin);
    const logMax = Math.log10(costMax);
    const logValue = Math.log10(cost);
    return margin.left + ((logValue - logMin) / (logMax - logMin)) * plotWidth;
  };

  const scaleY = (accuracy: number) => {
    return margin.top + (1 - (accuracy - accuracyMin) / (accuracyMax - accuracyMin)) * plotHeight;
  };

  // Router colors and shapes
  const routerColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange-500
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a855f7', // Violet
  ];

  // Function to render different shapes
  const renderShape = (
    x: number,
    y: number,
    shape: string,
    color: string,
    key: string,
    size: number = chartLayout.pointSize
  ) => {
    switch (shape) {
      case 'square':
        return (
          <rect
            key={key}
            x={x - size}
            y={y - size}
            width={size * 2}
            height={size * 2}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      case 'diamond':
        return (
          <polygon
            key={key}
            points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      case 'triangle':
        return (
          <polygon
            key={key}
            points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      case 'star':
        const starPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = ((i * 144 - 90) * Math.PI) / 180;
          const outerX = x + Math.cos(angle) * size;
          const outerY = y + Math.sin(angle) * size;
          const innerAngle = (((i + 0.5) * 144 - 90) * Math.PI) / 180;
          const innerX = x + Math.cos(innerAngle) * (size * 0.4);
          const innerY = y + Math.sin(innerAngle) * (size * 0.4);
          starPoints.push(`${outerX},${outerY} ${innerX},${innerY}`);
        }
        return (
          <polygon
            key={key}
            points={starPoints.join(' ')}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = ((i * 60 - 30) * Math.PI) / 180;
          const hexX = x + Math.cos(angle) * size;
          const hexY = y + Math.sin(angle) * size;
          hexPoints.push(`${hexX},${hexY}`);
        }
        return (
          <polygon
            key={key}
            points={hexPoints.join(' ')}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      default: // circle
        return (
          <circle key={key} cx={x} cy={y} r={size} fill={color} stroke="white" strokeWidth="2" />
        );
    }
  };

  // Generate powers of 10 for x-axis (0.1, 1, 10, etc.)
  const generatePowersOf10 = (min: number, max: number) => {
    const ticks = [];
    const minLog = Math.floor(Math.log10(min));
    const maxLog = Math.ceil(Math.log10(max));

    for (let i = minLog; i <= maxLog; i++) {
      const baseValue = Math.pow(10, i);
      if (baseValue >= min && baseValue <= max) {
        ticks.push(baseValue);
      }
    }
    return ticks;
  };

  const costTicks = generatePowersOf10(costMin, costMax);
  const scaledFont = (size: number) => size * chartLayout.fontScale;

  return (
    <div className="deferral-curve-container">
      <div className="deferral-curve-wrapper">
        <svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {costTicks.map(tick => {
            const x = scaleX(tick);
            return (
              <line
                key={`grid-x-${tick}`}
                x1={x}
                y1={margin.top}
                x2={x}
                y2={margin.top + plotHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(tick => {
            if (tick >= accuracyMin && tick <= accuracyMax) {
              const y = scaleY(tick);
              return (
                <line
                  key={`grid-y-${tick}`}
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Open-source routers */}
          {Object.entries(openSourcePoints).map(([name, point], index) => {
            const x = scaleX(point.cost_per_1k);
            const y = scaleY(point.accuracy);
            const color = routerColors[index % routerColors.length];

            return renderShape(x, y, 'circle', color, `open-source-${name}`);
          })}

          {/* Closed-source routers */}
          {Object.entries(closedSourcePoints).map(([name, point], index) => {
            const x = scaleX(point.cost_per_1k);
            const y = scaleY(point.accuracy);
            const color =
              routerColors[(index + Object.keys(openSourcePoints).length) % routerColors.length];

            return renderShape(x, y, 'triangle', color, `closed-source-${name}`);
          })}

          {/* Oracle accuracy line */}
          <line
            x1={margin.left}
            y1={scaleY(0.9089)}
            x2={margin.left + plotWidth}
            y2={scaleY(0.9089)}
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={margin.left + plotWidth - 5}
            y={scaleY(0.9089) - 8}
            fontSize={scaledFont(18)}
            fill="#22c55e"
            textAnchor="end"
            fontWeight="600"
          >
            Oracle Accuracy
          </text>

          {/* Axes */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X-axis labels - powers of 10 only */}
          {costTicks.map(tick => {
            const x = scaleX(tick);
            return (
              <g key={`x-tick-${tick}`}>
                <line
                  x1={x}
                  y1={margin.top + plotHeight}
                  x2={x}
                  y2={margin.top + plotHeight + 5}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={margin.top + plotHeight + 20}
                  fontSize={scaledFont(17)}
                  fill="#374151"
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels */}
          {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(tick => {
            if (tick >= accuracyMin && tick <= accuracyMax) {
              const y = scaleY(tick);
              return (
                <g key={`y-tick-${tick}`}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={margin.left - 5}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    fontSize={scaledFont(17)}
                    fill="#374151"
                    textAnchor="end"
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Axis titles */}
          <text
            x={margin.left + plotWidth / 2}
            y={chartHeight - 10}
            fontSize={scaledFont(16)}
            fill="#374151"
            textAnchor="middle"
            fontWeight="500"
          >
            Inference Cost ($ per 1K queries, log scale)
          </text>
          <text
            x={20}
            y={margin.top + plotHeight / 2}
            fontSize={scaledFont(16)}
            fill="#374151"
            textAnchor="middle"
            fontWeight="500"
            transform={`rotate(-90, 20, ${margin.top + plotHeight / 2})`}
          >
            Accuracy
          </text>
        </svg>

        {/* Legend */}
        <div className="deferral-legend-side">
          <div className="legend-section">
            <h4>Open-Source</h4>
            <div className="legend-items">
              {Object.entries(openSourcePoints).map(([name, point], index) => {
                const color = routerColors[index % routerColors.length];
                return (
                  <div key={name} className="legend-item">
                    <svg className="legend-shape" width="16" height="16">
                      {renderShape(8, 8, 'circle', color, `legend-${name}`, 5)}
                    </svg>
                    <span className="legend-label">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="legend-section">
            <h4>Closed-Source</h4>
            <div className="legend-items">
              {Object.entries(closedSourcePoints).map(([name, point], index) => {
                const color =
                  routerColors[(index + Object.keys(openSourcePoints).length) % routerColors.length];
                return (
                  <div key={name} className="legend-item">
                    <svg className="legend-shape" width="16" height="16">
                      {renderShape(8, 8, 'triangle', color, `legend-${name}`, 5)}
                    </svg>
                    <span className="legend-label">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeferralCurve;
