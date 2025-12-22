import React, { useState, useMemo } from 'react';
import { Trophy, Search, Medal, Github, Layers, Link as LinkIcon, Unlock, Lock } from 'lucide-react';
import { Router } from '../types';
import { routers } from '../data/routerData';
import SpiderChart from '../components/SpiderChart';
import DeferralCurve from '../components/DeferralCurve';
import RouterModelCard from '../components/RouterModelCard';
import CompareModal from '../components/CompareModal';
import './LeaderboardPage.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import huggingFaceLogo from '../assets/images/hf-logo.svg';

type RouterWithDynamicArena = Router & { dynamicArena: number };

const COST_MIN = 0.0044;
const COST_MAX = 200;

const DEFAULT_BETA = 0.1;
const defaultCostWeight = DEFAULT_BETA / (1 + DEFAULT_BETA);

// 👇 snapping behavior
const SNAP_TARGET = defaultCostWeight; // ~0.0909
const SNAP_THRESHOLD = 0.015;          // how close before snapping


const computeNormalizedCost = (costPer1k: number): number => {
  // const safeCost = Math.max(costPer1k, COST_MIN);
  const numerator = Math.log2(COST_MAX) - Math.log2(costPer1k);
  const denominator = Math.log2(COST_MAX) - Math.log2(COST_MIN);
  if (denominator === 0) return 0;
  const normalized = numerator / denominator;
  return Math.min(Math.max(normalized, 0), 1);
};

const computeArenaScore = (router: Router, beta: number): number => {
  const accuracy = router.metrics.accuracy / 100;
  const normalizedCost = computeNormalizedCost(router.metrics.costPer1k);
  const denominator = beta * accuracy + normalizedCost;
  if (denominator === 0) return 0;
  return (((1 + beta) * accuracy * normalizedCost) / denominator) * 100;
};

const LeaderboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'open-source' | 'closed-source'>('all');
  const [activeMetric, setActiveMetric] = useState<
    'arena' | 'accuracy' | 'cost' | 'optimalSelection' | 'optimalCost' | 'optimalAcc' | 'latency' | 'robustness'
  >('arena');
  const [activeTab, setActiveTab] = useState<'spider' | 'deferral'>('spider');
  const [costWeight, setCostWeight] = useState(defaultCostWeight);

  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const beta = costWeight / (1 - costWeight);
  const accuracyWeight = 1 - costWeight;
  const MAX_COMPARE = 3;
  const maxCompareReached = selectedCompareIds.length >= MAX_COMPARE;
  const [modelCardRouter, setModelCardRouter] = useState<Router | null>(null);

  // Deferral curve data
  const openSourcePoints = {
    CARROT: { accuracy: 0.672, cost_per_1k: 2.060741 },
    RouterDC: { accuracy: 0.3344, cost_per_1k: 0.063751 },
    GraphRouter: { accuracy: 0.6072, cost_per_1k: 0.363695 },
    KNN: { accuracy: 0.5905, cost_per_1k: 4.266104 },
    MLP: { accuracy: 0.6191, cost_per_1k: 4.830245 },
    RouteLLM: { accuracy: 0.6224, cost_per_1k: 4.937691 },
    'MIRT-BERT': { accuracy: 0.6731, cost_per_1k: 0.150629 },
    'NIRT-BERT': { accuracy: 0.6159, cost_per_1k: 0.600228 },
  };

  const closedSourcePoints = {
    NotDiamond: { accuracy: 0.6651, cost_per_1k: 9.330411 },
    Azure: { accuracy: 0.6798, cost_per_1k: 0.619866 },
    'GPT-5': { accuracy: 0.7428, cost_per_1k: 14.407096 },
    'vLLM-SR': { accuracy: 0.6665, cost_per_1k: 1.61393 },
  };

  const filteredAndSortedRouters = useMemo<RouterWithDynamicArena[]>(() => {
    const metricKeyMap = {
      arena: 'arenaScore',
      optimalSelection: 'optimalSelectionScore',
      optimalCost: 'optimalCostScore',
      optimalAcc: 'optimalAccScore',
      latency: 'latencyScore',
      robustness: 'robustnessScore',
      accuracy: 'accuracy',
      cost: 'costPer1k',
    } as const;

    const withDynamicArena: RouterWithDynamicArena[] = routers.map(router => ({
      ...router,
      dynamicArena: computeArenaScore(router, beta),
    }));

    let filtered = withDynamicArena.filter(router => {
      const matchesSearch =
        router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || router.type === filterType;
      return matchesSearch && matchesFilter;
    });

    const key = metricKeyMap[activeMetric];
    return filtered.sort((a, b) => {
      const scoreA = activeMetric === 'arena' ? a.dynamicArena : a.metrics[key];
      const scoreB = activeMetric === 'arena' ? b.dynamicArena : b.metrics[key];
      // Handle null values - put them at the end
      if (scoreA === null && scoreB === null) return 0;
      if (scoreA === null) return 1;
      if (scoreB === null) return -1;
      // For cost, lower is better, so sort ascending
      if (activeMetric === 'cost') {
        return (scoreA as number) - (scoreB as number);
      }
      // For all other metrics, higher is better, so sort descending
      return (scoreB as number) - (scoreA as number);
    });
  }, [searchTerm, filterType, activeMetric, beta]);

  type MetricBestMap = {
    dynamicArena: number | null;
    accuracy: number | null;
    costPer1k: number | null;
    optimalSelectionScore: number | null;
    optimalCostScore: number | null;
    optimalAccScore: number | null;
    latencyScore: number | null;
    robustnessScore: number | null;
  };

  const bestMetricValues = useMemo<MetricBestMap>(() => {
    const best: MetricBestMap = {
      dynamicArena: null,
      accuracy: null,
      costPer1k: null,
      optimalSelectionScore: null,
      optimalCostScore: null,
      optimalAccScore: null,
      latencyScore: null,
      robustnessScore: null,
    };

    const updateBest = (
      key: keyof MetricBestMap,
      value: number | null | undefined,
      favorLower = false
    ) => {
      if (value === null || value === undefined) return;
      const current = best[key];
      if (current === null) {
        best[key] = value;
        return;
      }
      if ((!favorLower && value > current) || (favorLower && value < current)) {
        best[key] = value;
      }
    };

    filteredAndSortedRouters.forEach(router => {
      updateBest('dynamicArena', router.dynamicArena);
      updateBest('accuracy', router.metrics.accuracy);
      updateBest('costPer1k', router.metrics.costPer1k, true);
      updateBest('optimalSelectionScore', router.metrics.optimalSelectionScore);
      updateBest('optimalCostScore', router.metrics.optimalCostScore);
      updateBest('optimalAccScore', router.metrics.optimalAccScore);
      updateBest('latencyScore', router.metrics.latencyScore);
      updateBest('robustnessScore', router.metrics.robustnessScore);
    });

    return best;
  }, [filteredAndSortedRouters]);

  const isBestValue = (value: number | null | undefined, best: number | null) => {
    if (value === null || value === undefined || best === null) return false;
    return Math.abs(value - best) < 0.0001;
  };

  // const getRankBadge = (rank: number) => {
  //   if (rank === 1) return 'rank-1';
  //   if (rank === 2) return 'rank-2';
  //   if (rank === 3) return 'rank-3';
  //   return 'rank-other';
  // };

  const renderRankBadge = (rank: number) => {
    const baseClass = 'rank-badge';
    switch (rank) {
      case 1:
        return (
          <div className={`${baseClass} gold`}>
            <Trophy size={24} color="#92400e" fill="#fbbf24" strokeWidth={2.2} />
          </div>
        );
      case 2:
        return (
          <div className={`${baseClass} silver`}>
            <Medal size={24} color="#9ca3af" fill="#d1d5db" />
          </div>
        );
      case 3:
        return (
          <div className={`${baseClass} bronze`}>
            <Medal size={24} color="#b45309" fill="#f59e0b" />
          </div>
        );
      default:
        return <span className={`${baseClass} rank-other`}>{rank}</span>;
    }
  };

  const toggleCompareSelection = (routerId: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(routerId)) {
        return prev.filter(id => id !== routerId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, routerId];
    });
  };

  const handleSoloCompare = (routerId: string) => {
    setSelectedCompareIds([routerId]);
    setIsCompareModalOpen(true);
    setModelCardRouter(null);
  };

  const handleRemoveFromCompare = (routerId: string) => {
    setSelectedCompareIds(prev => {
      const updated = prev.filter(id => id !== routerId);
      if (!updated.length) {
        setIsCompareModalOpen(false);
      }
      return updated;
    });
  };

  return (
    <div className="leaderboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <Trophy className="title-icon" />
            RouterArena Leaderboard
          </h1>
          <p className="page-subtitle">
            Comprehensive evaluation and ranking of LLM routers across multiple metrics
          </p>
        </div>

        {/* Metric Filter Buttons */}
        <div className="metric-filters">
          <button
            className={`metric-filter-btn ${activeMetric === 'arena' ? 'active' : ''}`}
            onClick={() => setActiveMetric('arena')}
          >
            Arena Score
          </button>

          <button
            className={`metric-filter-btn ${activeMetric === 'accuracy' ? 'active' : ''}`}
            onClick={() => setActiveMetric('accuracy')}
          >
            Accuracy
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'cost' ? 'active' : ''}`}
            onClick={() => setActiveMetric('cost')}
          >
            Cost/1k Queries
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimalSelection' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalSelection')}
          >
            Opt. Selection
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimalCost' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalCost')}
          >
            Opt. Cost
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimalAcc' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalAcc')}
          >
            Opt. Acc.
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'latency' ? 'active' : ''}`}
            onClick={() => setActiveMetric('latency')}
          >
            Latency
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'robustness' ? 'active' : ''}`}
            onClick={() => setActiveMetric('robustness')}
          >
            Robustness
          </button>
        </div>

        {/* Filters and Search */}
        <div className="controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search routers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'all' | 'open-source' | 'closed-source')}
                className="filter-select"
              >
                <option value="all">All Routers</option>
                <option value="open-source">Open-Source</option>
                <option value="closed-source">Closed-Source</option>
              </select>
            </div>
          </div>

          <div className="beta-control">
            <button
              type="button"
              className="beta-label-link"
              onClick={() =>
                document.getElementById('metrics-explanation')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <span className="beta-label-text">Weighted Arena Score</span>
            </button>
            <input
              type="range"
              id="beta-slider"
              min={0.05}
              max={0.95}
              step={0.01}
              value={costWeight}
              onChange={event => {
                let value = parseFloat(event.target.value);

                // Clamp first
                value = Math.min(0.95, Math.max(0.05, value));

                // Snap to default if close enough
                if (Math.abs(value - SNAP_TARGET) < SNAP_THRESHOLD) {
                  value = SNAP_TARGET;
                }

                setCostWeight(value);
              }}

              className="beta-slider"
            />
            <div className="beta-hints">
              <span>{(costWeight * 100).toFixed(0)}% Cost Weight</span>
              <span> Accuracy Weight {(accuracyWeight * 100).toFixed(0)}%</span>
            </div>
            <div className="beta-weights">

              <div className="beta-weight-pill">
                β = cost weight&nbsp;: accuracy weight&nbsp;= {beta.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-container">
          <div className="leaderboard-scroll">
            <div className="leaderboard-header">
              <div className="select-col">
                <Layers size={16} aria-label="Compare" />
              </div>
              <div className="rank-col">Rank</div>
              <div className="name-col">Router</div>
              <div className="affiliation-col">Affiliation</div>
              <div className="metrics-col">Arena</div>
              <div className="metrics-col">Accuracy</div>
              <div className="metrics-col">Cost/1K</div>
              <div className="metrics-col">Opt. Select</div>
              <div className="metrics-col">Opt. Cost</div>
              <div className="metrics-col">Opt. Acc</div>
              <div className="metrics-col">Latency</div>
              <div className="metrics-col">Robust</div>
            </div>


            <div className="leaderboard-body">
              {filteredAndSortedRouters.map((router, index) => {
              const isSelectedForCompare = selectedCompareIds.includes(router.id);
              const primaryLink = router.websiteUrl || router.paperUrl || router.githubUrl;
              const TypeIcon = router.type === 'open-source' ? Unlock : Lock;
              const typeLabel = router.type === 'open-source' ? 'Open' : 'Closed';
              const typeDescription =
                router.type === 'open-source' ? 'Open-source router' : 'Closed-source router';
              return (
                <div key={router.id} className="leaderboard-row">
                <div className="select-col">
                  <input
                    type="checkbox"
                    checked={isSelectedForCompare}
                    onChange={() => toggleCompareSelection(router.id)}
                    disabled={!isSelectedForCompare && maxCompareReached}
                    aria-label={`Select ${router.name} for comparison`}
                  />
                </div>
                <div className="rank-col">{renderRankBadge(index + 1)}</div>

                <div className="name-col">
                  <div className="router-info">
                    <div className="router-name-row">

                      <button
                        type="button"
                        className="router-name-link"
                        onClick={() => setModelCardRouter(router)}
                      >
                        <h3 className="router-name">{router.name}</h3>
                      </button>

                      <span
                        className={`router-type-indicator ${router.type}`}
                        title= {`${typeDescription}`}
                        aria-label={`${typeDescription}`}
                      >
                        <TypeIcon size={12} aria-hidden="true" />
                      </span>

                    </div>
                    {(primaryLink || router.githubUrl || router.huggingfaceUrl) && (
                      <div className="router-link-badges">
                        {primaryLink && (
                          <a
                            href={primaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="router-link-pill primary"
                            aria-label={`${router.name} resource`}
                          >
                            <LinkIcon size={14} />
                          </a>
                        )}
                        {router.githubUrl && (
                          <a
                            href={router.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="router-link-pill github"
                            aria-label={`${router.name} GitHub repository`}
                          >
                            <Github size={14} />
                          </a>
                        )}
                        {router.huggingfaceUrl && (
                          <a
                            href={router.huggingfaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="router-link-pill huggingface"
                            aria-label={`${router.name} Hugging Face card`}
                          >
                            <img src={huggingFaceLogo} alt="Hugging Face logo" className="hf-logo" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="affiliation-col">
                  <span className="affiliation">{router.affiliation}</span>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span
                      className={`score ${
                        isBestValue(router.dynamicArena, bestMetricValues.dynamicArena) ? 'score--best' : ''
                      }`}
                    >
                      {router.dynamicArena.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span
                      className={`score ${
                        isBestValue(router.metrics.accuracy, bestMetricValues.accuracy) ? 'score--best' : ''
                      }`}
                    >
                      {router.metrics.accuracy.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span
                      className={`score ${
                        isBestValue(router.metrics.costPer1k, bestMetricValues.costPer1k)
                          ? 'score--best score--best--invert'
                          : ''
                      }`}
                    >
                      ${router.metrics.costPer1k.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    {router.metrics.optimalSelectionScore !== null ? (
                      <span
                        className={`score ${
                          isBestValue(router.metrics.optimalSelectionScore, bestMetricValues.optimalSelectionScore)
                            ? 'score--best'
                            : ''
                        }`}
                      >
                        {router.metrics.optimalSelectionScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="score">—</span>
                    )}
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    {router.metrics.optimalCostScore !== null ? (
                      <span
                        className={`score ${
                          isBestValue(router.metrics.optimalCostScore, bestMetricValues.optimalCostScore)
                            ? 'score--best'
                            : ''
                        }`}
                      >
                        {router.metrics.optimalCostScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="score">—</span>
                    )}
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    {router.metrics.optimalAccScore !== null ? (
                      <span
                        className={`score ${
                          isBestValue(router.metrics.optimalAccScore, bestMetricValues.optimalAccScore)
                            ? 'score--best'
                            : ''
                        }`}
                      >
                        {router.metrics.optimalAccScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="score">—</span>
                    )}
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    {router.metrics.latencyScore !== null ? (
                      <span
                        className={`score ${
                          isBestValue(router.metrics.latencyScore, bestMetricValues.latencyScore) ? 'score--best' : ''
                        }`}
                      >
                        {router.metrics.latencyScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="score">—</span>
                    )}
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    {router.metrics.robustnessScore !== null ? (
                      <span
                        className={`score ${
                          isBestValue(router.metrics.robustnessScore, bestMetricValues.robustnessScore)
                            ? 'score--best'
                            : ''
                        }`}
                      >
                        {router.metrics.robustnessScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="score">—</span>
                    )}
                  </div>
                </div>

                </div>
                );
              })}
            </div>
          </div>
        </div>
      {modelCardRouter && (
        <div className="model-card-modal-overlay" onClick={() => setModelCardRouter(null)}>
          <div className="model-card-modal" onClick={event => event.stopPropagation()}>
            <div className="model-card-modal-header">
              <h3>{modelCardRouter.name}</h3>
              <button type="button" className="link-button" onClick={() => setModelCardRouter(null)}>
                Close
              </button>
            </div>
            <RouterModelCard
              router={modelCardRouter}
              isSelected={selectedCompareIds.includes(modelCardRouter.id)}
              maxSelectedReached={maxCompareReached}
              onToggleCompare={toggleCompareSelection}
              onSoloCompare={handleSoloCompare}
            />
          </div>
        </div>
      )}
      {selectedCompareIds.length > 0 && (
        <button className="compare-fab" onClick={() => setIsCompareModalOpen(true)}>
          Compare ({selectedCompareIds.length})
        </button>
      )}
      {isCompareModalOpen && selectedCompareIds.length > 0 && (
        <CompareModal
          routerIds={selectedCompareIds}
          onClose={() => setIsCompareModalOpen(false)}
          onAdd={toggleCompareSelection}
          onRemove={handleRemoveFromCompare}
          maxSelected={MAX_COMPARE}
        />
      )}

        {/* Visualizations Section with Tabs */}
        <div className="visualizations-section">
          <div className="viz-tabs">
            <button
              className={`viz-tab ${activeTab === 'spider' ? 'active' : ''}`}
              onClick={() => setActiveTab('spider')}
            >
              Router Performance Comparison
            </button>
            <button
              className={`viz-tab ${activeTab === 'deferral' ? 'active' : ''}`}
              onClick={() => setActiveTab('deferral')}
            >
              Deferral Plot: Accuracy vs Inference Cost
            </button>
          </div>

          <div className="viz-content">
            {activeTab === 'spider' && (
              <div className="spider-plot-section">
                <SpiderChart routers={routers} maxRouters={5} />
              </div>
            )}

            {activeTab === 'deferral' && (
              <div className="deferral-curve-section">
                <DeferralCurve
                  openSourcePoints={openSourcePoints}
                  closedSourcePoints={closedSourcePoints}
                />
              </div>
            )}
          </div>
        </div>

        {/* Metrics Explanation */}
        <div className="metrics-explanation" id="metrics-explanation">
          <h2>Evaluation Metrics</h2>
          <div className="metrics-grid">
            {/* 1️⃣ Arena Score */}
            <div className="metric-card" >
              <div className="metric-summary">
                <h3>Arena Score</h3>
                <p>Weighted harmonic mean capturing the trade-off between accuracy and cost.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  For each router <InlineMath math="r" />, let <InlineMath math="A_r" /> denote the
                  average correctness of the selected models' answers over the dataset queries.
                  Denote <InlineMath math="c_r" /> its average inference cost per 1k queries. We
                  define the normalized cost as:
                </p>

                <BlockMath math="C_r = \frac{\log_2(c_{\max}) - \log_2(c_r)}{\log_2(c_{\max}) - \log_2(c_{\min})}" />

                <p>
                  where <InlineMath math="c_{\min}" /> and <InlineMath math="c_{\max}" /> are the
                  minimum and maximum routing costs possible in the router's model pool for 1k
                  queries.
                </p>

                <p>
                  The Arena Score for router <InlineMath math="r" /> is reported as:{' '}
                </p>
                <BlockMath math="S_{r,\beta} = \frac{(1+\beta)A_rC_r}{\beta A_r + C_r}, \quad \beta = 0.1" />

                <p>
                  The parameter <InlineMath math="\beta" /> controls the trade-off between accuracy
                  and cost.
                </p>

                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-summary">
                <h3>Accuracy Score</h3>
                <p> The average correctness across all of our dataset's queries.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                We calculate accuracy as the average correctness of the answers generated by the router's selected models across all of our dataset's queries
                </p>


                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-summary">
                <h3>Cost/1K Queries</h3>
                <p>Measures the cost incurred by a router’s routing decisions per 1000 queries.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                This is the average token cost incurred by the router's selected models for 1000 queries from our dataset.
                <br />
                We obtain the per-token cost for the specific models a router
chooses using the official API pricing published by their providers. For unpopular models that are not served by commercial providers, we deploy them ourselves for experiments.
In such cases, we approximate their costs using the pricing tiers published by commercial hosting
platforms.
                </p>

              </div>
            </div>


            {/* 2️⃣ Optimal Selection Score */}
            <div className="metric-card">
              <div className="metric-summary">
                <h3>Optimal Selection Score</h3>
                <p>Fraction of router selections that match the optimal model.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  For each query <InlineMath math="i" />, define the <em>optimal model</em> as the
                  cheapest model that produces a correct response. If no such model exists, the
                  query is excluded. The score is the proportion of selections that match this
                  optimal choice.
                </p>
                <BlockMath math="\text{Score} = \frac{N_{\text{optimal selections}}}{N_{\text{selections}}}" />
                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            {/* 3️⃣ Optimal Cost Score */}
            <div className="metric-card">
              <div className="metric-summary">
                <h3>Optimal Cost Score</h3>
                <p>Cost ratio of the optimal model cost relative to the actual cost.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  For each query <InlineMath math="i" />, define the <em>optimal model</em> as the
                  cheapest model that produces a correct response. If no such model exists, the
                  query is excluded. For queries with an optimal model, we define the optimal cost
                  score as
                </p>
                <BlockMath math="Score_i = \frac{cost_{\text{opt}}}{cost_{\text{actual}}}" />
                <p>
                  Averaged across all queries that have an optimal model. Values close to 1 indicate
                  near-optimal cost decisions.
                </p>
                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            {/* 4️⃣ Optimal Accuracy Score */}
            <div className="metric-card">
              <div className="metric-summary">
                <h3>Optimal Accuracy Score</h3>
                <p>Achieved accuracy relative to the best possible accuracy across model pool.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  Unlike the Optimal Selection and Cost scores, which are computed only over queries
                  with a defined optimal model, this metric is computed over <em>all queries</em>.
                  Let <InlineMath math="a_{\text{achieved}}" /> denote the averaged accuracy of the
                  selected model and <InlineMath math="a_{\text{max}}" /> the maximum achievable
                  accuracy among all models in the router's model pool.
                </p>
                <BlockMath math="\text{Score} = \frac{a_{\text{achieved}}}{a_{\text{max}}}" />
                <p>
                  Reflects how close the router’s predictions are to the best achievable accuracy,
                  independent of cost.
                </p>
                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            {/* 5️⃣ Robustness Score */}
            <div className="metric-card">
              <div className="metric-summary">
                <h3>Robustness Score</h3>
                <p>Consistency of routing under input perturbations and noise.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  This metric evaluates the router’s robustness against noisy inputs. We generate
                  perturbed variants of each query (through paraphrasing, grammatical changes,
                  synonyms, and typos) and measure how often the router selects the same model as
                  for the original query.
                </p>
                <BlockMath math="Score = 1 - \frac{\#\text{changed selections}}{\#\text{total selections}}" />
                <p>
                  Higher values indicate greater stability under realistic input noise, reflecting
                  robust model selection.
                </p>
                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>

            {/* 6️⃣ Latency Score */}
            <div className="metric-card">
              <div className="metric-summary">
                <h3>Latency Score</h3>
                <p>Inverse measure of routing overhead relative to base latency.</p>
              </div>

              <div className="metric-details">
                <h4>Definition</h4>
                <p>
                  Quantifies the delay introduced by the router’s decision process. If{' '}
                  <InlineMath math="L_{\text{router}}" /> is the average duration (ms) from when a
                  request is received to the output of router decision and a 10 ms baseline overhead
                  is assumed, the score is defined as:
                </p>
                <BlockMath math="Score = \frac{1}{L_{\text{router}} - 10}" />
                <p>Higher scores correspond to lower latency overhead and faster inference.</p>
                <p>
                  <strong>Range:</strong> [0, 100]
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;
