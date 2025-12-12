import React, { useMemo, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CompareMetric } from '../data/routerData';

interface CompareDeferralChartProps {
  selectedPoints: ScatterPoint[];
  backgroundPoints: ScatterPoint[];
  metric: CompareMetric;
  contextLabel?: string;
}

type ScatterPoint = {
  routerId: string;
  routerName: string;
  metricValue: number;
  costPer1k: number;
  color: string;
};

const formatCurrency = (value: number) => `$${value.toFixed(value >= 10 ? 0 : 2)}`;

const logTicks = (min: number, max: number) => {
  const ticks: number[] = [];
  const minLog = Math.floor(Math.log10(min));
  const maxLog = Math.ceil(Math.log10(max));

  for (let i = minLog; i <= maxLog; i++) {
    const tickValue = Math.pow(10, i);
    if (tickValue >= min && tickValue <= max) {
      ticks.push(Number(tickValue.toFixed(3)));
    }
  }

  return ticks;
};

const metricLabels: Record<CompareMetric, string> = {
  accuracy: 'Accuracy (%)',
  robustness: 'Robustness',
  cost: 'Cost Score',
};

const CompareDeferralChart: React.FC<CompareDeferralChartProps> = ({
  selectedPoints,
  backgroundPoints,
  metric,
  contextLabel,
}) => {
  const combinedPoints = useMemo(
    () => [...backgroundPoints, ...selectedPoints],
    [backgroundPoints, selectedPoints]
  );

  const costDomain = useMemo(() => {
    if (!combinedPoints.length) return { min: 0.01, max: 100 };
    const minValue = Math.min(...combinedPoints.map(point => point.costPer1k));
    const maxValue = Math.max(...combinedPoints.map(point => point.costPer1k));
    return {
      min: Math.max(0.01, minValue * 0.7),
      max: maxValue * 1.3,
    };
  }, [combinedPoints]);

  const metricDomain = useMemo(() => {
    if (!combinedPoints.length) return { min: 20, max: 100 };
    const minValue = Math.min(...combinedPoints.map(point => point.metricValue));
    const maxValue = Math.max(...combinedPoints.map(point => point.metricValue));
    const padding = Math.max(4, (maxValue - minValue) * 0.08);
    return {
      min: Math.max(0, minValue - padding),
      max: Math.min(100, maxValue + padding),
    };
  }, [combinedPoints]);

  const costTicks = logTicks(costDomain.min, costDomain.max);
  const metricLabel = metricLabels[metric];
  const formatMetricValue = useCallback(
    (value: number) => (metric === 'accuracy' ? `${value.toFixed(1)}%` : value.toFixed(1)),
    [metric]
  );
  const renderTooltip = useCallback(
    (props: any) => {
      const { active, payload } = props;
      if (!active || !payload?.length) return null;
      const point = payload[0].payload as ScatterPoint;
      return (
        <div className="deferral-tooltip">
          <p className="deferral-tooltip-name">{point.routerName}</p>
          <p>
            {metricLabel}: <strong>{formatMetricValue(point.metricValue)}</strong>
          </p>
          <p>
            Cost per 1k: <strong>{formatCurrency(point.costPer1k)}</strong>
          </p>
        </div>
      );
    },
    [metricLabel, formatMetricValue]
  );

  if (!selectedPoints.length && !backgroundPoints.length) {
    return (
      <div className="deferral-chart-panel empty">
        <p>Select routers to plot on the deferral curve.</p>
      </div>
    );
  }

  return (
    <div className="deferral-chart-panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">Efficiency view</p>
          <h4 className="panel-title">Deferral curve</h4>
          {contextLabel && <p className="panel-context">{contextLabel}</p>}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 60 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="costPer1k"
            name="Cost per 1k"
            scale="log"
            domain={[costDomain.min, costDomain.max]}
            ticks={costTicks}
            tickFormatter={formatCurrency}
            stroke="#475569"
            label={{
              value: 'Cost per 1k tokens (log scale)',
              position: 'insideBottom',
              offset: -5,
              fill: '#0f172a',
            }}
          />
          <YAxis
            type="number"
            dataKey="metricValue"
            name={metricLabel}
            domain={[metricDomain.min, metricDomain.max]}
            tickFormatter={formatMetricValue}
            stroke="#475569"
            label={{
              value: metricLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              fill: '#0f172a',
            }}
          />
          <Tooltip content={renderTooltip} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          {backgroundPoints.length > 0 && (
            <Scatter
              data={backgroundPoints}
              fill="#c7cdd8"
              stroke="#94a3b8"
              shape="circle"
              legendType="none"
              isAnimationActive={false}
              opacity={0.7}
            />
          )}
          {selectedPoints.map(point => (
            <Scatter
              key={point.routerId}
              name={point.routerName}
              data={[point]}
              fill={point.color}
              shape="circle"
              legendType="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareDeferralChart;
