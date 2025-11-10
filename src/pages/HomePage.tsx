import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, BarChart3, Users, BookOpen, ArrowRight, Zap, Shield, Github } from 'lucide-react';
import { contactInfo, datasetInfo, routers } from '../data/mockData';
import Figure from '../components/Figure';
import DatasetCompositionChart from '../components/DatasetCompositionChart';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dataset');

  // Get top 3 routers sorted by arena score (highest first)
  const topRouters = useMemo(() => {
    return routers.sort((a, b) => b.metrics.arenaScore - a.metrics.arenaScore).slice(0, 3);
  }, []);

  useEffect(() => {
    // Handle direct navigation to #contact
    if (window.location.hash === '#contact') {
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">
              RouterArena: An Open Platform for
              <span className="highlight"> Comprehensive Comparison</span> of <br /> LLM Routers
            </h1>

            <p className="hero-subtitle-short">
              Diverse dataset, extensive metrics, and live leaderboard
            </p>
            <div className="hero-actions">
              <Link to="/leaderboard" className="btn btn-primary">
                <Trophy className="btn-icon" />
                View Leaderboard
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-right-content">
              <div className="hero-cards-container">
                <div className="hero-card">
                  <div className="card-header">
                    <Trophy className="card-icon" />
                    <h3>RouterArena Leaderboard</h3>
                  </div>
                  <div className="leaderboard-preview">
                    {topRouters.map((router, index) => (
                      <div key={router.id} className={`rank-item rank-${index + 1}`}>
                        <span className="rank">{index + 1}</span>
                        <span className="name">{router.name}</span>
                        <span className="affiliation">{router.affiliation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cta-card">
                  <h3 className="cta-heading">Want to see your router on the leaderboard?</h3>
                  <p className="cta-description">Head to our GitHub to submit your router.</p>
                  <a href={contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  className="btn btn-primary"

                  >
                    Get Started →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Key Features</h2>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'dataset' ? 'active' : ''}`}
              onClick={() => setActiveTab('dataset')}
            >
              <BookOpen className="tab-icon" />
              Diverse Dataset
            </button>
            <button
              className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              <BarChart3 className="tab-icon" />
              Extensive Metrics
            </button>
            <button
              className={`tab-button ${activeTab === 'framework' ? 'active' : ''}`}
              onClick={() => setActiveTab('framework')}
            >
              <Zap className="tab-icon" />
              Automated Framework
            </button>
            <button
              className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              <Shield className="tab-icon" />
              Fair Comparison
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'dataset' && (
              <div className="tab-panel">
                <div className="tab-header">
                  <div className="tab-icon-large">
                    <BookOpen />
                  </div>
                  <div>
                    <h3>Diverse Dataset</h3>
                    <p className="tab-subtitle">
                      {datasetInfo.totalQueries.toLocaleString()} queries across{' '}
                      {datasetInfo.domains} domains and {datasetInfo.categories} categories,
                      designed using Dewey Decimal Classification and Bloom's taxonomy for
                      comprehensive evaluation.
                    </p>
                  </div>
                </div>
                <div className="tab-details">
                  <h4>Dataset Composition</h4>
                  <ul>
                    <li>
                      <strong>8,000+ queries</strong> across 9 Dewey Decimal Classification domains
                    </li>
                    <li>
                      <strong>44 categories</strong> covering all major knowledge areas except
                      religion
                    </li>
                    <li>
                      <strong>Bloom's Taxonomy levels:</strong> Remember, Understand, Apply,
                      Analyze, Evaluate, Create
                    </li>
                    <li>
                      <strong>Balanced distribution</strong> ensuring fair evaluation across
                      difficulty levels
                    </li>
                    <li>
                      <strong>Multi-source integration</strong> from academic and specialized
                      datasets
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="tab-panel">
                <div className="tab-header">
                  <div className="tab-icon-large">
                    <BarChart3 />
                  </div>
                  <div>
                    <h3>Extensive Metrics</h3>
                    <p className="tab-subtitle">
                      Multi-dimensional evaluation including arena score, optimal selection, cost,
                      accuracy, robustness, and latency to provide comprehensive router comparison.
                    </p>
                  </div>
                </div>
                <div className="tab-details">
                  <h4>Evaluation Dimensions</h4>
                  <ul>
                    <li>
                      <strong>Arena Score:</strong> Weighted harmonic mean capturing the trade-off
                      between accuracy and cost efficiency
                    </li>
                    <li>
                      <strong>Optimal Selection Score:</strong> Fraction of router selections that
                      match the optimal model
                    </li>
                    <li>
                      <strong>Optimal Cost Score:</strong> Inverse cost ratio relative to the
                      query's optimal model
                    </li>
                    <li>
                      <strong>Optimal Accuracy Score:</strong> Accuracy achieved relative to the
                      maximum possible accuracy across models
                    </li>
                    <li>
                      <strong>Robustness Score:</strong> Consistency of routing under input
                      perturbations and noise
                    </li>
                    <li>
                      <strong>Latency Score:</strong> Inverse measure of routing overhead relative
                      to base latency
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'framework' && (
              <div className="tab-panel">
                <div className="tab-header">
                  <div className="tab-icon-large">
                    <Zap />
                  </div>
                  <div>
                    <h3>Automated Framework</h3>
                    <p className="tab-subtitle">
                      Automated evaluation pipeline supporting both open-source and commercial
                      routers with real-time leaderboard updates.
                    </p>
                  </div>
                </div>
                <div className="tab-details">
                  <h4>Framework Features</h4>
                  <ul>
                    <li>
                      <strong>Unified Protocol:</strong> Consistent evaluation across all router
                      types
                    </li>
                    <li>
                      <strong>Prefix Caching:</strong> Optimized inference efficiency for faster
                      evaluation
                    </li>
                    <li>
                      <strong>Live Updates:</strong> Real-time leaderboard updates as new routers
                      are added
                    </li>
                    <li>
                      <strong>Multi-Platform:</strong> Support for both academic and commercial
                      routers
                    </li>
                    <li>
                      <strong>Reproducible Results:</strong> Transparent and standardized evaluation
                      process
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className="tab-panel">
                <div className="tab-header">
                  <div className="tab-icon-large">
                    <Shield />
                  </div>
                  <div>
                    <h3>Fair Comparison</h3>
                    <p className="tab-subtitle">
                      Unified evaluation protocol enabling fair comparison between academic and
                      commercial routers under consistent conditions.
                    </p>
                  </div>
                </div>
                <div className="tab-details">
                  <h4>Comparison Standards</h4>
                  <ul>
                    <li>
                      <strong>Consistent Evaluation:</strong> Same dataset and metrics for all
                      routers
                    </li>
                    <li>
                      <strong>Transparent Methodology:</strong> Open evaluation framework and
                      protocols
                    </li>
                    <li>
                      <strong>Academic & Commercial:</strong> Fair comparison across different
                      router types
                    </li>
                    <li>
                      <strong>Standardized Metrics:</strong> Unified scoring system for objective
                      ranking
                    </li>
                    <li>
                      <strong>Community Driven:</strong> Open platform for ongoing evaluation and
                      improvement
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dataset Overview */}
      <section className="dataset-overview">
        <div className="container">
          <h2 className="section-title">Dataset Overview</h2>
          <DatasetCompositionChart />
        </div>
      </section>

      {/* Research Team Section */}
      <section id="contact" className="team">
        <div className="container">
          <h2 className="section-title">Research Team</h2>
          <p className="contact-description">
            To evaluate your router with RouterArena, please visit our GitHub repository and follow the instructions provided in the README.<br />
            For inquiries or support, contact us at {contactInfo.email} or submit an issue on GitHub.
          </p>

          {/* Action Buttons */}
          <div className="action-buttons">
            <a
              href={contactInfo.paper}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="btn-icon" />
              Read Paper
            </a>
            <a
              href={contactInfo.github}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="btn-icon" />
              View GitHub
            </a>
          </div>

          {/* Team Content */}
          <div className="team-content">
            <div className="institution">
              <h3>{contactInfo.institution}</h3>
              <p>Department of Computer Science</p>
            </div>
            <div className="authors-grid">
              {contactInfo.authors.map((author, index) => (
                <div key={index} className="author-card">
                  <div className="author-name">{author.name}</div>
                  <a href={`mailto:${author.email}`} className="author-email">
                    {author.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
