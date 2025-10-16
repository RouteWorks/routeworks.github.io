import React, { useState, useMemo } from 'react';
import { Trophy, Search } from 'lucide-react';
import { routers } from '../data/mockData';
import SpiderChart from '../components/SpiderChart';
import DeferralCurve from '../components/DeferralCurve';
import './LeaderboardPage.css';

const LeaderboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'commercial'>('all');
  const [activeMetric, setActiveMetric] = useState<'overall' | 'arena' | 'cost' | 'optimal' | 'latency' | 'robustness'>('overall');
  const [activeTab, setActiveTab] = useState<'spider' | 'deferral'>('spider');

  // Deferral curve data
  const academicPoints = {
    "CARROT":              {"accuracy": 0.6720, "cost_per_1k": 2.060741},
    "RouterDC":            {"accuracy": 0.3344, "cost_per_1k": 0.063751},
    "GraphRouter":         {"accuracy": 0.6072, "cost_per_1k": 0.363695},
    "KNN":                 {"accuracy": 0.5905, "cost_per_1k": 4.266104},
    "MLP":                 {"accuracy": 0.6191, "cost_per_1k": 4.830245},
    "RouteLLM":            {"accuracy": 0.6224, "cost_per_1k": 4.937691},
    "MIRT-BERT":           {"accuracy": 0.6731, "cost_per_1k": 0.150629},
    "NIRT-BERT":           {"accuracy": 0.6159, "cost_per_1k": 0.600228},
  };

  const commercialPoints = {
    "NotDiamond": {"accuracy": 0.6651, "cost_per_1k": 9.330411},
    "Azure":      {"accuracy": 0.6798, "cost_per_1k": 0.619866},
    "GPT-5":      {"accuracy": 0.7428, "cost_per_1k": 14.407096},
    "vLLM-SR":    {"accuracy": 0.6665, "cost_per_1k": 1.613930},
  };

  const filteredAndSortedRouters = useMemo(() => {
    const metricKeyMap = {
      arena: 'arenaScore',
      cost: 'costRatioScore',
      optimal: 'optimalAccScore',
      latency: 'latencyScore',
      robustness: 'robustnessScore',
    } as const;

    let filtered = routers.filter(router => {
      const matchesSearch = router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || router.type === filterType;
      return matchesSearch && matchesFilter;
    });

    if (activeMetric === 'overall') {
      return filtered.sort((a, b) => a.metrics.overallRank - b.metrics.overallRank);
    }

    const key = metricKeyMap[activeMetric];
    return filtered.sort((a, b) => b.metrics[key] - a.metrics[key]);
  }, [searchTerm, filterType, activeMetric]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
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
            className={`metric-filter-btn ${activeMetric === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveMetric('overall')}
          >
            Overall Ranking
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'arena' ? 'active' : ''}`}
            onClick={() => setActiveMetric('arena')}
          >
            Avg Arena Score
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'cost' ? 'active' : ''}`}
            onClick={() => setActiveMetric('cost')}
          >
            Avg Cost Ratio
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'optimal' ? 'active' : ''}`}
            onClick={() => setActiveMetric('optimal')}
          >
            Avg Optimality
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'latency' ? 'active' : ''}`}
            onClick={() => setActiveMetric('latency')}
          >
            Avg Latency
          </button>
          <button
            className={`metric-filter-btn ${activeMetric === 'robustness' ? 'active' : ''}`}
            onClick={() => setActiveMetric('robustness')}
          >
            Avg Robustness
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'academic' | 'commercial')}
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
            <div className="type-col">Type</div>
            <div className="metrics-col">Arena</div>
            <div className="metrics-col">Cost</div>
            <div className="metrics-col">Optimal</div>
            <div className="metrics-col">Latency</div>
            <div className="metrics-col">Robust</div>
            <div className="overall-col">Overall</div>
          </div>

          <div className="leaderboard-body">
            {filteredAndSortedRouters.map((router, index) => (
              <div key={router.id} className="leaderboard-row">
                <div className="rank-col">
                  <span className={`rank-badge ${getRankBadge(index + 1)}`}>
                    {index + 1}
                  </span>
                </div>

                <div className="name-col">
                  <div className="router-info">
                    <h3 className="router-name">{router.name}</h3>
                  </div>
                </div>

                <div className="type-col">
                  <span className={`type-badge ${router.type}`}>
                    {router.type}
                  </span>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.arenaScore.toFixed(3)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${router.metrics.arenaScore * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.costRatioScore.toFixed(3)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${router.metrics.costRatioScore * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.optimalAccScore.toFixed(3)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${router.metrics.optimalAccScore * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.latencyScore.toFixed(3)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${router.metrics.latencyScore * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-col">
                  <div className="metric-value">
                    <span className="score">{router.metrics.robustnessScore.toFixed(3)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${router.metrics.robustnessScore * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="overall-col">
                  <div className="overall-score">{router.metrics.overallRank}</div>
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
            <div className="metric-card">
              <h3>Arena Score</h3>
              <p>Overall performance combining accuracy and cost efficiency</p>
            </div>
            <div className="metric-card">
              <h3>Cost Ratio Score</h3>
              <p>Efficiency in cost optimization relative to optimal routing</p>
            </div>
            <div className="metric-card">
              <h3>Optimality Score</h3>
              <p>Frequency of selecting the most efficient model for each query</p>
            </div>
            <div className="metric-card">
              <h3>Latency Score</h3>
              <p>Router overhead and response time performance</p>
            </div>
            <div className="metric-card">
              <h3>Robustness Score</h3>
              <p>Stability against query perturbations and noise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
