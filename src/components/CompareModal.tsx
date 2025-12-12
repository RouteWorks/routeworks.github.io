import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  routerCategoryScores,
  routerIdToName,
  compareRouterOptions,
  compareRouterNames,
  compareMetrics,
  compareDifficulties,
  CompareMetric,
  DifficultyLevel,
  routerMetricsById,
  computeCostScore,
} from '../data/routerData';
import DifficultyBarPanel from './DifficultyBarPanel';
import CompareDeferralChart from './CompareDeferralChart';

type DeferralPoint = {
  routerId: string;
  routerName: string;
  metricValue: number;
  costPer1k: number;
  color: string;
};

type ScopeSelectValue = { type: 'overall' } | { type: 'category'; category: string };

const METRIC_LABELS: Record<CompareMetric, string> = {
  accuracy: 'Accuracy',
  robustness: 'Robustness',
  cost: 'Cost',
};

const MAX_BACKGROUND_DEFERRAL_POINTS = 30;
const BACKGROUND_POINT_COLOR = '#c7cdd8';
const OVERALL_SCOPE_VALUE = 'overall';

const buildCategoryScopeValue = (category: string) => `category|${encodeURIComponent(category)}`;

const parseScopeSelectValue = (value: string): ScopeSelectValue => {
  if (value === OVERALL_SCOPE_VALUE) {
    return { type: 'overall' };
  }

  if (value.startsWith('category|')) {
    const [, encodedCategory = ''] = value.split('|');
    return {
      type: 'category',
      category: decodeURIComponent(encodedCategory),
    };
  }

  return { type: 'overall' };
};

interface CompareModalProps {
  routerIds: string[];
  onClose: () => void;
  onAdd: (routerId: string) => void;
  onRemove: (routerId: string) => void;
  maxSelected: number;
}

const CompareModal: React.FC<CompareModalProps> = ({
  routerIds,
  onClose,
  onAdd,
  onRemove,
  maxSelected,
}) => {
  const [activeMetric, setActiveMetric] = useState<CompareMetric>('accuracy');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBarAxis, setActiveBarAxis] = useState<string>('');
  const [activeChartView, setActiveChartView] = useState<'spider' | 'bars' | 'deferral'>('spider');

  const filteredRouterOptions = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return compareRouterOptions
      .filter(option => !routerIds.includes(option.id))
      .filter(option => option.name.toLowerCase().includes(lowerTerm) || option.id.includes(lowerTerm))
      .slice(0, 6);
  }, [searchTerm, routerIds]);

  const canSelectMore = routerIds.length < maxSelected;

  const scopeOptions = useMemo(() => {
    const categoriesMap = new Map<string, Set<string>>();

    routerIds.forEach(id => {
      const routerData = routerCategoryScores[id];
      if (!routerData) return;

      Object.entries(routerData.categories).forEach(([categoryName, categoryData]) => {
        if (!categoriesMap.has(categoryName)) {
          categoriesMap.set(categoryName, new Set());
        }

        const subcategorySet = categoriesMap.get(categoryName)!;
        const subcategories = categoryData.subcategories ? Object.keys(categoryData.subcategories) : [];
        subcategories.forEach(subcategory => subcategorySet.add(subcategory));
      });
    });

    return Array.from(categoriesMap.entries())
      .map(([category, subSet]) => ({
        category,
        subcategories: Array.from(subSet).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [routerIds]);

  const currentAxes = useMemo(() => {
    const axes = new Set<string>();
    routerIds.forEach(id => {
      const data = routerCategoryScores[id];
      if (!data) return;

      if (activeCategory) {
        const subs = data.categories[activeCategory]?.subcategories;
        if (subs) Object.keys(subs).forEach(label => axes.add(label));
      } else {
        Object.keys(data.categories).forEach(label => axes.add(label));
      }
    });
    return Array.from(axes);
  }, [routerIds, activeCategory]);

  const getMetricValue = useCallback(
    (routerId: string, axisLabel: string): number => {
      const data = routerCategoryScores[routerId];
      if (!data) return 0;

      if (activeCategory) {
        const subs = data.categories[activeCategory]?.subcategories;
        const metrics = subs?.[axisLabel]?.metrics?.[activeDifficulty];
        return metrics?.[activeMetric] ?? 0;
      }

      const metrics = data.categories[axisLabel]?.metrics?.[activeDifficulty];
      return metrics?.[activeMetric] ?? 0;
    },
    [activeCategory, activeDifficulty, activeMetric]
  );

  const chartData = useMemo(() => {
    if (!currentAxes.length) return [];

    return currentAxes.map(axisLabel => {
      const entry: Record<string, number | string> = { axis: axisLabel, fullMark: 100 };
      routerIds.forEach(id => {
        entry[id] = getMetricValue(id, axisLabel);
      });
      return entry;
    });
  }, [currentAxes, routerIds, getMetricValue]);

  useEffect(() => {
    if (activeBarAxis && !currentAxes.includes(activeBarAxis)) {
      setActiveBarAxis('');
    }
  }, [currentAxes, activeBarAxis]);

  useEffect(() => {
    if (!activeCategory) return;

    const categoryOption = scopeOptions.find(option => option.category === activeCategory);
    if (!categoryOption) {
      setActiveCategory(null);
      setActiveBarAxis('');
      return;
    }

    if (activeBarAxis && !categoryOption.subcategories.includes(activeBarAxis)) {
      setActiveBarAxis('');
    }
  }, [scopeOptions, activeCategory, activeBarAxis]);

  const scopeSelectValue = useMemo(() => {
    if (!activeCategory) {
      return OVERALL_SCOPE_VALUE;
    }

    return buildCategoryScopeValue(activeCategory);
  }, [activeCategory]);

  const handleScopeSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextScope = parseScopeSelectValue(event.target.value);

    if (nextScope.type === 'overall') {
      setActiveCategory(null);
      setActiveBarAxis('');
      return;
    }

    setActiveCategory(nextScope.category);
    setActiveBarAxis('');
  };

  const difficultyBarData = useMemo(() => {
    if (!routerIds.length) return [];

    const difficultiesToShow =
      activeDifficulty === 'all' ? compareDifficulties : [activeDifficulty];

    return difficultiesToShow.map(difficulty => {

      const entry: Record<string, number | string> = {
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      };

      routerIds.forEach(id => {
        const routerData = routerCategoryScores[id];
        if (!routerData) {
          entry[id] = 0;
          return;
        }

        if (!activeBarAxis) {
          // 🔥 NEW: if we're inside a category, average its subcategories
          if (activeCategory) {
            const subcategories =
              routerData.categories[activeCategory]?.subcategories;

            if (!subcategories) {
              entry[id] = 0;
              return;
            }

            const subs = Object.values(subcategories);
            if (!subs.length) {
              entry[id] = 0;
              return;
            }

            const average =
              subs.reduce((sum, sub) => {
                const metricValue = sub.metrics?.[difficulty]?.[activeMetric] ?? 0;
                return sum + metricValue;
              }, 0) / subs.length;

            entry[id] = average;
            return;
          }

          // fallback: global average across categories
          const categories = Object.values(routerData.categories);
          if (!categories.length) {
            entry[id] = 0;
            return;
          }

          const average =
            categories.reduce((sum, category) => {
              const metricValue = category.metrics?.[difficulty]?.[activeMetric] ?? 0;
              return sum + metricValue;
            }, 0) / categories.length;

          entry[id] = average;
          return;
        }


        const metricSource = activeCategory
          ? routerData.categories[activeCategory]?.subcategories?.[activeBarAxis]?.metrics?.[difficulty]
          : routerData.categories[activeBarAxis]?.metrics?.[difficulty];

        entry[id] = metricSource?.[activeMetric] ?? 0;
      });

      return entry;
    });
  }, [routerIds, activeBarAxis, activeMetric, activeCategory]);

  const barContextLabel = useMemo(() => {
    const metricLabel = METRIC_LABELS[activeMetric];

    if (activeCategory) {
      return `${activeCategory} · ${metricLabel}`;
    }

    if (activeBarAxis) {
      return `${activeBarAxis} · ${metricLabel}`;
    }

    return `${metricLabel} · All categories`;
  }, [activeBarAxis, activeCategory, activeMetric]);


  const selectedRouterNames = useMemo(() => {
    return routerIds.reduce<Record<string, string>>((acc, id) => {
      acc[id] = routerIdToName[id] ?? id;
      return acc;
    }, {});
  }, [routerIds]);

  const getDeferralMetricValue = useCallback(
    (routerId: string): number | null => {
      if (activeCategory) {
        const category = routerCategoryScores[routerId]?.categories[activeCategory];
        const metrics = category?.metrics?.[activeDifficulty];
        return metrics?.[activeMetric] ?? null;
      }

      const routerData = routerCategoryScores[routerId];
      if (!routerData) return null;

      const categories = Object.values(routerData.categories);
      if (!categories.length) return null;

      if (activeMetric === 'cost') {
        const routerMetrics = routerMetricsById[routerId];
        return routerMetrics ? computeCostScore(routerMetrics.costPer1k) : null;
      }

      const values = categories
        .map(category => category.metrics?.[activeDifficulty]?.[activeMetric])
        .filter((v): v is number => typeof v === 'number');

      if (!values.length) return null;

      return values.reduce((a, b) => a + b, 0) / values.length;

    },
    [activeCategory, activeDifficulty, activeMetric]
  );

  const deferralPoints = useMemo<DeferralPoint[]>(() => {
    return routerIds
      .map((routerId, index) => {
        const routerMetrics = routerMetricsById[routerId];
        const metricValue = getDeferralMetricValue(routerId);
        if (!routerMetrics || metricValue === null) return null;

        return {
          routerId,
          routerName: routerIdToName[routerId] ?? routerId,
          metricValue,
          costPer1k: Math.max(routerMetrics.costPer1k, 0.001),
          color: ROUTER_COLORS[index % ROUTER_COLORS.length],
        };
      })
      .filter((point): point is DeferralPoint => Boolean(point));
  }, [routerIds, getDeferralMetricValue]);

  const backgroundDeferralPoints = useMemo<DeferralPoint[]>(() => {
    const remainingIds = compareRouterNames.filter(id => !routerIds.includes(id));
    return remainingIds
      .map(routerId => {
        const routerMetrics = routerMetricsById[routerId];
        const metricValue = getDeferralMetricValue(routerId);
        if (!routerMetrics || metricValue === null) return null;

        return {
          routerId,
          routerName: routerIdToName[routerId] ?? routerId,
          metricValue,
          costPer1k: Math.max(routerMetrics.costPer1k, 0.001),
          color: BACKGROUND_POINT_COLOR,
        };
      })
      .filter((point): point is DeferralPoint => Boolean(point))
      .slice(0, MAX_BACKGROUND_DEFERRAL_POINTS);
  }, [routerIds, getDeferralMetricValue]);

  const deferralContextLabel = useMemo(() => {
    const metricLabel = METRIC_LABELS[activeMetric];
    if (activeCategory) {
      return `${activeCategory} · ${metricLabel} · ${activeDifficulty}`;
    }
    return `${metricLabel} · Overall`;
  }, [activeCategory, activeMetric, activeDifficulty]);

  const handleAxisClick = (axis: string) => {
    if (activeCategory) return;

    setActiveBarAxis(prev => (prev === axis ? '' : axis));
    const hasSubs = routerIds.some(id => routerCategoryScores[id]?.categories[axis]?.subcategories);
    if (hasSubs) setActiveCategory(axis);
  };

  return (
    <div className="compare-modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={event => event.stopPropagation()}>
        <div className="compare-modal-header">
          <div>
            <h3>Compare Routers</h3>
            <p>
              {activeCategory ? `${activeCategory} Category` : 'All Categories'} · {activeMetric} ·{' '}
              {activeDifficulty}
            </p>
          </div>

          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="compare-modal-body">
          <div className="compare-modal-sidebar">
            <div className="control-section">
              <label htmlFor="compare-search">Search routers</label>
              <div className="compare-search-input">
                <input
                  id="compare-search"
                  type="text"
                  placeholder="Search for a router..."
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </div>
              <div className={`search-results ${!canSelectMore ? 'collapsed' : ''}`}>
                {canSelectMore &&
                  filteredRouterOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className="search-result-item"
                      onClick={() => onAdd(option.id)}
                    >
                      {option.name}
                    </button>
                  ))}
                {canSelectMore && !filteredRouterOptions.length && searchTerm && (
                  <p className="helper-text">No routers match “{searchTerm}”.</p>
                )}
              </div>
            </div>

            <div className="control-section">
              <label>Selected routers</label>
              <div className="selected-router-chips">
                {routerIds.map(id => (
                  <button key={id} className="router-chip" onClick={() => onRemove(id)}>
                    {routerIdToName[id] ?? id}
                  </button>
                ))}
                {!routerIds.length && <p className="helper-text">No routers selected</p>}
              </div>
            </div>

            <div className="control-section">
              <label>Metric</label>
              <div className="pill-group">
                {compareMetrics.map(metric => (
                  <button
                    key={metric}
                    className={`pill-button ${metric === activeMetric ? 'active' : ''}`}
                    onClick={() => setActiveMetric(metric)}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <label>Difficulty</label>
              <div className="pill-group">
                {compareDifficulties.map(level => (
                  <button
                    key={level}
                    className={`pill-button ${level === activeDifficulty ? 'active' : ''}`}
                    onClick={() => setActiveDifficulty(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>


          </div>

          <div className="compare-modal-main">
          <div className="compare-toolbar">
              <div className="compare-toolbar-left">
                <div className="view-toggle">
                  {(['spider', 'bars', 'deferral'] as const).map(view => (
                    <button
                      key={view}
                      type="button"
                      className={`pill-button ${activeChartView === view ? 'active' : ''}`}
                      onClick={() => setActiveChartView(view)}
                    >
                      {view === 'spider'
                        ? 'Spider Graph'
                        : view === 'bars'
                          ? 'Difficulty Bars'
                          : 'Deferral Curve'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="compare-toolbar-right">
                {activeCategory && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveBarAxis('');
                    }}
                  >
                    ← All categories
                  </button>
                )}

                <div className="control-section control-section--condensed">
                  <div className="select-control">
                    <select
                      id="view-scope"
                      value={scopeSelectValue}
                      onChange={handleScopeSelectChange}
                    >
                      <option value={OVERALL_SCOPE_VALUE}>All categories</option>
                      {scopeOptions.map(option => (
                        <option
                          key={option.category}
                          value={buildCategoryScopeValue(option.category)}
                        >
                          {option.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
            </div>

            </div>




            {activeChartView === 'spider' && (
              <div className="compare-modal-chart primary">
                {routerIds.length && chartData.length ? (
                  <ResponsiveContainer width="100%" height={480}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={({ payload, x, y, textAnchor }) => (
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            className={`axis-label ${!activeCategory ? 'axis-label--clickable' : ''}`}
                            onClick={() => handleAxisClick(payload.value)}
                          >
                            {payload.value}
                          </text>
                        )}
                      />
                      <PolarRadiusAxis domain={[0, 100]} tickCount={5} />
                      {routerIds.map((id, index) => (
                        <Radar
                          key={id}
                          name={routerIdToName[id] ?? id}
                          dataKey={id}
                          stroke={ROUTER_COLORS[index % ROUTER_COLORS.length]}
                          fill={ROUTER_COLORS[index % ROUTER_COLORS.length]}
                          fillOpacity={0.18}
                          strokeWidth={2.5}
                          animationDuration={400}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">
                    <p>Select routers to compare</p>
                  </div>
                )}
              </div>
            )}

            {activeChartView === 'bars' && (
              <DifficultyBarPanel
                data={difficultyBarData}
                routerIds={routerIds}
                routerNames={selectedRouterNames}
                colors={ROUTER_COLORS}
                contextLabel={barContextLabel}
              />
            )}

            {activeChartView === 'deferral' && (
              <CompareDeferralChart
                selectedPoints={deferralPoints}
                backgroundPoints={backgroundDeferralPoints}
                metric={activeMetric}
                contextLabel={deferralPoints.length ? deferralContextLabel : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ROUTER_COLORS = ['#2563eb', '#f97316', '#10b981'];

export default CompareModal;
