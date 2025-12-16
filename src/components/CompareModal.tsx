import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
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
const PRIORITY_AXIS_LABEL = 'Computer science, information, and general works';

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
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const scopeDropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredRouterOptions = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return compareRouterOptions
      .filter(option => !routerIds.includes(option.id))
      .filter(option => option.name.toLowerCase().includes(lowerTerm) || option.id.includes(lowerTerm))
      .slice(0, 6);
  }, [searchTerm, routerIds]);

  const spiderChartHeight = isCompactLayout ? 360 : 460;
  const spiderOuterRadius = isCompactLayout ? '65%' : '80%';
  const spiderChartMargin = isCompactLayout
    ? { top: 32, right: 32, bottom: 32, left: 32 }
    : { top: 16, right: 48, bottom: 16, left: 48 };
  const secondaryChartHeight = isCompactLayout ? 260 : 320;
  const deferralChartHeight = isCompactLayout ? 280 : 320;
  const isDeferralDisabled = activeMetric === 'cost';

  const canSelectMore = routerIds.length < maxSelected;

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window === 'undefined') return;
      setIsCompactLayout(window.innerWidth <= 768);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

useEffect(() => {
  if (isDeferralDisabled && activeChartView === 'deferral') {
    setActiveChartView('spider');
  }
}, [isDeferralDisabled, activeChartView]);

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
    const axisList = Array.from(axes);
    axisList.sort((a, b) => {
      const aIsPriority = a === PRIORITY_AXIS_LABEL;
      const bIsPriority = b === PRIORITY_AXIS_LABEL;
      if (aIsPriority && bIsPriority) return 0;
      if (aIsPriority) return -1;
      if (bIsPriority) return 1;
      return a.localeCompare(b);
    });
    return axisList;
  }, [routerIds, activeCategory]);

  const canShowSpider = currentAxes.length >= 3;

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

  const routerAxisAverages = useMemo(() => {
    const axisAverages: Record<string, number> = {};
    chartData.forEach(row => {
      const axis = row.axis as string;
      const values = routerIds
        .map(id => Number(row[id]))
        .filter(value => Number.isFinite(value)) as number[];
      if (values.length) {
        axisAverages[axis] = values.reduce((sum, value) => sum + value, 0) / values.length;
      }
    });
    return axisAverages;
  }, [chartData, routerIds]);

  const spiderValueDomain = useMemo<[number, number]>(() => {
    if (activeMetric !== 'cost') return [0, 100];
    if (!Object.keys(routerAxisAverages).length) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    Object.values(routerAxisAverages).forEach(value => {
      min = Math.min(min, value);
      max = Math.max(max, value);
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [0, 100];
    }

    if (min === max) {
      const padding = Math.max(Math.abs(min) * 0.3, 0.00005);
      const domainMin = Math.max(0, min - padding);
      const domainMax = min + padding;
      return [domainMin, Math.max(domainMin + padding * 0.5, domainMax)];
    }

    const range = max - min;
    const padding = Math.max(range * 0.2, max * 0.1, 0.00005);
    const domainMin = Math.max(0, min - padding);
    const domainMax = max + padding;
    return [domainMin, Math.max(domainMin + padding * 0.5, domainMax)];
  }, [activeMetric, routerAxisAverages]);

  const spiderChartDomain: [number, number] =
    activeMetric === 'cost' ? spiderValueDomain : [0, 100];

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

  const scopeDisplayLabel = useMemo(() => (activeCategory ? activeCategory : 'All categories'), [activeCategory]);

  const applyScopeValue = useCallback((value: string) => {
    const nextScope = parseScopeSelectValue(value);

    if (nextScope.type === 'overall') {
      setActiveCategory(null);
      setActiveBarAxis('');
      return;
    }

    setActiveCategory(nextScope.category);
    setActiveBarAxis('');
  }, []);

  const handleScopeOptionClick = useCallback(
    (value: string) => {
      applyScopeValue(value);
      setIsScopeDropdownOpen(false);
    },
    [applyScopeValue]
  );

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
          if (activeCategory) {
            const categoryMetric =
              routerData.categories[activeCategory]?.metrics?.[difficulty]?.[activeMetric];
            entry[id] = typeof categoryMetric === 'number' ? categoryMetric : 0;
            return;
          }

          const routerLevelMetric = routerData.metrics?.[difficulty]?.[activeMetric];
          if (typeof routerLevelMetric === 'number') {
            entry[id] = routerLevelMetric;
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
  }, [routerIds, activeBarAxis, activeMetric, activeCategory, activeDifficulty]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDeferralMetricValue = useCallback(
    (routerId: string): number | null => {
      const routerData = routerCategoryScores[routerId];
      if (!routerData) return null;

      if (activeCategory) {
        const category = routerData.categories[activeCategory];
        const metrics = category?.metrics?.[activeDifficulty];
        return metrics?.[activeMetric] ?? null;
      }

      if (activeMetric !== 'cost') {
        const routerLevelMetric = routerData.metrics?.[activeDifficulty]?.[activeMetric];
        if (typeof routerLevelMetric === 'number') {
          return routerLevelMetric;
        }
      }

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
                {routerIds.map((id, index) => (
                  <button
                    key={id}
                    className="router-chip"
                    onClick={() => onRemove(id)}
                    style={{
                      background: `${ROUTER_COLORS[index % ROUTER_COLORS.length]}20`,
                      borderColor: ROUTER_COLORS[index % ROUTER_COLORS.length],
                      color: '#0f172a',
                    }}
                  >
                    <span
                      className="router-chip-dot"
                      style={{ backgroundColor: ROUTER_COLORS[index % ROUTER_COLORS.length] }}
                    />
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
                  {(['spider', 'bars', 'deferral'] as const).map(view => {
                    const isDeferralView = view === 'deferral';
                    const disabled = isDeferralView && activeMetric === 'cost';
                    const title = disabled ? 'Deferral curve is unavailable for cost metric' : undefined;

                    return (
                      <button
                        key={view}
                        type="button"
                        className={`pill-button ${activeChartView === view ? 'active' : ''}`}
                        disabled={disabled}
                        title={title}
                        onClick={() => {
                          if (disabled) return;
                          setActiveChartView(view);
                        }}
                      >
                        {view === 'spider'
                          ? 'Spider Graph'
                          : view === 'bars'
                            ? 'Difficulty Bars'
                            : 'Deferral Curve'}
                      </button>
                    );
                  })}
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

                <div className="scope-dropdown" ref={scopeDropdownRef}>
                  <button
                    type="button"
                    className={`scope-dropdown-toggle ${isScopeDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsScopeDropdownOpen(prev => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isScopeDropdownOpen}
                  >
                    <span className="scope-dropdown-label">{scopeDisplayLabel}</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  {isScopeDropdownOpen && (
                    <div className="scope-dropdown-menu" role="listbox">
                      <button
                        type="button"
                        className={`scope-dropdown-option ${scopeSelectValue === OVERALL_SCOPE_VALUE ? 'selected' : ''}`}
                        onClick={() => handleScopeOptionClick(OVERALL_SCOPE_VALUE)}
                      >
                        All categories
                      </button>
                      {scopeOptions.map(option => {
                        const value = buildCategoryScopeValue(option.category);
                        return (
                          <button
                            type="button"
                            key={option.category}
                            className={`scope-dropdown-option ${scopeSelectValue === value ? 'selected' : ''}`}
                            onClick={() => handleScopeOptionClick(value)}
                          >
                            {option.category}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>

            </div>




            {activeChartView === 'spider' && (
              <div className="compare-modal-chart primary">
                {routerIds.length && chartData.length ? (
                  canShowSpider ? (
                    <ResponsiveContainer width="100%" height={spiderChartHeight}>
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius={spiderOuterRadius}
                        data={chartData}
                        margin={spiderChartMargin}
                      >
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={({ payload, x, y, textAnchor }) => (
                            <text
                              x={x}
                              y={y}
                              textAnchor={textAnchor ?? 'middle'}
                              className={`axis-label ${!activeCategory ? 'axis-label--clickable' : ''}`}
                              onClick={() => handleAxisClick(payload.value)}
                            >
                              <tspan>{payload.value}</tspan>
                            </text>
                          )}
                        />
                        <PolarRadiusAxis domain={spiderValueDomain} tickCount={5} />
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
                    <DifficultyBarPanel
                      data={chartData.map(row => {
                        const transformed: Record<string, number | string> = {
                          difficulty: row.axis as string,
                        };
                        routerIds.forEach(id => {
                          const value = Number(row[id]);
                          transformed[id] = Number.isFinite(value) ? value : 0;
                        });
                        return transformed;
                      })}
                      routerIds={routerIds}
                      routerNames={selectedRouterNames}
                      colors={ROUTER_COLORS}
                      contextLabel={`Grouped view · ${activeCategory ?? 'All categories'} · ${METRIC_LABELS[activeMetric]}`}
                      titleText="Grouped bar comparison"
                      height={320}
                      metricKey={activeMetric}
                    />
                  )
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
                height={secondaryChartHeight}
                metricKey={activeMetric}
              />
            )}

            {activeChartView === 'deferral' && activeMetric !== 'cost' && (
              <CompareDeferralChart
                selectedPoints={deferralPoints}
                backgroundPoints={backgroundDeferralPoints}
                metric={activeMetric}
                contextLabel={deferralPoints.length ? deferralContextLabel : undefined}
                height={deferralChartHeight}
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
