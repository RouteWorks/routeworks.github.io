import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface DifficultyBarPanelProps {
  data: Array<Record<string, number | string>>;
  routerIds: string[];
  routerNames: Record<string, string>;
  colors: string[];
  contextLabel?: string;
  height?: number;
  titleText?: string;
  metricKey?: string;
}

const DifficultyBarPanel: React.FC<DifficultyBarPanelProps> = ({
  data,
  routerIds,
  routerNames,
  colors,
  contextLabel,
  height = 320,
  titleText = "Difficulty breakdown",
  metricKey,
}) => {
  if (!data.length || !routerIds.length) {
    return (
      <div className="difficulty-bar-panel empty">
        <p>Select routers to view difficulty comparisons.</p>
      </div>
    );
  }

  return (
    <div className="difficulty-bar-panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">{titleText}</p>
          {contextLabel && <p className="panel-context">{contextLabel}</p>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 30, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={([dataMin, dataMax]: [number, number]) => {
              if (metricKey === 'cost') {
                if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
                  return [0, 100];
                }

                if (dataMin === dataMax) {
                  const padding = Math.max(Math.abs(dataMin) * 0.3, 0.00005);
                  const domainMin = Math.max(0, dataMin - padding);
                  const domainMax = dataMax + padding;
                  return [domainMin, Math.max(domainMin + padding * 0.5, domainMax)];
                }

                const range = dataMax - dataMin;
                const padding = Math.max(range * 0.2, dataMax * 0.1, 0.00005);
                const domainMin = Math.max(0, dataMin - padding);
                const domainMax = dataMax + padding;
                return [domainMin, Math.max(domainMin + padding * 0.5, domainMax)];
              }

              return [0, 100];
            }}
          />
          <YAxis type="category" dataKey="difficulty" />
          <Tooltip
          cursor={{ fill: 'transparent' }}
          />
          <Legend />
          {routerIds.map((routerId, index) => (
            <Bar
              key={routerId}
              dataKey={routerId}
              name={routerNames[routerId] ?? routerId}
              fill={colors[index % colors.length]}
              radius={[4, 4, 4, 4]}
              maxBarSize={20}
            >
              <LabelList
                dataKey={routerId}
                position="right"
                formatter={(value: number) => {
                  if (metricKey === 'cost') {
                    const safeValue = Number.isFinite(value) ? value : 0;
                    return `$${safeValue.toFixed(5)}`;
                  }
                  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
                }}
                fill="#0f172a"
                fontSize={12}
                offset={8}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DifficultyBarPanel;
