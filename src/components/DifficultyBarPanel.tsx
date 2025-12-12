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
}

const DifficultyBarPanel: React.FC<DifficultyBarPanelProps> = ({
  data,
  routerIds,
  routerNames,
  colors,
  contextLabel,
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
          <p className="panel-eyebrow">Difficulty breakdown</p>
          <h4 className="panel-title">Grouped bar comparison</h4>
          {contextLabel && <p className="panel-context">{contextLabel}</p>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="difficulty" />
          <Tooltip />
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
                formatter={(value: number) => value.toFixed(1)}
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
