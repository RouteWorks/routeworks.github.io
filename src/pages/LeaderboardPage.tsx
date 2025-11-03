import React, { useState, useMemo } from 'react';
import { Trophy, Search, Medal } from 'lucide-react';
import { Router } from '../types';
import { routers } from '../data/mockData';
import SpiderChart from '../components/SpiderChart';
import DeferralCurve from '../components/DeferralCurve';
import './LeaderboardPage.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LeaderboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'commercial'>('all');
  const [activeMetric, setActiveMetric] = useState<
    'arena' | 'optimalSelection' | 'optimalCost' | 'optimalAcc' | 'latency' | 'robustness'
  >('arena');
  const [activeTab, setActiveTab] = useState<'spider' | 'deferral'>('spider');

  // Deferral curve data
  const academicPoints = {
    CARROT: { accuracy: 0.672, cost_per_1k: 2.060741 },
    RouterDC: { accuracy: 0.3344, cost_per_1k: 0.063751 },
    GraphRouter: { accuracy: 0.6072, cost_per_1k: 0.363695 },
    KNN: { accuracy: 0.5905, cost_per_1k: 4.266104 },
    MLP: { accuracy: 0.6191, cost_per_1k: 4.830245 },
    RouteLLM: { accuracy: 0.6224, cost_per_1k: 4.937691 },
    'MIRT-BERT': { accuracy: 0.6731, cost_per_1k: 0.150629 },
    'NIRT-BERT': { accuracy: 0.6159, cost_per_1k: 0.600228 },
  };

  const commercialPoints = {
    NotDiamond: { accuracy: 0.6651, cost_per_1k: 9.330411 },
    Azure: { accuracy: 0.6798, cost_per_1k: 0.619866 },
    'GPT-5': { accuracy: 0.7428, cost_per_1k: 14.407096 },
    'vLLM-SR': { accuracy: 0.6665, cost_per_1k: 1.61393 },
  };

  // Helper function to calculate average score for overall ranking
  const calculateAverageScore = (metrics: Router['metrics']): number => {
    const scores: number[] = [metrics.arenaScore];
    if (metrics.optimalSelectionScore !== null) scores.push(metrics.optimalSelectionScore);
    if (metrics.optimalCostScore !== null) scores.push(metrics.optimalCostScore);
    if (metrics.optimalAccScore !== null) scores.push(metrics.optimalAccScore);
    if (metrics.robustnessScore !== null) scores.push(metrics.robustnessScore);
    if (metrics.latencyScore !== null) scores.push(metrics.latencyScore);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const filteredAndSortedRouters = useMemo(() => {
    const metricKeyMap = {
      arena: 'arenaScore',
      optimalSelection: 'optimalSelectionScore',
      optimalCost: 'optimalCostScore',
      optimalAcc: 'optimalAccScore',
      latency: 'latencyScore',
      robustness: 'robustnessScore',
    } as const;

    let filtered = routers.filter(router => {
      const matchesSearch =
        router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || router.type === filterType;
      return matchesSearch && matchesFilter;
    });

    const key = metricKeyMap[activeMetric];
    return filtered.sort((a, b) => {
      const scoreA = a.metrics[key];
      const scoreB = b.metrics[key];
      // Handle null values - put them at the end
      if (scoreA === null && scoreB === null) return 0;
      if (scoreA === null) return 1;
      if (scoreB === null) return -1;
      return scoreB - scoreA;
    });
  }, [searchTerm, filterType, activeMetric]);

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
            className={`metric-filter-btn ${activeMetric === 'optimalSelection' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalSelection')}
          >
            Optimal Selection
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimalCost' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalCost')}
          >
            Optimal Cost
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimalAcc' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimalAcc')}
          >
            Optimal Acc
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
                onChange={e => setFilterType(e.target.value as 'all' | 'academic' | 'commercial')}
                className="filter-select"
              >
                <option value="all">All Routers</option>
                <option value="academic">Academic</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <div className="rank-col">Rank</div>
            <div className="name-col">Router</div>
            <div className="affiliation-col">Affiliation</div>
            <div className="type-col">Type</div>
            <div className="metrics-col">Arena</div>
            <div className="metrics-col">Opt. Select</div>
            <div className="metrics-col">Opt. Cost</div>
            <div className="metrics-col">Opt. Acc</div>
            <div className="metrics-col">Latency</div>
            <div className="metrics-col">Robust</div>
          </div>

          <div className="leaderboard-body">
            {filteredAndSortedRouters.map((router, index) => (
              <div key={router.id} className="leaderboard-row">
                <div className="rank-col">{renderRankBadge(index + 1)}</div>

                <div className="name-col">
                  <div className="router-info">
                    <h3 className="router-name">{router.name}</h3>
                  </div>
                </div>

                <div className="affiliation-col">
                  <span className="affiliation">{router.affiliation}</span>
                </div>

                <div className="type-col">
                  <span className={`type-badge ${router.type}`}>{router.type}</span>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.arenaScore.toFixed(4)}</span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">
                      {router.metrics.optimalSelectionScore !== null
                        ? router.metrics.optimalSelectionScore.toFixed(4)
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">
                      {router.metrics.optimalCostScore !== null
                        ? router.metrics.optimalCostScore.toFixed(4)
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">
                      {router.metrics.optimalAccScore !== null
                        ? router.metrics.optimalAccScore.toFixed(4)
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">
                      {router.metrics.latencyScore !== null
                        ? router.metrics.latencyScore.toFixed(4)
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">
                      {router.metrics.robustnessScore !== null
                        ? router.metrics.robustnessScore.toFixed(4)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  academicPoints={academicPoints}
                  commercialPoints={commercialPoints}
                />
              </div>
            )}
          </div>
        </div>

        {/* Metrics Explanation */}
        <div className="metrics-explanation">
          <h2>Evaluation Metrics</h2>
          <div className="metrics-grid">
            {/* 1️⃣ Arena Score */}
            <div className="metric-card">
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
                  <strong>Range:</strong> [0, 1]
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
                  <strong>Range:</strong> [0, 1]
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
                  <strong>Range:</strong> [0, 1]
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
                  <strong>Range:</strong> [0, 1]
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
                <BlockMath math="Score = \frac{\#\text{consistent selections}}{\#\text{noisy variants}}" />
                <p>
                  Higher values indicate greater stability under realistic input noise, reflecting
                  robust model selection.
                </p>
                <p>
                  <strong>Range:</strong> [0, 1]
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
                  <strong>Range:</strong> [0, 1]
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
